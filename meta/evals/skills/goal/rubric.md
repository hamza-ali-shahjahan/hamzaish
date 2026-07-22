# Eval rubric — /goal's unattended harness (autonomy-loop)

/goal itself is an interactive command; what must never regress silently is the harness
that runs it UNATTENDED — `scripts/autonomy-loop.ts`. Two deterministic cases pin its two
load-bearing behaviors: the safety refusal (opt-in marker) and the session contract
(loop-state handoff, branch-only rule, spend cap) that every unattended session receives.

## Assertions

| # | Assertion | Method | Pass |
|---|---|---|---|
| A1 | Refuses a repo without `.autonomy-ok` (autonomy is opt-in) | run without marker | exit ≠ 0 |
| A2 | Session prompt carries the contract: loop-state.json shape, feature-branch-only, no irreversible actions; spend cap active in preconditions | `--dry-run` on a marker'd fixture | exit 0 + stdout matches |

A1 is the born-red case: it asserts the refusal path, so the safety rail itself is
regression-guarded (deleting the opt-in check turns this case red).
