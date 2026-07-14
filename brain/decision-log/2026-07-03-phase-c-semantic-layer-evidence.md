# Phase C (semantic/definitions layer): external evidence logged, build still deferred

**Date:** 2026-07-03
**Type:** brain architecture / roadmap — evidence, not a build

## Decision

Record Anthropic's internal-analytics write-up (21% → >95% accuracy; the jump came from a **governed semantic layer + validation**, not a better model — captured in `brain/knowledge/2026-07-03-semantic-layer-is-the-moat.md`) as **external evidence that Phase C — the canonical-definitions / semantic layer — is the right next structural bet for the brain.** Phase C stays **deferred**; this entry does not start it. What changes is the evidence base: the "one canonical definition beats five conflicting ones" claim is no longer just our intuition, it's the load-bearing finding in a first-party account of exactly this problem.

Phase C design already exists (`brain/knowledge/2026-06-20-phase-c-brain-design.md`: entity extraction + typed edges + graph over the current markdown + FTS5). Today the brain has **knowledge** (`brain/`), **workflows** (`factory/`), and **validation** (`meta/evals/`) — but **no cross-product canonical-definitions layer**. That gap is the one the article says carries the most leverage.

## Why

Three reasons to log-not-build:

1. **No live pain yet.** Metric definitions aren't currently *conflicting* across products — each product's `measurement-framework.md` is internally consistent. Building a graph-backed semantic layer before the "five definitions of WAU" collision actually bites would be validation-before-need, which contradicts build-when-it-hurts discipline.
2. **The operator's ask was explicitly non-forceful** ("leverage this, IF we can — no forceful stuff"). The honest leverage is metabolizing the evidence, not manufacturing a build off someone else's blog post.
3. **The cheap version is available if we want substance sooner** — a single `brain/glossary.md` of canonical metric definitions (markdown, no graph) is a scoped, reversible first slice that doesn't require committing to full Phase C. Considered and left on the shelf here, not rejected.

## Wrong if

- Metric definitions start conflicting across products *now* and we keep deferring — then "no live pain" is stale and the glossary (at minimum) should ship.
- Phase C gets pulled forward on the strength of this article alone, with no product-level pain — that would be building on external validation instead of real need, the exact trap `brain/knowledge/2026-06-06-world-models-watch-note.md` guards against.

## Revisit trigger

Re-open when **either**:
1. A metric term is defined two different ways across two products in the portfolio (the concrete collision the semantic layer exists to kill) — the "five definitions of WAU" smell; **or**
2. A `/learn-loop` major-cycle boundary where the brain's markdown-only recall is visibly failing to hold one canonical answer for a repeated question.

At that point weigh: cheap `brain/glossary.md` slice vs. full Phase C graph. This entry + `brain/knowledge/2026-07-03-semantic-layer-is-the-moat.md` are the external evidence to bring to that decision.
