# Measurement Framework — Pre-Launch

The measurement framework is set **before launch**, not after. Set it after, and you'll cherry-pick metrics that flatter early traction.

## The 5 components

1. **North-star metric (NSM)** — the one number that proxies value delivery
2. **Activation criterion** — what makes a user "real" (vs. signed-up-and-vanished)
3. **Retention targets** — D1, D7, D30 benchmarks
4. **Sean Ellis target** — the PMF litmus
5. **False-positive shape** — what would *look* like PMF and isn't

## North-star metric (NSM)

### Properties of a good NSM
- A rate or composite (not a count)
- Tied to value delivery, not just engagement
- A leading indicator of revenue, not a lagging one

### Common patterns by product type
| Product type | NSM examples |
|---|---|
| Productivity SaaS | Weekly active users who completed key action ≥3 times |
| Marketplace | Successful transactions per week |
| Content | Articles read to completion per user per week |
| Communication tool | Messages sent per user per week |
| AI tool | Outputs accepted (vs regenerated) per user per week |
| Indie consumer | Subscriptions retained past day 30 |

### Anti-patterns
- "Sign-ups" — vanity, not value
- "Pageviews" — vanity
- "Sessions" — vanity (depends on the product type)
- "MRR" alone — lagging indicator; need leading proxy

## Activation criterion

A user is **activated** when they've done the thing that means they got value once.

### Examples
- Notion: "Created 3 pages within the first 7 days"
- Linear: "Created an issue and moved it across columns"
- Slack: "Sent 2000 messages within the org" (note: famous for being aggressive)

### How to define it
1. What's the moment a user feels "ok, this is useful"?
2. What's the simplest, measurable proxy for that moment?
3. Set it ambitious enough that activation = real use, not "tried it once"

## Retention benchmarks (D1 / D7 / D30)

### Indie benchmarks (rough)
| Product type | D1 | D7 | D30 | "Healthy" if flattening above... |
|---|---|---|---|---|
| Consumer mobile | 40% | 20% | 10% | 8% |
| Consumer web SaaS | 50% | 25% | 15% | 12% |
| Prosumer SaaS | 60% | 40% | 30% | 25% |
| B2B SaaS | 70% | 55% | 45% | 40% |
| Vertical B2B SaaS | 80% | 65% | 55% | 50% |

These are *retention curves of activated users*, not signup cohorts. Big difference.

### What "flattening" means
After ~D30, the curve should flatten (not keep dropping). A flat tail = product-market fit. A decaying tail = leaky bucket.

## Sean Ellis target

### The question
At your survey moment (typically 40+ activated users), ask:
> "How would you feel if you could no longer use <product>?"
> 
> A. Very disappointed
> B. Somewhat disappointed
> C. Not disappointed
> D. N/A — no longer use it

### The threshold
≥40% "very disappointed" = PMF signal (per Sean Ellis's original research)

### Critical caveats
- Run it on active users, not all signups
- Sample needs to be ≥40 responses to be statistically meaningful
- Not a one-shot test — run quarterly and watch the trend
- The Sean Ellis ≥40% number is correlated with growth, not causal. Use it as one of several signals.

## False-positive shapes

For each product, list 3 patterns that would *look like* PMF but aren't.

### Common false positives
1. **Launch spike that decays in 7 days** — HN/PH front page drives signups, retention is awful
2. **Founder-network signups dominating** — friends try it because of you, not because of value
3. **Investor-portfolio customers** — they paid as a favor / strategic, not as a need
4. **High signups, low activation** — top-of-funnel works, product doesn't
5. **High D1 retention, zero D30** — novelty effect

For each, list what evidence would distinguish "PMF" from "this false positive."

## Reporting cadence

- **Daily**: 1 number — yesterday's NSM
- **Weekly**: cohort retention curve, signup → activation funnel
- **Monthly**: revenue, churn, expansion (post-payments)
- **Quarterly**: Sean Ellis survey, NPS, full cohort analysis

## PostHog event names to fire (standard set)

Adapt to your product, but include at minimum:
- `signup_completed`
- `activated` (when activation criterion is met)
- `key_action_performed` (the core verb your NSM is built on)
- `subscription_started`
- `subscription_canceled`
- `error_encountered` (for in-product errors)

Properties on every event: `user_id`, `plan`, `cohort_week`, `referrer_source`.

## Source for follow-up

- Sean Ellis original PMF survey: practicetrumpstheory.com archives
- Brian Balfour on retention curves: brianbalfour.com
- *Lean Analytics* — Croll & Yoskovitz
