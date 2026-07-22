import { describe, expect, test } from "bun:test";
import { frictionLine, summarizeFriction, isSeverity, type FrictionEntry } from "./friction";

const e = (over: Partial<FrictionEntry>): FrictionEntry => ({
  ts: "2026-07-20T10:00:00Z",
  severity: "error",
  source: "go-live",
  message: "x",
  ...over,
});

describe("friction", () => {
  test("severity vocabulary is closed", () => {
    expect(isSeverity("blocker")).toBe(true);
    expect(isSeverity("delight")).toBe(true);
    expect(isSeverity("annoying")).toBe(false);
  });

  test("round-trips and summarizes by severity and source", () => {
    const jsonl = [
      frictionLine(e({ severity: "blocker", source: "go-live", message: "DNS check hung" })),
      frictionLine(e({ severity: "error", source: "go-live" })),
      frictionLine(e({ severity: "nit", source: "scaffold" })),
      frictionLine(e({ severity: "delight", source: "check-gates", message: "dashboard nailed it" })),
      "not json",
      JSON.stringify({ ts: "2026-07-20T10:00:00Z", severity: "made-up", source: "x", message: "bad severity dropped" }),
    ].join("\n");
    const s = summarizeFriction(jsonl);
    expect(s.total).toBe(4);
    expect(s.bySeverity).toEqual({ blocker: 1, error: 1, nit: 1, delight: 1 });
    expect(s.bySource["go-live"]).toBe(2);
    expect(s.blockers[0].message).toBe("DNS check hung");
    expect(s.delights[0].source).toBe("check-gates");
  });

  test("since filter bounds the window", () => {
    const jsonl = [
      frictionLine(e({ ts: "2026-07-01T00:00:00Z" })),
      frictionLine(e({ ts: "2026-07-19T00:00:00Z" })),
    ].join("\n");
    expect(summarizeFriction(jsonl, { sinceIso: "2026-07-10T00:00:00Z" }).total).toBe(1);
  });

  test("empty input → empty summary", () => {
    expect(summarizeFriction("").total).toBe(0);
  });
});
