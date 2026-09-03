# Anti-pattern: an environment variable as an architectural boundary

**Spotted:** 2026-08-20, Patently (`products/copyright`).

## What it looks like

A capability is removed for safety or cost, and the removal is expressed as a feature flag:

```ts
if (process.env.EXPENSIVE_FALLBACK !== "1") return emptyResult();
// …the expensive thing
```

It defaults off. It is documented. It looks careful. It is not a boundary.

## Why it is not

**A boundary is something the system cannot cross. A flag is something a person can flip** — from a dashboard, in a hurry, at 2am, without reading the file that explains why it was set. If the reason for removal was *"a server should not be able to do this,"* then handing a server a switch reinstates precisely the thing you removed.

Patently learned this twice in one week, in both directions:

- Deliberate spending needed an operator escape hatch. Making it an env var would have handed every scheduled job the same right — so it became an in-process call only a human-run script can obtain, which a server has no way to acquire.
- Then the same shape turned up in the search path as `PATENT_BQ_FALLBACK`, sitting quietly off. Same flaw, unnoticed for weeks, because a flag that is off looks like a decision that was made.

## The rule

**Delete the variable, don't default it to off.** Then make the removal a property of the build — see [`enforce-the-invariant.md`](../../factory/playbooks/mvp-stage/enforce-the-invariant.md).

Env vars are legitimate for things whose *value* varies by environment: budgets, thresholds, API endpoints, kill switches for something you still intend to run. They are wrong for a capability that should not exist on this path at all.

Useful test: **if flipping this variable in production would be a bug rather than a decision, it should not be a variable.**

## Related

- [`spend-belongs-to-a-customer.md`](../../factory/playbooks/mvp-stage/spend-belongs-to-a-customer.md) — where the operator-escape-hatch version of this rule was first written
- [`enforce-the-invariant.md`](../../factory/playbooks/mvp-stage/enforce-the-invariant.md) — what to replace the flag with
