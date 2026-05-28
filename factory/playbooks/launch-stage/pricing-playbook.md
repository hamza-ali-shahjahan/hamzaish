# Pricing Playbook

## The framework in one paragraph

Pricing is the most underrated lever in indie SaaS — a 30% price increase usually drops conversion by < 10%, netting more revenue with less work. The right starting point: **value-based pricing** (10-20% of value created), validated against competitors and willingness-to-pay signals from interviews, packaged into 2-3 tiers max. Use **van Westendorp** if you can survey, **price laddering** in customer interviews otherwise. Iterate after launch with A/B tests on price points.

## When to set initial pricing

- Right before launch (not after)
- Default to monthly + annual subscription with 15-20% annual discount
- Don't launch with a permanent free tier unless it's a clear strategic call

## Methods (use 2-3 to triangulate)

### 1. Value-based pricing
> Customer saves <X hrs/$> × <their effective hourly rate / $ value> = total value created. Capture 10-20%.

Example:
- Tool saves 4 hrs/week → 17 hrs/month
- Customer's effective rate: $80/hr
- Value created: $1,360/month
- Capture 15%: $204/month → round to $199/month

This is the most defensible anchor.

### 2. Competitive anchoring
List 5 comparable tools' pricing. Note: indie / SMB tools cluster around $20-100/mo; mid-market $100-500; enterprise $500-2K+.

Set your price in the **middle of the relevant cluster** (cheaper feels off-brand; pricier needs proof).

### 3. Van Westendorp Price Sensitivity Meter
Survey 30+ qualified prospects with 4 questions:
1. At what price would this be **too expensive to consider?** (Too expensive)
2. At what price would this be **getting expensive** (you'd think about it, but still consider)? (Expensive)
3. At what price would it be a **bargain**? (Cheap)
4. At what price would you start to **question the quality**? (Too cheap)

Plot lines, find intersections. Optimal price = intersection of "not too expensive" + "not too cheap" curves.

### 4. Price laddering in customer interviews
Ask one prospect at a time: "Would you pay $50?" → if yes, "$100?" → if yes, "$200?" → stop where they hesitate. Repeat with 10+ prospects. Median = signal.

## Tiering — keep it simple

### Default structure (most indie SaaS)
| Tier | Price (typical) | For | Limit |
|---|---|---|---|
| Free / Trial | $0 / 14 days | discovery | feature- or quota-gated |
| Starter / Pro | $29-$99/mo | individual users | scoped |
| Team | $99-$299/mo | small teams | per-seat or quota |
| Enterprise | custom | large orgs | SSO + custom contract |

Rules:
- **Max 3 paid tiers.** More = decision paralysis.
- **Don't list enterprise pricing publicly.** "Talk to us" with anchor.
- **80% of paying users on Starter/Pro.** Team and Enterprise are smaller, larger ACV.
- **Tier names matter.** Avoid "Basic" — feels lesser. Use "Starter", "Pro", "Team", "Business".

## Free tier vs free trial

| When to use free tier | When to use free trial |
|---|---|
| Network effect product (more users = more value) | High-ACV B2B |
| Viral mechanic baked in | Enterprise-track product |
| Product Hunt / launch-momentum business | Sales-led |
| Long path to "aha" moment (need time) | Quick aha moment |

Default: 14-day free trial, no CC required for indie / PLG; CC required for B2B / high-touch.

## Annual vs monthly

- Always offer both
- Annual gets 15-20% discount
- Goal: 30-50% of paying users on annual within 6 months
- Annual = cash upfront + lower churn risk + better LTV/CAC

Show annual prominently on pricing page. "Save $X/year" copy works.

## Stripe setup (the standard)

For each tier:
1. **Product** in Stripe (e.g., "Pro Plan")
2. **Price** monthly + annual (use price IDs in code)
3. **Customer portal** enabled (self-serve cancel + upgrade)
4. **Tax** — Stripe Tax add-on ($0.50/txn) if selling internationally
5. **Webhooks**:
   - `customer.subscription.created`
   - `customer.subscription.updated` (handle plan changes)
   - `customer.subscription.deleted` (revoke access)
   - `invoice.payment_failed` (handle dunning)
6. **Idempotency** — webhook handler must be replay-safe

## Pricing changes (post-launch)

### Existing customers
- Grandfather them at their current price OR give 60-day notice
- Don't surprise-charge — biggest trust break
- If raising prices: announce, justify, give time

### New customers
- A/B test new prices for 14-30 days
- Measure: conversion rate × revenue per signup (not just conversion)
- Beware of seasonality and traffic source mix

## Common failure modes

- **Pricing too low.** "Just trying to get users" → mostly low-quality users who churn.
- **Too many tiers.** Pricing pages with 4+ tiers convert worse than 2-3.
- **Hidden costs.** Surprise overages = trust killer.
- **No annual.** Leaves money on the table + higher churn.
- **Public enterprise pricing.** Anchors deals lower than they should be.
- **Permanent free tier without conversion path.** Costs you money to support free users who never pay.
- **Discount-driven first sale.** Customers acquired on discount churn 2-3x faster.

## When to revisit pricing

- Every quarter (`pricing-optimizer` agent)
- After significant feature additions (more value → ability to raise price)
- After 6 months if data clearly shows under-pricing (high conversion + low cancel-due-to-price)
- Never reactively to one customer's complaint — wait for the pattern

## Source for follow-up

- Patrick Campbell / ProfitWell pricing research (great free content)
- "Monetizing Innovation" — Madhavan Ramanujam
- April Dunford on positioning's role in pricing
- Lenny Rachitsky pricing podcast episodes
