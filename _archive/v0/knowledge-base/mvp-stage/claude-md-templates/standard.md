# CLAUDE.md Template — Standard (Next.js + Supabase SaaS)

Drop this in `products/<name>/CLAUDE.md` for any product on the default stack. Customize the bracketed sections.

---

```markdown
# <Product Name> — Claude Code Instructions

## What this product is
<one paragraph: who it serves, what value it delivers, the validated job-to-be-done>

## Tech stack
- Framework: Next.js 15 App Router (RSC + Server Actions)
- DB + Auth: Supabase (Postgres + RLS + magic-link auth)
- Payments: Stripe (subscriptions + customer portal)
- Email: Resend + React Email
- Analytics: PostHog + Plausible + GA4
- Errors: Sentry
- Background: Inngest
- AI: Anthropic SDK (Claude Sonnet 4.6 default, Opus 4.7 for judgment-heavy, Haiku 4.5 for bulk)

See `stack/tech-stack.md` in the factory root for env vars + setup.

## Key files / patterns to know
- `src/lib/supabase/{server,client,middleware}.ts` — Supabase client patterns
- `src/lib/stripe.ts` — Stripe SDK wrapper, webhook handler, customer portal
- `src/lib/analytics.ts` — unified `track(event, props)` for PostHog
- `src/lib/env.ts` — zod-validated env (fail fast on missing keys)
- `src/inngest/` — background functions (cron, retry, fan-out)
- `src/emails/` — React Email templates

## Decisions
See `decisions/` for ADRs. Last 3:
- ADR-0001: Tech stack
- ADR-0002: Data model
- ADR-0003: Auth model

## Scope
See `scope.md`. Bar to add a feature: ≥3 real users blocked without it. Otherwise → parking lot.

## Conventions
- TypeScript strict mode; no `any` without comment
- Server Actions for mutations; API routes only for webhooks
- All form input validated with zod
- All DB writes RLS-protected (no service role from user-facing code)
- Error responses don't leak stack traces in production
- No PII in logs

## What I'm NOT
- I'm not multi-tenant (org_id) yet → ADR-XXXX
- I don't support SSO → enterprise pricing path TBD
- I don't have a public API → consider only after PMF

## Build session protocol
At session start: read this file + `scope.md` + last 3 entries in `decisions/`.
At session end: append to `decisions/sessions.md` + update this file if architecture changed.

See `knowledge-base/mvp-stage/ai-native-dev-loop.md` for the full discipline.

## Anti-patterns Claude should refuse
- Adding new dependencies for trivial functionality
- Generating tests for trivial code (do generate for: auth, payments, anything touching user data)
- Comments that say WHAT (the code says what); WHY only when non-obvious
- Refactoring unrelated code in the same session
- Mocking the DB in tests (we use a test schema; see test setup)

## When in doubt
- Performance: measure first (Lighthouse + PostHog), optimize second
- Security: see `knowledge-base/mvp-stage/security-checklist.md`
- Scope: see `scope.md`; if ambiguous, invoke `agents/mvp/scope-guardian/`
- Architecture: cite ADR or write a new one (small ADRs > unwritten patterns)
```

---

## Variants

For different product types, customize:
- **Marketplace** template — adds two-sided onboarding flow, payouts, trust/safety
- **API-as-product** template — adds rate limiting, key management, billing-by-usage
- **AI agent product** template — adds Agent SDK setup, prompt caching, cost telemetry, eval framework

(These variants live as additional files in this folder: `marketplace.md`, `api-product.md`, `ai-agent-product.md` — add as you scaffold products that need them.)
