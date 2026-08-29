#!/usr/bin/env bun
// brain ingest — starter (ported from Hamzaish's own brain/ingest.ts)
// Scans the repo for markdown (per corpus.ts), populates brain.db.
// Re-run anytime: `bun brain/ingest.ts` (idempotent, change-detection by hash)
// Full rebuild:    `bun brain/ingest.ts --rebuild`

import { Database } from "bun:sqlite";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { corpusFiles, BRAIN_ROOT } from "./corpus.ts";
import { computeFingerprint, writeStoredFingerprint } from "./freshness.ts";

const DB_PATH = join(import.meta.dir, "brain.db");
const SCHEMA_PATH = join(import.meta.dir, "schema.sql");

const REBUILD = process.argv.includes("--rebuild");
const VERBOSE = process.argv.includes("--verbose") || process.argv.includes("-v");

if (REBUILD && existsSync(DB_PATH)) {
  await Bun.file(DB_PATH).delete?.().catch(() => {});
}

const db = new Database(DB_PATH);
db.exec(await readFile(SCHEMA_PATH, "utf8"));

if (REBUILD) {
  db.exec("DELETE FROM documents;");
  console.log("→ rebuild: cleared documents table");
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function extractTitle(body: string, fallbackPath: string): string {
  const h1 = body.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  const fm = body.match(/^---\s*\n([\s\S]+?)\n---/);
  if (fm) {
    const n = fm[1].match(/^name:\s*(.+)$/m);
    if (n) return n[1].trim();
  }
  return fallbackPath.split("/").pop() || fallbackPath;
}

const upsert = db.prepare(`
  INSERT INTO documents (id, source, product, title, body, mtime, content_hash, ingested_at)
  VALUES ($id, $source, NULL, $title, $body, $mtime, $content_hash, $ingested_at)
  ON CONFLICT(id) DO UPDATE SET
    source = excluded.source,
    title = excluded.title,
    body = excluded.body,
    mtime = excluded.mtime,
    content_hash = excluded.content_hash,
    ingested_at = excluded.ingested_at
  WHERE excluded.content_hash != documents.content_hash
`);

const getExisting = db.prepare(`SELECT content_hash FROM documents WHERE id = ?`);
const allIds = db.prepare(`SELECT id FROM documents`);
const deleteById = db.prepare(`DELETE FROM documents WHERE id = ?`);
const insertRun = db.prepare(`
  INSERT INTO ingest_runs (started_at, finished_at, files_added, files_updated, files_deleted, files_skipped, notes)
  VALUES ($started_at, $finished_at, $added, $updated, $deleted, $skipped, $notes)
`);

const startedAt = Date.now();
let added = 0, updated = 0, deleted = 0, skipped = 0;
const seenIds = new Set<string>();

async function ingestFile(relPath: string, source: string) {
  const abs = join(BRAIN_ROOT, relPath);
  const st = await stat(abs);
  const body = await readFile(abs, "utf8");
  const hash = sha256(body);
  const existing = getExisting.get(relPath) as { content_hash: string } | undefined;

  seenIds.add(relPath);

  if (existing?.content_hash === hash) {
    skipped++;
    if (VERBOSE) console.log("  · skip", relPath);
    return;
  }

  const title = extractTitle(body, relPath);

  upsert.run({
    $id: relPath,
    $source: source,
    $title: title,
    $body: body,
    $mtime: Math.floor(st.mtimeMs),
    $content_hash: hash,
    $ingested_at: Date.now(),
  });

  if (existing) {
    updated++;
    if (VERBOSE) console.log("  ↻ updated", relPath);
  } else {
    added++;
    if (VERBOSE) console.log("  + added", relPath);
  }
}

console.log("→ ingest start");

for await (const entry of corpusFiles()) {
  await ingestFile(entry.path, entry.source);
}

// Prune deleted files
for (const row of allIds.all() as { id: string }[]) {
  if (!seenIds.has(row.id)) {
    deleteById.run(row.id);
    deleted++;
    if (VERBOSE) console.log("  − removed", row.id);
  }
}

const finishedAt = Date.now();
insertRun.run({
  $started_at: startedAt,
  $finished_at: finishedAt,
  $added: added,
  $updated: updated,
  $deleted: deleted,
  $skipped: skipped,
  $notes: REBUILD ? "rebuild" : "incremental",
});

// Stamp what the corpus looked like at this instant — ask.ts recomputes this
// before every query and rebuilds only when it moved, so the index can never
// silently lag the markdown.
const { fingerprint } = await computeFingerprint();
writeStoredFingerprint(db, fingerprint);

const totalRows = (db.prepare(`SELECT COUNT(*) AS n FROM documents`).get() as { n: number }).n;

console.log(`→ ingest done in ${finishedAt - startedAt}ms`);
console.log(`   added=${added}  updated=${updated}  deleted=${deleted}  skipped=${skipped}`);
console.log(`   total in db: ${totalRows} documents`);

db.close();
