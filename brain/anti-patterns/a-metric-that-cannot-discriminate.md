# Anti-pattern: building on a metric that cannot discriminate

**Spotted:** 2026-08-20, Patently (`products/copyright`).

## What it looks like

A system was being built to answer: *are bad search results a DATA problem (we lack the content) or a RETRIEVAL problem (we have it and rank it badly)?* Those have opposite fixes — one costs money to buy data, the other is a bug to fix — so the distinction was the whole point.

The plan was to use the relevance score the search already returned.

That score was reciprocal-rank fusion: `1 / (60 + rank)`. It encodes **position**, not similarity. Measured against the live index:

| Query | Fused score | Raw cosine |
|---|---|---|
| "transformer attention mechanism" (well covered) | 0.0148 | **0.640** |
| "hydraulic excavator bucket linkage" (absent) | 0.0115 | **0.534** |

The fused scores are nearly identical. **The signal the detection layer was about to be built on carried no information about the thing being detected.** The raw cosine, computed in the same query and then discarded by the fusion step, separated them cleanly.

## Why it happens

The metric had a plausible name — `score` — and was already there. Reusing it felt like reuse rather than a decision. Nobody checked what it *varied with*, because it was never wrong for its original job: ordering results.

## The rule

**Before building on a metric, test it against a known-good and a known-bad case and confirm the numbers actually differ.**

Two queries and a minute of work. If they come back nearly equal, the metric cannot support the decision you are about to hang on it, no matter how reasonable its name.

Then, once you have a metric that does discriminate: **record the raw signal, not just the derived verdict.** Patently stores `top_similarity` on every search precisely so the threshold that splits the classes can be recalibrated later from thousands of real queries rather than the six probes that set it.

## The tell

You are about to write `if (score > SOME_THRESHOLD)` and you have never seen the distribution of `score` for the two cases you are separating.

## Related

- [`measurement-framework.md`](../../factory/playbooks/mvp-stage/measurement-framework.md) — calibrating the constant once the metric is sound
- [`hand-maintained-facts-drift.md`](./hand-maintained-facts-drift.md) — numbers that were true once
