# Payments go-live (Stripe)

**Payments are a GO-LIVE task, not a build task.** The same shape as
[`auth-go-live.md`](auth-go-live.md), and for the same reason: the thing that
"worked" the whole build was the mode that cannot take real money, and the
swap to the one that can is where the failures live.

The difference from auth: an unproven auth path shows a broken sign-in. An
unproven payment path takes real money and hands back nothing, or takes real
money twice, or takes it and never grants what was paid for. There is no
"minor" version of this failure.

---

## The rule

> **A product that takes money does not reach its domain until one real payment
> has been put through, end to end, on a test key — locally AND on staging.**

Both, in that order. They fail differently:

| Where | What it proves | What it cannot prove |
|---|---|---|
| **Local** | Checkout session shape, redirect, settlement logic, the database write | Nothing about the deployed environment |
| **Staging** | The deployed webhook actually receives and verifies a signed event | Nothing about the live key |
| **Production** | The live key works | — this is the one you cannot rehearse, so everything else must be proven first |

Locally the webhook is forwarded by the Stripe CLI, which is not the same code
path as a real HTTPS delivery hitting a serverless function. A signature that
verifies against a CLI secret proves the verification code; it does not prove
the deployed endpoint is reachable, or that the platform did not buffer/modify
the body. Only staging proves that.

---

## Provision BOTH keys, at the same time

When Stripe is added to a product, **the test key is provisioned alongside the
live key — not later, not "when we get to testing."** A product with only a
live key in its vault has no way to be tested except with real money, which
means in practice it does not get tested.

Environment scoping is the whole game:

| Variable | Development | Preview (staging) | Production |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` | `sk_test_…` | `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | CLI `whsec_…` | **test-mode** endpoint `whsec_…` | **live-mode** endpoint `whsec_…` |

Two webhook endpoints, not one. Stripe's test and live modes have separate
endpoint lists and separate signing secrets — a live secret will reject every
test event and vice versa, with a signature error that reads like a bug.

**The trap this exists to stop:** a single `STRIPE_SECRET_KEY` scoped to
Production **and** Preview **and** Development. It looks tidy in the dashboard
and it means every staging click, every local run and every automated test is
charging a real card. Same shape as the `DATABASE_URL` trap — one variable
across three environments is never right for anything that costs money or
holds real rows.

---

## Verify the mode by what the product SHIPS, never by a local file

Directly inherited from the Clerk lesson, and it burns exactly the same way:
reading `.env.local` and concluding what production is doing. A local file is
the developer's environment. It is not evidence about a deployed one.

To determine the mode without ever printing a key:

```bash
# Which mode is this key? Prefix only — never echo the value.
grep -c '^STRIPE_SECRET_KEY=sk_test' .env.local
grep -c '^STRIPE_SECRET_KEY=sk_live' .env.local
```

For a deployed environment, ask the platform for the variable's **scopes**, not
its value (`vercel env ls`), and confirm the checkout page the product actually
serves opens a session in the expected mode.

---

## Making the paid path reachable for a test

A payment gate that only triggers after some threshold — a free allocation, a
trial, a usage tier — is untestable on a fresh database, because the threshold
is never reached. Ship a **local-only fixture** that exhausts the threshold,
guarded exactly like `db:reset`:

- Refuses to run against a hosted database (`looksHosted()`), because the local
  env file is pulled from the host and points at **production**. Exhausting a
  free allocation there tells every real visitor the free spots are gone.
- Reversible (`--undo`), so the free path is testable too.
- Rows tagged with a recognisable id prefix so the undo is exact.

---

## The checklist

1. Test keys created; **both** test and live provisioned into the vault.
2. Test key scoped to Development + Preview. Live key scoped to Production
   **only**.
3. Two webhook endpoints: one test-mode (→ staging URL), one live-mode
   (→ production URL). Each secret scoped to its own environment.
4. **Local payment proven** — Stripe CLI forwarding, test card `4242…`, money
   becomes the thing that was bought.
5. **Staging payment proven** — real HTTPS webhook delivery, signature
   verified, settled, and the result visible in the product.
6. Idempotency proven: the same event delivered twice does **not** double the
   outcome. Stripe retries; this is not hypothetical.
7. Failure path proven: whatever cannot be delivered is **refunded**, and the
   reason is recorded.
8. Only then: live key to Production, deploy, and one real payment with a real
   card — the smallest amount the product charges.
9. Refund that real payment, and confirm the refund lands.

Steps 4 and 5 are the **hard gate**. A product with an unproven payment path
does not get a domain.

---

## Gotchas worth knowing before they cost a session

- **The webhook secret rotates every `stripe listen` run.** A signature failure
  after restarting the CLI is almost always a stale `whsec_` in the env file,
  not a code bug.
- **`payment_status` is not the same as "session completed."** Delayed payment
  methods complete the session before the money clears. Check
  `payment_status === "paid"`, and handle `async_payment_succeeded` separately.
- **Never trust an unsigned webhook body.** Verify before anything reads it —
  a forged event is a free grant of whatever the product sells, and it is the
  highest-value forgery target in any paid product.
- **Settlement must be idempotent** — claim the intent with a conditional
  `UPDATE … WHERE status = 'pending'` and no-op if it loses that race.
- **The escape hatch that skips payment in development must require BOTH** a
  non-production build **and** an explicit flag. One condition is one
  misconfigured deploy away from giving the product away.
