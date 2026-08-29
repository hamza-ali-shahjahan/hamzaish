#!/usr/bin/env bun
// check-status-staleness.ts — dreaming & pruning: time decay for product status pages.
//
// The brain's review queue (`/reflect`) catches learnings nobody wrote down. It
// doesn't catch a status.md that quietly stopped being true. A product staged
// mvp/launch/scale whose config claims "active" but whose status.md hasn't been
// touched in weeks is the same failure shape as "Telemetry is blind"
// (products/_portfolio.md) — a claim nothing is checking — just for docs
// instead of metrics. This makes that mechanical, git-log based (no external
// keys, so it can never false-positive the way a telemetry-based drift check
// would have — every product currently has zero analytics IDs wired, so
// "connectors not_connected" is a permanent constant, not a signal).
//
// Report-first, not a CI gate: staleness is a judgment call (a paused product
// SHOULD go quiet), so this surfaces candidates for /portfolio-pulse and human
// review rather than failing a build. Pass --strict to exit 1 on any stale hit
// once the threshold is trusted enough to enforce.
//
// Usage: bun run check-status-staleness                # dashboard
//        bun run check-status-staleness --json          # machine-readable
//        bun run check-status-staleness --days 30       # override threshold (default 21)
//        bun run check-status-staleness --strict         # exit 1 if anything is stale

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { classifyStaleness, DEFAULT_THRESHOLD_DAYS, type StalenessResult } from "./lib/staleness";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const asJson = process.argv.includes("--json");
const strict = process.argv.includes("--strict");
const daysArgIdx = process.argv.indexOf("--days");
const thresholdDays = daysArgIdx !== -1 ? parseInt(process.argv[daysArgIdx + 1], 10) : DEFAULT_THRESHOLD_DAYS;

function daysSinceLastCommit(relPath: string): number | null {
  const proc = Bun.spawnSync(["git", "log", "-1", "--format=%ct", "--", relPath], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });
  if (proc.exitCode !== 0) return null;
  const out = new TextDecoder().decode(proc.stdout).trim();
  if (!out) return null; // file exists but was never committed (e.g. fresh untracked file)
  const commitMs = parseInt(out, 10) * 1000;
  return Math.floor((Date.now() - commitMs) / 86_400_000);
}

const results: StalenessResult[] = [];
const productsDir = join(root, "products");
for (const slug of readdirSync(productsDir).sort()) {
  if (slug.startsWith("_")) continue;
  const statusPath = join(productsDir, slug, "status.md");
  const cfgPath = join(productsDir, slug, "product.config.json");
  if (!existsSync(statusPath) || !existsSync(cfgPath)) continue;
  try { if (!statSync(statusPath).isFile()) continue; } catch { continue; }

  let cfg: { stage?: string; status?: string; gates?: { verdict?: string } };
  try {
    cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
  } catch {
    continue; // check-product-layout / check-gates already flag unparsable configs
  }

  const daysSinceUpdate = daysSinceLastCommit(`products/${slug}/status.md`);
  results.push(
    classifyStaleness({
      slug,
      stage: cfg.stage ?? "?",
      status: String(cfg.status ?? ""),
      daysSinceUpdate,
      thresholdDays,
      verdict: cfg.gates?.verdict ?? null,
    }),
  );
}

const stale = results.filter((r) => r.stale);

if (asJson) {
  console.log(JSON.stringify({ thresholdDays, generated: new Date().toISOString(), results }, null, 2));
} else {
  console.log(`\nstatus staleness — threshold ${thresholdDays}d`);
  const rows: string[][] = [["product", "stage", "status", "days since status.md", "verdict"]];
  for (const r of results) {
    rows.push([
      r.slug,
      r.stage,
      r.status || "—",
      r.daysSinceUpdate === null ? "—" : String(r.daysSinceUpdate),
      r.stale ? "STALE ✗" : r.claimsActiveWork ? "fresh" : "n/a",
    ]);
  }
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => r[i].length)));
  for (const [i, r] of rows.entries()) {
    console.log("  " + r.map((c, j) => c.padEnd(widths[j])).join("  "));
    if (i === 0) console.log("  " + widths.map((w) => "─".repeat(w)).join("  "));
  }
  if (stale.length > 0) {
    console.log(`\n⚑ ${stale.length} product(s) claim active work but status.md has gone quiet:`);
    for (const r of stale) console.log(`  - ${r.slug}: ${r.reason}`);
    console.log(`\nThis is a candidate list for review, not a verdict — a product can legitimately be paused without anyone updating the file yet.`);
  } else {
    console.log(`\n✓ no status page has gone stale past ${thresholdDays}d for a product claiming active work.`);
  }
}

if (strict && stale.length > 0) process.exit(1);
