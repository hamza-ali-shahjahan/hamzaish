// meta/evals/lib/sweep.ts — the model-independence bench engine.
//
// Runs each LLM case across a SET of system-under-test models with a FIXED judge,
// capturing verdict + real $ cost + latency per model, then writes
// meta/evals/leaderboard.json. This is Nadella's control criterion made mechanical:
// "your evals should continue to hill-climb even when any given model is removed."
//
// ADDITIVE BY DESIGN: the battle-tested single-model floor in run.ts is untouched.
// The sweep reuses the same case format, the same deterministic checks, and the
// same gate-not-oracle judge — it only varies the SUT model and records cost.
//
// Cost capture: swept invocations force `--output-format json` so `total_cost_usd`
// is read straight from Claude Code (the same field the autonomy loop meters).

import { existsSync } from "node:fs";
import { join } from "node:path";
import { validateCase, runInvocation, runChecks, type CaseSpec } from "./checks";
import { llmJudge, JUDGE_MODEL } from "./judge";
import { buildLeaderboard, mergeLeaderboard, type SweepResult, type Leaderboard } from "./leaderboard";

const SWEEP_TIMEOUT_MS = 300_000; // LLM cases read playbooks + generate — minutes

/** Only LLM cases carry a `--model` to vary. Returns the cmd with the model
 *  substituted and JSON output forced (for cost capture), or null if the case
 *  isn't a sweepable `claude … --model …` invocation. */
export function withModel(cmd: string[], model: string): string[] | null {
  if (cmd[0] !== "claude") return null;
  const i = cmd.indexOf("--model");
  if (i === -1 || i + 1 >= cmd.length) return null;
  const out = [...cmd];
  out[i + 1] = model;
  if (!out.includes("--output-format")) out.push("--output-format", "json");
  return out;
}

/** claude -p --output-format json → { result, total_cost_usd, … }. Falls back to
 *  raw text if the output isn't JSON (so a format change degrades, never crashes). */
function parseClaudeJson(stdout: string): { text: string; cost: number | null } {
  try {
    const j = JSON.parse(stdout);
    return {
      text: typeof j.result === "string" ? j.result : stdout,
      cost: typeof j.total_cost_usd === "number" ? j.total_cost_usd : null,
    };
  } catch {
    return { text: stdout, cost: null };
  }
}

async function runCaseOnModel(spec: CaseSpec, model: string, root: string): Promise<SweepResult> {
  const base = { skill: spec.skill, case: spec.name, model };
  const cmd = withModel(spec.invoke.cmd, model);
  if (!cmd) return { ...base, outcome: "SKIP", cost_usd: null, latency_ms: 0, reason: "not a sweepable LLM case" };
  if (!Bun.which("claude")) return { ...base, outcome: "SKIP", cost_usd: null, latency_ms: 0, reason: "claude not on PATH" };

  const started = Date.now();
  const inv = await runInvocation(cmd, root, spec.invoke.timeout_ms ?? SWEEP_TIMEOUT_MS);
  const latency_ms = Date.now() - started;
  if (inv === "timeout") return { ...base, outcome: "UNCERTAIN", cost_usd: null, latency_ms, reason: "timed out" };
  if ("spawnError" in (inv as any)) return { ...base, outcome: "UNCERTAIN", cost_usd: null, latency_ms, reason: `spawn: ${(inv as any).spawnError}` };

  const { text, cost } = parseClaudeJson((inv as any).stdout);
  const invForChecks = { stdout: text, stderr: (inv as any).stderr, exitCode: (inv as any).exitCode };

  const checks = runChecks(spec.checks, invForChecks);
  const failed = checks.filter((c) => !c.ok);
  if (failed.length) return { ...base, outcome: "FAIL_BUILDABLE", cost_usd: cost, latency_ms, reason: `${failed.length}/${checks.length} criteria failed` };

  // Judge stays FIXED across the sweep (the constant yardstick). Gate, never oracle.
  for (const ch of spec.checks) {
    if (ch.type !== "llm_judge") continue;
    const judged = await llmJudge(ch.criteria, text, ch.model ?? JUDGE_MODEL);
    if (!judged.ok) return { ...base, outcome: "UNCERTAIN", cost_usd: cost, latency_ms, reason: `judge unavailable: ${judged.reason}` };
    if (judged.criteria.some((c) => c.verdict === "FAIL")) return { ...base, outcome: "FAIL_BUILDABLE", cost_usd: cost, latency_ms, reason: "judge failed a criterion" };
    if (judged.criteria.some((c) => c.verdict === "UNSURE")) return { ...base, outcome: "UNCERTAIN", cost_usd: cost, latency_ms, reason: "judge unsure — human look needed" };
  }

  return { ...base, outcome: "PASS", cost_usd: cost, latency_ms, reason: "all criteria green" };
}

/** Entry point called by run.ts when `--models a,b,c` is passed. Filters the
 *  discovered cases to sweepable LLM cases, runs the model matrix sequentially
 *  (cost + rate-limit friendly), and writes/merges the leaderboard. */
export async function runSweepMode(casePaths: string[], models: string[], root: string): Promise<void> {
  const specs: CaseSpec[] = [];
  for (const p of casePaths) {
    let spec: CaseSpec;
    try {
      spec = (Bun as any).YAML.parse(await Bun.file(p).text());
    } catch {
      continue;
    }
    if (validateCase(spec)) continue;
    if (withModel(spec.invoke.cmd, models[0])) specs.push(spec);
  }
  if (specs.length === 0) {
    console.log("No sweepable LLM cases found (a sweepable case invokes `claude … --model …`).");
    return;
  }

  console.log(
    `→ model-independence bench: ${specs.length} case(s) × ${models.length} model(s) [${models.join(", ")}] · judge=${JUDGE_MODEL}\n`,
  );
  const results: SweepResult[] = [];
  for (const spec of specs) {
    for (const model of models) {
      const r = await runCaseOnModel(spec, model, root);
      results.push(r);
      const icon = { PASS: "✅", FAIL_BUILDABLE: "❌", GAP: "🕳️ ", UNCERTAIN: "❓", SKIP: "⏭️ " }[r.outcome];
      const price = r.cost_usd !== null ? `$${r.cost_usd.toFixed(4)}` : "   —   ";
      console.log(`${icon} ${r.model.padEnd(7)} ${r.skill}/${r.case}  ${price}  ${String(r.latency_ms).padStart(6)}ms${r.outcome === "PASS" ? "" : "  — " + r.reason}`);
    }
  }

  const LB_PATH = join(root, "meta", "evals", "leaderboard.json");
  let prev: Leaderboard | null = null;
  if (existsSync(LB_PATH)) {
    try {
      prev = JSON.parse(await Bun.file(LB_PATH).text());
    } catch {
      prev = null;
    }
  }
  const fresh = buildLeaderboard(results, models, new Date().toISOString(), JUDGE_MODEL);
  const merged = mergeLeaderboard(prev, fresh);
  await Bun.write(LB_PATH, JSON.stringify(merged, null, 2) + "\n");

  console.log(`\n→ leaderboard: meta/evals/leaderboard.json`);
  for (const [skill, e] of Object.entries(fresh.skills)) {
    console.log(
      `   ${skill}: recommended=${e.recommended ?? "—"} · ${e.independent ? "independent ✓" : "SINGLE-MODEL ⚠"} · passing=[${e.passing_models.join(", ")}]`,
    );
  }
}
