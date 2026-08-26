# 2026-08-26 — Wire Stripe by provisioning, never by pasting

## The cost

GetHired's Stripe setup was done by hand through two dashboards. It produced:

- **Two real payments taken with nowhere to deliver the confirmation.** The
  webhook endpoint was created a day AFTER payments became possible. Money in,
  nothing granted, and nobody noticed until much later.
- **A third payment that took money and granted nothing** because the signing
  secret in the host did not match the endpoint's. Every confirmation was
  refused as unsigned.
- **An afternoon** of copy, paste, redeploy, resend, still-400, repeat.

None of it was necessary. All of it is avoidable by construction.

## The thing that was missed

**`stripe.webhookEndpoints.create()` returns the signing secret in its
response, and `vercel env add NAME env` reads a value from stdin.** One pipes
into the other. The secret exists only in process memory — never a clipboard,
never a file, never a screen, never a command argument (`ps` shows those).

The manual route is not merely slower. It is the route where a value gets
pasted into the wrong one of three identically-named rows and nobody can tell.

**Why it was missed** is the more useful lesson. After a credentials leak two
days earlier, the standing rule became "never handle secrets, send the user to
the dashboard." That rule is about **files** — pulling secrets into a file is
what leaked. Passing a value between two APIs in memory is a different act
entirely. A safety rule applied outside the situation it was written for
becomes a cost with no benefit. When a rule starts producing work, check
whether the failure it prevents is even reachable.

## The order. It is not optional.

Wiring done out of order is how money gets taken with nothing to deliver it.

1. **Webhook endpoint FIRST — before any payment is possible.** Not after the
   checkout works. Not "once we're ready to test". An endpoint that arrives
   second means every payment before it is silently lost.
2. **Provision the endpoint and write its secret in one step**, programmatically.
3. **Redeploy.** Env vars are read at build time. Saving without redeploying
   looks exactly like a value that did not save.
4. **Prove delivery with a real event before launch.** A signing secret is
   unproven until something has actually landed. This is the step everybody
   skips and it is the only one that catches the fault.
5. **Only then, launch.**

## Dos and don'ts

**DO**
- Provision webhook endpoints through the API so the secret is known by
  construction. One paste per environment (the API key) is the floor; anything
  more is a defect in the runbook.
- Give every product its own Stripe sandbox. Two products sharing one sandbox
  each collect permanent delivery failures from the other's payments. Do NOT
  "fix" this by unsubscribing the other product's endpoint — it needs that
  event for its own payments.
- Ship a `stripe:check` command with every product, and run it before launch
  and after any environment change. It should REFUSE to pass while no payment
  has ever completed, because an unproven signing secret takes real money and
  delivers nothing — and the refund safeguard does not catch it, since
  settlement never runs at all.
- Build the reconciliation view early, then USE it. GetHired had a
  `paid_not_settled` check built for exactly this failure and it went unread
  while the fault was diagnosed from raw SQL. An instrument nobody opens is
  not an instrument.

**DON'T**
- **Never read `vercel env ls` timestamps as edit times.** The column is
  CREATION time and does not change when a value is edited. There is no CLI
  flag for edit times. Reading it wrongly sent Hamza to redo correct work
  twice, and cost more trust than the original bug.
- **Never say "redeploy the newest deployment."** That list mixes Preview and
  Production and the newest row is often the wrong environment. It hit
  production twice. Name the environment, or trigger the build yourself with
  an empty commit on the branch.
- **Never assume a dashboard list is fresh.** Stripe's delivery list showed
  stale attempts while the fix had already landed. Verify from the API.
- **Never recommend a test payment without checking what the product charges.**
  A "$1 entry test" was recommended for a product where entry is free while
  founding spots last. There was no such payment to make.

## The template to copy into the next product

1. `scripts/stripe-wire.ts` from GetHired — `stripe:check` (read-only, safe,
   run it often) and `stripe:wire` (provisions the endpoint and writes both
   values to the host, no paste).
2. The key supplied as an environment variable by the human in their own
   terminal — never a file, never an argument, never chat.
3. A launch gate that fails while no payment has ever settled in that mode.
