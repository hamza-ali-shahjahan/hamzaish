#!/usr/bin/env bun
// Hamzaish — eval harness runner (Movement 1 / Phase D, brick #1)
//
// The honest, agent-blind judge. Discovers case files, runs each system under
// test as a subprocess, and returns a FOUR-OUTCOME verdict per case:
//
//   PASS            all executable criteria green → keep, no human
//   FAIL_BUILDABLE  a clear criterion failed → the output is wrong, fix it
//   GAP             the criterion couldn't be written / spec silent → escalate, never guess
//   UNCERTAIN       can't classify (timeout, judge-needed) → the only outcome
//                   that pulls a human in real time
//   (SKIP           environment missing — non-verdict, never red)
//
// Usage:
//   bun meta/evals/run.ts                 # run everything
//   bun meta/evals/run.ts --skill brain-ask
//   bun meta/evals/run.ts --case meta/evals/skills/brain-ask/cases/x.yaml
//   bun meta/evals/run.ts --update-baseline
//
// Regression floor: meta/evals/baseline.json records which cases PASS. A case
// that was PASS in the baseline and is no longer PASS → exit 1 (regressions
// block). New cases failing → reported, exit 0 (new failures explain).
//
// AGENT-BLIND RULE (the hard one): the system under test must never read its
// own cases or rubric. cases/ + runs/ are excluded from the brain index
// (brain/ingest.ts SKIP_DIRS) and no skill may reference meta/evals/.

import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { validateCase, runInvocation, runChecks, type CaseSpec, type Verdict } from "./lib/checks";

const ROOT = resolve(import.meta.dir, "..", "..");
const EVALS_DIR = import.meta.dir;
const BASELINE_PATH = join(EVALS_DIR, "baseline.json");
const RUNS_DIR = join(EVALS_DIR, "runs");
const DEFAULT_TIMEOUT_MS = 30_000;

// ─── args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let skillFilter: string | null = null;
let caseFilter: string | null = null;
let updateBaseline = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--skill") skillFilter = args[++i];
  else if (args[i] === "--case") caseFilter = resolve(args[++i]);
  else if (args[i] === "--update-baseline") updateBaseline = true;
  else if (args[i] === "--help" || args[i] === "-h") {
    console.log("Usage: bun meta/evals/run.ts [--skill <name>] [--case <path>] [--update-baseline]");
    process.exit(0);
  }
}

// ─── discover cases ────────────────────────────────────────────────────────

async function discoverCases(): Promise<string[]> {
  const out: string[] = [];
  const skillsDir = join(EVALS_DIR, "skills");
  if (!existsSync(skillsDir)) return out;
  for (const skill of await readdir(skillsDir)) {
    if (skillFilter && skill !== skillFilter) continue;
    const casesDir = join(skillsDir, skill, "cases");
    if (!existsSync(casesDir)) continue;
    for (const f of await readdir(casesDir)) {
      if (!f.endsWith(".yaml") && !f.endsWith(".yml")) continue;
      const p = join(casesDir, f);
      if (caseFilter && resolve(p) !== caseFilter) continue;
      out.push(p);
    }
  }
  return out.sort();
}

// ─── run one case ──────────────────────────────────────────────────────────

async function runOne(path: string): Promise<Verdict> {
  const started = Date.now();
  const rel = relative(ROOT, path);

  let spec: CaseSpec;
  try {
    spec = (Bun as any).YAML.parse(await Bun.file(path).text());
  } catch (e) {
    return { name: rel, skill: "?", outcome: "GAP", reason: `unparseable case file: ${(e as Error).message.slice(0, 100)}`, checks: [], duration_ms: Date.now() - started };
  }

  // Executable-criterion-or-GAP, enforced at load time
  const schemaErr = validateCase(spec);
  if (schemaErr) {
    return { name: spec?.name ?? rel, skill: spec?.skill ?? "?", outcome: "GAP", reason: `criterion not executable: ${schemaErr}`, checks: [], duration_ms: Date.now() - started };
  }

  // Preflight: missing environment → SKIP (never a failure)
  for (const f of spec.preflight?.must_exist ?? []) {
    if (!existsSync(join(ROOT, f))) {
      return { name: spec.name, skill: spec.skill, outcome: "SKIP", reason: `environment missing: ${f}`, checks: [], duration_ms: Date.now() - started };
    }
  }

  const inv = await runInvocation(spec.invoke.cmd, ROOT, spec.invoke.timeout_ms ?? DEFAULT_TIMEOUT_MS);
  if (inv === "timeout") {
    return { name: spec.name, skill: spec.skill, outcome: "UNCERTAIN", reason: `timed out after ${spec.invoke.timeout_ms ?? DEFAULT_TIMEOUT_MS}ms — can't distinguish broken from slow`, checks: [], duration_ms: Date.now() - started };
  }
  if ("spawnError" in (inv as any)) {
    return { name: spec.name, skill: spec.skill, outcome: "UNCERTAIN", reason: `could not spawn: ${(inv as any).spawnError}`, checks: [], duration_ms: Date.now() - started };
  }

  const checks = runChecks(spec.checks, inv as any);
  const failed = checks.filter((c) => !c.ok);
  return {
    name: spec.name,
    skill: spec.skill,
    outcome: failed.length === 0 ? "PASS" : "FAIL_BUILDABLE",
    reason: failed.length === 0 ? "all criteria green" : `${failed.length}/${checks.length} criteria failed — fix the output, the criteria are clear`,
    checks,
    duration_ms: Date.now() - started,
  };
}

