# 2026-07-02 — Factory · The portfolio gets senses: real Stripe/PostHog/Sentry connectors

> The audit's remaining top-5 item (live portfolio telemetry) shipped: three of the four dashboard connectors are real fetch-based implementations with an 11-test suite, surfaced to the factory via `bun run telemetry` and wired into `/portfolio-pulse`.

## Context

- Goal: close audit upgrade #4 — "the five most decision-heavy agents are the five blindest." The dashboard connectors all stubbed.
- Found on direct read (leads-not-facts practice applied): the stubs were worse than empty — Stripe/PostHog/Sentry returned **`status: 'connected'` with hardcoded zeros**, meaning a portfolio review would read a keyed product as "live, $0 MRR, 0 users, 0 errors." A lying stub beats no stub for demo screenshots and loses everywhere else.

## What shipped

- **Stripe**: active-subscription MRR normalized to monthly (year/12, week, day, interval_count), distinct paying customers, pagination with a safety cap, `Stripe-Account` header for connected accounts, metered prices excluded rather than guessed.
- **PostHog**: one HogQL query → 7d actives, 7d signups (event name configurable, default `user_signed_up`), and a WAU/MAU retention proxy — explicitly labeled a proxy, not a cohort curve.
- **Sentry**: 24h event pressure from the project stats endpoint.
- **Honesty contract everywhere**: no key → `not_connected`; API failure → `error` with nulls; `connected` now means the numbers came from the API. Tests assert the contract (11 pass), including the never-fake-connected and never-zeros-on-error paths.
- **`scripts/telemetry.ts` + `bun run telemetry [--json]`**: the whole portfolio in one table, zero installed dependencies (type-only imports keep zod out of the runtime path); `/portfolio-pulse` step 6 now pulls it.
- **Verified live** in the keyless state: full portfolio renders with ⚪ not_connected columns and the one-line key hint.

## What's deliberately out (named, not silent)

- **GSC** stays stubbed — it needs an OAuth flow, not a bearer token; that's a scope boundary, not a TODO.
- **health_score** formula untouched (per-stage weighting is a known open item from the audit).
- Live verification against real keys — no keys in this environment; the honest floor is the mocked-fetch suite + the keyless live path. First keyed run should eyeball MRR against the Stripe dashboard once.

## Next

→ **Operator sets the three keys (or runs `/go-live` for a product) — then `/portfolio-pulse` and `kill-or-double-down` run on data for the first time.**
