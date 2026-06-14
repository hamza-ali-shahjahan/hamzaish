# Admission Policy — what earns a place in the brain

> The brain is a **curated asset, not a dumping ground.** A learning or product earns a permanent place only after it has *earned the minimum* — proven by real use, not asserted. This policy is the gate **upstream** of the [learning-loop rubric](learning-loop-rubric.md): the rubric decides what to *promote*; this policy decides what is even *eligible*.

**Quality over volume.** Ten unproven notes dilute the brain and cost trust on every future read. One dogfooded learning that removes a class of failure is worth more than all ten. When in doubt, keep it in the holding pen — don't promote.

---

## The holding pen vs. the brain

There are two tiers, and the gate sits between them:

| Holding pen (always allowed) | The brain (gated) |
|---|---|
| Raw notes in `brain/learnings/YYYY-MM-DD.md` | A registered `products/<slug>/` folder |
| "We saw X, might mean Y" | A promoted `factory/playbooks/…` or `brain/anti-patterns/…` guardrail |
| Unverified hunches, mid-run observations | A product's `learnings.md` rolled up into cross-product guardrails |

Append freely to the **holding pen** — that's how candidates accumulate. The gates below control what graduates *out* of it.

---

## Gate 1 — Dogfood Gate (our own products)

> **A product gets a `products/<slug>/` folder, and its learnings graduate from the holding pen, only once we have actually used the product for its real job and it works for us.**

A product clears the gate when **all** of these are true:

- [ ] It's a **real artifact we can run** — a repo / package / URL — not a plan or a half-build.
- [ ] We have **used it for its actual job at least once** — not "it builds" or "the dry-run passes," but the real thing doing the real work, end-to-end, for us.
- [ ] Its learnings are **root-caused and verified** (came from that real use), i.e. Confidence ≥ 4 on the [rubric](learning-loop-rubric.md).

Until then: keep the notes in `brain/learnings/` (holding pen). **Do not** register the product folder or promote its learnings to playbooks/guardrails. "Shipped a repo" is *not* the bar — **"we ran it and it worked for us"** is.

> Worked example: `local-llm-setup` is public and at v1.0.1, but until there's a **working functional local LLM actually in use on the machine** (not just an install that reached a smoke test), it stays in the holding pen. Shipping the repo ≠ dogfooding the product.

## Gate 2 — Contribution Gate (community PRs)

> Community products live in `products/_community/`. Accept a contribution — and any learning it carries — only when it clears a bar high enough that the brain doesn't bloat with unproven claims.

Building on [`products/_community/README.md`](../products/_community/README.md) and [`docs/contributing.md`](../docs/contributing.md), a PR is accepted only when **all** hold:

- [ ] **Proof it shipped / exists** — live URL, public repo, published package, or screencast.
- [ ] **It actually uses Hamzaish** — the factory in action, not an unused badge.
- [ ] **Each submitted learning is evidence-backed** — a reproducible case, a *dated* incident, or a measured before/after. **Opinion-only learnings are rejected.** This is the "earned the minima" bar.
- [ ] **It generalizes** beyond the one product (or is honestly scoped as product-specific) **and isn't already covered** by an existing playbook/anti-pattern.
- [ ] **Maintainer reproduces or sanity-checks** before merge; merge stamps `verified_by: maintainer`.

Clearing this gate gets a contribution *into* `_community/`. It does **not** auto-promote its learnings to load-bearing guardrails — those still pass the [rubric](learning-loop-rubric.md) like any other candidate.

---

## Why this exists

Every entry in the brain is read on future builds and is implicitly trusted. An unproven learning is worse than no learning: it spends attention and can send a build down a wrong path with false confidence. The gate keeps the brain's signal high so that *"it's in the brain"* continues to mean *"this earned its place."*

## Provenance

Set as a norm 2026-06-14 while building `local-llm-setup` — the trigger was deciding (correctly) **not** to register the product or its learnings just because the repo shipped, since the actual local LLM wasn't working for us yet. Formalizes the dogfood instinct already present in `products/_community/` and extends it to our own products and to per-learning admission.
