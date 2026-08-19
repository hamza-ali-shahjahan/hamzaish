#!/usr/bin/env bun
// verify.ts — run a gate and record what REALLY happened, so the receipt can't guess.
//
// The defect this exists for: a session's "Checked:" line is narration. It is composed
// by the same entity that did the work, and `check-legibility` only lints its wording.
// This runner is the other half: it executes the gate, captures the true exit code, and
// appends it to a hash-chained ledger. `--checked` then RENDERS the line from those
// records. The narrator stops being the source of the claim.
//
// Honest about its ceiling (see lib/verification-ledger.ts): tamper-EVIDENT, not
// unforgeable. A shell can still append a lie; the chain makes it a deliberate act and
// an empty ledger reads "nothing was verified" instead of reading as success.
//
//   bun run verify check-counts check-evals   # run gates, record real exit codes
//   bun run verify --all                      # the standard pre-ship set
//   bun run verify --checked                  # print the Checked line from the ledger
//   bun run verify --show                     # full ledger + chain status
//   bun run verify --self-test                # deterministic anchor (no repo state)
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { appendRecord, parseLedger, renderChecked, verifyChain } from "./lib/verification-ledger";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

// ── the standard set: the guards CI runs, in the order a reader would want them ──
const STANDARD = [
  "check-counts",
  "check-evals",
  "check-model-independence",
  "check-product-layout",
  "check-skill-command-collision",
  "check-limitations",
  "check-decisions",
] as const;

// ── self-test: deterministic anchor, touches no repo state ──────────────────────
if (args.includes("--self-test")) {
  const a = appendRecord([], { ts: "2026-01-01T00:00:00Z", gate: "g1", cmd: "x", exitCode: 0, durationMs: 1 });
  const b = appendRecord([a], { ts: "2026-01-01T00:00:01Z", gate: "g2", cmd: "y", exitCode: 1, durationMs: 2 });
  const okChain = verifyChain([a, b]).ok;
  const okTamper = !verifyChain([{ ...a, exitCode: 1 }, b]).ok;
  const okEmpty = renderChecked([]).text.startsWith("nothing was verified");
  const okFail = renderChecked([a, b]).text.includes("FAILED") && !renderChecked([a, b]).clean;
  if (okChain && okTamper && okEmpty && okFail) {
    console.log("self-test: PASS (chain holds, tampering detected, silence and failure both visible)");
    process.exit(0);
  }
  console.error(`self-test: FAIL (chain=${okChain} tamper=${okTamper} empty=${okEmpty} fail=${okFail})`);
  process.exit(1);
}

// ── ledger location: gitignored, local-only, one per session ────────────────────
// Session identity comes from the environment when the host provides one; otherwise
// the day. Named .local.jsonl so the repo's existing ignore rule covers it.
const sessionId = process.env.HAMZAISH_VERIFY_SESSION ?? new Date().toISOString().slice(0, 10);
const ledgerDir = join(root, "meta", "telemetry", "verification");
const ledgerPath = join(ledgerDir, `${sessionId}.local.jsonl`);

function readLedger() {
  return existsSync(ledgerPath) ? parseLedger(readFileSync(ledgerPath, "utf8")) : [];
}

// ── --checked / --show: read-only reporting ────────────────────────────────────
if (args.includes("--checked")) {
  const line = renderChecked(readLedger());
  console.log(line.text);
  process.exit(line.clean ? 0 : 1);
}

if (args.includes("--show")) {
  const records = readLedger();
  const chain = verifyChain(records);
  console.log(`ledger: ${ledgerPath}`);
  console.log(`records: ${records.length} · chain: ${chain.ok ? "intact" : `BROKEN — ${chain.why}`}`);
  for (const r of records) {
    console.log(`  ${r.exitCode === 0 ? "✓" : "✗"} ${r.gate.padEnd(30)} exit=${r.exitCode} ${r.durationMs}ms  ${r.ts}`);
  }
  console.log(`\nChecked: ${renderChecked(records).text}`);
  // --show is a VIEWER and always exits 0; --checked is the gate. Keeping one exit
  // code meaningful in one place stops "it exited 0" from meaning two different things.
  process.exit(0);
}

// ── run mode ───────────────────────────────────────────────────────────────────
const gates = args.includes("--all") ? [...STANDARD] : args.filter((a) => !a.startsWith("--"));
if (gates.length === 0) {
  console.error("usage: bun run verify <gate>... | --all | --checked | --show | --self-test");
  process.exit(1);
}

mkdirSync(ledgerDir, { recursive: true });
let anyFailed = false;

for (const gate of gates) {
  const cmd = `bun run ${gate}`;
  const started = Date.now();
  const proc = Bun.spawnSync(["bun", "run", gate], { cwd: root, stdout: "inherit", stderr: "inherit" });
  const durationMs = Date.now() - started;
  const exitCode = proc.exitCode ?? 1;
  if (exitCode !== 0) anyFailed = true;

  // Append from the REAL exit code — this is the load-bearing line of the file.
  const record = appendRecord(readLedger(), { ts: new Date().toISOString(), gate, cmd, exitCode, durationMs });
  appendFileSync(ledgerPath, `${JSON.stringify(record)}\n`);
  console.log(`${exitCode === 0 ? "✓" : "✗"} ${gate} (exit ${exitCode}, ${durationMs}ms) → recorded`);
}

console.log(`\nChecked: ${renderChecked(readLedger()).text}`);
process.exit(anyFailed ? 1 : 0);
