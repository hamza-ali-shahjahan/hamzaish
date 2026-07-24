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
//   bun meta/evals/run.ts                 # run everything (incl. LLM cases via claude -p)
//   bun meta/evals/run.ts --skill brain-ask
//   bun meta/evals/run.ts --case meta/evals/skills/brain-ask/cases/x.yaml
//   bun meta/evals/run.ts --no-llm        # deterministic cases only (LLM cases → SKIP); fast + free
//   bun meta/evals/run.ts --update-baseline
//
// Regression floor: meta/evals/baseline.json records which cases PASS. A case
// that was PASS in the baseline and is now FAIL_BUILDABLE → exit 1 (regressions
// block). A baseline-PASS case going UNCERTAIN/GAP/SKIP is reported loudly but
// does not block — UNCERTAIN pulls a human, it doesn't fail the floor (LLM
// cases are nondeterministic; a judge hiccup must not read as a regression).
// New cases failing → reported, exit 0 (new failures explain).
//
// The LLM judge (lib/judge.ts) runs only after every deterministic check passes,
// and is a GATE, never an oracle: it can demote to FAIL_BUILDABLE/UNCERTAIN,
// it can never produce PASS on its own.
//
// AGENT-BLIND RULE (the hard one): the system under test must never read its
// own cases or rubric. cases/ + runs/ are excluded from the brain index
// (brain/ingest.ts SKIP_DIRS) and no skill may reference meta/evals/.

import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { validateCase, runInvocation, runChecks, type CaseSpec, type Verdict } from "./lib/checks";
import { llmJudge, JUDGE_MODEL } from "./lib/judge";
import { runSweepMode } from "./lib/sweep";

const ROOT = resolve(import.meta.dir, "..", "..");
const EVALS_DIR = import.meta.dir;
const BASELINE_PATH = join(EVALS_DIR, "baseline.json");
const RUNS_DIR = join(EVALS_DIR, "runs");
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_LLM_TIMEOUT_MS = 240_000; // claude -p cases read playbooks + generate — minutes, not seconds
const CONCURRENCY = 3;

// ─── args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let skillFilter: string | null = null;
let caseFilter: string | null = null;
let updateBaseline = false;
let noLlm = false;
let models: string[] | null = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--skill") skillFilter = args[++i];
  else if (args[i] === "--case") caseFilter = resolve(args[++i]);
  else if (args[i] === "--update-baseline") updateBaseline = true;
  else if (args[i] === "--no-llm") noLlm = true;
  else if (args[i] === "--models") models = args[++i].split(",").map((s) => s.trim()).filter(Boolean);
  else if (args[i] === "--help" || args[i] === "-h") {
    console.log("Usage: bun meta/evals/run.ts [--skill <name>] [--case <path>] [--no-llm] [--models a,b,c] [--update-baseline]");
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

/** An LLM case invokes claude -p and/or carries an llm_judge check —
 *  nondeterministic, slower default timeout, one retry, skippable via --no-llm. */
function isLlmCase(spec: CaseSpec): boolean {
  return spec.invoke.cmd[0] === "claude" || spec.checks.some((c) => c.type === "llm_judge");
}

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

  // --no-llm: LLM cases become SKIP (non-verdict) — the fast, free gate
  if (noLlm && isLlmCase(spec)) {
    return { name: spec.name, skill: spec.skill, outcome: "SKIP", reason: "--no-llm (LLM case skipped)", checks: [], duration_ms: Date.now() - started };
  }

  // Preflight: missing environment → SKIP (never a failure)
  for (const f of spec.preflight?.must_exist ?? []) {
    if (!existsSync(join(ROOT, f))) {
      return { name: spec.name, skill: spec.skill, outcome: "SKIP", reason: `environment missing: ${f}`, checks: [], duration_ms: Date.now() - started };
    }
  }
  for (const cmd of [...(spec.preflight?.commands ?? []), ...(isLlmCase(spec) ? ["claude"] : [])]) {
    if (!Bun.which(cmd)) {
      return { name: spec.name, skill: spec.skill, outcome: "SKIP", reason: `command not on PATH: ${cmd}`, checks: [], duration_ms: Date.now() - started };
    }
  }

  const defaultTimeout = isLlmCase(spec) ? DEFAULT_LLM_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;
  const inv = await runInvocation(spec.invoke.cmd, ROOT, spec.invoke.timeout_ms ?? defaultTimeout);
  if (inv === "timeout") {
    return { name: spec.name, skill: spec.skill, outcome: "UNCERTAIN", reason: `timed out after ${spec.invoke.timeout_ms ?? defaultTimeout}ms — can't distinguish broken from slow`, checks: [], duration_ms: Date.now() - started };
  }
  if ("spawnError" in (inv as any)) {
    return { name: spec.name, skill: spec.skill, outcome: "UNCERTAIN", reason: `could not spawn: ${(inv as any).spawnError}`, checks: [], duration_ms: Date.now() - started };
  }

  const checks = runChecks(spec.checks, inv as any);
  const failed = checks.filter((c) => !c.ok);
  if (failed.length > 0) {
    return {
      name: spec.name,
      skill: spec.skill,
      outcome: "FAIL_BUILDABLE",
      reason: `${failed.length}/${checks.length} criteria failed — fix the output, the criteria are clear`,
      checks,
      duration_ms: Date.now() - started,
    };
  }

  // Deterministic floor is green — now (and only now) the judge gets a veto.
  // Gate, never oracle: it can demote this PASS, it cannot create one.
  for (const spec2 of spec.checks) {
    if (spec2.type !== "llm_judge") continue;
    const judged = await llmJudge(spec2.criteria, (inv as any).stdout, spec2.model ?? JUDGE_MODEL);
    if (!judged.ok) {
      return { name: spec.name, skill: spec.skill, outcome: "UNCERTAIN", reason: `judge unavailable: ${judged.reason}`, checks, duration_ms: Date.now() - started };
    }
    for (const cr of judged.criteria) {
      checks.push({ check: `judge: ${cr.id}`, ok: cr.verdict === "PASS", detail: `${cr.verdict} — ${cr.evidence}` });
    }
    const fails = judged.criteria.filter((c) => c.verdict === "FAIL");
    const unsure = judged.criteria.filter((c) => c.verdict === "UNSURE");
    if (fails.length > 0) {
      return { name: spec.name, skill: spec.skill, outcome: "FAIL_BUILDABLE", reason: `judge failed criteria: ${fails.map((c) => c.id).join(", ")}`, checks, duration_ms: Date.now() - started };
    }
    if (unsure.length > 0) {
      return { name: spec.name, skill: spec.skill, outcome: "UNCERTAIN", reason: `judge unsure on: ${unsure.map((c) => c.id).join(", ")} — human look needed`, checks, duration_ms: Date.now() - started };
    }
  }

  return {
    name: spec.name,
    skill: spec.skill,
    outcome: "PASS",
    reason: "all criteria green",
    checks,
    duration_ms: Date.now() - started,
  };
}

