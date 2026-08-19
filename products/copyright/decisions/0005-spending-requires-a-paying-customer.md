# 0005 — Spending money requires a paying customer

**Date:** 2026-08-20
**Status:** Shipped to production (`dab5e72`, PR #17, live on patently.legal)

## Context

Google Cloud billed $93.91 for Aug 1–17 on a product with **zero active users**.
Measured by BigQuery dry run: `patents-public-data.patents.publications` is not
partitioned on `publication_date`, so the date and CPC filters in our queries prune
nothing. Every query shape costs a flat ~231 GiB ≈ $1.41 — a one-day search, a 90-day
CPC pull, and a single `WHERE publication_number = @id` lookup are priced identically.

Two scheduled jobs issued those calls for months:
- The daily digest — **77 runs, 0 items returned every time, 0 emails sent**, for one
  watchlist owned by a free test account.
- The Monday patent top-up — ~$25 per run to add a few hundred rows to a 58k index.

Three blind spots kept it invisible: the code's cost comments asserted partition
pruning and free-tier coverage (untested, all wrong); the search cache key embedded
today's date, so it missed by construction; and cost tracking lived only inside
clearance runs, so `/admin` showed $21 lifetime against a real $94/month.

## Decision

**A live patent lookup runs only for a signed-in user on an active paid plan.**
Not a scheduled job, not a free account, and explicitly not an admin account — admin
usage is testing, and testing must not cost money. The operator set this rule directly.

Entitlement is carried ambiently and checked at the leaf, so a cron can label itself
but has no paying user to bill against and is refused before anything is priced. This
makes "spend with no users" structurally impossible rather than merely fixed.

Layered behind it: a free dry run prices every query and refuses anything over a byte
cap; a monthly budget stops spend entirely and **fails closed** when the ledger is
unreadable; a `service_usage` ledger records every call, billed or refused, with what
triggered it; alert emails at 50/80/100%; and `/admin` shows month-to-date spend by
caller. Terminal seeds get an in-process operator scope no server can acquire, behind
an explicit `--i-will-pay` flag that prints the price.

Also: the digest reads patents from the local index (removes ~$42/mo), and the weekly
BigQuery cron is removed from `vercel.json` (opt in with `PATENT_INDEX_REFRESH=1`).

## Why

Ceilings do not stop a caller that has no customer behind it. Every guard already in
place bounded how big a single call could be; none bounded whether the call should
happen at all, so a timer spent right up to those ceilings for months on behalf of
nobody. Attaching the right to spend to a *person* converts "remember to switch the cron
off" (discipline, which decays) into "the cron cannot switch spending on" (structure,
which holds). It also makes attribution free — every charge already knows whose it was.

## Alternatives considered

- **Just delete the crons.** Fixes this instance, not the class. The next scheduled job
  someone adds re-opens the same hole, and nothing would have caught it.
- **Lower the per-query byte cap and keep everything else.** This is what was already in
  place and it is precisely what failed — the cap was set above the real cost from an
  unmeasured guess, so it never fired.
- **A provider-side daily quota alone.** Kept, but as one layer of three. It cannot tell
  a paying customer from a robot, so it can only fail everything or allow everything.
- **Let admin accounts keep spending, since they are the operator's.** Rejected at the
  operator's direction: admin usage is testing, and testing must not cost money. The
  local index serves admins the same path real users hit, so nothing is lost.
- **Fail open when the spend ledger is unreadable** (matching how usage limits behave
  elsewhere in this codebase). Rejected — wrongly allowing costs real money, wrongly
  refusing costs a fallback that still returns results.

## What would prove it wrong

A paying customer reports patent results that are materially worse than before, traced
to the live lookup being refused rather than to the local index being thin. Or: the
ledger shows the guard blocking legitimate paid calls more often than it blocks machine
ones. Either says the gate is drawn in the wrong place. Equally disconfirming in the
other direction: a month passes with billed spend still at $0 while paying customers are
active — that would mean the local index is answering everything and the live fallback
can be removed entirely rather than merely gated.

## Revisit trigger

At the first paying Builder subscriber, or at the first month where billed BigQuery
spend exceeds $1 — whichever comes first. Also revisit if a memo-pack buyer complains,
since that tier currently counts as unentitled.

## Consequences

- Expected Google spend at zero paying users: **$0**.
- The operator cannot exercise live Google lookups from the admin accounts. Accepted —
  the local index serves the same path real users hit.
- A $19 memo-pack buyer counts as free for this purpose (no subscription). Flagged to
  the operator as an open call; costs them nothing today since the index answers.
- `production` branch is stale (15 PRs behind); the real deploy path is a merge to
  `main`, confirmed against the Vercel project. Recorded so future ships don't push to
  a dead branch.

## Verification

Against real BigQuery and the real database, before merge: cron call refused at $0
billed; 0 watchlists qualify for digests (was 1); all 6 real accounts blocked with
reasons; seed script without the flag exits 1 with the price. 40 new tests, existing
suites green (12/9/14), no new lint errors. A security review found no vulnerabilities;
its two robustness findings (fail-open budget read, fragile chat entitlement scope)
were fixed before merge. Post-deploy: `/api/health` returns `buildSha dab5e72`, all
probes green, site 200.
