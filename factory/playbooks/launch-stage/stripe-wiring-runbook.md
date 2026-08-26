# Wiring Stripe — the order, and the tool that removes the pasting

Use this the moment a product will take money. Not later. The single most
expensive mistake in this playbook is doing step 1 second.

## The rule

**Provision, never paste.** `stripe.webhookEndpoints.create()` returns the
signing secret in its response, and `vercel env add NAME env` reads a value
from stdin. One pipes into the other — the secret exists only in process
memory, never a clipboard, a file, a screen, or a command argument (`ps` shows
arguments).

One paste per environment is the floor: the API key itself, because Stripe has
no API for handing you your own key. **Anything more than that is a defect in
the runbook, not a fact of life.**

`scripts/stripe-wire.ts` ships in the product starter. Copy it forward.

## The order — out of order is how money vanishes

1. **Create the webhook endpoint BEFORE any payment is possible.** Not after
   checkout works, not "when we're ready to test". An endpoint that arrives
   second means every payment before it is taken with nowhere to deliver the
   confirmation. This has happened: two real payments, money in, nothing
   granted, unnoticed for a day.

2. **Provision it and write its secret in one step:**
   ```
   STRIPE_TARGET_URL=https://staging.example.com \
   STRIPE_SECRET_KEY=sk_test_… npm run stripe:wire -- --env preview
   ```
   Run by the human, in their own terminal. The key is an environment
   variable — never a file, never an argument, never pasted into a chat.

3. **Redeploy that environment.** Environment variables are read at build time.
   Saving without rebuilding looks identical to a value that did not save, and
   that ambiguity has cost hours.

4. **Prove delivery with a REAL event before launch.**
   ```
   npm run stripe:check
   ```
   It refuses to pass while no payment has ever completed in that mode. That is
   deliberate: an unproven signing secret takes real money and grants nothing,
   and a refund safeguard does **not** catch it, because settlement never runs
   at all.

5. **Then launch.**

## Guardrails to build into the product itself

- **Refuse live keys on preview deployments.** A public staging site with a
  live key charges real cards by accident.
- **Verify the webhook signature before reading the body.** A forged event is
  the highest-value attack on a paid product — it hands out the thing money
  buys, for free.
- **Make settlement idempotent.** Stripe retries. Claim the payment with a
  conditional `UPDATE … WHERE status = 'pending'` and no-op on losing the race.
- **Build the reconciliation view early, and actually open it.** It should ask
  Stripe about every unsettled payment and flag any Stripe says was paid —
  money taken, nothing delivered. One product had exactly this check built and
  it went unread while the fault was diagnosed from raw SQL. An instrument
  nobody opens is not an instrument.
- **One Stripe sandbox per product.** Two products in one sandbox each collect
  permanent delivery failures from the other's payments. Do NOT fix this by
  unsubscribing the other product's endpoint — it needs that event.

## Traps that cost real time

- **`vercel env ls` shows CREATION time, not edit time.** A row reading "1d
  ago" says nothing about whether it was just changed, and there is no CLI flag
  for edit times. Reading it as an edit time sent a founder to redo correct
  work twice.
- **Never say "redeploy the newest deployment."** That list mixes Preview and
  Production and the newest row is often the wrong one. It hit production
  twice. Name the environment, or trigger the build with an empty commit on the
  branch.
- **Dashboard delivery lists go stale.** Verify from the API, not the screen.
- **Check what the product actually charges before recommending a test
  payment.** A "$1 test" was recommended for a product where entry is free
  while founding spots last. There was no such payment to make.

## Replacing a key — Stripe never shows an old one again

An existing secret key cannot be revealed after creation. The row's menu offers
**Rotate**, which replaces it — and rotating leaves the live site running on a
dead key until it is redeployed.

**Create a second standard key instead.** The old one keeps working throughout,
so there is no window where anything is broken. Then, in this order:

1. Create the new key, name it for the product, copy it (shown once).
2. `stripe:wire` with the new key — it writes the key AND a matching signing
   secret to the host.
3. Redeploy.
4. `stripe:check` to confirm.
5. **Only now** expire the old key.

**Never delete a key showing recent use.** "Last used: today" means it is what
production is running on. Tidying up before step 3 is the one move that turns a
working site into a broken one.

## What a checker must never do

Two false STOPs on this tool's first real run, both its own fault. A checker
that cries wolf is worse than no checker, because it burns trust at the exact
moment somebody needs to believe it.

- **Never default an environment.** It defaulted to `preview` when none was
  given, so a live key checked against the production URL was reported as
  "a LIVE key aimed at preview — this charges real cards". The key was fine;
  the comparison was against an environment nobody asked for. **Fail closed on
  ambiguity — ask which one, do not guess.**
- **Never read account-wide state as if it were yours.** It counted every
  payment in the Stripe account. One account commonly serves several products
  — this one serves six — so another product's failed delivery was reported as
  this product's money taken and nothing granted. Filter by something only your
  own checkouts carry, such as your intent id in the metadata.
- **Detect your own placeholders.** The command is handed over to be copied and
  run, so it WILL be run with the placeholder still in it. Stripe's answer —
  "Invalid API Key provided: sk_live_xxx" — reads like the key is broken rather
  than absent. Catch it before contacting anything and say where the real one
  lives.

## The note that should remain, and is not a failure

With several products in one Stripe account, every product's endpoint receives
the others' confirmations and rejects them. Nothing breaks — each ignores what
is not its own — but every dashboard accumulates permanent delivery failures
from the rest. **Do not unsubscribe another product's endpoint; it needs that
event.** The real fix is an account per product. What matters day to day is
that the noise is explained, so a genuine failure is not lost inside it.
