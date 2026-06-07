# 2026-06-08 — Naming is a pipeline, not a word-hunt

## What happened

Renaming the IP product (away from "Patently", which collided with an existing AI
patent platform) turned into a long grind: I kept generating name batches and
checking them one-by-one, jumping to a "winner" before defining the brand. Hamza
pushed back twice — "why did we get to the final process all of a sudden?" and
"let's stop and rethink." The fix was to **back up to positioning, then run a
structured pipeline** — and to bake that pipeline into reusable skills.

## Empirical finding (checked, not assumed)

Across ~50 candidates (architectural, abstract/coined, friendly, -ly, agent/
investigator, armor, -proof): **real single words and common suffixes are
essentially all taken in software/AI** — and many adjacent ones sit in IP/legal/
fintech, which is a collision. The only reliably-clearable survivors were **coined
compounds** (Inkclad) and the **-proof family** (Suitproof, Lawproof, Markproof,
Flagproof). BUT: never *assume* a dictionary word is taken — check it; a parked
`.com` is not a dead name, only a same-industry collision or live TM kills it.

## The pipeline (now skills)

Built three composing skills:
- **`name-product`** — the orchestrator: brief → competitor scan → theme-by-theme
  generation (sub-lanes: real-related / arbitrary / coined / structural like
  -ly,-proof,agent,compounds) → clearance → **iterative shortlist-by-theme
  selection (the operator's default)** → TLD + budget → lock. Keeps a parking lot
  + a rejected-names log; persists a naming-brief per product.
- **`competitor-research`** — direct/adjacent/incumbent scan; outputs naming
  conventions, white-space, and the collision baseline; persists
  `products/<slug>/competitors.md` so it compounds.
- **`name-clearance`** (existing) — the clearance engine (phase 4), now with the
  "check, don't assume" rule.

## How to apply

For any naming/rename: run `/name-product`. Positioning first; diverge wide;
**give the operator the wheel at every gate — never fast-forward to one pick**
(see [[feedback_dont_converge_early]]). Standing finalists for the IP product if
revisited: Inkclad (coined) and the -proof family; neither locked.
