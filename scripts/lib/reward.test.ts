import { test, expect } from "bun:test";
import { rewardLine, summarizeReward, isSignal, isOutcome, type RewardEntry } from "./reward";

const e = (over: Partial<RewardEntry>): RewardEntry => ({
  ts: "2026-07-24T00:00:00.000Z",
  signal: "eval",
  outcome: "pass",
  source: "s",
  ...over,
});

test("isSignal / isOutcome validate the enums", () => {
  expect(isSignal("eval")).toBe(true);
  expect(isSignal("nope")).toBe(false);
  expect(isOutcome("pass")).toBe(true);
  expect(isOutcome("meh")).toBe(false);
});

test("rewardLine round-trips as JSON", () => {
  expect(JSON.parse(rewardLine(e({})))).toMatchObject({ signal: "eval", outcome: "pass", source: "s" });
});

test("summarizeReward computes pass rate + per-source stats and skips malformed/invalid", () => {
  const jsonl = [
    rewardLine(e({ source: "feature-slicing", outcome: "pass" })),
    rewardLine(e({ source: "feature-slicing", outcome: "fail" })),
    rewardLine(e({ source: "acme", signal: "activation", outcome: "pass" })),
    "{ not json",
    rewardLine({ ...e({}), signal: "bogus" as any }), // invalid signal → skipped
  ].join("\n");
  const s = summarizeReward(jsonl);
  expect(s.total).toBe(3);
  expect(s.passRate).toBe(0.667); // 2 of 3
  expect(s.bySource["feature-slicing"]).toEqual({ total: 2, pass: 1, passRate: 0.5 });
  expect(s.bySignal).toEqual({ eval: 2, activation: 1 });
  expect(s.byOutcome).toEqual({ pass: 2, fail: 1 });
});

test("summarizeReward respects the sinceIso bound", () => {
  const jsonl = [
    rewardLine(e({ ts: "2026-07-01T00:00:00.000Z" })),
    rewardLine(e({ ts: "2026-07-24T00:00:00.000Z" })),
  ].join("\n");
  const s = summarizeReward(jsonl, { sinceIso: "2026-07-10T00:00:00.000Z" });
  expect(s.total).toBe(1);
});
