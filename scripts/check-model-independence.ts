#!/usr/bin/env bun
// check-model-independence.ts — the model-independence ratchet.
//
// Reads the committed bench artifact (meta/evals/leaderboard.json) and reports,
// per COVERED skill, whether its eval passes on more than one model. This is the
// standing enforcement of control criterion #1 in
// factory/playbooks/ai-native-2026/cost-to-outcome-and-model-independence.md:
// "no skill depends on one model — evals must hill-climb even if a model is removed."
//
//   exit 1 when:
//     • leaderboard.json is malformed / wrong shape
//     • a COVERED skill in the leaderboard passes on ZERO models (broken everywhere —
//       a real signal, not LLM flakiness: a healthy skill won't fail on all tiers)
//   warn (exit 0) when:
//     • a covered skill passes on exactly ONE model (a model-dependence smell)
//   info:
//     • independent skills (+ their recommended tier) · covered skills not yet benched
//
// Absent leaderboard → info + exit 0: the bench costs money (LLM calls × models)
// and is opt-in (`bun run bench`), not run in CI. The guard validates the artifact
// when it exists; it never forces a paid run.
//
// Usage: bun run check-model-independence [--quiet]

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const quiet = process.argv.includes("--quiet");
const log = (s: string) => {
  if (!quiet) console.log(s);
};
const fails: string[] = [];
const warns: string[] = [];

const LB_PATH = join(root, "meta", "evals", "leaderboard.json");
const COVERAGE_PATH = join(root, "meta", "evals", "coverage.json");

if (!existsSync(LB_PATH)) {
  log("ℹ no meta/evals/leaderboard.json yet — run the bench to populate it: bun run bench");
  log("  (the bench makes real LLM calls across models; it is opt-in, not a CI gate.)");
  process.exit(0);
}

type ModelStats = { cases: number; pass: number; pass_rate: number; avg_cost_usd: number | null; capability_per_dollar: number | null };
type SkillEntry = { by_model: Record<string, ModelStats>; passing_models: string[]; recommended: string | null; independent: boolean };
type Leaderboard = { generated: string; models: string[]; judge_model: string; skills: Record<string, SkillEntry> };

let lb: Leaderboard;
try {
  lb = JSON.parse(readFileSync(LB_PATH, "utf8"));
} catch (e) {
  console.error(`✗ leaderboard.json is not valid JSON: ${(e as Error).message}`);
  process.exit(1);
}
if (!lb || !Array.isArray(lb.models) || typeof lb.skills !== "object" || lb.skills === null) {
  console.error("✗ leaderboard.json malformed — expected { generated, models[], judge_model, skills{} }");
  process.exit(1);
}

const covered: Set<string> = existsSync(COVERAGE_PATH)
  ? new Set((JSON.parse(readFileSync(COVERAGE_PATH, "utf8")).covered as string[]) ?? [])
  : new Set();

const benched = Object.keys(lb.skills);
log(`bench: ${benched.length} skill(s) across [${lb.models.join(", ")}] · judge=${lb.judge_model} · generated ${lb.generated}`);

let independentCount = 0;
for (const [skill, entry] of Object.entries(lb.skills)) {
  const passing = Array.isArray(entry.passing_models) ? entry.passing_models : [];
  const isCovered = covered.has(skill);
  const tag = isCovered ? "" : " (not in coverage.json)";
  if (passing.length === 0) {
    const msg = `"${skill}" passes on ZERO models${tag} — the eval is broken on every tier, or the bench is stale. Re-run or fix the case.`;
    if (isCovered) fails.push(msg);
    else warns.push(msg);
  } else if (passing.length === 1) {
    warns.push(`"${skill}" is MODEL-DEPENDENT — passes only on ${passing[0]}${tag}. An eval that works on one model measures the model, not the skill.`);
  } else {
    independentCount++;
    log(`  ✓ ${skill}: independent — passes on [${passing.join(", ")}] · recommended=${entry.recommended ?? "—"}`);
  }
}

// covered skills that haven't been benched yet — informational (the bench grows case-by-case)
const notBenched = [...covered].filter((c) => !benched.includes(c));
if (notBenched.length) log(`ℹ ${notBenched.length} covered skill(s) not yet benched: ${notBenched.join(", ")}`);

for (const w of warns) log(`  ⚠ ${w}`);

if (fails.length === 0) {
  log(`✓ model-independence: ${independentCount} independent · ${warns.length} advisory warning(s) · 0 blocking.`);
  process.exit(0);
}
console.error(`✗ check-model-independence: ${fails.length} failure(s):`);
for (const f of fails) console.error(`  • ${f}`);
process.exit(1);
