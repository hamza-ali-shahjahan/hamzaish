---
name: metric-framework-designer
description: Define the measurement framework BEFORE launch. North star, activation criterion, retention targets, Sean Ellis target, and false-positive shape.
---

# Metric Framework Designer

## When you activate
Before a product's first real user. User says: "what should I track?", "set up metrics for X", "ready to launch — what do I measure?"

## What you produce
A `products/<name>/metrics.md` file:

```
## Metrics Framework — <product>

### North star metric
<single number> — what we optimize for above all else.
Why this one: <reasoning>

### Activation criterion
A user is "activated" when they: <specific action within Y minutes/days of signup>.
Why this defines "real" use: <reasoning>

### Retention targets
- Day 1: ≥ X% of activated users return
- Day 7: ≥ Y%
- Day 30: ≥ Z%
- Benchmarks based on <industry / similar-product reference>

### PMF target
Sean Ellis survey at N=40 active users: ≥40% answer "very disappointed" to "how would you feel if you could no longer use this?"

### False-positive shape (what would LOOK like PMF but isn't?)
1. <e.g. "spike from HN front page that decays in 7 days">
2. <e.g. "high signup rate but D7 retention < 20%">
3. <e.g. "founder's network signup dominance">

### Anti-metrics (things we deliberately don't optimize)
- <e.g. "page views" — vanity>
- <e.g. "signups without activation" — see above>

### Reporting cadence
- Daily: 1 number — yesterday's <NSM>
- Weekly: cohort retention curve + signup → activation funnel
- Monthly: revenue, churn, expansion (post-payments)

### Tracking implementation
- PostHog events to fire: <list of event names>
- PostHog dashboards to create: <list>
- GSC + Plausible: <what to watch>
```

## Protocol
1. Read the product's `scope.md` and `prd.md` — what value does this product deliver?
2. Pick the north-star metric that most cleanly proxies "is the product delivering value?" Not "is it growing?" — that's a derivative.
3. Define activation precisely. A user who signed up isn't activated. Activation is the moment they got value.
4. Set retention benchmarks. Pull from `knowledge-base/mvp-stage/measurement-framework.md` for indie benchmarks by product type (SaaS, marketplace, content, tool).
5. Set the Sean Ellis target. Reference `knowledge-base/mvp-stage/sean-ellis-survey.md`.
6. List 3 false-positive shapes that are specific to this product's dynamics.
7. List anti-metrics. Forcing this list reduces vanity-metric drift.
8. Write the PostHog event names that need firing — pass to `mvp/builder` as a task.

## Sources
- `knowledge-base/mvp-stage/measurement-framework.md`
- `knowledge-base/mvp-stage/sean-ellis-survey.md`
- `knowledge-base/scale-stage/growth-loops-reforge.md` (for understanding retention curves)

## What you don't do
- Don't pick a north-star metric that's just a count. NSMs are usually combinations or rates.
- Don't set targets without a referenced benchmark.
- Don't skip the false-positive section — that's the whole point of measuring before launch.
