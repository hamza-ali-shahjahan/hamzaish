#!/usr/bin/env bun
// brain ask — starter (ported from Hamzaish's own brain/ask.ts)
// FTS5 search over brain.db. Refreshes itself before every query (see
// freshness.ts) so recall can't silently answer from yesterday's files.
//
// Usage:
//   bun brain/ask.ts "your question"
//   bun brain/ask.ts --source <top-level-folder> "your question"
//   bun brain/ask.ts --limit 5 --json "query"
//   bun brain/ask.ts --no-refresh "query"       # answer from the index exactly as it is

import { Database } from "bun:sqlite";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { checkFreshness } from "./freshness.ts";

const BRAIN_ROOT = join(import.meta.dir, "..");
const DB_PATH = join(import.meta.dir, "brain.db");

// ─── arg parsing ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let limit = 8;
let source: string | null = null;
let asJson = false;
let refresh = process.env.BRAIN_NO_REFRESH !== "1";
const queryParts: string[] = [];

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--limit" || a === "-n") { limit = parseInt(args[++i], 10); }
  else if (a === "--source" || a === "-s") { source = args[++i]; }
  else if (a === "--json") { asJson = true; }
  else if (a === "--no-refresh") { refresh = false; }
  else if (a === "--help" || a === "-h") {
    console.log(`Usage: bun brain/ask.ts [--source <folder>] [--limit N] [--json] "<query>"`);
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

if (refresh) {
  const report = await checkFreshness();
  if (report.stale) {
    const proc = Bun.spawnSync([process.execPath, join(import.meta.dir, "ingest.ts")], {
      cwd: BRAIN_ROOT,
      stdout: "pipe",
      stderr: "pipe",
    });
    if (proc.exitCode === 0) {
      console.error(
        report.reason === "no-index"
          ? "⟳ built the brain index (first run)"
          : `⟳ index was behind the files — refreshed (${report.files} docs, probed in ${report.elapsedMs}ms)`,
      );
    } else {
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

function buildFtsQuery(q: string): string {
  const phrases: string[] = [];
  let rest = q.replace(/"([^"]+)"/g, (_, p) => {
    phrases.push(`"${p.replace(/"/g, "")}"`);
    return " ";
  });
  // Every token gets wrapped in double quotes — neutralizes FTS5 operators
  // (-, NEAR, AND, OR, NOT, *, :) when they appear inside a user's term.
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

// ─── coverage gaps ─────────────────────────────────────────────────────────
//
// "State your own gaps" — ported from Hamzaish's own brain/ask.ts, which
// ported the idea from gbrain (brain/knowledge/2026-06-20-phase-c-brain-design.md).
// This script has no LLM step, so it can't narrate a blind spot it discovered
// mid-answer — what it CAN do honestly is disclose the structural blind spots
// that are always true, plus anything a --source scope excluded from THIS query.

function coverageGaps(): string[] {
  const gaps: string[] = [
    "build/vendor folders (node_modules, .git, dist, build, .next, .turbo, .wrangler) and any folder starting with `.` or `_` are never indexed.",
  ];
  if (source) gaps.push(`scoped to source \`${source}\` — other folders were excluded from this search.`);
  return gaps;
}

// ─── search ────────────────────────────────────────────────────────────────

const db = new Database(DB_PATH, { readonly: true });
db.exec("PRAGMA busy_timeout = 5000");

let sql = `
  SELECT
    d.id           AS path,
    d.title        AS title,
    d.source       AS source,
    snippet(docs_fts, 1, '«', '»', '…', 18) AS snippet,
    bm25(docs_fts) AS score
  FROM docs_fts
  JOIN documents d ON d.rowid = docs_fts.rowid
  WHERE docs_fts MATCH $q
`;
const params: Record<string, unknown> = { $q: ftsQ };

if (source) { sql += ` AND d.source = $source`; params.$source = source; }

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
  console.log(JSON.stringify({ query, fts_query: ftsQ, count: rows.length, results: rows, coverage_gaps: coverageGaps() }, null, 2));
  process.exit(0);
}

if (rows.length === 0) {
  console.log(`No hits for: ${query}`);
  console.log(`(parsed as FTS5: ${ftsQ})`);
  console.log(
    refresh
      ? `\nThe index is up to date, so this is genuinely uncharted. Try broader terms.`
      : `\nTry broader terms — and note refresh was skipped, so the index may be behind.`,
  );
  console.log(`\nWhat this search didn't cover: ${coverageGaps().join(" ")}`);
  process.exit(0);
}

console.log(`## brain · ${rows.length} hit${rows.length === 1 ? "" : "s"} for: ${query}\n`);
for (const r of rows) {
  const score = (r.score as number).toFixed(2);
  console.log(`- **${r.title}** · \`${r.path}\` · *${r.source}* · bm25=${score}`);
  console.log(`  ${(r.snippet as string).replace(/\n+/g, " ").trim()}`);
  console.log();
}
console.log(`What this search didn't cover: ${coverageGaps().join(" ")}`);
console.log(`Refine: \`bun brain/ask.ts --source <folder> "..."\``);
