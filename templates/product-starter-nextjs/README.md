# {{PRODUCT_NAME}}

{{ONE_LINER}}

## Quick start

```bash
cp .env.example .env.local
# fill required vars (see SETUP.md)
bun install
bun dev
```

Visit http://localhost:3000.

## Stack
Next.js 15 · Supabase · Stripe · Resend · PostHog · Plausible · GA4 · Sentry · Inngest · Anthropic

See `../CLAUDE.md` for the architectural context and the build session protocol.

## Secrets

**Never commit secrets.** Only `.env.example` (placeholder names, no values) is
tracked. `.env`, `.env.local`, and `.env*.local` are gitignored.

- **Local dev:** put real values in `.env.local` (gitignored).
- **Production / preview:** store secrets in the platform's secret manager —
  Vercel **Project → Settings → Environment Variables** — never in the repo.
- **CI:** uses throwaway placeholders for the build; real values stay in Vercel.
- A `gitleaks` secret-scan runs on every push/PR (`.github/workflows/secret-scan.yml`),
  and an optional pre-commit hook (`.githooks/pre-commit`) blocks local leaks.

If a secret ever lands in a commit, treat it as compromised: **rotate the key**,
then scrub history. See the Hamzaish security baseline (`docs/security.md`).

## Onboarding
Run through `SETUP.md` to wire up auth, payments, analytics, errors, SEO. Estimated 25 min first time.

## Working with Claude
This product's CLAUDE.md is in the parent folder (`../CLAUDE.md`). It includes the routing rules, architectural decisions, and conventions Claude should follow when working on this codebase.
