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

## Onboarding
Run through `SETUP.md` to wire up auth, payments, analytics, errors, SEO. Estimated 25 min first time.

## Working with Claude
This product's CLAUDE.md is in the parent folder (`../CLAUDE.md`). It includes the routing rules, architectural decisions, and conventions Claude should follow when working on this codebase.
