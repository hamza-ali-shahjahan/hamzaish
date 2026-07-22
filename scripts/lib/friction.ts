// scripts/lib/friction.ts — structured friction/delight capture (pure functions).
//
// The machine-readable version of "surprise is the highest-signal entry": any
// session (or skill step) can log a one-line structured event — friction when a
// tool/skill/flow fought back, delight when something worked unreasonably well.
// /learn-loop reads the summary alongside trace-report, so recurring friction
// becomes a promotion candidate even when no prose learning mentioned it.
// (Ported idea: gbrain's _friction-protocol. JSONL at
// meta/telemetry/friction.local.jsonl — gitignored, local-only.)

export const SEVERITIES = ["blocker", "error", "confused", "nit", "delight"] as const;
export type Severity = (typeof SEVERITIES)[number];

export type FrictionEntry = {
  ts: string; // ISO
  severity: Severity;
  /** What was being used when it happened — a skill/command/script name. */
  source: string;
  /** Optional phase within the source (e.g. "gate-4", "install"). */
  phase?: string;
  message: string;
};

export function isSeverity(s: string): s is Severity {
  return (SEVERITIES as readonly string[]).includes(s);
}

/** One JSONL line (no trailing newline — caller appends). */
export function frictionLine(e: FrictionEntry): string {
  return JSON.stringify(e);
}

export type FrictionSummary = {
  total: number;
  bySeverity: Record<string, number>;
  /** source → count, worst-severity-first sources the loop should look at. */
  bySource: Record<string, number>;
  blockers: FrictionEntry[];
  delights: FrictionEntry[];
};

/** Summarize a JSONL blob, optionally since an ISO bound. Malformed lines are skipped. */
export function summarizeFriction(jsonl: string, opts: { sinceIso?: string } = {}): FrictionSummary {
  const out: FrictionSummary = { total: 0, bySeverity: {}, bySource: {}, blockers: [], delights: [] };
  for (const line of jsonl.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    let e: FrictionEntry;
    try {
      e = JSON.parse(t);
    } catch {
      continue;
    }
    if (!e || typeof e.message !== "string" || !isSeverity(e.severity as string)) continue;
    if (opts.sinceIso && (!e.ts || e.ts < opts.sinceIso)) continue;
    out.total++;
    out.bySeverity[e.severity] = (out.bySeverity[e.severity] ?? 0) + 1;
    const src = e.source || "(unknown)";
    out.bySource[src] = (out.bySource[src] ?? 0) + 1;
    if (e.severity === "blocker") out.blockers.push(e);
    if (e.severity === "delight") out.delights.push(e);
  }
  return out;
}
