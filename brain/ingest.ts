#!/usr/bin/env bun
// Hamzaish — brain ingest
// Scans known folders for markdown/JSON, populates brain.db.
// Re-run anytime: `bun brain/ingest.ts` (idempotent, change-detection by mtime + hash)
// Run a full rebuild:  `bun brain/ingest.ts --rebuild`

import { Database } from "bun:sqlite";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { corpusFiles, HAMZAISH_ROOT } from "./corpus.ts";
import { computeFingerprint, writeStoredFingerprint } from "./freshness.ts";

const DB_PATH = join(import.meta.dir, "brain.db");
const SCHEMA_PATH = join(import.meta.dir, "schema.sql");

const REBUILD = process.argv.includes("--rebuild");
const VERBOSE = process.argv.includes("--verbose") || process.argv.includes("-v");

// ─── DB setup ──────────────────────────────────────────────────────────────

if (REBUILD && existsSync(DB_PATH)) {
  await Bun.file(DB_PATH).delete?.().catch(() => {});
  // bun:sqlite locks the file; safer to just truncate via fresh-open.
}

const db = new Database(DB_PATH);
db.exec(await readFile(SCHEMA_PATH, "utf8"));

if (REBUILD) {
  db.exec("DELETE FROM documents;");
  console.log("→ rebuild: cleared documents table");
}

// ─── helpers ───────────────────────────────────────────────────────────────

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

function extractTitle(body: string, fallbackPath: string): string {
  const h1 = body.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  // YAML frontmatter name?
  const fm = body.match(/^---\s*\n([\s\S]+?)\n---/);
  if (fm) {
    const n = fm[1].match(/^name:\s*(.+)$/m);
    if (n) return n[1].trim();
  }
  return fallbackPath.split("/").pop() || fallbackPath;
}

function productFromPath(relPath: string): string | null {
  const m = relPath.match(/^products\/([^/_][^/]*)\//);
  return m ? m[1] : null;
}

// ─── prepared statements ───────────────────────────────────────────────────

const upsert = db.prepare(`
  INSERT INTO documents (id, source, product, title, body, mtime, content_hash, ingested_at)
  VALUES ($id, $source, $product, $title, $body, $mtime, $content_hash, $ingested_at)
  ON CONFLICT(id) DO UPDATE SET
    source = excluded.source,
    product = excluded.product,
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

// ─── ingest loop ───────────────────────────────────────────────────────────

const startedAt = Date.now();
let added = 0, updated = 0, deleted = 0, skipped = 0;
const seenIds = new Set<string>();

async function ingestFile(relPath: string, source: string) {
  const abs = join(HAMZAISH_ROOT, relPath);
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
  const product = productFromPath(relPath);

  upsert.run({
    $id: relPath,
    $source: source,
    $product: product,
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

// Stamp what the corpus looked like at this instant. `/brain-ask` recomputes
// this before every query and rebuilds only when it moved — so the index can
// never silently lag the markdown. Written AFTER the prune so it describes the
// state the index actually reached.
const { fingerprint } = await computeFingerprint();
writeStoredFingerprint(db, fingerprint);

const totalRows = (db.prepare(`SELECT COUNT(*) AS n FROM documents`).get() as { n: number }).n;

console.log(`→ ingest done in ${finishedAt - startedAt}ms`);
console.log(`   added=${added}  updated=${updated}  deleted=${deleted}  skipped=${skipped}`);
console.log(`   total in db: ${totalRows} documents`);

db.close();
