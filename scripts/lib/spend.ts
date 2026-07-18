// scripts/lib/spend.ts — spend-meter primitives for unattended runs (#6 closed).
//
// Pure functions only (no I/O) so the budget arithmetic is unit-testable: the
// autonomy loop feeds them `claude -p --output-format json` output and a ledger
// file's lines; they never touch the filesystem themselves. The cap is a HARD
// abort, not a warning — an unattended loop with no burn meter is the
// cost-runaway class (factory/playbooks/scale-stage/abuse-and-cost-controls.md).

export type SessionCost = {
  /** Dollars this session cost; 0 when unparsable (caller must warn). */
  costUsd: number;
  turns?: number;
  /** Final result text from the session, when present. */
  resultText?: string;
  /** false = we could not find a cost in the output (stream mode / crash / format drift). */
  parsed: boolean;
};

/**
 * Parse the JSON object `claude -p --output-format json` prints. Tolerant on
 * purpose: the cost field has already been renamed once (cost_usd →
 * total_cost_usd), and a crashed session may print partial output. Scans lines
 * from the END so a trailing result object wins over any earlier noise.
 */
export function parseClaudeJson(stdout: string): SessionCost {
  const lines = stdout.trim().split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line.startsWith("{")) continue;
    try {
      const o = JSON.parse(line);
      const cost = typeof o.total_cost_usd === "number" ? o.total_cost_usd
        : typeof o.cost_usd === "number" ? o.cost_usd
        : undefined;
      if (cost === undefined) continue;
      return {
        costUsd: cost,
        turns: typeof o.num_turns === "number" ? o.num_turns : undefined,
        resultText: typeof o.result === "string" ? o.result : undefined,
        parsed: true,
      };
    } catch {
      /* not JSON — keep scanning up */
    }
  }
  // Whole-output parse as a fallback (pretty-printed multi-line JSON).
  try {
    const o = JSON.parse(stdout);
    const cost = typeof o.total_cost_usd === "number" ? o.total_cost_usd
      : typeof o.cost_usd === "number" ? o.cost_usd : undefined;
    if (cost !== undefined) {
      return {
        costUsd: cost,
        turns: typeof o.num_turns === "number" ? o.num_turns : undefined,
        resultText: typeof o.result === "string" ? o.result : undefined,
        parsed: true,
      };
    }
  } catch {
    /* fall through */
  }
  return { costUsd: 0, parsed: false };
}

export type SpendState = { spentUsd: number; capUsd: number };

/** True when the cap is hit or crossed — the loop must hard-stop BEFORE the next session. */
export function capReached(state: SpendState): boolean {
  return state.capUsd > 0 && state.spentUsd >= state.capUsd;
}

export function recordSession(state: SpendState, costUsd: number): SpendState {
  return { ...state, spentUsd: +(state.spentUsd + Math.max(0, costUsd)).toFixed(4) };
}

/** The FACTORY-ORDERS tick-discipline line: `spend $X.XX/$Y.XX`. */
export function spendLine(state: SpendState): string {
  return `spend $${state.spentUsd.toFixed(2)}/$${state.capUsd.toFixed(2)}`;
}

export type LedgerEntry = {
  ts: string; // ISO timestamp
  slug: string;
  session: number;
  model: string;
  costUsd: number;
  turns?: number;
  state?: string; // loop-state after the session, when known
};

/** One JSONL line (no trailing newline — caller appends). */
export function ledgerLine(e: LedgerEntry): string {
  return JSON.stringify(e);
}

/**
 * Sum ledger costs, optionally filtered by slug and/or an ISO `since` bound.
 * Malformed lines are skipped (a half-written line from a killed process must
 * never wedge the meter).
 */
export function sumLedger(jsonl: string, opts: { slug?: string; sinceIso?: string } = {}): number {
  let total = 0;
  for (const line of jsonl.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    try {
      const e = JSON.parse(t) as LedgerEntry;
      if (typeof e.costUsd !== "number") continue;
      if (opts.slug && e.slug !== opts.slug) continue;
      if (opts.sinceIso && (!e.ts || e.ts < opts.sinceIso)) continue;
      total += e.costUsd;
    } catch {
      /* skip malformed */
    }
  }
  return +total.toFixed(4);
}
