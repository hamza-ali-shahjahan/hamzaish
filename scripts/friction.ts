#!/usr/bin/env bun
// friction.ts — log + report structured friction/delight (the capture half of
// /learn-loop's grounding). Local-only JSONL; the file never leaves the machine.
//
//   bun run friction log --severity error --source go-live --message "DNS check hung" [--phase gate-4]
//   bun run friction report [--days 7] [--json]
import { existsSync, readFileSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { frictionLine, summarizeFriction, isSeverity, SEVERITIES } from "./lib/friction";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(root, "meta", "telemetry", "friction.local.jsonl");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const mode = process.argv[2];

if (mode === "log") {
  const severity = arg("severity") ?? "";
  const source = arg("source") ?? "";
  const message = arg("message") ?? "";
  if (!isSeverity(severity) || !source || !message) {
    console.error(`usage: bun run friction log --severity <${SEVERITIES.join("|")}> --source <skill/script> --message "<what happened>" [--phase <step>]`);
    process.exit(1);
  }
  mkdirSync(join(root, "meta", "telemetry"), { recursive: true });
  appendFileSync(FILE, frictionLine({ ts: new Date().toISOString(), severity, source, phase: arg("phase"), message }) + "\n");
  console.log(`✓ ${severity} logged for ${source}`);
  process.exit(0);
}

if (mode === "report" || mode === undefined) {
  const days = Number(arg("days") ?? "7");
  const sinceIso = new Date(Date.now() - days * 86_400_000).toISOString();
  const jsonl = existsSync(FILE) ? readFileSync(FILE, "utf8") : "";
  const s = summarizeFriction(jsonl, { sinceIso });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(s, null, 2));
    process.exit(0);
  }
  console.log(`friction report — last ${days}d (${FILE.replace(root + "/", "")})`);
  if (s.total === 0) {
    console.log("  no entries. (That's a data point too: either a smooth week, or nobody logged.)");
    process.exit(0);
  }
  console.log(`  total: ${s.total} · by severity: ${Object.entries(s.bySeverity).map(([k, v]) => `${k}=${v}`).join(" ")}`);
  const sources = Object.entries(s.bySource).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log(`  by source: ${sources.map(([k, v]) => `${k}(${v})`).join(" · ")}`);
  for (const b of s.blockers.slice(0, 5)) console.log(`  ⛔ ${b.source}${b.phase ? `/${b.phase}` : ""}: ${b.message}`);
  for (const d of s.delights.slice(0, 3)) console.log(`  ✨ ${d.source}: ${d.message}`);
  process.exit(0);
}

console.error("usage: bun run friction log|report …");
process.exit(1);
