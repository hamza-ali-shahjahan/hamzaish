#!/usr/bin/env bun
// check-gates.ts — the lifecycle-gate dashboard + guard.
//
// Renders every product's gate ladder (states-and-dates precommitments from
// product.config.json → `gates`) and enforces the rule that makes kill
// discipline mechanical instead of quarterly vibes:
//
//   exit 1 when:
//     • a product REGISTERED in code-paths.local.json (the operator's real
//       work queue) has no `gates` block, or a malformed one
//   info only:
//     • showcase products (committed but unregistered) without gates — they're
//       proof/context, not the operator's queue (CLAUDE.md showcase rule)
//     • OVERDUE gates (the heartbeat/operator act on these; a deadline missed
//       is a verdict conversation, not a broken build)
//
// Usage: bun run check-gates              # dashboard + gate
//        bun run check-gates --quiet      # gate only (CI); print on failure
//        bun run check-gates --self-test  # deterministic fixture run (eval anchor)
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateGates, summarize, validateGates, nextGate, type GatesBlock } from "./lib/gates";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const quiet = process.argv.includes("--quiet");
const log = (s: string) => { if (!quiet) console.log(s); };

// ── self-test: the deterministic eval anchor (no repo state involved) ────────
if (process.argv.includes("--self-test")) {
  const fixture: GatesBlock = {
    validation: { date: "2026-01-10", state: "5 conversations", passed: "2026-01-09" },
    launch: { date: "2026-02-01", state: "first dollar" },
  };
  const evals = evaluateGates(fixture, "2026-02-15");
  const okEval = evals.length === 2 && evals[0].status === "PASSED" && evals[1].status === "OVERDUE";
  const okNext = nextGate(evals)?.gate === "launch";
  const okValid = validateGates(fixture).length === 0;
  const okInvalid = validateGates({}).length === 1;
  if (okEval && okNext && okValid && okInvalid) {
    console.log("self-test: PASS (evaluate/next/validate all behave)");
    process.exit(0);
  }
  console.error(`self-test: FAIL (evals=${JSON.stringify(evals)} next=${nextGate(evals)?.gate})`);
  process.exit(1);
}

// ── registered products = the operator's real queue ──────────────────────────
let registered = new Set<string>();
const cpPath = join(root, "code-paths.local.json");
if (existsSync(cpPath)) {
  try {
    const cp = JSON.parse(readFileSync(cpPath, "utf8"));
    const map = cp && typeof cp.products === "object" && cp.products ? cp.products : cp;
    if (map && typeof map === "object") registered = new Set(Object.keys(map));
  } catch {
    /* unreadable local file → treat as none registered (CI has none either) */
  }
}

const today = new Date().toISOString().slice(0, 10);
const fails: string[] = [];
let overdue = 0;

const rows: string[][] = [["product", "stage", "verdict", "next gate", "who"]];
const productsRoot = join(root, "products");
for (const slug of readdirSync(productsRoot).sort()) {
  if (slug.startsWith("_")) continue;
  const cfgPath = join(productsRoot, slug, "product.config.json");
  try { if (!statSync(cfgPath).isFile()) continue; } catch { continue; }

  let cfg: { stage?: string; status?: string; gates?: GatesBlock };
  try {
    cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
  } catch (e) {
    fails.push(`${slug}: product.config.json unparsable (${e})`);
    continue;
  }

  const isRegistered = registered.has(slug);
  const who = isRegistered ? "registered" : "showcase";

  if (!cfg.gates) {
    if (isRegistered) {
      fails.push(`${slug}: REGISTERED product has no gates block — write its states-and-dates (see FACTORY-ORDERS.example.md + /factory-launch)`);
      rows.push([slug, cfg.stage ?? "?", "—", "NO GATES ✗", who]);
    } else {
      rows.push([slug, cfg.stage ?? "?", "—", "no gates (showcase — ok)", who]);
    }
    continue;
  }

  const problems = validateGates(cfg.gates);
  if (problems.length > 0) {
    for (const p of problems) {
      if (isRegistered) fails.push(`${slug}: ${p}`);
      else log(`  · ${slug} (showcase): ${p}`);
    }
  }
  const evals = evaluateGates(cfg.gates, today);
  const line = summarize(evals);
  if (line.includes("OVERDUE")) overdue++;
  rows.push([slug, cfg.stage ?? "?", cfg.gates.verdict ?? "—", line, who]);
}

// ── render ───────────────────────────────────────────────────────────────────
const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => r[i].length)));
log(`\ngate dashboard — ${today}`);
for (const [i, r] of rows.entries()) {
  log("  " + r.map((c, j) => c.padEnd(widths[j])).join("  "));
  if (i === 0) log("  " + widths.map((w) => "─".repeat(w)).join("  "));
}
if (overdue > 0) log(`\n  ⚑ ${overdue} product(s) OVERDUE on a gate — verdict conversation due (kill or double down, never drift).`);

if (fails.length > 0) {
  console.error(`\n✗ check-gates: ${fails.length} problem(s)`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
log(`\n✓ check-gates: every registered product carries a valid gates block.`);
