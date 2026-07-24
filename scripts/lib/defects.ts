// scripts/lib/defects.ts — the guard-fire defect registry (pure functions).
//
// The v2.18 follow-up ("which guard blocked what, how often"), made real: when
// any check catches a REAL defect — a CI guard going red on a genuine problem,
// an eval regression, a live assertion failing against a deploy, a hook block —
// one structured line records what was caught and which check caught it. Over
// time this answers the questions the factory keeps asking from memory: which
// guards earn their keep, which stages catch what, where the escape paths are.
// /learn-loop reads the summary; /kill-or-keep's guard-sunset pass reads the
// per-catcher counts. JSONL at meta/telemetry/defects.local.jsonl (local-only).
//
// NOT a bug tracker: a row is written at CATCH time by whoever saw the check
// fire, one line each, no workflow. False alarms don't belong here (a guard
// firing on a non-defect is friction — log it there instead).

export const STAGES = ["hook", "ci", "eval", "review", "pre-launch", "live"] as const;
export type Stage = (typeof STAGES)[number];

export type DefectEntry = {
  ts: string; // ISO
  /** Which repo/product the defect lived in (slug or "factory"). */
  target: string;
  /** The check that caught it — guard script, eval case id, live assertion (e.g. "check-counts", "A11", "verify-live A4"). */
  catcher: string;
  /** Where in the pipeline it fired. */
  stage: Stage;
  /** One line: what was actually wrong. */
  defect: string;
  severity?: "critical" | "major" | "minor";
  /** Optional: commit/PR that fixed it. */
  fixed_by?: string;
};

export function isStage(s: string): s is Stage {
  return (STAGES as readonly string[]).includes(s);
}

/** One JSONL line (no trailing newline — caller appends). */
export function defectLine(e: DefectEntry): string {
  return JSON.stringify(e);
}

export type DefectSummary = {
  total: number;
  byCatcher: Record<string, number>;
  byStage: Record<string, number>;
  byTarget: Record<string, number>;
  criticals: DefectEntry[];
  /** Catchers that have never fired live/pre-launch but fired often upstream — informational. */
};

/** Summarize a JSONL blob, optionally since an ISO bound. Malformed lines are skipped. */
export function summarizeDefects(jsonl: string, opts: { sinceIso?: string } = {}): DefectSummary {
  const out: DefectSummary = { total: 0, byCatcher: {}, byStage: {}, byTarget: {}, criticals: [] };
  for (const line of jsonl.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    let e: DefectEntry;
    try {
      e = JSON.parse(t);
    } catch {
      continue;
    }
    if (!e || typeof e.defect !== "string" || !e.catcher || !isStage(e.stage as string)) continue;
    if (opts.sinceIso && (!e.ts || e.ts < opts.sinceIso)) continue;
    out.total++;
    out.byCatcher[e.catcher] = (out.byCatcher[e.catcher] ?? 0) + 1;
    out.byStage[e.stage] = (out.byStage[e.stage] ?? 0) + 1;
    out.byTarget[e.target || "(unknown)"] = (out.byTarget[e.target || "(unknown)"] ?? 0) + 1;
    if (e.severity === "critical") out.criticals.push(e);
  }
  return out;
}
