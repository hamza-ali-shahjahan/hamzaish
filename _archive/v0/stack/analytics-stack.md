# Analytics Stack — Bootstrapped Telemetry for 10 Products

Goal: full observability across 10 products for ~$0/month until each hits $1K MRR.

## The full picture

| Concern | Tool | Free tier | When to upgrade |
|---|---|---|---|
| Product analytics (funnels, retention, replays, feature flags) | **PostHog** | 1M events/mo, 5K session replays | At 5M events or 25K replays |
| Web analytics (clean, cookie-free, GDPR-OK) | **Plausible** | self-host OR $9/mo for first site | After 10K MV/mo per site |
| Web analytics (Google ecosystem, GSC linkage) | **GA4** | unlimited (but ugly) | n/a — keep free forever |
| Error monitoring + perf | **Sentry** | 5K errors, 10K transactions, 50 replays /mo | At 50K errors |
| SEO — own-site keyword data | **Google Search Console** | unlimited | n/a — free forever |
| SEO — own-site audit + backlinks | **Ahrefs Webmaster Tools (AWT)** | free for verified domains | n/a — free forever |
| SEO — competitor research, SERP, search volume | **DataForSEO API** | pay-per-query (~$0.0006/SERP) | n/a — pay only what you use, $50 deposit |
| SEO UI (optional, only if needed) | **Mangools KWFinder** | $30/mo annual | Skip until you actively miss a UI |
| Uptime monitoring | **BetterStack** (formerly Better Uptime) | 10 monitors free | Skip until you have paying users |
| Logs | **Vercel Logs + Sentry breadcrumbs** | included | Add Axiom only if Vercel logs aren't enough |
| User feedback | **PostHog surveys** | included free | n/a |

**Total monthly fixed cost across 10 products at indie scale: $0–$9.**

## Why this stack vs. Ahrefs/Semrush

Ahrefs and Semrush each cost $129–$140/mo *minimum*. For 10 products at idea/MVP stage, that's $1,400+/year on tools, before any revenue. The bootstrapped alternative:

- **GSC** — for any verified site, gives every query you rank for, position, impressions, clicks. This is the single highest-signal SEO data source and it's free.
- **Ahrefs Webmaster Tools (AWT)** — free tier of Ahrefs, scoped to verified domains. Gives organic keywords, backlink profile, site audit. Doesn't give competitor data. Combined with GSC, covers everything you need to optimize *your own* sites.
- **DataForSEO API** — when you need competitor data, SERP scrapes, search volume for keywords you don't yet rank for: pay-per-query. A $50 deposit lasts months at indie volume because each query is fractions of a cent. Use programmatically through the `/keyword-research` skill — no UI subscription overhead.

Upgrade to a $30/mo Mangools or eventually full Ahrefs only when:
- You spend more than 2 hours/week wrestling with the API, OR
- A product is past $5K MRR and SEO is the primary growth lever.

## Per-product wiring

Each scaffolded product writes IDs (not secrets) to its `product.config.json`:

```json
{
  "analytics": {
    "posthog_project_id": "phc_xxx",
    "ga4_measurement_id": "G-XXXXX",
    "plausible_domain": "yourproduct.com",
    "sentry_project": "yourproduct",
    "gsc_property": "sc-domain:yourproduct.com",
    "ahrefs_target": "yourproduct.com",
    "stripe_account_id": "acct_xxx"
  }
}
```

The dashboard at `dashboard/` reads these and calls each connector with the relevant ID. Secrets live in `.env.local` (dashboard side).

## The `/keyword-research` skill — what it does

Input: a topic, a competitor domain, or your own domain.
Output: a clustered keyword brief (intent-grouped, with search volume, difficulty proxy, suggested page).

Pipeline:
1. If input is *your* domain → pull queries from **GSC API** for last 90 days. Bucket by intent (informational/commercial/transactional). Surface "striking distance" keywords (positions 5–15 with high impressions).
2. If input is *a competitor's* domain → use **DataForSEO** to get their ranking keywords. Filter to ones with volume > 50 and difficulty < 40.
3. If input is a *topic* → use **DataForSEO Keyword Suggestions** + **AnswerThePublic-style question expansion** (also DataForSEO). Cluster semantically using Claude.
4. Output formatted markdown saved to `products/<name>/launch/keyword-briefs/YYYY-MM-DD-<topic>.md` with suggested page structure, target keywords per page, and rough monthly traffic estimate.

## Per-product dashboard cards (what gets shown)

From `dashboard/`, each product card renders:

- **Stage badge** (from product.config.json)
- **MRR + #paying customers** (Stripe API)
- **7-day DAU** (PostHog `dau` query)
- **7-day signups** (PostHog or GSC fallback)
- **24-hour error rate** (Sentry API)
- **Top 5 organic queries last 7d** (GSC API)
- **Lighthouse-style health score** (composite: error rate × retention × MRR growth)
- **"Today's action"** — populated by the `portfolio-conductor` agent

Connectors are pluggable. A product can omit any of GSC / Sentry / PostHog / Stripe and the card just shows "not connected" for those panels.

## Setup checklist that ships with every product

Stored at `products/<name>/SETUP.md`, the scaffold writes:

```
1. [ ] Create Supabase project → paste keys into .env.local
2. [ ] Create Stripe account + product + price → paste keys
3. [ ] Create Resend account + verify domain → paste API key
4. [ ] Create PostHog project → paste public key
5. [ ] Create GA4 property → paste measurement ID
6. [ ] Create Plausible site → paste domain
7. [ ] Create Sentry project → paste DSN + auth token
8. [ ] Verify domain in Google Search Console → paste meta tag content
9. [ ] Verify domain in Ahrefs Webmaster Tools → no env var, just confirm verified
10. [ ] (optional) Create DataForSEO account + $50 deposit → paste login/password
11. [ ] pnpm install && pnpm dev
```

Each step links directly to the signup/setup URL. Setup time for a fresh product: ~25 minutes if you have nothing, ~5 minutes for the 10th product because you reuse Supabase/Stripe/Resend/Sentry/PostHog accounts and just add new projects.
