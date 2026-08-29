// staleness.ts — pure classification logic for check-status-staleness.ts.
//
// "Dreaming and pruning" (Slite's Company Brain framework, chapter 4) names time
// decay as its own mechanism: old, unused facts should lose weight even when
// nobody flags them by hand. Hamzaish's brain has a review queue (`/reflect`)
// but nothing that notices a status.md gone quiet. This is that: a product
// whose status page hasn't moved in a while, while its config still claims
// active work, is silent aging — the same shape as the "Telemetry is blind"
// finding in products/_portfolio.md, but for docs instead of metrics.

export const DEFAULT_THRESHOLD_DAYS = 21;

// Stages where "no status update in weeks" is actually surprising. A killed
// or idea-stage product going quiet is expected, not stale.
export const ACTIVE_STAGES = new Set(["mvp", "launch", "scale"]);

export type StalenessInput = {
  slug: string;
  stage: string;
  status: string;
  /** days since the last commit that touched status.md, or null if unknown (no git history / untracked) */
  daysSinceUpdate: number | null;
  thresholdDays?: number;
  /** product.config.json → gates.verdict, if set. AUTOPILOT means the portfolio already decided not to touch this — going quiet is the intended state, not decay. */
  verdict?: string | null;
};

export type StalenessResult = {
  slug: string;
  stage: string;
  status: string;
  daysSinceUpdate: number | null;
  claimsActiveWork: boolean;
  stale: boolean;
  reason: string;
};

/** A config's status text implies ongoing work — "active", "live", or similar — as opposed to "idea", "slot_reserved", "killed". */
export function claimsActiveWork(status: string): boolean {
  return /active|live/i.test(status);
}

export function classifyStaleness(input: StalenessInput): StalenessResult {
  const thresholdDays = input.thresholdDays ?? DEFAULT_THRESHOLD_DAYS;
  const isAutopilot = (input.verdict ?? "").toUpperCase() === "AUTOPILOT";
  const claims = claimsActiveWork(input.status) && ACTIVE_STAGES.has(input.stage) && !isAutopilot;
  const stale = claims && input.daysSinceUpdate !== null && input.daysSinceUpdate > thresholdDays;

  let reason: string;
  if (isAutopilot) {
    reason = `verdict AUTOPILOT — the portfolio already decided not to touch this; going quiet is expected, not decay`;
  } else if (input.daysSinceUpdate === null) {
    reason = "no git history for status.md — can't tell";
  } else if (!claims) {
    reason = `stage "${input.stage}" / status "${input.status}" doesn't claim active work — staleness doesn't apply`;
  } else if (stale) {
    reason = `claims active work at stage "${input.stage}" but status.md hasn't moved in ${input.daysSinceUpdate}d (>${thresholdDays}d threshold)`;
  } else {
    reason = `updated ${input.daysSinceUpdate}d ago — within the ${thresholdDays}d threshold`;
  }

  return {
    slug: input.slug,
    stage: input.stage,
    status: input.status,
    daysSinceUpdate: input.daysSinceUpdate,
    claimsActiveWork: claims,
    stale,
    reason,
  };
}
