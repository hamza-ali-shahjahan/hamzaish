import { describe, expect, test } from "bun:test";
import { countEvidence, evaluateLedger, parseState } from "./validation-ledger";

/** A ledger with a real conversation logged and nothing else. */
const withEvidence = `# Validation Ledger — Example

## Status
- **State**: \`in-progress\`  <!-- unvalidated | in-progress | validated | debt-accepted -->

## Evidence
### 2026-06-14 — Maintainer (target-profile: yes)
- Problem in their own words: the thing is slow.

## Validation debt (fill this only if you build before validating)
`;

/** The muakkil shape: state set, debt recorded, zero conversations. */
const debtOnly = `# Validation Ledger — Example

## Status
- **State**: \`in-progress\`  <!-- unvalidated | in-progress | validated | debt-accepted -->

## Evidence
<!-- One block per REAL conversation. Copy the block below.
### YYYY-MM-DD — who they are (are they target-profile?)
- Problem in their own words:
-->

## Validation debt (fill this only if you build before validating)
### 2026-07-02 — Building before validation
- Why now: chose to build with validation "in parallel".
- Catch-up trigger: 2026-08-16.
`;

describe("countEvidence", () => {
  test("a ledger containing only a debt block reports 0 evidence blocks", () => {
    expect(countEvidence(debtOnly)).toBe(0);
  });

  test("counts real blocks under ## Evidence", () => {
    expect(countEvidence(withEvidence)).toBe(1);
  });

  test("counts every block in the section, not just the first", () => {
    const two = withEvidence.replace("## Validation debt", "### 2026-06-20 — Second person\n\n## Validation debt");
    expect(countEvidence(two)).toBe(2);
  });

  test("ignores commented-out template examples", () => {
    const commented = `## Evidence
<!--
### 2026-06-14 — a draft I never had
-->
`;
    expect(countEvidence(commented)).toBe(0);
  });

  test("a ledger with no ## Evidence section has no evidence", () => {
    expect(countEvidence("## Status\n- **State**: `validated`\n")).toBe(0);
  });
});

describe("evaluateLedger", () => {
  test("in-progress with nothing recorded is blocked — the empty-claim hole", () => {
    const verdict = evaluateLedger(debtOnly);
    expect(verdict.pass).toBe(false);
    expect(verdict.evidence).toBe(0);
    expect(verdict.reason).toContain("no evidence blocks");
  });

  test("in-progress with one real conversation is clear to build", () => {
    expect(evaluateLedger(withEvidence)).toEqual({ state: "in-progress", evidence: 1, pass: true });
  });

  test("validated needs evidence too — same hole, same rule", () => {
    const empty = withEvidence.replace("`in-progress`", "`validated`").replace(/### 2026-06-14[\s\S]*?\n\n/, "");
    expect(evaluateLedger(empty).pass).toBe(false);
    expect(evaluateLedger(withEvidence.replace("`in-progress`", "`validated`")).pass).toBe(true);
  });

  test("debt-accepted passes without evidence — recording the skip IS the requirement", () => {
    const verdict = evaluateLedger(debtOnly.replace("`in-progress`", "`debt-accepted`"));
    expect(verdict).toEqual({ state: "debt-accepted", evidence: 0, pass: true });
  });

  test("unvalidated is blocked", () => {
    expect(evaluateLedger(debtOnly.replace("`in-progress`", "`unvalidated`")).pass).toBe(false);
  });

  test("a missing State line reads as unvalidated, never as a pass", () => {
    expect(parseState("# Ledger\n\n## Evidence\n### 2026-06-14 — someone\n")).toBe("unvalidated");
    expect(evaluateLedger("# Ledger\n\n## Evidence\n### 2026-06-14 — someone\n").pass).toBe(false);
  });
});
