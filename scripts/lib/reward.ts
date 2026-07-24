// scripts/lib/reward.ts — structured REWARD/outcome capture (pure functions).
//
// The reward dimension telemetry was missing. trace-log records which TOOLS ran
// and whether they errored; friction records where the flow fought back. Neither
// records the thing Nadella's post centers on: did the task the CUSTOMER actually
// cares about complete? A reward entry is that signal — an outcome (pass/fail/
// partial) on a channel that matters (an executed eval, an e2e pass, an activation
// or key-action event), attributed to a source (a skill or a product).
//
// It deliberately UNIFIES the two axes the factory kept separate: agent/skill evals
// and product usage metrics both land here as rewards, so the hill-climb has one
// signal to optimize. Doctrine (the RLE analog — we optimize the harness/router/
// skill selection against these outcomes, never model weights):
// factory/playbooks/ai-native-2026/cost-to-outcome-and-model-independence.md
// JSONL at meta/telemetry/reward.local.jsonl — gitignored, local-only.

export const SIGNALS = ["eval", "e2e", "activation", "key_action", "retention", "sean_ellis"] as const;
export type Signal = (typeof SIGNALS)[number];

export const OUTCOMES = ["pass", "fail", "partial"] as const;
export type Outcome = (typeof OUTCOMES)[number];

export type RewardEntry = {
  ts: string; // ISO
  signal: Signal; // the reward channel — what kind of customer-valued outcome this is
  outcome: Outcome; // pass / fail / partial
  source: string; // skill/agent/product the reward is attributed to
  value?: number; // optional numeric reward (eval pass fraction, activation rate, …)
  ref?: string; // optional pointer (a run report, a PR, a product slug)
  note?: string;
};

export function isSignal(s: string): s is Signal {
  return (SIGNALS as readonly string[]).includes(s);
}
export function isOutcome(s: string): s is Outcome {
  return (OUTCOMES as readonly string[]).includes(s);
}

/** One JSONL line (no trailing newline — caller appends). */
export function rewardLine(e: RewardEntry): string {
  return JSON.stringify(e);
}

export type SourceStat = { total: number; pass: number; passRate: number };
export type RewardSummary = {
  total: number;
  bySignal: Record<string, number>;
  byOutcome: Record<string, number>;
  bySource: Record<string, SourceStat>;
  passRate: number; // pass / total across all reward entries in range
};

function round(n: number, d = 3): number {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

/** Summarize a JSONL blob, optionally since an ISO bound. Malformed lines skipped. */
export function summarizeReward(jsonl: string, opts: { sinceIso?: string } = {}): RewardSummary {
  const out: RewardSummary = { total: 0, bySignal: {}, byOutcome: {}, bySource: {}, passRate: 0 };
  let pass = 0;
  for (const line of jsonl.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    let e: RewardEntry;
    try {
      e = JSON.parse(t);
    } catch {
      continue;
    }
    if (!e || !isSignal(e.signal as string) || !isOutcome(e.outcome as string)) continue;
    if (opts.sinceIso && (!e.ts || e.ts < opts.sinceIso)) continue;
    out.total++;
    out.bySignal[e.signal] = (out.bySignal[e.signal] ?? 0) + 1;
    out.byOutcome[e.outcome] = (out.byOutcome[e.outcome] ?? 0) + 1;
    const src = e.source || "(unknown)";
    const st = (out.bySource[src] ??= { total: 0, pass: 0, passRate: 0 });
    st.total++;
    if (e.outcome === "pass") {
      st.pass++;
      pass++;
    }
    st.passRate = round(st.pass / st.total);
  }
  out.passRate = out.total ? round(pass / out.total) : 0;
  return out;
}
