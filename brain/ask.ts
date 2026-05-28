#!/usr/bin/env bun
// Hamzaish — brain ask
// Hybrid-ish retrieval over brain.db. FTS5 first (vectors are Phase C).
//
// Usage:
//   bun brain/ask.ts "what's the muakkil status"
//   bun brain/ask.ts --product muakkil "scribe demo plan"
//   bun brain/ask.ts --source brain/learnings "what surprised me"
//   bun brain/ask.ts --limit 5 --json "query"
//
// Output: markdown citations with snippets. Cite by path so the caller can open the file.

import { Database } from "bun:sqlite";
import { join } from "node:path";
import { existsSync } from "node:fs";

const HAMZAISH_ROOT = join(import.meta.dir, "..");
const DB_PATH = join(import.meta.dir, "brain.db");

if (!existsSync(DB_PATH)) {
  console.error("× brain.db doesn't exist yet. Run `bun brain/ingest.ts` first.");
  process.exit(1);
}

// ─── arg parsing ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let limit = 8;
let product: string | null = null;
let source: string | null = null;
let asJson = false;
const queryParts: string[] = [];

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--limit" || a === "-n") { limit = parseInt(args[++i], 10); }
  else if (a === "--product" || a === "-p") { product = args[++i]; }
  else if (a === "--source" || a === "-s") { source = args[++i]; }
  else if (a === "--json") { asJson = true; }
  else if (a === "--help" || a === "-h") {
    console.log(`Usage: bun brain/ask.ts [--product slug] [--source path] [--limit N] [--json] "<query>"`);
    process.exit(0);
  }
  else { queryParts.push(a); }
}

const query = queryParts.join(" ").trim();
if (!query) {
  console.error("× missing query. `bun brain/ask.ts \"your question\"`");
  process.exit(1);
}

// ─── FTS5 query construction ──────────────────────────────────────────────
//
// FTS5 likes quoted phrases. Bare words get OR'd by default; we use the
// porter+unicode61 tokenizer (set in schema). Wrap each non-operator token
// so we don't crash on user punctuation. Quoted substrings stay as phrases.

function buildFtsQuery(q: string): string {
  // Extract "quoted phrases" first so we can keep them intact
  const phrases: string[] = [];
  let rest = q.replace(/"([^"]+)"/g, (_, p) => {
    phrases.push(`"${p.replace(/"/g, "")}"`);
    return " ";
  });
  // Sanitize remaining tokens: alphanumerics + hyphens allowed
  // EVERY token gets wrapped in double quotes — this neutralizes FTS5 operators
  // (-, NEAR, AND, OR, NOT, *, :) when they appear inside user terms like "work-on".
  const tokens = rest
    .split(/\s+/)
    .map((t) => t.replace(/[^\w\-]/g, ""))
    .filter((t) => t.length >= 2)
    .map((t) => `"${t}"`);

  const all = [...phrases, ...tokens];
  if (all.length === 0) return `"${q.replace(/"/g, "")}"`;
  return all.join(" OR ");
}

const ftsQ = buildFtsQuery(query);

// ─── search ────────────────────────────────────────────────────────────────

const db = new Database(DB_PATH, { readonly: true });

let sql = `
  SELECT
    d.id           AS path,
    d.title        AS title,
    d.source       AS source,
    d.product      AS product,
    snippet(docs_fts, 1, '«', '»', '…', 18) AS snippet,
    bm25(docs_fts) AS score
  FROM docs_fts
  JOIN documents d ON d.rowid = docs_fts.rowid
  WHERE docs_fts MATCH $q
`;
const params: Record<string, unknown> = { $q: ftsQ };

if (product) { sql += ` AND d.product = $product`; params.$product = product; }
if (source)  { sql += ` AND d.source LIKE $source`; params.$source = source + "%"; }

sql += ` ORDER BY score ASC LIMIT $limit`;
params.$limit = limit;

let rows: any[];
try {
  rows = db.prepare(sql).all(params);
} catch (e) {
  console.error("× FTS5 query failed:", (e as Error).message);
  console.error("  parsed query was:", ftsQ);
  process.exit(2);
}

// ─── output ────────────────────────────────────────────────────────────────

if (asJson) {
  console.log(JSON.stringify({ query, fts_query: ftsQ, count: rows.length, results: rows }, null, 2));
  process.exit(0);
}

if (rows.length === 0) {
  console.log(`No hits for: ${query}`);
  console.log(`(parsed as FTS5: ${ftsQ})`);
  console.log(`\nTry: broader terms, --source brain/, or re-run \`bun brain/ingest.ts\` if the file is new.`);
  process.exit(0);
}

console.log(`## brain · ${rows.length} hit${rows.length === 1 ? "" : "s"} for: ${query}\n`);
for (const r of rows) {
  const pathRel = r.path as string;
  const product = (r.product as string) || "—";
  const score = (r.score as number).toFixed(2);
  console.log(`- **${r.title}** · \`${pathRel}\` · *${r.source}*${product !== "—" ? ` · product=${product}` : ""} · bm25=${score}`);
  console.log(`  ${(r.snippet as string).replace(/\n+/g, " ").trim()}`);
  console.log();
}
console.log(`Refine: \`bun brain/ask.ts --product <slug> "..."\` or \`--source brain/learnings "..."\``);
