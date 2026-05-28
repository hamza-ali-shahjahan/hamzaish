# Sean Ellis Survey — PMF Litmus

## The framework in one paragraph

Sean Ellis (early growth lead at Dropbox, LogMeIn, Eventbrite) found that the single best signal of product-market fit is the answer to one question: **"How would you feel if you could no longer use <product>?"** If **≥40% of active users answer "very disappointed"**, the product has PMF. Below 40%, it doesn't yet — and growth investments will leak.

## The exact question

> How would you feel if you could no longer use <product name>?
> 
> ☐ Very disappointed
> ☐ Somewhat disappointed
> ☐ Not disappointed
> ☐ N/A — I no longer use it

## When to run it

- First time: at ~40 activated users (statistical minimum)
- Then: quarterly until score is stable
- After major changes: 4 weeks post-change
- For products at Scale: still quarterly, more for trend than threshold

## Who to send it to

**Active users only.** Not signups, not churned users. The definition of "active":
- Logged in within last 14 days
- Performed the activation action

Sending to all signups dilutes the signal — they include people who tried and bounced (who have no opinion).

## Implementation

### In-app (highest response rate)
Show as a modal after the user completes a meaningful action, on their 4th+ session.
```
[Modal]
Quick question — 5 seconds.
"How would you feel if you could no longer use <product>?"
( ) Very disappointed
( ) Somewhat disappointed
( ) Not disappointed

[+ optional follow-up text field: "What's the main reason?"]
[Submit]
```

### Email
Sent to active users (define as above). Plain text. Subject line: "Quick 5-second question about <product>".

```
Hi <name>,

Just one question. I'm trying to understand who finds <product> valuable.

How would you feel if you could no longer use <product>?
[Very disappointed]
[Somewhat disappointed]
[Not disappointed]

Whichever you click — would love to hear the reason (just hit reply).

Thanks!
<Founder name>
```

Use buttons that route to a one-click capture page (Typeform / Tally / SurveyMonkey / your own form).

### PostHog Surveys (recommended)
PostHog has built-in survey support. Trigger on user-property targeting (active = true + activated = true). Free tier covers indie volumes.

## Reading the results

### Score interpretation
| % "very disappointed" | Interpretation |
|---|---|
| < 25% | Pre-PMF — significant work needed; consider pivoting |
| 25-40% | Approaching PMF — refine the wedge / target user |
| ≥ 40% | PMF — invest in growth |
| ≥ 60% | Strong PMF — scaling investments justified |

### Beyond the headline number

The free-text follow-up is gold. Bucket responses:
- **Why disappointed**: surfaces the value props that resonate (use in marketing copy)
- **Why not disappointed**: surfaces the persona-product mismatch (or weak value)
- **Why somewhat**: surfaces what's missing for them to become very-disappointed users

The 25-40% segment is the most actionable — they're close. What do they need?

### Segment the result

Sean Ellis score by:
- Persona / role
- Plan tier
- Tenure (newer vs older users — newer often score lower)
- Acquisition channel (organic vs cold outreach vs PH launch — channel quality varies)

If one segment hits 50%+ and others lag, you've found the wedge. Double down on that segment.

## Common failure modes

- **Surveying signups, not actives.** Diluted signal.
- **Stopping at the number.** Skip the why — miss the actionable insight.
- **One-shot survey.** Need quarterly trend.
- **Low sample size.** < 40 responses → don't trust the percentage.
- **Treating < 40% as failure.** It's diagnostic. 30% means "close, here's what to fix."

## Caveats and critiques

- The 40% threshold is empirical, not causal. Some products scale above 40%, some don't.
- Survey selection bias: people who respond are more invested than those who don't.
- The question is forward-counterfactual ("how would you feel"), which Mom Test would normally reject. The work-around: the question is so simple and the threshold is high, so the bias has a known shape.

## Source for follow-up

- Original Sean Ellis post: practicetrumpstheory.com (archived)
- Rahul Vohra's expansion (Superhuman PMF engine): rahulvohra.com / podcast appearances
- *The Lean Product Playbook* — Dan Olsen (alternative PMF tests for context)
