import { describe, expect, test } from "bun:test";
import { defectLine, summarizeDefects, isStage, type DefectEntry } from "./defects";

const e = (over: Partial<DefectEntry>): DefectEntry => ({
  ts: "2026-07-24T10:00:00Z",
  target: "factory",
  catcher: "check-counts",
  stage: "ci",
  defect: "x",
  ...over,
});

describe("defects", () => {
  test("stage vocabulary is closed", () => {
    expect(isStage("ci")).toBe(true);
    expect(isStage("live")).toBe(true);
    expect(isStage("prod")).toBe(false);
  });

  test("round-trips and summarizes by catcher/stage/target with criticals surfaced", () => {
    const jsonl = [
      defectLine(e({ catcher: "A11", stage: "live", target: "starter", severity: "critical", defect: "Sentry never initialized" })),
      defectLine(e({ catcher: "check-counts", stage: "ci", defect: "README count drift" })),
      defectLine(e({ catcher: "check-counts", stage: "ci", defect: "another drift" })),
      defectLine(e({ catcher: "eval:go-live", stage: "eval", target: "factory", defect: "scorecard regex stale" })),
      "garbage line",
      JSON.stringify({ ts: "2026-07-24T10:00:00Z", target: "x", catcher: "y", stage: "prod", defect: "bad stage dropped" }),
    ].join("\n");
    const s = summarizeDefects(jsonl);
    expect(s.total).toBe(4);
    expect(s.byCatcher["check-counts"]).toBe(2);
    expect(s.byStage).toEqual({ live: 1, ci: 2, eval: 1 });
    expect(s.byTarget["starter"]).toBe(1);
    expect(s.criticals).toHaveLength(1);
    expect(s.criticals[0].defect).toContain("Sentry");
  });

  test("since filter bounds the window", () => {
    const jsonl = [defectLine(e({ ts: "2026-06-01T00:00:00Z" })), defectLine(e({ ts: "2026-07-23T00:00:00Z" }))].join("\n");
    expect(summarizeDefects(jsonl, { sinceIso: "2026-07-01T00:00:00Z" }).total).toBe(1);
  });

  test("empty input → empty summary", () => {
    expect(summarizeDefects("").total).toBe(0);
  });
});
