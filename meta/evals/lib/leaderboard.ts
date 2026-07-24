// meta/evals/lib/leaderboard.ts — pure aggregation for the model-independence
// bench. Turns per-(skill, case, model) sweep results into a capability-per-dollar
// leaderboard + a recommended tier per skill. No I/O, no LLM — unit-testable.
//
// Doctrine: factory/playbooks/ai-native-2026/cost-to-outcome-and-model-independence.md
//   1. No skill depends on one model  → `independent` (passes cleanly on ≥2 models)
//   2. Route on evidence, not vibes    → `recommended` (cheapest model matching the
//                                        best pass rate) + capability_per_dollar

export type SweepOutcome = "PASS" | "FAIL_BUILDABLE" | "GAP" | "UNCERTAIN" | "SKIP";

export type SweepResult = {
  skill: string;
  case: string;
  model: string;
  outcome: SweepOutcome;
  cost_usd: number | null;
  latency_ms: number;
  reason: string;
};

export type ModelStats = {
  cases: number; // non-SKIP results for this (skill, model)
  pass: number;
  pass_rate: number; // pass / cases (0 when cases === 0)
  avg_cost_usd: number | null;
  avg_latency_ms: number;
  capability_per_dollar: number | null; // pass_rate / avg_cost_usd — outcomes per dollar
};

export type SkillEntry = {
  by_model: Record<string, ModelStats>;
  passing_models: string[]; // models that cleanly pass EVERY case run for this skill
  recommended: string | null; // cheapest model matching the best achieved pass rate (>0)
  independent: boolean; // passing_models.length >= 2 — the control criterion
};

export type Leaderboard = {
  generated: string;
  models: string[];
  judge_model: string;
  skills: Record<string, SkillEntry>;
};

// A model "passes" a skill only when it cleanly passes every case run for it.
// Strict on purpose: "the eval hill-climbs even if this model is removed" means
// the skill genuinely works on the model, not that it works most of the time.
const PASS_BAR = 1;

function round(n: number, d: number): number {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

export function statsFor(results: SweepResult[]): ModelStats {
  const ran = results.filter((r) => r.outcome !== "SKIP");
  const cases = ran.length;
  const pass = ran.filter((r) => r.outcome === "PASS").length;
  const pass_rate = cases ? pass / cases : 0;
  const withCost = ran.filter((r) => typeof r.cost_usd === "number") as (SweepResult & { cost_usd: number })[];
  const avg_cost_usd = withCost.length ? withCost.reduce((s, r) => s + r.cost_usd, 0) / withCost.length : null;
  const avg_latency_ms = cases ? Math.round(ran.reduce((s, r) => s + r.latency_ms, 0) / cases) : 0;
  const capability_per_dollar = avg_cost_usd && avg_cost_usd > 0 ? round(pass_rate / avg_cost_usd, 2) : null;
  return {
    cases,
    pass,
    pass_rate: round(pass_rate, 3),
    avg_cost_usd: avg_cost_usd === null ? null : round(avg_cost_usd, 5),
    avg_latency_ms,
    capability_per_dollar,
  };
}

export function buildSkillEntry(results: SweepResult[], models: string[]): SkillEntry {
  const by_model: Record<string, ModelStats> = {};
  for (const m of models) by_model[m] = statsFor(results.filter((r) => r.model === m));

  const passing_models = models.filter((m) => by_model[m].cases > 0 && by_model[m].pass_rate >= PASS_BAR);

  // recommended: among models that MATCH the best achieved pass rate (>0), the
  // cheapest by avg cost (nulls last), tie-broken by latency. This is "route to
  // the cheaper model whenever it matches the frontier," made mechanical.
  const bestRate = Math.max(0, ...models.map((m) => by_model[m].pass_rate));
  let recommended: string | null = null;
  if (bestRate > 0) {
    const matches = models
      .filter((m) => by_model[m].cases > 0 && by_model[m].pass_rate >= bestRate)
      .sort((a, b) => {
        const ca = by_model[a].avg_cost_usd;
        const cb = by_model[b].avg_cost_usd;
        if (ca !== null && cb !== null && ca !== cb) return ca - cb;
        if (ca === null && cb !== null) return 1;
        if (cb === null && ca !== null) return -1;
        return by_model[a].avg_latency_ms - by_model[b].avg_latency_ms;
      });
    recommended = matches[0] ?? null;
  }

  return { by_model, passing_models, recommended, independent: passing_models.length >= 2 };
}

export function buildLeaderboard(
  results: SweepResult[],
  models: string[],
  generatedIso: string,
  judgeModel: string,
): Leaderboard {
  const bySkill = new Map<string, SweepResult[]>();
  for (const r of results) {
    const arr = bySkill.get(r.skill);
    if (arr) arr.push(r);
    else bySkill.set(r.skill, [r]);
  }
  const skills: Record<string, SkillEntry> = {};
  for (const [skill, rs] of bySkill) skills[skill] = buildSkillEntry(rs, models);
  return { generated: generatedIso, models, judge_model: judgeModel, skills };
}

/** Merge a fresh (partial) sweep into a prior leaderboard: skills the new run
 *  touched are replaced; untouched skills carry forward. Lets the bench grow
 *  case-by-case without re-running everything. */
export function mergeLeaderboard(prev: Leaderboard | null, next: Leaderboard): Leaderboard {
  if (!prev) return next;
  const models = Array.from(new Set([...prev.models, ...next.models]));
  return {
    generated: next.generated,
    models,
    judge_model: next.judge_model,
    skills: { ...prev.skills, ...next.skills },
  };
}
