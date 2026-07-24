#!/usr/bin/env bun
// reward.ts — log + report the factory's REWARD signal: did the task the customer
// actually cares about complete? (the dimension trace-log + friction don't carry).
//
//   bun run reward log --signal eval --outcome pass --source feature-slicing [--value 1.0] [--ref …] [--note "…"]
//   bun run reward report [--days 7] [--json]
//
// Local-only JSONL (meta/telemetry/reward.local.jsonl); never leaves the machine.
import { existsSync, readFileSync, mkdirSync, appendFileSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { rewardLine, summarizeReward, isSignal, isOutcome, SIGNALS, OUTCOMES } from "./lib/reward";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(root, "meta", "telemetry", "reward.local.jsonl");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const mode = process.argv[2];

if (mode === "log") {
  const signal = arg("signal") ?? "";
  const outcome = arg("outcome") ?? "";
  const source = arg("source") ?? "";
  if (!isSignal(signal) || !isOutcome(outcome) || !source) {
    console.error(
      `usage: bun run reward log --signal <${SIGNALS.join("|")}> --outcome <${OUTCOMES.join("|")}> --source <skill/product> [--value <n>] [--ref <ptr>] [--note "<what>"]`,
    );
    process.exit(1);
  }
  const valueRaw = arg("value");
  const value = valueRaw !== undefined ? Number(valueRaw) : undefined;
  mkdirSync(join(root, "meta", "telemetry"), { recursive: true });
  appendFileSync(
    FILE,
    rewardLine({
      ts: new Date().toISOString(),
      signal,
      outcome,
      source,
      value: value !== undefined && Number.isFinite(value) ? value : undefined,
      ref: arg("ref"),
      note: arg("note"),
    }) + "\n",
  );
  console.log(`✓ reward logged: ${signal}/${outcome} for ${source}${value !== undefined ? ` (value=${value})` : ""}`);
  process.exit(0);
}

if (mode === "report" || mode === undefined) {
  const days = Number(arg("days") ?? "7");
  const sinceIso = new Date(Date.now() - days * 86_400_000).toISOString();
  const jsonl = existsSync(FILE) ? readFileSync(FILE, "utf8") : "";
  const s = summarizeReward(jsonl, { sinceIso });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(s, null, 2));
    process.exit(0);
  }
  console.log(`reward report — last ${days}d (${FILE.replace(root + "/", "")})`);
  if (s.total === 0) {
    console.log("  no reward entries yet. (Wire an outcome — an eval pass, an activation event — to start the hill.)");
    process.exit(0);
  }
  console.log(`  total: ${s.total} · overall pass rate: ${(s.passRate * 100).toFixed(0)}%`);
  console.log(`  by signal: ${Object.entries(s.bySignal).map(([k, v]) => `${k}=${v}`).join(" · ")}`);
  const sources = Object.entries(s.bySource)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 8);
  console.log(`  by source: ${sources.map(([k, v]) => `${k}(${v.pass}/${v.total})`).join(" · ")}`);
  process.exit(0);
}

console.error("usage: bun run reward log|report …");
process.exit(1);
