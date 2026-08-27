# Validation Ledger — GetHired

The momentum-first validation rail, made checkable. `scripts/check-validation.ts <slug>` reads the **State** line below.

**The rail**: before expensive or irreversible bets, aim for ~5 conversations with target-profile users. Cheap, fast, reversible builds are their own validation — the ship is the test.
**The escape hatch**: building first is allowed (momentum is the default) — but it must be *recorded as debt here*, never happen silently. This is the wp-to-astro lesson encoded: the violation is visible, not invisible.

## Status
- **State**: `debt-accepted`  <!-- unvalidated | in-progress | validated | debt-accepted -->
- **Evidence count**: 0 / 5

## Evidence
<!-- One block per REAL conversation. Copy the block below.
### YYYY-MM-DD — who they are (are they target-profile?)
- Problem in their own words:
- Current workaround / what they pay today:
- Reaction to the idea (signal, not politeness):
- Would-pay signal:
-->

## Validation debt

### 2026-08-24 — Building before validation

> **AMENDED 2026-08-24, same day.** Stop condition #1 below (real payments) was crossed by
> an explicit operator decision at the build gate — Hamza chose Stripe now over shipping the
> auction uncollected. The gate surfaced the cost first and the override was taken knowingly;
> see [`../decisions/0001-payments-before-validation.md`](../decisions/0001-payments-before-validation.md).
> The catch-up trigger below is unchanged and now carries more weight, since money moves.

- **Why now (cheap / fast / reversible? deadline? the build IS the test?):**
  All three. The product already exists — ~5,000 lines were written in a single session
  before it entered the factory, so the build cost is sunk, not forecast. Nothing here is
  expensive or irreversible: no money changes hands (bids record what is owed and collect
  nothing), there is no auth, no user data beyond a public professional URL somebody pastes
  in themselves, and the domain was already owned. The bet is a weekend of hosting.
  Critically, **this product cannot be validated by interview.** It is a public leaderboard
  whose entire thesis is that people will pay to outrank each other in the open. Asked in the
  abstract, everyone says "no, that's dystopian"; the honest test is whether a live board
  with real names on it gets a second bid. Shipping IS the experiment — the same reason the
  outbid.lol family of products is only ever validated in public.

- **What would make me stop and validate:**
  Any of these flips this from cheap to expensive, and each one stops the build until five
  real conversations are logged:
  1. Wiring real payments (Stripe) — money changing hands makes it irreversible.
  2. Ingesting profiles nobody submitted, i.e. scraping — legal + consent exposure.
  3. Spending on paid acquisition, or building anything that takes more than a weekend.
  4. Charging a company a subscription, which would contradict the stated revenue model.

- **Catch-up trigger (when I will run the 5 conversations):**
  At the **first real bid from someone who is not Hamza** — that person is by definition
  target-profile and self-selected, and they are conversation #1. Also triggered by the
  first company that asks to post a job. If the board is live for 14 days (by 2026-09-07)
  with zero outside bids, the honest read is that the mechanic did not land, and the five
  conversations happen then — as a post-mortem, not a pre-mortem.
