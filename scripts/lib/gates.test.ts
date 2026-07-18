import { describe, expect, test } from "bun:test";
import { evaluateGates, nextGate, summarize, validateGates, type GatesBlock } from "./gates";

const TODAY = "2026-07-18";

const typical: GatesBlock = {
  validation: { date: "2026-06-01", state: "5 target conversations", passed: "2026-05-28" },
  launch: { date: "2026-07-10", state: "first dollar OR 10 activated users" },
  traction: { date: "2026-07-25", state: "impressions curve rising (SEO channel)" },
  pmf: { date: "2026-10-01", state: "Sean Ellis ≥40% AND retention flattens" },
};

describe("evaluateGates", () => {
  test("classifies passed/overdue/due/upcoming against today", () => {
    const evals = evaluateGates(typical, TODAY);
    expect(evals).toEqual([
      { gate: "validation", status: "PASSED", date: "2026-06-01", state: "5 target conversations" },
      { gate: "launch", status: "OVERDUE", date: "2026-07-10", state: "first dollar OR 10 activated users" },
      { gate: "traction", status: "DUE", date: "2026-07-25", state: "impressions curve rising (SEO channel)" },
      { gate: "pmf", status: "UPCOMING", date: "2026-10-01", state: "Sean Ellis ≥40% AND retention flattens" },
    ]);
  });

  test("a defined gate without a date is UNDATED (visible, never silently skipped)", () => {
    const evals = evaluateGates({ launch: { state: "first dollar" } }, TODAY);
    expect(evals[0].status).toBe("UNDATED");
  });

  test("passed beats overdue — a verified gate is done regardless of date", () => {
    const evals = evaluateGates({ launch: { date: "2026-01-01", state: "x", passed: "2026-01-02" } }, TODAY);
    expect(evals[0].status).toBe("PASSED");
  });

  test("empty block evaluates to nothing", () => {
    expect(evaluateGates({}, TODAY)).toEqual([]);
  });
});

describe("nextGate + summarize", () => {
  test("next gate is the first non-passed in ladder order", () => {
    const evals = evaluateGates(typical, TODAY);
    expect(nextGate(evals)?.gate).toBe("launch");
    expect(summarize(evals)).toBe("launch OVERDUE by 2026-07-10");
  });

  test("all passed → says so", () => {
    const evals = evaluateGates(
      { validation: { date: "2026-01-01", state: "x", passed: "2026-01-01" } },
      TODAY,
    );
    expect(summarize(evals)).toBe("all gates PASSED");
  });

  test("no gates → says so", () => {
    expect(summarize([])).toBe("no gates");
  });
});

describe("validateGates", () => {
  test("valid block has no problems", () => {
    expect(validateGates(typical)).toEqual([]);
  });

  test("flags empty block, unfilled template state, bad dates", () => {
    expect(validateGates({})).toEqual(["gates block has none of validation/launch/traction/pmf"]);
    expect(validateGates({ launch: { date: "2026-08-01", state: "___" } })).toEqual(["launch: missing/unfilled state"]);
    expect(validateGates({ launch: { date: "next month", state: "first dollar" } })).toEqual([
      'launch: date must be YYYY-MM-DD (got "next month")',
    ]);
  });
});
