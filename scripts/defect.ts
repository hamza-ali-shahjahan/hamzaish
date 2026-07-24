#!/usr/bin/env bun
// defect.ts — log + report the guard-fire defect registry (see lib/defects.ts).
//
//   bun run defect log --catcher "verify-live A4" --stage live --target ventbox \
//       --defect "deployed sha != HEAD" [--severity major] [--fixed-by "PR #63"]
//   bun run defect report [--days 90] [--json]
import { existsSync, readFileSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defectLine, summarizeDefects, isStage, STAGES } from "./lib/defects";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(root, "meta", "telemetry", "defects.local.jsonl");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const mode = process.argv[2];

if (mode === "log") {
  const stage = arg("stage") ?? "";
  const catcher = arg("catcher") ?? "";
  const defect = arg("defect") ?? "";
  const target = arg("target") ?? "factory";
  const severity = arg("severity") as "critical" | "major" | "minor" | undefined;
  if (!isStage(stage) || !catcher || !defect) {
    console.error(`usage: bun run defect log --catcher <check id> --stage <${STAGES.join("|")}> --defect "<what was wrong>" [--target <slug>] [--severity critical|major|minor] [--fixed-by <ref>]`);
    process.exit(1);
  }
  mkdirSync(join(root, "meta", "telemetry"), { recursive: true });
  appendFileSync(
    FILE,
    defectLine({ ts: new Date().toISOString(), target, catcher, stage, defect, severity, fixed_by: arg("fixed-by") }) + "\n",
  );
  console.log(`✓ defect logged: ${catcher} (${stage}) caught "${defect}"`);
  process.exit(0);
}

if (mode === "report" || mode === undefined) {
  const days = Number(arg("days") ?? "90");
  const sinceIso = new Date(Date.now() - days * 86_400_000).toISOString();
  const jsonl = existsSync(FILE) ? readFileSync(FILE, "utf8") : "";
  const s = summarizeDefects(jsonl, { sinceIso });
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(s, null, 2));
    process.exit(0);
  }
  console.log(`defect registry — last ${days}d (${FILE.replace(root + "/", "")})`);
  if (s.total === 0) {
    console.log("  no catches recorded. (Guards firing without rows here = the registry isn't being fed — log at catch time.)");
    process.exit(0);
  }
  console.log(`  total: ${s.total}`);
  const top = (m: Record<string, number>) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}(${v})`).join(" · ");
  console.log(`  by catcher: ${top(s.byCatcher)}`);
  console.log(`  by stage:   ${top(s.byStage)}`);
  console.log(`  by target:  ${top(s.byTarget)}`);
  for (const c of s.criticals.slice(0, 5)) console.log(`  ‼ ${c.catcher} (${c.target}): ${c.defect}${c.fixed_by ? ` — fixed by ${c.fixed_by}` : ""}`);
  process.exit(0);
}

console.error("usage: bun run defect log|report …");
process.exit(1);
