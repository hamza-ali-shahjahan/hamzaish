---
name: telemetry-aggregator
description: Pull metrics across all products into a single view. Powers the dashboard and the daily/weekly briefings.
---

# Telemetry Aggregator

## When you activate
- Powers `dashboard/` rendering
- Powers `/portfolio-pulse` skill
- User asks: "give me numbers across all products", "what's the total MRR?", "total errors today?"

## What you produce
A normalized telemetry payload — usable by the dashboard's renderer or any downstream agent:

```json
{
  "as_of": "2026-05-19T14:32:00Z",
  "totals": {
    "mrr_usd": 0,
    "paying_customers": 0,
    "active_users_7d": 0,
    "errors_24h": 0,
    "search_impressions_7d": 0
  },
  "products": [
    {
      "slug": "linkedup",
      "stage": "mvp",
      "metrics": {
        "mrr_usd": 0,
        "paying_customers": 0,
        "active_users_7d": 0,
        "signups_7d": 0,
        "errors_24h": 0,
        "top_queries_7d": [{"query": "...", "clicks": 0, "impressions": 0, "position": 0}],
        "health_score": 0.0
      },
      "connectors_status": {
        "stripe": "connected | not_connected | error",
        "posthog": "connected | not_connected | error",
        "sentry": "connected | not_connected | error",
        "gsc": "connected | not_connected | error"
      }
    }
  ]
}
```

## Protocol
1. Read all `products/*/product.config.json`.
2. For each product, for each connector listed, call the connector with the credentials referenced.
3. Handle errors gracefully — a missing connector returns `not_connected`, an erroring one returns `error` with a brief reason in the dashboard, not a crash.
4. Compute the composite `health_score` per product:
   ```
   health = w_retention * D7_retention + w_revenue * MRR_growth + w_errors * (1 - error_rate_normalized)
   ```
   weights default: 0.4 / 0.3 / 0.3. Tune per product type.
5. Cache results for 5 minutes (don't hammer the APIs).

## Connectors

All in `dashboard/lib/connectors/`:
- `stripe.ts` — `fetchStripeMetrics(account_id)`
- `posthog.ts` — `fetchPostHogMetrics(project_id)`
- `sentry.ts` — `fetchSentryMetrics(org, project)`
- `gsc.ts` — `fetchGSCMetrics(property)`
- `plausible.ts` — `fetchPlausibleMetrics(domain)`
- `ga4.ts` — `fetchGA4Metrics(measurement_id)`

Each returns a normalized shape: `{ status: 'ok' | 'error', data?: {...}, error?: string }`.

## Sources
- `stack/analytics-stack.md` (for the connector list)
- `dashboard/lib/connectors/*.ts` (the actual implementations)

## What you don't do
- Don't fail the whole aggregation because one connector errors. Return partial data.
- Don't store secrets in `product.config.json` — only references.
- Don't call connectors more often than every 5 minutes per product.
