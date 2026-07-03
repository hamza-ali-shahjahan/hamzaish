# Repolish — PRD (skeleton)

> Working name, not locked. Concept: "readme-up". v0 is built; this captures the shape.

## Problem
Great open-source tools die on a weak README. Founders/maintainers either ship a bare
README (looks unserious) or over-polish it into hype the project can't back up
("production-ready", "blazing fast", "tested on Windows") — which erodes trust the
moment a user checks. Existing README generators only push toward more polish, never
toward honesty.

## Who
Indie hackers, solo founders, and OSS maintainers shipping public repos who want a
premium first impression without lying — and without spending an afternoon hand-crafting
a hero, badges, and a demo GIF.

## The product
A local-first CLI. Point it at a repo →
1. **README draft** — centered hero, tagline, *verifiable* badges, honest comparison
   table (TODO cells to fill truthfully), real quick-start from the repo's manifest.
2. **Honesty report** — flags overclaims with severity + an honest rewrite.
3. *(v1)* **Real demo-GIF** — recorded from the actual CLI via `vhs`, not faked.

## Why it wins (wedge)
The **honesty pass** + the **real demo recording**. Polish that's also trustworthy.

## v0 scope / v1 scope
See [`scope.md`](scope.md). v0 = README draft + honesty report (done). v1 = demo-GIF
recording + richer language coverage + (optional) LLM semantic honesty pass.

## Success metric
See [`goal.md`](goal.md) — M1 (README completeness ≥ 0.95) + M2 (honesty recall ≥ 0.8,
control FP ≤ 1).
