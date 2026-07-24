// Unit tests for the model-independence bench aggregation (pure — no LLM, no I/O).
import { test, expect } from "bun:test";
import { statsFor, buildSkillEntry, buildLeaderboard, mergeLeaderboard, type SweepResult } from "./leaderboard";

const r = (skill: string, model: string, outcome: SweepResult["outcome"], cost: number | null, latency = 1000): SweepResult => ({
  skill,
  case: `${skill}-c1`,
  model,
  outcome,
  cost_usd: cost,
  latency_ms: latency,
  reason: "",
});

test("statsFor computes pass_rate, avg cost/latency, and capability-per-dollar", () => {
  const s = statsFor([
    r("x", "sonnet", "PASS", 0.02, 1000),
    r("x", "sonnet", "PASS", 0.04, 3000),
  ]);
  expect(s.cases).toBe(2);
  expect(s.pass).toBe(2);
  expect(s.pass_rate).toBe(1);
  expect(s.avg_cost_usd).toBe(0.03);
  expect(s.avg_latency_ms).toBe(2000);
  // capability_per_dollar = pass_rate / avg_cost = 1 / 0.03 = 33.33
  expect(s.capability_per_dollar).toBe(33.33);
});

test("SKIP results are excluded from the denominator", () => {
  const s = statsFor([r("x", "haiku", "PASS", 0.01), r("x", "haiku", "SKIP", null)]);
  expect(s.cases).toBe(1);
  expect(s.pass_rate).toBe(1);
});

test("a model that fails any case does not reach the pass bar", () => {
  const s = statsFor([r("x", "haiku", "PASS", 0.01), r("x", "haiku", "FAIL_BUILDABLE", 0.01)]);
  expect(s.pass_rate).toBe(0.5);
});

test("buildSkillEntry: recommends the cheapest model that matches the best pass rate", () => {
  // opus + sonnet both pass; haiku fails. Cheapest passing = sonnet.
  const entry = buildSkillEntry(
    [
      r("x", "opus", "PASS", 0.15),
      r("x", "sonnet", "PASS", 0.03),
      r("x", "haiku", "FAIL_BUILDABLE", 0.005),
    ],
    ["opus", "sonnet", "haiku"],
  );
  expect(entry.passing_models.sort()).toEqual(["opus", "sonnet"]);
  expect(entry.independent).toBe(true);
  expect(entry.recommended).toBe("sonnet"); // matches best rate (1.0), cheaper than opus
});

test("buildSkillEntry: single-model pass → not independent, recommends that model", () => {
  const entry = buildSkillEntry(
    [
      r("y", "opus", "PASS", 0.15),
      r("y", "sonnet", "FAIL_BUILDABLE", 0.03),
      r("y", "haiku", "FAIL_BUILDABLE", 0.005),
    ],
    ["opus", "sonnet", "haiku"],
  );
  expect(entry.passing_models).toEqual(["opus"]);
  expect(entry.independent).toBe(false);
  expect(entry.recommended).toBe("opus");
});

test("buildSkillEntry: nobody passes → recommended is null", () => {
  const entry = buildSkillEntry(
    [r("z", "opus", "FAIL_BUILDABLE", 0.15), r("z", "sonnet", "UNCERTAIN", 0.03)],
    ["opus", "sonnet"],
  );
  expect(entry.passing_models).toEqual([]);
  expect(entry.independent).toBe(false);
  expect(entry.recommended).toBeNull();
});

test("buildLeaderboard groups by skill and carries models + judge", () => {
  const lb = buildLeaderboard(
    [r("x", "sonnet", "PASS", 0.03), r("y", "opus", "PASS", 0.15)],
    ["opus", "sonnet"],
    "2026-07-24T00:00:00.000Z",
    "haiku",
  );
  expect(Object.keys(lb.skills).sort()).toEqual(["x", "y"]);
  expect(lb.models).toEqual(["opus", "sonnet"]);
  expect(lb.judge_model).toBe("haiku");
});

test("mergeLeaderboard replaces touched skills, carries the rest forward, unions models", () => {
  const prev = buildLeaderboard([r("x", "sonnet", "PASS", 0.03)], ["sonnet"], "t0", "haiku");
  const next = buildLeaderboard([r("y", "opus", "PASS", 0.15)], ["opus"], "t1", "haiku");
  const merged = mergeLeaderboard(prev, next);
  expect(Object.keys(merged.skills).sort()).toEqual(["x", "y"]); // x carried forward, y added
  expect(merged.models.sort()).toEqual(["opus", "sonnet"]);
  expect(merged.generated).toBe("t1");
});
