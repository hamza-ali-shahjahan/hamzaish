# Scope Document — Template & Discipline

The scope.md is the single most important document at the MVP stage. It's the bar against which every feature request is evaluated.

## Template

```markdown
# Scope — <product>

Last updated: YYYY-MM-DD

## What this product does
<one paragraph: the core value delivered>

## Three things it deliberately does NOT do
1. <feature / use case> — because <reason>
2. <feature / use case> — because <reason>
3. <feature / use case> — because <reason>

## Target user (single, specific)
<persona — see prd.md for full profile>

## Core flows (≤ 5)
1. <flow name> — input → output, success criterion
2. ...

## In scope for v1
- [ ] <feature> — required for core flow N
- [ ] <feature> — required for core flow N
- [ ] ...

## In parking lot (NOT v1)
| Feature | Why deferred | Reconsider when |
|---|---|---|
| <feature> | not required for v1 | <signal> |

## Criteria to amend scope
A feature gets added to scope ONLY when:
1. ≥3 real users (per `mvp/scope-guardian/SKILL.md` definition) tell us they cannot get value from the product without it
2. The feature serves an existing core flow, OR there is evidence we need a new core flow
3. The decision is logged in `decisions/` with the user evidence cited

## Anti-features (we say no even if 100 users ask)
- <e.g. "Public API" because we'd have to support backward compat forever and we're pre-PMF>
- <e.g. "On-prem deployment" because security/ops cost exceeds revenue potential at our stage>
```

## Why "deliberately doesn't do" matters

A scope.md that only lists what the product does is almost useless. The discipline is in the "doesn't do" section. Most successful products are 10% feature, 90% deliberate omission. Examples:

- Notion does NOT have a Gantt chart.
- Linear does NOT have time tracking.
- Stripe does NOT have a checkout UI (originally).
- Superhuman does NOT have a free tier.

These choices are the product.

## How to fill in "doesn't do"

Look at the obvious requests you'd get from users in the persona. Pick 3 you'll say no to. State why. Common categories:

- **Features that serve a different persona** ("we don't support enterprise SSO at v1")
- **Features that compete with our integration partners** ("we don't do payments — we work with Stripe")
- **Features that bloat the surface area** ("we don't have a Calendar view — we have one view, the right one")
- **Features that introduce regulatory burden** ("we don't store PII beyond email")
- **Features that destroy our differentiation** ("we don't support legacy file formats — modern only")

## Amendment process (the discipline)

When a feature is proposed:
1. Check: is it already in scope? → just build
2. Out of scope? → invoke `mvp/scope-guardian/`
3. Scope guardian demands 3 real-user evidence quotes
4. If evidence provided: amend scope.md, log decision, build
5. If evidence not provided: defer to parking lot OR kill

This loop is the only thing that prevents the feature creep that kills MVP products.

## Common failure modes

- **No scope.md exists.** Every feature ask is rationalized. No discipline.
- **Scope.md is a wishlist.** Lists everything. Equivalent to no scope.
- **Founder amends scope solo.** Skips the evidence requirement. Becomes the feature creep founder.
- **Parking lot has 50 items.** It's a dumping ground, no one ever revisits. Truncate quarterly.

## Source for follow-up

- Inspired by Marty Cagan's *Inspired* (product discovery)
- Reinforced by April Dunford's *Sales Pitch* (the "what we don't do" is the positioning)
