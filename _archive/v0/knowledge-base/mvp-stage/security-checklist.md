# Security Checklist — Pre-Launch

Minimum bar before any user touches the product. Run this with `agents/mvp/security-reviewer/`.

## Auth & session
- [ ] Session cookies: `httpOnly`, `secure`, `sameSite=lax` or `strict`
- [ ] Password reset rate-limited (max 5/hour/email)
- [ ] Email enumeration prevented (same response for "user exists" vs "doesn't")
- [ ] OAuth callback URLs whitelisted (no open redirect)
- [ ] JWT secrets ≥ 32 bytes, rotated annually
- [ ] No tokens in URL params (always headers/cookies)
- [ ] Logout actually invalidates sessions (not just clears cookies client-side)

## Authorization
- [ ] Every authenticated endpoint checks `userId === resourceOwnerId` OR uses RLS
- [ ] Supabase RLS enabled on every table, no `public` policies on user data
- [ ] No "admin" endpoints accessible by changing a URL param
- [ ] File uploads scoped to user's bucket/folder

## Data exposure
- [ ] API responses don't leak: password hashes, internal IDs, other users' data, debug info
- [ ] Error messages don't leak stack traces in production
- [ ] No "X-Powered-By" headers leaking framework/version
- [ ] Logs don't contain: passwords, full tokens, PII beyond what's necessary

## Input validation
- [ ] All server actions / API routes validate input with zod (or equivalent)
- [ ] SQL parameterized (never string-concatenated) — Supabase client handles this; raw SQL must be reviewed
- [ ] File uploads: MIME type + size + extension validated
- [ ] User-supplied URLs validated against SSRF (e.g., no internal IPs)
- [ ] User-supplied HTML/markdown sanitized (DOMPurify or similar)

## Secrets & env
- [ ] `.env*` in `.gitignore`
- [ ] No hardcoded secrets in repo (run `gitleaks` or equivalent)
- [ ] Different keys for prod vs dev (no shared)
- [ ] Stripe webhook secrets verified on every webhook
- [ ] Inngest signing key validated on every job dispatch

## Dependencies
- [ ] `pnpm audit` passes (no high/critical without justification)
- [ ] No deps unmaintained > 12 months without a strong reason
- [ ] Dependabot or Renovate enabled

## Headers (use https://securityheaders.com to grade)
- [ ] CSP: `default-src 'self'` minimum; allow vendor scripts explicitly
- [ ] HSTS: `max-age=63072000; includeSubDomains`
- [ ] X-Frame-Options: `DENY` (unless embeddable feature)
- [ ] X-Content-Type-Options: `nosniff`
- [ ] Referrer-Policy: `strict-origin-when-cross-origin`
- [ ] Permissions-Policy: minimal

## CORS
- [ ] If you have a public API: explicit allowlist, not `*`
- [ ] No `Access-Control-Allow-Credentials: true` paired with `*`

## Rate limiting
- [ ] Auth endpoints: per-IP + per-account limits
- [ ] Public API: per-key limits
- [ ] Email sending: per-user daily cap (prevents abuse)
- [ ] AI endpoints (calls to LLMs): per-user spend cap

## Webhooks
- [ ] Stripe: signature verified (use raw body, not parsed)
- [ ] Inngest: signing key validated
- [ ] All external webhooks: signature OR IP allowlist
- [ ] Idempotency: replay-safe (use event_id deduplication)

## Payments
- [ ] No card data on your server (Stripe Checkout / Elements only)
- [ ] Webhook handler is idempotent
- [ ] Subscription state derived from Stripe webhooks, not local timer
- [ ] Plan changes use Stripe's proration (don't reimplement)

## Logging & monitoring
- [ ] Sentry catching unhandled errors (verify with a deliberate test error)
- [ ] No PII in Sentry breadcrumbs (scrub before send)
- [ ] Auth events logged: login, logout, password reset, role change, deletion

## AI-specific
- [ ] User-provided text passed to LLM: prompt-injection considered (don't blindly trust LLM output to act on the user's behalf in ways that could harm)
- [ ] LLM API key stored server-side only
- [ ] Per-user cost cap implemented (LLM bills can spike fast)
- [ ] LLM responses sanitized before rendering (e.g., don't trust markdown to be safe HTML)

## Compliance-adjacent (light touch at MVP)
- [ ] Privacy policy exists and is honest
- [ ] Terms of service exist
- [ ] Cookie consent if EU users (even without GDPR formal compliance — at least mention)
- [ ] Way to delete an account (and what happens to data)

## What this checklist is NOT

- A substitute for a real audit (needed at Scale stage)
- A penetration test (separate effort)
- A SOC 2 audit (also separate)
- Insurance (cyber liability — needed once you have real customers + revenue)

## Verdict format
After running through:
- **BLOCK**: critical items unresolved (auth bypass, secrets in repo, missing RLS)
- **CLEAR with caveats**: medium-and-below items go in the backlog with dates
- **CLEAR**: all critical and high items resolved
