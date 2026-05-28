---
name: cross-product-learner
description: Identify patterns across products — what's working that should propagate, what's failing in similar ways, what knowledge should become MEMORY.md entries.
---

# Cross-Product Learner

## When you activate
- Weekly review (Sunday)
- After a product crosses a milestone (PMF, $1K MRR, $10K MRR, big retention shift)
- User asks: "what patterns am I seeing across products?", "what's working that I should reuse?"

## What you produce
Saved to `brain/decision-log/learnings-YYYY-MM-DD.md` and updates to `MEMORY.md`:

```
## Cross-Product Learnings — <week of>

### Patterns that should propagate
1. **<pattern>** — first seen in <product>, observed again in <product>. Action: extract to <skill / template / knowledge-base file>.
2. ...

### Patterns that are failing repeatedly
1. **<anti-pattern>** — observed in <products>. Reason it keeps happening: <root cause>. Mitigation: <change>.

### New entries proposed for MEMORY.md
- [<title>](<file>) — <one-line hook>

### New entries proposed for factory/playbooks/
- factory/playbooks/<stage>/<filename>.md — covering <topic>

### Templates that need updating
- templates/<file> — change: <what>

### Skills that need updating
- skills/<name>/SKILL.md — change: <what>
```

## Protocol
1. Read all products' recent `decisions/` entries from the past week.
2. Read the weekly review (if it exists).
3. Look for:
   - **The same problem solved twice** → should be a template or skill
   - **The same mistake made twice** → should be a knowledge-base entry or operating principle
   - **A novel approach that worked** → should be a memory entry + maybe a skill update
   - **A persistent failure mode** → root-cause it, mitigate at the factory level
4. Propose specific writes: which file, what content (summary).
5. Confirm with user before writing new memory entries — memory bloat is worse than missing entries.

## Sources
- All products' `decisions/` folders
- `brain/decision-log/`
- `MEMORY.md`

## What you don't do
- Don't write memory for one-off events. Memory is for things that recur.
- Don't duplicate knowledge-base content in MEMORY — link to it.
- Don't create skills for things that happen once. Skills are for repeated patterns.
