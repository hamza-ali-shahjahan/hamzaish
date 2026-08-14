// scripts/lib/validation-ledger.ts — validation-ledger parsing (pure).
//
// The ledger is products/<slug>/validation/README.md. Two things are read from it:
// the **State** line, and how many REAL evidence blocks sit under `## Evidence`.
//
// Both readings used to be wrong, and wrong in the same direction — toward a
// passing gate with nothing behind it (found 2026-08-13 seeding muakkil):
//
//   1. Evidence counting was scope-blind: every `### YYYY-MM-DD` heading anywhere
//      in the file counted, including the one under `## Validation debt`. A debt
//      block is a record of NOT validating; counting it as evidence FOR validation
//      inverts the ledger's meaning. Two live products reported phantom evidence.
//   2. `in-progress` passed unconditionally, so typing it and writing nothing else
//      printed "Clear to build" forever.
//
// So: evidence is counted only inside the `## Evidence` section, and any state that
// *claims validation happened* has to show at least one block. `debt-accepted` is
// exempt by design — it claims the opposite, and saying so out loud is the point.
//
// Pure functions only; check-validation.ts does the filesystem walk.

/** Ledger states the template offers. Anything unrecognized is treated as unvalidated. */
export type LedgerState = "unvalidated" | "in-progress" | "validated" | "debt-accepted" | (string & {});

export type LedgerVerdict = {
  state: LedgerState;
  /** Evidence blocks under `## Evidence` — real conversations, nothing else. */
  evidence: number;
  pass: boolean;
  /** Why it failed. Absent when it passes. */
  reason?: string;
};

/** States that assert validation actually happened — each needs ≥1 evidence block. */
const EVIDENCE_BACKED = new Set<LedgerState>(["validated", "in-progress"]);

/** The honest "I built first and wrote it down" state. Passes without evidence, by design. */
const RECORDED_DEBT = "debt-accepted";

/** The bar the rail aims at: ~5 target-profile conversations before expensive bets. */
export const TARGET_EVIDENCE = 5;

export function parseState(text: string): LedgerState {
  return (text.match(/\*\*State\*\*:\s*`?([a-z-]+)`?/i)?.[1] ?? "unvalidated").toLowerCase();
}

/**
 * Count evidence blocks — dated `###` headings under the `## Evidence` section only.
 *
 * Scoped to that section so a dated `## Validation debt` heading can never be read as
 * evidence, and HTML comments are stripped first so the template's commented-out example
 * block (and any commented draft) never counts either.
 */
export function countEvidence(text: string): number {
  const lines = text.replace(/<!--[\s\S]*?-->/g, "").split("\n");

  const start = lines.findIndex((line) => /^##\s+Evidence\b/i.test(line));
  if (start === -1) return 0;

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^#{1,2}\s/.test(line));
  const section = (end === -1 ? rest : rest.slice(0, end)).join("\n");

  return (section.match(/^###\s+\d{4}-\d{2}-\d{2}/gm) ?? []).length;
}

export function evaluateLedger(text: string): LedgerVerdict {
  const state = parseState(text);
  const evidence = countEvidence(text);

  if (state === RECORDED_DEBT) return { state, evidence, pass: true };

  if (EVIDENCE_BACKED.has(state)) {
    if (evidence > 0) return { state, evidence, pass: true };
    return {
      state,
      evidence,
      pass: false,
      reason: `state \`${state}\` says validation is underway, but there are no evidence blocks under "## Evidence" — nothing was recorded.`,
    };
  }

  return { state, evidence, pass: false, reason: `state \`${state}\` — no validation recorded.` };
}
