# Hamzaish Dashboard

Minimal Next.js 15 app that reads `../products/*/product.config.json` and renders one card per product with metrics from Stripe, PostHog, Sentry, and Google Search Console.

## Quick start

```bash
cp .env.example .env.local
# add credentials for the connectors you have
pnpm install
pnpm dev
# → http://localhost:3100
```

Runs on port 3100 so it doesn't conflict with product dev servers (3000).

## Architecture

```
src/
├── app/
│   ├── page.tsx          # main view — totals + grid of product cards
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── product-card.tsx  # one card per product
├── lib/
│   ├── registry.ts       # reads products/*/product.config.json
│   ├── types.ts          # zod schemas
│   └── connectors/
│       ├── index.ts      # aggregator + caching
│       ├── stripe.ts
│       ├── posthog.ts
│       ├── sentry.ts
│       └── gsc.ts
```

## Connectors

Each connector is a `lib/connectors/<name>.ts` file with a typed `fetch...Metrics` function.

**v1: all connectors are stubs that return `not_connected` unless creds are present.** That's intentional — the dashboard renders 10 cards as soon as you have `product.config.json` files, with placeholder metrics. As you wire connectors for individual products (by populating the `analytics.*` fields in each `product.config.json` AND adding credentials to dashboard `.env.local`), real metrics replace the placeholders.

**TODO (Phase F+):** Implement real API calls in each connector. They're shaped correctly; just need:
- Stripe: `stripe.subscriptions.list({ status: 'active' })` → sum MRR
- PostHog: HogQL query for 7d DAU and signups by event
- Sentry: stats API for 24h error count
- GSC: searchanalytics query for top 5 queries by clicks

## Adding a product
The dashboard auto-discovers anything in `../products/<slug>/product.config.json`. Just write the file and reload. No dashboard restart needed (Next.js dev hot-reloads + the registry re-reads on every request via the 60s revalidate).

## Deployment
Optional. The dashboard is for personal use; runs locally. If you want it always-on:
- Deploy to Vercel
- Add all env vars in project settings
- Add HTTP Basic auth via middleware (it's your private telemetry — don't expose)
