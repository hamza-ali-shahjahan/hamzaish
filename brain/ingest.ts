#!/usr/bin/env bun
// Hamzaish — brain ingest
// Scans known folders for markdown/JSON, populates brain.db.
// Re-run anytime: `bun brain/ingest.ts` (idempotent, change-detection by mtime + hash)
// Run a full rebuild:  `bun brain/ingest.ts --rebuild`

import { Database } from "bun:sqlite";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";

const HAMZAISH_ROOT = join(import.meta.dir, "..");
const DB_PATH = join(import.meta.dir, "brain.db");
const SCHEMA_PATH = join(import.meta.dir, "schema.sql");

const REBUILD = process.argv.includes("--rebuild");
const VERBOSE = process.argv.includes("--verbose") || process.argv.includes("-v");

// What we ingest. Each rule: { root: relative path, source: tag, ext: allowed extensions, recurse }
type IngestRule = {
  root: string;
  source: string;
  exts: string[];
  recurse: boolean;
};

const INGEST_RULES: IngestRule[] = [
  // Top-level brain docs
  { root: "", source: "root", exts: [".md"], recurse: false }, // CLAUDE.md, README.md, MEMORY.md
  // Brain layer
  { root: "brain/identity", source: "brain/identity", exts: [".md"], recurse: true },
  { root: "brain/learnings", source: "brain/learnings", exts: [".md"], recurse: true },
  { root: "brain/anti-patterns", source: "brain/anti-patterns", exts: [".md"], recurse: true },
  { root: "brain/decision-log", source: "brain/decision-log", exts: [".md"], recurse: true },
  { root: "brain/knowledge", source: "brain/knowledge", exts: [".md"], recurse: true },
  // Standalone brain files (persona, operating-principles)
  { root: "brain", source: "brain", exts: [".md"], recurse: false },
  // Factory layer
  { root: "factory/playbooks", source: "factory/playbooks", exts: [".md"], recurse: true },
  { root: "factory/skills", source: "factory/skills", exts: [".md"], recurse: true },
  { root: "factory/agents", source: "factory/agents", exts: [".md"], recurse: true },
  { root: "factory/commands", source: "factory/commands", exts: [".md"], recurse: true },
  { root: "factory/workflows", source: "factory/workflows", exts: [".md"], recurse: true },
  // Meta layer
  { root: "meta", source: "meta", exts: [".md"], recurse: true },
  // Stack defaults
  { root: "stack", source: "stack", exts: [".md"], recurse: true },
  // Products — handled specially so we can scope by slug
];

// Folders we never traverse into (matched by name, any depth)
const SKIP_DIRS = new Set([
  "_archive", "references", "node_modules", ".git", ".next", "dist", ".wrangler", ".turbo", "build"
]);

// Paths we never traverse into (matched by repo-relative prefix).
// AGENT-BLIND RULE: the judged system must never retrieve its own eval
// fixtures, rubrics, or verdicts via /brain-ask. Selection trusts separation,
// not re-checking (meta/SELF-EVOLUTION.md, meta/evals/README.md).
const SKIP_PATHS = ["meta/evals/skills", "meta/evals/runs"];

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

async function* walk(dir: string, recurse: boolean): AsyncGenerator<string> {
  const absDir = join(HAMZAISH_ROOT, dir);
  if (!existsSync(absDir)) return;
  const entries = await readdir(absDir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(absDir, e.name);
    if (e.isDirectory()) {
      if (!recurse) continue;
      if (SKIP_DIRS.has(e.name)) continue;
      if (e.name.startsWith(".")) continue;
      const rel = relative(HAMZAISH_ROOT, full);
      if (SKIP_PATHS.some((p) => rel === p || rel.startsWith(p + "/"))) continue;
      yield* walk(rel, recurse);
    } else if (e.isFile()) {
      yield relative(HAMZAISH_ROOT, full);
    }
  }
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
    $mtime: st.mtimeMs | 0,
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

for (const rule of INGEST_RULES) {
  for await (const relPath of walk(rule.root, rule.recurse)) {
    if (!rule.exts.some((e) => relPath.endsWith(e))) continue;
    // root rule only picks top-level files (no subfolders)
    if (rule.root === "" && relPath.includes("/")) continue;
    // brain (non-recursive) rule only picks files directly in brain/
    if (rule.root === "brain" && relPath.split("/").length > 2) continue;
    await ingestFile(relPath, rule.source);
  }
}

// Products are walked specially so we can scope each by slug
const productsAbs = join(HAMZAISH_ROOT, "products");
if (existsSync(productsAbs)) {
  const productDirs = (await readdir(productsAbs, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"));
  for (const p of productDirs) {
    const slug = p.name;
    const base = `products/${slug}`;
    // Config JSON
    const cfgPath = `${base}/product.config.json`;
    if (existsSync(join(HAMZAISH_ROOT, cfgPath))) {
      await ingestFile(cfgPath, "products/config");
    }
    // README and status
    for (const f of ["README.md", "status.md", "scope.md", "prd.md", "metrics.md"]) {
      const fp = `${base}/${f}`;
      if (existsSync(join(HAMZAISH_ROOT, fp))) await ingestFile(fp, "products/docs");
    }
    // Decisions
    const decDir = `${base}/decisions`;
    if (existsSync(join(HAMZAISH_ROOT, decDir))) {
      for await (const f of walk(decDir, true)) {
        if (f.endsWith(".md")) await ingestFile(f, "products/decisions");
      }
    }
    // Launch / analytics / interviews docs
    for (const sub of ["launch", "analytics", "interviews"]) {
      const subDir = `${base}/${sub}`;
      if (existsSync(join(HAMZAISH_ROOT, subDir))) {
        for await (const f of walk(subDir, true)) {
          if (f.endsWith(".md")) await ingestFile(f, `products/${sub}`);
        }
      }
    }
  }

  // _portfolio.md
  const port = "products/_portfolio.md";
  if (existsSync(join(HAMZAISH_ROOT, port))) await ingestFile(port, "products/portfolio");
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

const totalRows = (db.prepare(`SELECT COUNT(*) AS n FROM documents`).get() as { n: number }).n;

console.log(`→ ingest done in ${finishedAt - startedAt}ms`);
console.log(`   added=${added}  updated=${updated}  deleted=${deleted}  skipped=${skipped}`);
console.log(`   total in db: ${totalRows} documents`);

db.close();
