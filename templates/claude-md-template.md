# {{PRODUCT_NAME}} — Claude Code Instructions

> Replace all `{{PLACEHOLDERS}}` when scaffolding.

## Hamzaish-managed product (the factory contract — keep this section)

This repo is a **Hamzaish factory product** (slug: `{{SLUG}}`). Factory home:
`~/Claude/Hamzaish/products/{{SLUG}}/` — pinned goal, live status, slices, learnings,
decisions, validation ledger. On ANY change request in this repo, do this without being
asked (a follow-up is a new slice, not an exit from the factory):

1. **Re-enter the factory flow** (`/work-on {{SLUG}}` or `/hamzaish` when available);
   read the factory `status.md` first.
2. **Pin the request as a slice** (one measurable "done" line) in `status.md` BEFORE building.
3. **Build with tests** — the suite stays green; new features ship with new tests; never strip tests.
4. **Verify end to end** against the really-running app before reporting done.
5. **Feed the loop**: mark the slice shipped in `status.md`, add transferable lessons to
   `learnings.md`, and ground the retro (`bun run trace-report`, `bun run friction log`
   from the factory repo).
6. **Make it visible (enablement protocol)** — plain day-1 language, value never
   mechanism, no factory jargon. Open each task response with the 4-line plan (~80 words):
   `🏭 Hamzaish plan` · **Goal:** what "done" looks like · **Steps:** the pieces of this
   task, in order · **Commands:** each `/command` WITH what it does here · **Proof before
   "done":** how it will be verified. Close with the 3-line receipt (max ~50 words):
   `🏭 Hamzaish receipt` · **What you got:** the value added to the user's work ·
   **Checked:** how it was verified (plus anything deliberately not done) · **Try next:**
   ONE `/command` with what it does. Numbers only if the user feels them — test counts
   yes, commit hashes no. Gate both bookends before sending: day-1 words only (no
   insider nouns), exact shapes, caps respected, one Try-next command — `bun run
   check-legibility` in the factory repo lints a bookend for you.

## Session-quality defaults (factory-shipped — apply in every session)

- **Only share links that work.** Before sharing a localhost link, verify a real dev
  server answers HTTP 200 (`curl -s -o /dev/null -w "%{http_code}" http://localhost:PORT/`).
  End build responses with the relevant links — clickable AND in a copyable code block.
- **Anything the user must copy/paste goes in its own fenced code block** — one command
  per block, prose outside the block.
- **Secrets files are user-touched only.** Claude creates/edits only `*.example`
  templates with placeholders; the user copies (`cp x.example x`) and pastes real keys
  themselves. Verify with non-printing checks (`grep -c`, `test -s`) — never print,
  cat, or open a real-secrets file.

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
- Name files after the domain concept they contain (`stripe-webhook-verify.ts`), never `utils`/`helpers`/`common`/`misc` — vague names become dumping grounds and are illegible to agents; if no concrete name fits, the file has too many responsibilities
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
