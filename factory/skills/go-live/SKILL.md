---
name: go-live
description: Guided, stateful provisioning of a product's production stack — service by service, with deep-links, key-format validation, .env.local writes, a resumable ledger, and CLI automation after signup. Hands off to /security-check → /ship. Turns the 25-min SETUP.md into a walked, resumable flow.
---

# /go-live

Usage: `/go-live <slug>`

The guided provisioning flow that takes a **local-first** product (built with `/builder-mode`, running with zero accounts) to a **production-ready** one — then hands off to deploy. It operationalizes `templates/product-starter-nextjs/SETUP.md` (the service list) and `factory/playbooks/ai-native-2026/go-live-provisioning.md` (the env-var → service map), but *walked, validated, and resumable* instead of a static checklist.

Where it sits in the chain:
`/builder-mode` (build local) → **`/go-live` (wire the stack)** → `/security-check` (gate) → `/ship` (deploy) → `/web-launch` (verify the launch).

## Preconditions

1. Resolve the product: `$ARGUMENTS` is the slug. If empty, ask (or `Read products/_portfolio.md`).
2. Resolve the **code path** from `products/<slug>/product.config.json` → `code_path` (maps via `code-paths.local.json`). All provisioning happens **in that product's code repo** — that's where `.env.local` lives.
3. Confirm there's an `.env.local` (create from `.env.example` if missing). **Never** write secrets to anything tracked; `.env.local` is gitignored.

## The state ledger (resume)

Maintain `.hamzaish-go-live.json` in the product's code repo (gitignored — add to `.gitignore` if absent). Shape:

```json
{ "updated": "<date>", "services": { "supabase": "done", "stripe": "skipped", "resend": "pending", "...": "..." } }
```

On every run: read it, **skip services already `done`/`skipped`**, resume at the first `pending`. State values: `pending` · `done` · `skipped` · `later`. This is what makes `/go-live` resumable across sessions — never re-ask a settled service.

## The guided loop

Group services into **required-to-deploy** first, **optional** second. For each not-yet-settled service, do exactly this:

1. **Explain in one line** what it's for and the cheapest skip ("no payments yet? skip Stripe").
2. **Open the deep-link** (print it; the user signs up — you can't create accounts for them).
3. **Ask for the key(s)**, naming exactly what to copy from where.
4. **Validate the format** (table below) before writing — a malformed key caught now saves a broken deploy later.
5. **Write to `.env.local`** under the documented var name(s).
6. **Mark the service `done`** in the ledger. Offer `skip`/`later` at every step (records the choice, moves on).

### Service catalog (deep-links · keys · validation)

| Service | For | Signup | Env vars | Key format check |
|---|---|---|---|---|
| **Supabase** *(req. to leave local mode)* | DB + auth | supabase.com/dashboard → New project | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | URL `https://<ref>.supabase.co`; keys are JWTs (`eyJ…`) |
| **Vercel + Domain** *(req. to deploy)* | hosting + DNS | vercel.com → import repo; cloudflare.com for the domain | (Vercel project; `NEXT_PUBLIC_APP_URL`) | APP_URL is a valid https URL |
| **Stripe** | payments | dashboard.stripe.com (test mode first) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `sk_(live\|test)_…`, `whsec_…`, `pk_(live\|test)_…` |
| **Resend** | email | resend.com → verify domain | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | `re_…`; FROM is an email |
| **PostHog** | analytics | posthog.com → new project | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | `phc_…` |
| **Sentry** | errors | sentry.io → new Next.js project | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | DSN `https://…@…ingest.sentry.io/…` |
| **GA4 / Plausible** | web analytics | analytics.google.com / plausible.io | `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | GA4 `G-…` |
| **GSC / Ahrefs** | SEO | search.google.com/search-console / ahrefs.com/webmaster-tools | `NEXT_PUBLIC_GSC_VERIFICATION` (Ahrefs = DNS verify, no key) | meta content string |
| **DataForSEO** *(optional)* | keyword data | dataforseo.com | `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` | non-empty |

## Automate after signup (the part that *is* fast)

Account creation is manual; everything after the key exists, automate — **with explicit confirmation before each mutation**:

- **Vercel**: `vercel link`, then push the local env up: `vercel env add <NAME> production` (or `vercel env pull`/`add` in a loop). `vercel domains add <domain>`.
- **GitHub**: `gh secret set <NAME>` for CI secrets.
- **Cloudflare**: DNS records via API if a token is provided.

State plainly what you can't do: you can't sign the user up, accept their ToS, or enter their card.

## Verify, then hand off

When the **required-to-deploy** set is `done`:
1. **Verify**: every required var is present in `.env.local` and well-formed (re-run the format checks). Confirm `LOCAL_MODE` will now be off (Supabase set).
2. **Offer the handoff**: "Stack wired. Run `/security-check <slug>` (gate), then `/ship <slug>` (deploy)?" — `/go-live` provisions; `/ship` deploys. Don't deploy from here.

## Honest rules

- Never commit a real key. Only `.env.local` (gitignored) or the platform's secret store. The `.env.example` stays placeholders-only.
- Record skips honestly in the ledger; a skipped service is a deliberate choice, not a gap.
- This command lives at `factory/commands/go-live.md` (symlinked into `.claude/commands/`).
