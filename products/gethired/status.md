# GetHired — Live Status

**Stage**: build → wiring
**Status**: active

## North star this sprint
> A live board on gethired.lol where a stranger can place a real, paid bid from their phone.

## Active sessions (lock — update when you start/stop work)
_Avoid two sessions on the same files. See [`meta/parallel-sessions-protocol.md`](../../meta/parallel-sessions-protocol.md)._

| Session / branch | Scope (files/area owned) | Status | As of |
|---|---|---|---|
| main (re-home + Postgres + payments + mobile) | whole repo | done, pushed | 2026-08-24 |

## Open immediately

1. **Env vars in Vercel** — blocked on Hamza. `DATABASE_URL` (Neon, pooled),
   `AUTH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Nothing else can proceed.
2. **`gethired.lol` is not on the `hamzas-projects-aec1699a` team.** `vercel domains inspect`
   says the domain exists on Vercel but under an account this CLI cannot see — likely a
   personal account. Resolve before attaching.
3. **Stripe webhook endpoint** — add `https://gethired.lol/api/stripe/webhook` in the Stripe
   dashboard, listening for `checkout.session.completed` and
   `checkout.session.async_payment_succeeded`, then paste the signing secret into Vercel.
4. **Delete the old branch** `claude/indeed-lol-job-auction-gzzsnr` from
   `hamza-s-digital-twin` — Hamza approved this *after* gethired.lol is verified live.

## Done 2026-08-25 — mechanics round

- **The fee split is gone.** The bid bar said "GetHired keeps 10% ($39.90)", implying $360
  was owed to somebody. It never was. We keep the whole bid; `platform_fee_cents` dropped.
- **$5 minimum paid bid.** Stripe's 2.9% + 30c took a third of a $1 bid. Listing stays free
  forever at $1 — you only pay to climb.
- **Founding spots** — first 500 candidates, first 100 job posts, permanent badge. Chosen
  over "free until N then bidding starts", which would have been a counter counting down to
  nothing since bidding already started at $1.
- **One-click bidding.** No sign-in before payment; the webhook creates the account from the
  email Stripe verified. Sign-in is now only how you return on another device.
- **Real checkout content** + `/terms` + `/refunds`, and a GETHIRED statement descriptor.
- **Live visitor strip** on our own Postgres — online now, unique since launch, bot-filtered.
- Split `lib/auction-rules.ts` out so client components stop pulling Postgres into the bundle.

76 tests, CI green.

## Done 2026-08-24

- Re-homed from a branch of `hamza-s-digital-twin` into its own private repo.
- SQLite → Postgres. Every data function async; per-category advisory lock in `placeBid`.
- Email magic-link accounts; signing in is required to bid.
- Stripe Checkout + webhook settlement, with auto-refund when a race is lost.
- Full mobile pass at 375px, verified in a browser, not assumed.
- 49 tests + CI on Postgres. SSRF redirect-hop fix.

## Deliberately not built

- OG images (planned, unbuilt).
- Refund *visibility* — refunds work, the bidder is not told in the UI yet.
- Multiple profiles per account.
