---
name: concluding-no-backend-from-code-alone
description: Calling a site "fully static / no backend / scales trivially" from a keyless or dev-state code read, when the backend is env-gated and live in production
type: anti-pattern
---

# Concluding "no backend" from code alone (the env-gated-backend trap)

## The pattern

You audit a site for scale / production-readiness, read the source in a **keyless or dev state**, see the data/auth client fall back to local-only (or no network calls fire), and conclude: *"fully static, no backend, no DB — scales to 10k trivially."* You ship that verdict without ever opening the `.env` files or checking the production deployment.

The tell: the backend SDK is **initialized conditionally** — `if (process.env.NEXT_PUBLIC_SUPABASE_URL) createClient(...)` — so with no keys present, the live backend is invisible. "Static" is a **delivery claim, not a code-only property**: the *same bundle* is static in dev and backend-driven in prod, decided entirely by which env vars are set.

## Why we don't do it

**Thousand Worlds Explorer site/scale audit, 2026-06-29.** The first pass read the keyless state and called it fully static, no backend, no DB, "scales to 10k trivially." It was wrong. The site actually runs a **live Supabase backend** — magic-link + Google OAuth, a `creations` CRUD table with share slugs, a `profiles`/`is_admin` table, an `events` telemetry table, an AdminDashboard — **plus** a `/emulator` route that proxy-rewrites to a *separate* Vercel app with its own scaling limits. The Supabase client only initializes when env vars are present and degrades to local-only when absent, so the keyless read missed all of it. The verdict also skipped every real scale ceiling: free magic-link **SMTP rate limits** (the classic first failure), **DB tier caps** (connections / auto-pause / storage), and **RLS / anon-key authorization** correctness. The keyed/production state is the truth; the audit graded the wrong state.

## What to do instead

Before writing "static" or "no backend" in any audit, run the **backend reality check** (now required in `factory/playbooks/mvp-stage/security-checklist.md` and enforced by `/security-check`):

1. **Read the env files** — `.env`, `.env.local`, `.env.production`, `.env.example` — and trace how vars gate features. Populated keys = the backend is **LIVE in prod**, even if the code path is conditional.
2. **Grep deps + src for backend SDKs even when usage is conditional**: `supabase`, `@clerk`, `firebase`, auth libs, `prisma`/`drizzle`/any DB client, server SDKs.
3. **Check hosting config** (`vercel.json`, `netlify.toml`, `next.config.*`) for **rewrites/proxies to other deployments** — a "static route" can front a separate app with its own limits.
4. **Distinguish BUILD-TIME vs per-user RUNTIME** network calls.
5. **If a backend exists, audit the scale-critical layers**: auth email/**SMTP rate limits**, **DB tier limits** (connection caps, auto-pause, storage), and **RLS / authorization correctness**.

First-timer heuristic (keep it this simple): **If the site has a sign-in button, a save/share feature, or an admin page, it HAS a backend — even if the code looks like it runs without one. Open the .env file and check.**

## When this might not apply

A genuinely static site — pure SSG/HTML/CSS/JS with **zero** auth UI, no save/share, no admin, no data SDK in `package.json`, and no env vars referenced anywhere — really does have no backend. The point isn't "assume a backend always exists"; it's **prove the negative from the env + deployment state, never from a keyless code read.** Once you've checked the `.env` files, the deps, and the hosting config and they're all clean, "static" is a sound conclusion.
