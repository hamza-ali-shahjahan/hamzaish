# Ventbox — Live Status

**Stage**: launch
**Status**: active

_Refreshed 2026-07-19 (factory-launch gate review). Live at https://ventbox.co — stage
conflict (config launch vs status mvp) resolved to **launch**: the product is deployed and
public; what's missing is measurement, not build._

## North star this sprint
> Instrument before pushing: analytics live so next week's GTM push produces the
> portfolio's first measured signups. Gate being chased: `launch` (by 2026-08-18 —
> analytics IDs filled + 10 measured signups).

## Open immediately
- Backfill PostHog/GA analytics IDs into `product.config.json` → `analytics` (all null today)
- Verify signup flow end-to-end while wiring events (never-miss-a-signup standard: `/user-analytics`)
- Validation debt stands: 5 conversations with HR leads/founders at 10–100-person companies (gate: validation, 2026-08-30)
