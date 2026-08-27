# 0001 — Real payments shipped before validation, on operator override

**Date:** 2026-08-24
**Status:** accepted
**Decider:** Hamza (explicit, interactive)

## Context

GetHired entered the factory already built — ~5,000 lines written in one session before
registration. The validation ledger was set to `debt-accepted` on the honest grounds that
the build cost was sunk, nothing was expensive or irreversible, and the product's core
thesis (people will pay to outrank each other in public) *cannot* be validated by
interview — asked in the abstract everyone says no, so shipping is the experiment.

That debt block named four things that would flip the product from cheap to expensive and
stop the build until five real conversations were logged. The first was:

> Wiring real payments (Stripe) — money changing hands makes it irreversible.

At the build gate, the recommendation put to the operator was to ship the auction as-is —
bids recorded, not charged — and add Stripe at the first outside bid. The reasoning: Stripe
on a board nobody has bid on yet is weeks of work protecting revenue that does not exist.

**The operator chose real payments now.**

## Decision

Build real payments now, and record this as an explicit override rather than quietly
letting the gate contradict itself.

The gate did its job — it surfaced the cost before the work started, the operator saw the
tradeoff and took it knowingly. A validation rail that can never be overridden is a wall,
and the momentum-first rule is deliberate: building unvalidated is fine, building
unvalidated *silently* is the thing we no longer do.

## Consequences

- Payments forced real accounts. You cannot charge a cookie: someone who pays $500 and then
  clears their cookies must not lose the spot. Magic-link sign-in was a prerequisite, not a
  feature — it roughly doubled the scope of the build.
- The catch-up trigger is unchanged and now matters more: the first bid from someone who is
  not Hamza is conversation #1, and if the board sits 14 days (to 2026-09-07) with no
  outside bids, the five conversations happen as a post-mortem.
- Money makes some failure modes newly expensive, so they were built for rather than
  deferred: webhook signature verification, idempotent settlement under Stripe retries,
  auto-refund when a bid loses its race, and a per-category advisory lock so concurrent
  bids cannot corrupt the ranking. Each has a test.
- Remaining honest gap: a refund happens correctly but the bidder is not told in the UI.
  `recentIntentsFor()` exists for that and is currently unused.

## The rule this earns

When an operator override crosses a stop condition the ledger names, amend the ledger in
the same session. A gate whose recorded state silently disagrees with what was built is
worse than no gate — the next reader trusts it.
