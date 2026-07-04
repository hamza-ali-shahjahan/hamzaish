# Setup — {{PRODUCT_NAME}}

> **You don't need any of this to start.** Your product already runs locally with zero config — `bun install && bun dev`, open http://localhost:3000, and build. This checklist is for **going live**: wiring the real stack (auth, DB, payments, email, analytics) when you're ready to ship. Add services one at a time, only as you need them.

11-step go-live onboarding. Estimated time: 25 min for the first product, 5 min for subsequent (reusing accounts).

> **Prefer it walked + resumable?** Run **`/go-live <slug>`** instead of doing this by hand — it deep-links each signup, validates each key's format, tracks state so you can stop and resume, and hands off to `/security-check` → `/ship`. This checklist is the manual fallback / reference.

## 0. Secrets backend — pick one (recommended: fnox)

Before adding any keys, choose where secrets live. Two options:

**A — fnox (recommended).** No plaintext secrets file on disk; safe from the harness-watcher leak class by construction.
- `brew install fnox`, then `cp fnox.toml.example fnox.toml` and set your provider (1Password/KMS preferred — no local key to guard; or age with the key kept **outside** the repo).
- Set each secret yourself (value never touches chat): `fnox set SUPABASE_SERVICE_ROLE_KEY --provider age`. With the value omitted, fnox **prompts with hidden input** (so it's not in shell history either). `fnox.toml` stores only ciphertext and **is committed**.
- Run the app with secrets injected: `fnox exec -- bun dev`.
- For AI-agent access: `cp .mcp.json.example .mcp.json` (runs `fnox mcp` exec-only — its `exec` tool redacts resolved secret values from output). The committed `.claude/settings.json` denies **all** `fnox` commands to the agent's shell, so the agent must use the MCP server and can't read raw values via `fnox get`/`export`.
- **The honest boundary:** MCP redaction + shell deny-rules stop *accidental* leaks (the actual incident class), but a determined/prompt-injected agent can still bypass deny-rules (option injection, `eval`, absolute paths). The *real* protection against that is keeping the **decryption capability out of the agent's reach** — use a remote provider whose auth the agent can't complete, or an age key file the agent can't read. Read the full threat model in the `/go-live` skill before trusting it with production keys.
- Wherever a step below says "→ `.env.local`", do `fnox set <NAME>` instead.

**B — `.env.local` (fallback).** `cp .env.example .env.local` and paste keys in your own editor. Never let an AI agent read/write it; it's gitignored. This is the manual path the steps below assume.

## 1. Supabase (auth + DB)
- Go to https://supabase.com/dashboard → New project
- Project name: `{{PRODUCT_SLUG}}`
- Region: closest to your users
- Copy: `URL`, `anon key`, `service_role key` → `.env.local`
- Enable Email auth provider; configure magic-link template (optional, default works)

## 2. Stripe (payments)
- Go to https://dashboard.stripe.com (use test mode for setup)
- Get keys → Developers → API keys → publishable + secret → `.env.local`
- Create Products: free, pro, team (one Price each, monthly + annual)
- Copy price IDs to `.env.local`
- Set up webhook: Developers → Webhooks → Add endpoint
  - URL: `https://yourdomain.com/api/stripe/webhook` (use `stripe listen` locally)
  - Events: `customer.subscription.*`, `invoice.payment_*`
  - Copy webhook signing secret → `.env.local`

## 3. Resend (email)
- Go to https://resend.com
- Add and verify your domain (DNS records)
- Create API key → `.env.local`
- Set `RESEND_FROM_EMAIL=hi@yourdomain.com`

## 4. PostHog (product analytics)
- Go to https://posthog.com → New project: `{{PRODUCT_SLUG}}`
- Copy project key → `.env.local`
- Recommended: enable session replay (free tier 5K replays/mo)

## 5. GA4 (web analytics for GSC linkage)
- Go to https://analytics.google.com → Admin → Create property: `{{PRODUCT_SLUG}}`
- Add web data stream → copy Measurement ID → `.env.local`
- Link to Search Console (Admin → Search Console links)

## 6. Plausible (clean web analytics)
- Go to https://plausible.io → Add site: `yourdomain.com`
- Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com` → `.env.local`

## 7. Sentry (errors)
- Go to https://sentry.io → New project: Next.js, name `{{PRODUCT_SLUG}}`
- Copy DSN → `.env.local`
- Create auth token (Settings → Auth Tokens) → `.env.local`
- Set `SENTRY_ORG` and `SENTRY_PROJECT`

## 8. Google Search Console (SEO)
- Go to https://search.google.com/search-console
- Add property → Domain or URL prefix → enter `yourdomain.com`
- Verification → HTML tag → copy the content value → `.env.local` as `NEXT_PUBLIC_GSC_VERIFICATION`
- Submit sitemap: `https://yourdomain.com/sitemap.xml`

## 9. Ahrefs Webmaster Tools (free SEO data)
- Go to https://ahrefs.com/webmaster-tools
- Add and verify your domain (DNS or HTML file)
- No env var — verification only. Returns organic keywords, backlinks, site audit.

## 10. (Optional) DataForSEO (competitor / keyword research)
- Go to https://dataforseo.com → Sign up
- Top up $50 (lasts months at indie volume)
- Copy login + password → `.env.local`
- Test: `/keyword-research` skill should work

## 11. Domain + Vercel deploy
- Buy domain at https://dash.cloudflare.com (cheaper than competitors, no markup)
- Connect repo to https://vercel.com → New project → import
- Add custom domain in Vercel → update DNS at Cloudflare
- Add all env vars to Vercel project settings
- Push to main → auto-deploy

## Final check
```bash
cp .env.example .env.local
# fill in everything
bun install
bun dev
```
Visit http://localhost:3000 — landing page should render. `/pricing` should show tiers. `/waitlist` should accept emails. Sentry test error (curl `/api/test-error` if you build that route) should appear in Sentry within 60s.

### Running it supervised (recommended for multi-product / agent workflows)
Ad-hoc `bun dev` orphans on ^C and collides on ports when you run several products. **pitchfork** (`brew install pitchfork`) supervises dev servers so they start once, survive across terminal/agent sessions, and report readiness:
```bash
cp pitchfork.toml.example pitchfork.toml   # committed; no secrets
pitchfork start web                         # start-once; idempotent
pitchfork status web                        # verify it's up before sharing a link
```
On the fnox backend, inject secrets into the supervised server by setting `run = "fnox exec -- bun dev"` in `pitchfork.toml`. Running several products at once? Give each a **distinct port** (`PORT=3001 bun dev`, …) — the readiness check verifies "something answers," not "*this* daemon is alive," so a port collision can false-positive. Copying `.mcp.json.example → .mcp.json` also lets an agent start/verify/stop servers via pitchfork's MCP tools. The optional `pitchfork proxy` (stable `https://<name>.localhost`) installs a system CA + edits `/etc/hosts` — enable it deliberately, not from the template.

## Tests & CI (wired out of the box)

The starter ships a test harness so "testing" isn't left to you:

```bash
bun run test           # Vitest — unit + component (jsdom)
bun run test:watch     # Vitest in watch mode while you build
bun run test:coverage  # coverage report
bun run test:e2e       # Playwright — boots the real app, hits real routes
```

> Use `bun run test`, not `bun test` — the latter is Bun's own runner; `bun run test` invokes the Vitest script.

Example tests live at `src/lib/utils.test.ts`, `src/__tests__/smoke.test.tsx`, and `e2e/smoke.spec.ts` — replace them with real coverage as you build. First e2e run needs the browser: `bunx playwright install chromium`.

**CI**: `.github/workflows/ci.yml` runs typecheck → lint → test → build → e2e on every push and PR, using throwaway placeholder env vars for the build (real secrets stay in Vercel). No setup needed beyond pushing to GitHub.

> Why both layers: a 100%-green unit suite can still ship a broken app. The e2e smoke is the cheap "run it in the real environment" gate — see `factory/playbooks/launch-stage/output-validation-for-codegen-tools.md`.

## When you have paying customers — production ops
Don't bolt these on during an incident. Read before your first real users:
- `factory/playbooks/scale-stage/production-operations.md` — incident response, the DB-down runbook, backups/DR
- `factory/playbooks/scale-stage/abuse-and-cost-controls.md` — rate limiting, abuse handling, LLM/API cost-runaway caps

## What's deferred
- SOC 2 (start with Vanta/Drata when first enterprise asks)
- Status page (BetterStack free tier when you have paying customers)
- Custom support tool (use email + PostHog for now)