/** LLM cases get one retry on a non-PASS first attempt (nondeterminism ≠ regression). */
async function runWithRetry(path: string): Promise<Verdict> {
  const first = await runOne(path);
  if (first.outcome === "PASS" || first.outcome === "SKIP" || first.outcome === "GAP") return first;
  let spec: CaseSpec | null = null;
  try { spec = (Bun as any).YAML.parse(await Bun.file(path).text()); } catch { /* GAP already returned */ }
  if (!spec || !isLlmCase(spec)) return first;
  const second = await runOne(path);
  second.reason = `${second.reason} (retried once; first attempt: ${first.outcome})`;
  return second;
}

// ─── main ──────────────────────────────────────────────────────────────────

const casePaths = await discoverCases();
if (casePaths.length === 0) {
  console.log("No cases found (filters too narrow, or meta/evals/skills/*/cases/ empty).");
  process.exit(0);
}

// --models: the cross-model bench (additive — leaves the single-model floor below
// untouched). Runs each LLM case across the tier set and writes leaderboard.json.
if (models) {
  await runSweepMode(casePaths, models, ROOT);
  process.exit(0);
}

console.log(`→ eval run: ${casePaths.length} case${casePaths.length === 1 ? "" : "s"}${noLlm ? " (--no-llm)" : ""}\n`);
const verdictByPath = new Map<string, Verdict>();
let nextIdx = 0;
async function worker() {
  while (nextIdx < casePaths.length) {
    const p = casePaths[nextIdx++];
    const v = await runWithRetry(p);
    verdictByPath.set(p, v);
    const icon = { PASS: "✅", FAIL_BUILDABLE: "❌", GAP: "🕳️ ", UNCERTAIN: "❓", SKIP: "⏭️ " }[v.outcome];
    console.log(`${icon} ${v.outcome.padEnd(15)} ${v.skill}/${v.name}  (${v.duration_ms}ms)`);
    if (v.outcome !== "PASS") console.log(`   └─ ${v.reason}`);
    for (const c of v.checks) if (!c.ok) console.log(`      ✗ ${c.check} → ${c.detail}`);
  }
}
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, casePaths.length) }, worker));
const verdicts: Verdict[] = casePaths.map((p) => verdictByPath.get(p)!);

// ─── baseline / regression floor ───────────────────────────────────────────

const key = (v: Verdict) => `${v.skill}/${v.name}`;
let baseline: Record<string, string> = {};
let baselineExisted = existsSync(BASELINE_PATH);
if (baselineExisted) baseline = JSON.parse(await Bun.file(BASELINE_PATH).text());

// Only FAIL_BUILDABLE blocks: a clear criterion clearly failed. A baseline-PASS
// case going UNCERTAIN/GAP/SKIP is a floor warning — loud, but a judge hiccup or
// missing binary must never read as a regression (LLM cases are nondeterministic).
const regressions = verdicts.filter((v) => baseline[key(v)] === "PASS" && v.outcome === "FAIL_BUILDABLE");
const floorWarnings = verdicts.filter(
  (v) =>
    baseline[key(v)] === "PASS" &&
    v.outcome !== "PASS" &&
    v.outcome !== "FAIL_BUILDABLE" &&
    // a deliberate --no-llm skip is not floor erosion
    !(v.outcome === "SKIP" && v.reason.startsWith("--no-llm")),
);
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
await Bun.write(join(RUNS_DIR, `${stamp}.json`), JSON.stringify({ verdicts, counts, regressions: regressions.map(key), floor_warnings: floorWarnings.map(key) }, null, 2) + "\n");

console.log(`\n→ report: meta/evals/runs/${stamp}.md`);
console.log(`→ summary: ${Object.entries(counts).map(([k, n]) => `${k}=${n}`).join("  ")}`);

if (floorWarnings.length > 0) {
  console.error(`\n⚠ ${floorWarnings.length} floor warning(s) — baseline-PASS cases not green (non-blocking, but look):`);
  for (const w of floorWarnings) console.error(`  - ${key(w)} → ${w.outcome}: ${w.reason}`);
}
if (regressions.length > 0) {
  console.error(`\n✗ ${regressions.length} regression(s) vs baseline — previously-passing cases now failing:`);
  for (const r of regressions) console.error(`  - ${key(r)} → ${r.outcome}: ${r.reason}`);
  process.exit(1);
}
process.exit(0);
