# 0006 — The local index is the only search source; BigQuery becomes approval-gated acquisition

**Date:** 2026-08-20
**Status:** Shipped to production (`159bb92`, PR #18, live on patently.legal)

## Decision

Patent search and patent detail are served **entirely from the local pgvector
index**. BigQuery is no longer a search backend of any kind — it becomes a data
**acquisition** mechanism that only an explicitly approved, scope-bounded
request can reach.

- `pvSearchPatents`, `pvGetPatentDetail`, `pvGetClaimsForPatent` deleted.
- `PATENT_BQ_FALLBACK` **deleted**, not defaulted off.
- `get_patent_detail` reads `patent_index`; claims report as unavailable
  (0 of 58,824 rows carry them); unknown patents return an honest
  "not in our indexed dataset" rather than silently buying the answer.
- The weekly patent cron is gone.
- `runAcquisition` refuses anything whose status is not exactly `APPROVED`,
  revalidates the scope, and — for now — refuses to execute at all.
- Enforced by `scripts/test-import-boundary.ts`, which walks the real import
  graph from user-facing roots and fails the build on any path to the SDK.

## Why

A guard is a runtime check someone can bypass; an architecture is a shape that
cannot express the thing you are afraid of. Decision `0005` gated *spending* on
a paying customer, which stopped the bleeding. It did not stop a user request
from being **able** to reach a metered API — and `get_patent_detail` was doing
exactly that, unconditionally, twice per call, with no gate of its own.

The deeper reason is product, not cost: the local index is the thing worth
improving. Paying to search the entire public dataset on every miss meant the
corpus never got better and the bill scaled with curiosity. Making the index the
only source forces coverage gaps to become **visible, aggregated, and
deliberately fixed** rather than invisibly expensive.

## Alternatives considered

- **Keep BigQuery as a fallback, gated to paying users.** This is what `0005`
  shipped, and it works for cost. Rejected because it leaves a metered API on
  the synchronous user path — the risk returns the moment an entitlement check
  is refactored, and nothing would catch it.
- **Keep the env-var flag, defaulted off.** Rejected: a switch a server can flip
  is not a boundary. See the anti-pattern.
- **Bulk-acquire claims first so `get_patent_detail` keeps working fully.**
  Rejected for now — claims are the largest column in the table and the cost
  needs pricing. It becomes the first expansion request instead.
- **Automatic acquisition once a coverage gap is detected.** Rejected by the
  operator, explicitly: no automatic path from user behaviour to spending. A
  detected gap creates a proposal; a human approves a bounded scope.
- **Infer acquisition scope automatically.** Deferred. v1 requires an explicit
  scope on the request so the approval means something specific.

## What would prove it wrong

Users report materially worse patent answers, traced to genuine absence rather
than thin ranking — and the coverage detector does *not* surface those topics,
meaning the feedback loop cannot see what the product is missing. Or: months
pass with real usage and zero expansion requests, which would mean either the
index is sufficient (good) or the thresholds are unreachable (bad, and
indistinguishable without checking `search_events.top_similarity` directly).

Equally disconfirming in the other direction: a flood of requests whose
`top_similarity` sits near the ceiling would say 0.55 is drawn in the wrong
place and we are proposing purchases for ranking bugs.

## Revisit trigger

At the first approved expansion request, or at 500 recorded `search_events` —
whichever comes first. Recalibrate the 0.55 threshold from real data at that
point rather than from the six probes that set it.

## Consequences

- Claim-level analysis is visibly unavailable until claims are acquired.
- Local coverage is ~21 months (2024-07 → 2026-04), not the 12 years the seed
  config implies — the newest-first seed never reached further back. Users will
  meet that edge; the feedback loop is how it gets recorded.
- Admin `/api/admin/expansion` is the one route permitted to import the
  acquisition module (for pure scope helpers). Splitting those out is backlog.
- The acquisition runner is **unbuilt and inactive**, by instruction.

## Verification

Independent import-graph walk over all 39 route/page/layout entry points: one
reaches the SDK, the intended admin exception. Production, post-deploy: 0 billed
BigQuery calls in 30 days, $0.00 month-to-date; a clearance search wrote an
attributed `search_event` (userId, session=runId, surface, query, 8 result ids,
raw cosine 0.655, embedding present); memo feedback recorded one row and updated
rather than duplicating on a second press; patent detail returned local fields
with `claims_available: false`; an unknown patent returned the honest
unavailable state. 140 assertions across 8 suites.
