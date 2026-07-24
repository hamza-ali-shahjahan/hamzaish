import { test, expect } from "bun:test";
import { parseEvalSummary } from "./eval-score";

test("parseEvalSummary parses the runner summary into a score (SKIP excluded)", () => {
  const s = parseEvalSummary("… noise …\n→ summary: PASS=15  SKIP=9");
  expect(s.counts).toEqual({ PASS: 15, SKIP: 9 });
  expect(s.scored).toBe(15);
  expect(s.pass).toBe(15);
  expect(s.fraction).toBe(1);
});

test("parseEvalSummary counts failures in the denominator", () => {
  const s = parseEvalSummary("→ summary: PASS=3  FAIL_BUILDABLE=1  UNCERTAIN=1  SKIP=2");
  expect(s.scored).toBe(5);
  expect(s.pass).toBe(3);
  expect(s.fraction).toBe(0.6);
});

test("parseEvalSummary is safe on a missing/garbled summary", () => {
  expect(parseEvalSummary("no summary here").fraction).toBe(0);
  expect(parseEvalSummary("").scored).toBe(0);
});
