# Curated GitHub Repos

> **Rule:** Nothing goes in this file unless verified — exists, healthy, last commit < 12 months ago. The list is intentionally short. Quality over quantity.

## Status: seed list, pending verification

The repos below are *candidates* I plan to verify and add. Until verified (checked off), do NOT recommend them in product code.

### Boilerplates / starters (full-stack SaaS)
- [ ] `vercel/next.js` examples — `with-supabase`, `with-stripe-typescript` — verify the latest versions match Next.js 15 + App Router
- [ ] `saasrock/SaasRock` — full SaaS template, may be too opinionated
- [ ] `ixartz/SaaS-Boilerplate` — Next.js + Clerk + Stripe + Drizzle
- [ ] `shadcn-ui/taxonomy` — Next.js 15 patterns

### shadcn ecosystem
- [ ] `shadcn-ui/ui` — primitives
- [ ] `shadcn-ui/charts` — recharts wrappers
- [ ] `kinde-oss/kinde-auth-nextjs` — alt auth pattern

### Agent / AI SDK examples
- [ ] `anthropics/claude-code` repo and examples
- [ ] `anthropics/anthropic-sdk-typescript` examples (especially prompt caching + tool use loops)
- [ ] `vercel/ai` (Vercel AI SDK) — abstraction layer if cross-model is ever needed

### Email templates
- [ ] `resend/react-email` examples
- [ ] `resend/email-templates` — pre-built welcome/receipt/etc.

### Background jobs
- [ ] `inngest/inngest-js` examples

### Analytics / observability
- [ ] `posthog/posthog-js` Next.js App Router setup guide (verify it's current for v15)
- [ ] `getsentry/sentry-javascript` Next.js docs (latest v8 patterns)

### SEO
- [ ] `garmeeh/next-seo` — alternative to manual metadata if scaling
- [ ] `vercel/next.js`'s built-in `metadata` API + `generateStaticParams` for sitemaps

### MCP servers
- [ ] `modelcontextprotocol/servers` — official MCP server catalog
- [ ] Search Console MCP — verify if Google publishes one or if we build it

### Useful CLI tools
- [ ] `supabase/cli` — for one-shot project bootstrap
- [ ] `stripe/stripe-cli` — for webhook tunneling + product creation from CLI

## Verification process

For each candidate, before adding to the verified list:
1. `gh repo view <owner>/<repo>` — check it exists and last commit date
2. If it ships code we'd embed, read the package.json and the most-touched files — assess code quality
3. Confirm license is compatible (MIT/Apache/BSD)
4. If active maintainer & recent commits & good fit → move to "Verified" section below

## Verified (start empty; populated as verified)

*(no entries yet — verification happens in Phase F or first product onboarding)*
