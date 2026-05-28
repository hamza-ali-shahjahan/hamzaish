# {{PRODUCT_NAME}} — Claude Code Instructions

> Replace all `{{PLACEHOLDERS}}` when scaffolding.

## What this product is
{{ONE_LINER}}

Target user: {{TARGET_USER}}
Validated job-to-be-done: {{JTBD}}

## Tech stack
- Framework: Next.js 15 App Router (RSC + Server Actions)
- DB + Auth: Supabase (Postgres + RLS + magic-link auth)
- Payments: Stripe (subscriptions + customer portal)
- Email: Resend + React Email
- Analytics: PostHog + Plausible + GA4
- Errors: Sentry
- Background: Inngest
- AI: Anthropic SDK (Claude Sonnet 4.6 default; Opus 4.7 for judgment-heavy; Haiku 4.5 for bulk)

See factory `stack/tech-stack.md` for env vars + setup.

## Key files / patterns
- `src/lib/supabase/{server,client,middleware}.ts` — Supabase clients
- `src/lib/stripe.ts` — Stripe wrapper, webhook handler, portal
- `src/lib/analytics.ts` — unified `track(event, props)` for PostHog
- `src/lib/env.ts` — zod-validated env (fails fast on missing keys)
- `src/inngest/` — background functions
- `src/emails/` — React Email templates
- `app/sitemap.ts` + `app/robots.ts` — auto SEO

## Decisions
See `decisions/`. Active ADRs:
- ADR-0001: Tech stack (default per factory `stack/tech-stack.md`)
- ADR-0002: Data model — see file
- ADR-0003: Auth model — Supabase Auth, magic-link, RLS isolation by `user_id`

## Scope
See `scope.md`. Bar to add a feature: ≥3 real users blocked without it. Otherwise → parking lot.

## Conventions
- TypeScript strict; no `any` without comment
- Server Actions for mutations; API routes only for webhooks
- All input validated with zod
- DB writes RLS-protected (no service role from user-facing code)
- Error responses don't leak stack traces in prod
- No PII in logs

## What this product is NOT
- Not multi-tenant (org_id) — single-user accounts only at v1
- No SSO — enterprise path TBD
- No public API at v1 — consider after PMF

## Build session protocol
At session start: read this file + `scope.md` + last 3 entries in `decisions/`.
At session end: append to `decisions/sessions.md` + update this file if architecture changed.

See factory `knowledge-base/mvp-stage/ai-native-dev-loop.md` for the full discipline.

## Anti-patterns to refuse
- Adding deps for trivial functionality
- Tests for trivial code (do test: auth, payments, anything touching user data)
- Comments that say WHAT (code says what); WHY only when non-obvious
- Refactoring unrelated code in the same session
- Mocking the DB in tests — use a test schema