// ─── main ──────────────────────────────────────────────────────────────────

const casePaths = await discoverCases();
if (casePaths.length === 0) {
  console.log("No cases found (filters too narrow, or meta/evals/skills/*/cases/ empty).");
  process.exit(0);
}

console.log(`→ eval run: ${casePaths.length} case${casePaths.length === 1 ? "" : "s"}\n`);
const verdicts: Verdict[] = [];
for (const p of casePaths) {
  const v = await runOne(p);
  verdicts.push(v);
  const icon = { PASS: "✅", FAIL_BUILDABLE: "❌", GAP: "🕳️ ", UNCERTAIN: "❓", SKIP: "⏭️ " }[v.outcome];
  console.log(`${icon} ${v.outcome.padEnd(15)} ${v.skill}/${v.name}  (${v.duration_ms}ms)`);
  if (v.outcome !== "PASS") console.log(`   └─ ${v.reason}`);
  for (const c of v.checks) if (!c.ok) console.log(`      ✗ ${c.check} → ${c.detail}`);
}

// ─── baseline / regression floor ───────────────────────────────────────────

const key = (v: Verdict) => `${v.skill}/${v.name}`;
let baseline: Record<string, string> = {};
let baselineExisted = existsSync(BASELINE_PATH);
if (baselineExisted) baseline = JSON.parse(await Bun.file(BASELINE_PATH).text());

const regressions = verdicts.filter((v) => baseline[key(v)] === "PASS" && v.outcome !== "PASS");
const passes = Object.fromEntries(verdicts.filter((v) => v.outcome === "PASS").map((v) => [key(v), "PASS"]));

if (!baselineExisted || updateBaseline) {
  await Bun.write(BASELINE_PATH, JSON.stringify({ ...baseline, ...passes }, null, 2) + "\n");
  console.log(`\n→ baseline ${baselineExisted ? "updated" : "established (first run sets the floor)"}: ${BASELINE_PATH.replace(ROOT + "/", "")}`);
}

// ─── report ────────────────────────────────────────────────────────────────

const counts: Record<string, number> = {};
for (const v of verdicts) counts[v.outcome] = (counts[v.outcome] ?? 0) + 1;
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
await mkdir(RUNS_DIR, { recursive: true });

const md = [
  `# Eval run — ${new Date().toISOString()}`,
  ``,
  `**${verdicts.length} cases** · ${Object.entries(counts).map(([k, n]) => `${k}: ${n}`).join(" · ")}${regressions.length ? ` · **REGRESSIONS: ${regressions.length}**` : ""}`,
  ``,
  `| Outcome | Skill / case | Reason | ms |`,
  `|---|---|---|---|`,
  ...verdicts.map((v) => `| ${v.outcome} | \`${key(v)}\` | ${v.reason} | ${v.duration_ms} |`),
  ``,
  `## Check detail`,
  ``,
  ...verdicts.flatMap((v) => [`### ${key(v)} — ${v.outcome}`, ...v.checks.map((c) => `- ${c.ok ? "✅" : "✗"} ${c.check} — ${c.detail}`), ``]),
].join("\n");

await Bun.write(join(RUNS_DIR, `${stamp}.md`), md);
await Bun.write(join(RUNS_DIR, `${stamp}.json`), JSON.stringify({ verdicts, counts, regressions: regressions.map(key) }, null, 2) + "\n");

console.log(`\n→ report: meta/evals/runs/${stamp}.md`);
console.log(`→ summary: ${Object.entries(counts).map(([k, n]) => `${k}=${n}`).join("  ")}`);

if (regressions.length > 0) {
  console.error(`\n✗ ${regressions.length} regression(s) vs baseline — previously-passing cases now failing:`);
  for (const r of regressions) console.error(`  - ${key(r)} → ${r.outcome}: ${r.reason}`);
  process.exit(1);
}
process.exit(0);
