# 2026-08-25 — A Stripe test key is part of going live, not part of testing later

## What happened

GetHired was built with payments throughout — bidding takes money, and a $1
joining charge was added on top. It went to its domain with **only a live key
provisioned**, scoped to Production, Preview and Development all at once.

Two consequences, both discovered late:

1. **No payment had ever been put through.** Not once, in either direction. The
   settlement logic was covered by tests against a real database, which is the
   half that decides whether money becomes the thing that was bought — but
   Stripe's own session creation had never been exercised, because doing so
   with a live key charges a real card.
2. **Staging was charging real money.** The same live key served the preview
   deployments. Any click on staging was a real charge on a real card — and
   because `DATABASE_URL` was also one variable across all three environments,
   the resulting row landed on the live board.

Nothing was lost, because the free allocation meant the paid path could not
fire for the first hundred signups. That was luck, not design.

## The lesson

This is the **Clerk dev-instance lesson wearing different clothes**
(`2026-06-09-clerk-prod-launch.md`). There, auth "worked" the whole build on a
development instance, and the swap to production became a launch-day scramble.
Here, payments "worked" the whole build in the sense that the code was written
and tested — but the mode that can actually take money had never been run, and
the mode that had been run was the one that costs real money.

The shared shape: **the credential that makes a service real is a go-live
concern, and provisioning only one of the pair guarantees the other is never
exercised.**

The asymmetry that makes payments worse than auth: an unproven auth path shows
a broken sign-in. An unproven payment path takes real money and delivers
nothing, or takes it twice, or takes it and grants nothing. There is no minor
version of that failure, and the person it happens to is a customer.

## Rules (now guardrails)

1. **Provision BOTH keys when Stripe is added**, not later. A product whose
   vault holds only a live key has no way to be tested except with real money,
   which means in practice it is not tested.
2. **Scope them apart.** `sk_test_` → Development + Preview. `sk_live_` →
   Production **only**. One key across three environments means every staging
   click and every automated run charges a real card.
3. **Two webhook endpoints, two secrets.** Stripe's test and live modes keep
   separate endpoint lists. A live secret rejects every test event with a
   signature error that reads exactly like a bug.
4. **HARD GATE: one payment proven end to end — locally AND on staging — before
   the domain goes live.** They fail differently. Local proves the session
   shape, the redirect and the settlement write. Only staging proves a real
   HTTPS webhook reaches a deployed serverless function and verifies there.
5. **Never read a local env file and conclude what production is doing.**
   Verbatim from the Clerk lesson, and it applies unchanged. Check the key's
   *prefix* with a non-printing `grep -c`, and check a deployed environment by
   its variable **scopes** (`vercel env ls`), never its values.
6. **A gated paid path needs a local-only fixture to reach it.** If payment only
   triggers after a free allocation runs out, a fresh database can never test
   it. Ship a fill tool guarded like `db:reset` — refuses a hosted database,
   reversible, recognisable row prefix. Without it the gate is untestable and
   therefore untested.

## The broader pattern, worth stating on its own

**One environment variable spanning Production, Preview and Development is
never right for anything that costs money or holds real rows.** It was true of
`DATABASE_URL` here (staging writes were live writes) and it was true of
`STRIPE_SECRET_KEY` (staging clicks were real charges). The tidiness of a
single row in a dashboard is not worth it. When adding any credential, the
first question is which environments it belongs to — and the default answer for
anything with a live/test distinction is **not all of them**.

## What was built

- New playbook **`factory/playbooks/ai-native-2026/payments-go-live.md`** — key
  provisioning and scoping, the local-then-staging gate and why both are
  needed, mode verification without printing secrets, making a gated paid path
  reachable, the nine-step checklist, and the gotchas (rotating CLI secret,
  `payment_status` vs session completion, unsigned webhooks, idempotent
  settlement, the two-condition escape hatch).
- **`go-live-provisioning.md`** gained stage **5.5 payments** in the `/go-live`
  pipeline, and three assertions in the eval harness:
  - **A11** — live mode in Production only, test mode elsewhere; one key across
    all three is a FAIL.
  - **A12** — a payment proven locally **and** on staging. Unproven **blocks the
    domain**; it is not a warning.
  - **A13** — the webhook refuses an unsigned body with a 400 and grants
    nothing.
