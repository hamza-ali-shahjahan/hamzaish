---
template: retro
description: Canonical retro shape. Copy this file when a sprint/milestone ends. Rename to YYYY-MM-DD-<product-or-initiative>-<one-line-outcome-slug>.md.
---

# YYYY-MM-DD — <product or initiative> · <one-line outcome>

> One-sentence headline. "Muakkil Scribe demo shipped end-to-end in 47h." Or: "Buildathon submitted; Slack OAuth deferred to v1.5." Or: "Pivoted away from X after 3 cycles of flat retention."

## Context

What was the sprint / milestone? What did we set out to do? What were the explicit goals and time budget?

- Goal:
- Time budget:
- Stakes / why it mattered:
- Starting state (link to relevant `status.md` or commit):

## Timeline (what actually happened)

Bullet list of significant events in order. Times if you can recover them. Be honest about delays, dead ends, and pivots.

- HH:MM — …
- HH:MM — …

## What worked

Specific patterns / decisions / tools that delivered. These are candidates to promote to `factory/playbooks/`.

- **<pattern>** — what it did, why it worked.
- **<pattern>** — …

## What didn't

Specific friction. **Structural** friction (would happen again) is the high-signal kind — those become `brain/anti-patterns/` candidates.

- **<friction>** — what broke, why, what would prevent it next time.
- **<friction>** — …

## Decisions made

Record cross-product decisions in `brain/decision-log/`. Record product-specific decisions in `products/<slug>/decisions/`. Link them here.

- → `brain/decision-log/…`
- → `products/<slug>/decisions/…`

## Updates to Hamzaish itself

Did this sprint reveal that a skill/agent/playbook was wrong, missing, or unused?

- **New/updated**: `factory/skills/…`, `factory/agents/…`, `factory/playbooks/…`
- **Sunset**: …
- **Bumped Hamzaish version?** → append to `meta/changelog.md`

## Metrics moved (if any)

If this sprint produced measurable outcomes — signups, conversion, retention, latency, error rate — capture the before/after.

| Metric | Before | After | Δ |
|---|---|---|---|
| | | | |

## Surprises

What didn't go as expected? Surprise is the highest-signal entry — it points at a missing playbook or a wrong assumption. Worth capturing in `brain/learnings/YYYY-MM-DD.md` too.

- …

## Open questions / things to revisit

Things deferred or punted on. Each gets a trigger or a revisit date — otherwise they rot.

- **<question>** — revisit when / by:
- **<question>** — revisit when / by:

## Next

The single most important thing to do next. One bullet. If you can't name it, the retro isn't done yet.

→ **<next action>**

---

## Closing the loop (checklist before this retro counts as done)

- [ ] Wrote a `brain/learnings/YYYY-MM-DD.md` entry capturing the surprises
- [ ] Promoted any "what worked" patterns to `factory/playbooks/` (linked above)
- [ ] Captured structural friction in `brain/anti-patterns/` (linked above)
- [ ] Logged decisions in `brain/decision-log/` or `products/<slug>/decisions/` (linked above)
- [ ] Updated `meta/changelog.md` if Hamzaish itself changed
- [ ] Re-ran `bun brain/ingest.ts` so the new files are searchable
- [ ] If a product moved stages, updated its `product.config.json → stage` and `products/_portfolio.md`
