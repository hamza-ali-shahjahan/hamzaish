import { describe, expect, test } from "bun:test";
import { classifyStaleness, claimsActiveWork } from "./staleness";

describe("claimsActiveWork", () => {
  test("matches active/live status text", () => {
    expect(claimsActiveWork("active")).toBe(true);
    expect(claimsActiveWork("active · pre-launch")).toBe(true);
    expect(claimsActiveWork("LIVE — public GitHub repo")).toBe(true);
  });
  test("doesn't match idea/reserved/killed text", () => {
    expect(claimsActiveWork("slot_reserved")).toBe(false);
    expect(claimsActiveWork("killed")).toBe(false);
  });
});

describe("classifyStaleness", () => {
  test("flags a product claiming active mvp work that hasn't moved past the threshold", () => {
    const r = classifyStaleness({ slug: "copyright", stage: "mvp", status: "active", daysSinceUpdate: 30 });
    expect(r.stale).toBe(true);
    expect(r.claimsActiveWork).toBe(true);
  });

  test("does not flag a product within the threshold", () => {
    const r = classifyStaleness({ slug: "copyright", stage: "mvp", status: "active", daysSinceUpdate: 5 });
    expect(r.stale).toBe(false);
  });

  test("does not flag an idea-stage product even if untouched for a long time", () => {
    const r = classifyStaleness({ slug: "new-one", stage: "idea", status: "active", daysSinceUpdate: 90 });
    expect(r.claimsActiveWork).toBe(false);
    expect(r.stale).toBe(false);
  });

  test("does not flag a product whose status doesn't claim active work", () => {
    const r = classifyStaleness({ slug: "calculatrs", stage: "idea", status: "slot_reserved", daysSinceUpdate: 90 });
    expect(r.stale).toBe(false);
  });

  test("unknown git history (null days) never flags stale — absence of data isn't evidence of staleness", () => {
    const r = classifyStaleness({ slug: "x", stage: "mvp", status: "active", daysSinceUpdate: null });
    expect(r.stale).toBe(false);
    expect(r.reason).toContain("no git history");
  });

  test("threshold is respected exactly at the boundary (not stale AT the threshold, stale past it)", () => {
    expect(classifyStaleness({ slug: "x", stage: "mvp", status: "active", daysSinceUpdate: 21, thresholdDays: 21 }).stale).toBe(false);
    expect(classifyStaleness({ slug: "x", stage: "mvp", status: "active", daysSinceUpdate: 22, thresholdDays: 21 }).stale).toBe(true);
  });

  test("custom threshold overrides the default", () => {
    const r = classifyStaleness({ slug: "x", stage: "mvp", status: "active", daysSinceUpdate: 10, thresholdDays: 5 });
    expect(r.stale).toBe(true);
  });

  test("AUTOPILOT verdict is never flagged, no matter how old — the portfolio already decided not to touch it", () => {
    const r = classifyStaleness({ slug: "repolish", stage: "launch", status: "active", daysSinceUpdate: 200, verdict: "AUTOPILOT" });
    expect(r.stale).toBe(false);
    expect(r.claimsActiveWork).toBe(false);
    expect(r.reason).toContain("AUTOPILOT");
  });

  test("a non-AUTOPILOT verdict (or none) doesn't suppress staleness", () => {
    const r = classifyStaleness({ slug: "x", stage: "mvp", status: "active", daysSinceUpdate: 30, verdict: "MAINTAIN" });
    expect(r.stale).toBe(true);
  });
});
