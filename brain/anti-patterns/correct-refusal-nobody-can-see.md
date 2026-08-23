---
name: correct-refusal-nobody-can-see
description: A money or state path that correctly refuses to proceed on failure, but surfaces nothing anywhere — so the failure is invisible and the value is stranded
type: anti-pattern
---

# A Correct Refusal Nobody Can See

## The pattern

A payment webhook (or any critical write) hits an error. The code does the
*right* thing: it refuses to fake success, returns an error so the provider
retries, and logs it. Every line is defensible.

But nothing surfaces. No banner, no admin row, no alert. The provider's retries
hit the same wall. The customer's money sits in a `pending` row that no screen
displays, and the operator only finds out when a human happens to look.

**Correct behaviour with no visibility is still an outage.**

## Why we don't do it

**Incident 2026-08-23 (bids.town, first real customer):** a $1 claim was paid at
03:37. The webhook called `apply_paid_bid`, which was rejected by a
pooler-broken SQL guard. The route returned 500 — correct, so Stripe would
retry — and Stripe retried into the same wall for over an hour. The bid stayed
`pending`. The town showed 0 shops. The operator's discovery route was noticing
the money in Stripe himself and asking *"WHY IS THERE NO PLOT FOR THIS."*

The disease (the guard) was fixed separately. The lasting lesson is that the
system had **no organ for reporting stranded value**.

## What to do instead

Every critical path needs three things, not one:

1. **The happy path** — the write itself.
2. **A sweep that re-asks the source of truth.** For payments: query the
   provider directly for every pending record and apply anything that genuinely
   paid. Make it idempotent, expose it as a button *and* run it on a schedule,
   so recovery does not depend on anyone noticing.
3. **A surface that makes stranded value impossible to miss.** A red banner at
   the top of the admin — *"N payments in limbo"* — not a log line. Logs are
   where failures go to be forgotten.

**Design rule:** for any state that represents money or a promise to a user,
ask *"if this write fails silently, which screen turns red?"* If the answer is
"none", the feature is not finished.

## Related

The reconcile sweep is also the answer to provider-side gaps (a webhook that
never arrives at all), so it earns its keep beyond this incident class.
