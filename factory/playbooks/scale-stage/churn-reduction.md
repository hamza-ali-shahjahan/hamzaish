# Churn Reduction

## The framework in one paragraph

Churn kills SaaS faster than slow acquisition. A product with 50%/year churn needs to acquire its entire customer base every year just to stand still. The framework: (1) measure precisely (gross, net, by segment, by cohort), (2) diagnose root causes (activation problem? wrong customer? product gap? pricing? competitor?), (3) intervene at the right point (pre-cancel, mid-onboarding, expansion offer, win-back), (4) measure impact of each intervention. Most products focus on win-back when prevention is 10x more efficient.

## Define the metric precisely

### Gross revenue churn
> $ lost from customers canceling / $ at start of period

Common SaaS targets: < 2% monthly (24% annual). Indie consumer: more tolerated, < 5% monthly.

### Net revenue churn (NRR)
> ($ at end of period - $ from new sales) / $ at start of period

Includes expansion revenue. Best-in-class > 110% (negative churn). Indie target: > 95%.

### Logo churn vs revenue churn
- Logo churn: % of customers leaving (count)
- Revenue churn: % of $ leaving (weighted)

If logo > revenue churn: small customers churn more (probably acceptable). If revenue > logo: big customers churn more (urgent).

### Cohort churn
% of cohort retained at month N. The shape of the curve matters more than any single number.

## Diagnose the cause

### Categorize each cancellation
1. **Never activated** — signed up, didn't use → activation problem
2. **Used briefly, didn't return** — value gap or wrong fit
3. **Used for a while, then stopped** — product gap / boredom / competitor
4. **Subscription ended** (e.g., 1-time use) — product-market mismatch
5. **Price** — explicit "too expensive"
6. **Competitor** — switched to X
7. **No longer need it** — situational (sold company, changed role)
8. **Involuntary** — payment failed → dunning issue

Each requires different intervention.

### Survey churners (exit survey)
Required field on cancel flow:
> "What's the main reason you're canceling?"
> [ ] Too expensive
> [ ] Not using it enough
> [ ] Missing a feature: _____
> [ ] Found a better tool: _____
> [ ] Project ended / changed jobs
> [ ] Other: _____

Optional follow-up:
> "What would have to be true for you to stay?"

Analyze monthly. Pattern reveals what to fix.

## Interventions by cause

### Activation problem
- Onboarding redesign — reduce time-to-aha
- Trigger emails for inactive trials
- In-app onboarding checklist
- 1:1 onboarding for higher-tier customers

### Wrong fit
- Tighten ICP at acquisition
- Better trial gating (don't onboard the wrong users)
- More precise marketing copy

### Product gap
- Identify the missing feature from cancel reasons
- Build if 3+ users name it (scope guardian discipline applies)
- Push back if it's a one-off

### Price
- Could be: price is genuinely too high OR value isn't communicated
- Test downgrade option ("would you stay at a cheaper tier?") — recovers ~10-20%
- If many cancel on price, raise prices AND improve activation (the loud users churn faster anyway)

### Competitor
- Win-back offers (3 months 50% off — works ~5-10%)
- Build the feature your competitor differentiated on (if it's strategic)
- Accept the loss (some users are right to switch)

### Involuntary churn (payment failure)
- Dunning: retry failed cards over 7-14 days
- Email reminder + customer portal link
- Update card via Stripe automatic card updater
- Typically recovers 50-70% of payment failures

## Interventions at the right time

### Pre-cancel intervention (best ROI)
In-app behavioral triggers:
- "Hasn't logged in for 14 days" → email check-in
- "Activity dropped 50% from baseline" → CSM ping or automated nudge
- "Trial expires in 3 days + low usage" → guided demo offer

### Cancellation flow
- Don't make it adversarial. Ask the reason, offer a relevant alternative ONCE, then let them go.
- Cancellation pages with too many "are you sure?" gates make people angrier.
- Save email for ~7 days post-cancel: "we'd love your feedback, would you do a 15-min chat?"

### Win-back (3-6 months post-cancel)
- "We've shipped X / Y / Z since you left. 50% off if you come back this month."
- Typical recovery: 5-10% of churners
- Don't blast — segment to your better-fit churners

## What good looks like

A healthy indie SaaS at Scale stage:
- Monthly logo churn: < 5%
- Monthly revenue churn: < 3%
- NRR: > 100%
- Average customer tenure: > 18 months
- Exit survey response rate: > 30%

## Common failure modes

- **Measuring only logo churn.** Misses the expansion / contraction story.
- **No exit survey.** No data to act on.
- **Adversarial cancel flow.** Damages brand. People talk.
- **Discounts as default offer.** Trains churners to expect discounts.
- **Treating all churn the same.** Voluntary vs involuntary need different fixes.

## Source for follow-up

- ProfitWell churn data benchmarks (free)
- *Subscribed* — Tien Tzuo (Zuora founder)
- Reforge retention courses (paid, comprehensive)
- Lenny Rachitsky episodes on churn & retention
