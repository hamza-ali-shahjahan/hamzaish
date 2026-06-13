// Force every route of the headless runtime with injected fakes — NO Claude calls.
// Brick-#1 discipline: a loop that has never taken each branch proves nothing.
//   bun test factory/runtime/loop.test.ts
import { test, expect } from "bun:test";
import { runTask, type Generator, type Judge, type Task } from "./loop";
import type { JudgeResult } from "../../meta/evals/lib/judge";

const baseTask = (over: Partial<Task> = {}): Task => ({
  skill: "fake",
  generatePrompt: "produce the thing",
  deterministicChecks: [{ type: "stdout_matches", regex: "GOOD" }],
  judgeCriteria: [{ id: "quality", requirement: "is good" }],
  maxAttempts: 2,
  ...over,
});

const gen = (...outputs: string[]): Generator => {
  let i = 0;
  return async () => ({ ok: true, output: outputs[Math.min(i++, outputs.length - 1)] });
};
const judgeAll = (verdict: "PASS" | "FAIL" | "UNSURE"): Judge =>
  async (criteria) => ({ ok: true, criteria: criteria.map((c) => ({ id: c.id, verdict, evidence: "fake" })) });

test("PASS — deterministic floor green, judge green → kept", async () => {
  const r = await runTask(baseTask(), { generate: gen("GOOD output"), judge: judgeAll("PASS") });
  expect(r.finalOutcome).toBe("PASS");
  expect(r.route).toBe("kept");
  expect(r.kept).toBe("GOOD output");
  expect(r.attempts).toHaveLength(1);
});

test("FAIL_BUILDABLE → regenerate with feedback → PASS (the loop bites)", async () => {
  // attempt 1 misses the deterministic floor; attempt 2 (after feedback) satisfies it.
  const r = await runTask(baseTask(), { generate: gen("BAD output", "GOOD output"), judge: judgeAll("PASS") });
  expect(r.attempts[0].outcome).toBe("FAIL_BUILDABLE");
  expect(r.attempts[1].outcome).toBe("PASS");
  expect(r.finalOutcome).toBe("PASS");
  expect(r.attempts).toHaveLength(2);
});

test("FAIL_BUILDABLE persists past maxAttempts → escalate, last failure stands", async () => {
  const r = await runTask(baseTask({ maxAttempts: 2 }), { generate: gen("BAD", "BAD"), judge: judgeAll("PASS") });
  expect(r.finalOutcome).toBe("FAIL_BUILDABLE");
  expect(r.route).toContain("gave up after 2");
  expect(r.kept).toBeNull();
});

test("judge FAIL demotes a deterministically-green output → FAIL_BUILDABLE (gate, not oracle)", async () => {
  const r = await runTask(baseTask({ maxAttempts: 1 }), { generate: gen("GOOD"), judge: judgeAll("FAIL") });
  expect(r.finalOutcome).toBe("FAIL_BUILDABLE");
  expect(r.attempts[0].checks.some((c) => c.check.startsWith("judge:") && !c.ok)).toBe(true);
});

test("judge UNSURE → UNCERTAIN, escalate (the real-time human pull)", async () => {
  const r = await runTask(baseTask({ maxAttempts: 1 }), { generate: gen("GOOD"), judge: judgeAll("UNSURE") });
  expect(r.finalOutcome).toBe("UNCERTAIN");
  expect(r.route).toContain("escalate");
});

test("judge unavailable → UNCERTAIN (never a silent green)", async () => {
  const judgeDown: Judge = async () => ({ ok: false, reason: "judge timed out" } as JudgeResult);
  const r = await runTask(baseTask({ maxAttempts: 1 }), { generate: gen("GOOD"), judge: judgeDown });
  expect(r.finalOutcome).toBe("UNCERTAIN");
  expect(r.route).toContain("judge unavailable");
});

test("GAP marker → proposal written, stop, never guess (Movement 2 seam)", async () => {
  const r = await runTask(baseTask(), { generate: gen("GAP: the spec never said which pricing model"), judge: judgeAll("PASS") });
  expect(r.finalOutcome).toBe("GAP");
  expect(r.proposalPath).toContain("factory/runtime/proposals/");
  expect(r.attempts).toHaveLength(1);
});

test("generator failure (timeout/spawn/empty) → UNCERTAIN, escalate", async () => {
  const genFail: Generator = async () => ({ ok: false, reason: "generation timed out" });
  const r = await runTask(baseTask(), { generate: genFail, judge: judgeAll("PASS") });
  expect(r.finalOutcome).toBe("UNCERTAIN");
  expect(r.route).toContain("escalate");
});

test("no judge criteria → deterministic floor alone decides PASS", async () => {
  const r = await runTask(baseTask({ judgeCriteria: [] }), { generate: gen("GOOD"), judge: judgeAll("FAIL") });
  expect(r.finalOutcome).toBe("PASS"); // judge never consulted
});
