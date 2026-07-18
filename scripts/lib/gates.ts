// scripts/lib/gates.ts — lifecycle-gate evaluation (states-and-dates, pure).
//
// A product's `gates` block in product.config.json is a PRECOMMITMENT written at
// scaffold time: each gate = a measurable state + a date, so "kill or double
// down, never drift" is checkable instead of vibes (Annie Duke's states-and-
// dates; channel-matched indicators so slow-burn products aren't killed by
// naive MRR gates — an SEO product gates on impressions, not revenue).
//
// Pure functions only; check-gates.ts does the filesystem walk.

export type Gate = {
  /** Deadline, ISO YYYY-MM-DD. Written absolute at scaffold time. */
  date?: string;
  /** The measurable state that passes the gate — channel-matched, human-readable. */
  state?: string;
  /** ISO date the gate was verified passed (absence = not passed yet). */
  passed?: string;
  /** What happens on miss (documentation for the verdict conversation). */
  on_fail?: string;
  on_pass?: string;
};

export type GatesBlock = {
  validation?: Gate;
  launch?: Gate;
  traction?: Gate;
  pmf?: Gate;
  budgets?: { tokens_per_week?: number; usd_per_month?: number; hours_per_week?: number };
  /** Last recorded verdict: CONCENTRATE | DOUBLE-DOWN | MAINTAIN | AUTOPILOT | KILL */
  verdict?: string;
};

export const GATE_ORDER = ["validation", "launch", "traction", "pmf"] as const;
export type GateName = (typeof GATE_ORDER)[number];

export type GateStatus = "PASSED" | "OVERDUE" | "DUE" | "UPCOMING" | "UNDATED";
export type GateEval = { gate: GateName; status: GateStatus; date?: string; state?: string };

const DUE_WINDOW_DAYS = 14;

function daysBetween(aIso: string, bIso: string): number {
  return Math.round((Date.parse(bIso) - Date.parse(aIso)) / 86_400_000);
}

/** Evaluate every DEFINED gate against `todayIso` (YYYY-MM-DD). */
export function evaluateGates(gates: GatesBlock, todayIso: string): GateEval[] {
  const out: GateEval[] = [];
  for (const name of GATE_ORDER) {
    const g = gates[name];
    if (!g) continue;
    let status: GateStatus;
    if (g.passed) status = "PASSED";
    else if (!g.date) status = "UNDATED";
    else if (g.date < todayIso) status = "OVERDUE";
    else if (daysBetween(todayIso, g.date) <= DUE_WINDOW_DAYS) status = "DUE";
    else status = "UPCOMING";
    out.push({ gate: name, status, date: g.date, state: g.state });
  }
  return out;
}

/** The single gate the product is currently chasing (first non-passed, in ladder order). */
export function nextGate(evals: GateEval[]): GateEval | undefined {
  return evals.find((e) => e.status !== "PASSED");
}

/** One-line product summary for the dashboard. */
export function summarize(evals: GateEval[]): string {
  if (evals.length === 0) return "no gates";
  const nxt = nextGate(evals);
  if (!nxt) return "all gates PASSED";
  const when = nxt.date ? ` by ${nxt.date}` : "";
  return `${nxt.gate} ${nxt.status}${when}`;
}

/**
 * Validate a gates block's shape. Returns problem strings (empty = valid).
 * Loose on purpose — gates are a contract with the operator, not a type system;
 * we flag only what breaks evaluation or reads as an unfilled template.
 */
export function validateGates(gates: GatesBlock): string[] {
  const problems: string[] = [];
  const defined = GATE_ORDER.filter((n) => gates[n]);
  if (defined.length === 0) problems.push("gates block has none of validation/launch/traction/pmf");
  for (const name of defined) {
    const g = gates[name]!;
    if (!g.state || /^…|^\.\.\.|___/.test(g.state)) problems.push(`${name}: missing/unfilled state`);
    if (g.date && !/^\d{4}-\d{2}-\d{2}$/.test(g.date)) problems.push(`${name}: date must be YYYY-MM-DD (got "${g.date}")`);
    if (g.passed && !/^\d{4}-\d{2}-\d{2}$/.test(g.passed)) problems.push(`${name}: passed must be YYYY-MM-DD (got "${g.passed}")`);
  }
  return problems;
}
