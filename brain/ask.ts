#!/usr/bin/env bun
// Hamzaish — brain ask
// Hybrid-ish retrieval over brain.db. FTS5 first (vectors are Phase C).
//
// Usage:
//   bun brain/ask.ts "what's the muakkil status"
//   bun brain/ask.ts --product muakkil "scribe demo plan"
//   bun brain/ask.ts --source brain/learnings "what surprised me"
//   bun brain/ask.ts --limit 5 --json "query"
//   bun brain/ask.ts --no-refresh "query"        # answer from the index exactly as it is
//
// Output: markdown citations with snippets. Cite by path so the caller can open the file.
//
// FRESHNESS: every query stats the corpus first (~20ms, no reads) and rebuilds the
// index only if a file moved — so recall describes the markdown as it is right now,
// never as it was at the last manual ingest. Before this, ask/ answered from whatever
// the last ingest left behind and only NAGGED about re-ingesting in its no-hits
// footer — i.e. in the one case that wasn't dangerous. A stale index does not return
// no hits; it returns confident, out-of-date ones.
// Escape hatches: --no-refresh (this call) or BRAIN_NO_REFRESH=1 (every call).
// Set BRAIN_REFRESH=hash to compare file contents instead of size+mtime.

import { Database } from "bun:sqlite";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { checkFreshness } from "./freshness.ts";

const HAMZAISH_ROOT = join(import.meta.dir, "..");
const DB_PATH = join(import.meta.dir, "brain.db");

// ─── arg parsing ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let limit = 8;
let product: string | null = null;
let source: string | null = null;
let asJson = false;
let asContext = false; // --context: a compact, ready-to-inject session briefing block
let refresh = process.env.BRAIN_NO_REFRESH !== "1";
const queryParts: string[] = [];

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--limit" || a === "-n") { limit = parseInt(args[++i], 10); }
  else if (a === "--product" || a === "-p") { product = args[++i]; }
  else if (a === "--source" || a === "-s") { source = args[++i]; }
  else if (a === "--json") { asJson = true; }
  else if (a === "--context") { asContext = true; }
  else if (a === "--no-refresh") { refresh = false; }
  else if (a === "--help" || a === "-h") {
    console.log(`Usage: bun brain/ask.ts [--product slug] [--source path] [--limit N] [--json|--context] "<query>"`);
    console.log(`  --context     emit a compact recall block for injecting into a session (anti-patterns first)`);
    console.log(`  --no-refresh  skip the freshness check and answer from the index as-is`);
    process.exit(0);
  }
  else { queryParts.push(a); }
}

const query = queryParts.join(" ").trim();
if (!query) {
  console.error("× missing query. `bun brain/ask.ts \"your question\"`");
  process.exit(1);
}

// ─── freshness: refresh before reading ────────────────────────────────────
//
// Stat-only, so it is cheap enough to run on EVERY query; the rebuild behind it
// only happens when the corpus actually moved. Ingest stays the single writer —
// we shell out to it rather than duplicating its logic here.

if (refresh) {
  const report = await checkFreshness();
  if (report.stale) {
    const proc = Bun.spawnSync([process.execPath, join(import.meta.dir, "ingest.ts")], {
      cwd: HAMZAISH_ROOT,
      stdout: "pipe",
      stderr: "pipe",
    });
    // Notes go to stderr on purpose: stdout is the answer, parsed as markdown by
    // /brain-ask and as JSON by --json. A chatty stdout would corrupt both.
    if (proc.exitCode === 0) {
      console.error(
        report.reason === "no-index"
          ? "⟳ built the brain index (first run)"
          : `⟳ index was behind the files — refreshed (${report.files} docs, probed in ${report.elapsedMs}ms)`,
      );
    } else {
      // Fail open. A rebuild that breaks must not take recall down with it —
      // stale answers beat no answers, as long as the staleness is announced.
      console.error("⚠ refresh failed — answering from the index as it stands, which may be behind the files");
      const err = new TextDecoder().decode(proc.stderr).trim();
      if (err) console.error(err.split("\n").slice(-3).join("\n"));
    }
  }
}

if (!existsSync(DB_PATH)) {
  console.error("× no brain index, and it could not be built. Run `bun brain/ingest.ts` to see why.");
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
// Concurrent readers (e.g. the eval harness runs cases in parallel) must wait
// out transient locks instead of erroring with "database is locked".
db.exec("PRAGMA busy_timeout = 5000");

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

if (asContext) {
  // A briefing block a session injects at start (used by /work-on step 7).
  // Anti-patterns lead: defenses are worth more than context. Recall is
  // point-in-time — the footer tells the reader to verify before relying.
  const clean = (s: string) => s.replace(/\n+/g, " ").trim();
  const groups: { title: string; match: (src: string) => boolean }[] = [
    { title: "Defenses (anti-patterns)", match: (s) => s.startsWith("brain/anti-patterns") },
    { title: "Learnings & decisions", match: (s) => s.startsWith("brain/learnings") || s.startsWith("brain/decision-log") || s.startsWith("products/decisions") || s.startsWith("products/learnings") },
    { title: "Other context", match: () => true },
  ];
  console.log(`### 🧠 Brain recall — ${query}\n`);
  if (rows.length === 0) {
    console.log(
      refresh
        ? `_No recall hits against a just-refreshed index — genuinely new territory._`
        : `_No recall hits. Refresh was skipped, so the index may be behind the files._`,
    );
    process.exit(0);
  }
  const used = new Set<string>();
  for (const g of groups) {
    const hits = rows.filter((r) => !used.has(r.path) && g.match(r.source as string));
    if (hits.length === 0) continue;
    console.log(`**${g.title}:**`);
    for (const r of hits) {
      used.add(r.path);
      console.log(`- ${r.title} · \`${r.path}\` — ${clean(r.snippet as string)}`);
    }
    console.log();
  }
  console.log(`_Recalled from the brain index (FTS5, point-in-time). Verify against the live file before relying on any of it._`);
  process.exit(0);
}

if (rows.length === 0) {
  console.log(`No hits for: ${query}`);
  console.log(`(parsed as FTS5: ${ftsQ})`);
  console.log(
    refresh
      ? `\nThe index is up to date, so this is genuinely uncharted. Try broader terms or --source brain/.`
      : `\nTry broader terms or --source brain/ — and note refresh was skipped, so the index may be behind.`,
  );
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
