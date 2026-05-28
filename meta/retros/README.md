# meta/retros/

Time-stamped sprint and milestone retros. One file per retro. Filename: `YYYY-MM-DD-<short-slug>.md`.

## When to write one

- A product ships (or doesn't ship by deadline)
- A product moves stages (Idea → MVP, MVP → Launch, etc.)
- A sprint/buildathon ends (regardless of outcome)
- A skill or agent had visibly wrong-shaped behavior and got rewritten
- A cross-product strategic decision was made

## Template

```markdown
# YYYY-MM-DD — <Product or initiative> · <One-line outcome>

## Context
What was the sprint/milestone, what did we set out to do?

## What happened
Bulleted timeline of significant events. Be honest about failures.

## What worked
- Specific patterns that delivered. Worth promoting to `factory/playbooks/`.

## What didn't
- Specific friction points. Worth capturing in `brain/anti-patterns/` if structural.

## Decisions made
- Cross-product calls → `brain/decision-log/`
- Product-specific calls → `products/<slug>/decisions/`

## Updates to Hamzaish
- New/changed skills, playbooks, agents → list with file paths
- Bumped version? → `meta/changelog.md`

## Open questions / things to revisit
- Things we deferred or punted on, with a trigger or date

## Next
- The single most important thing to do next
```

## Discipline

- **Write the retro on the day of the milestone**, not later. Memory fades.
- **Be honest about what didn't work.** A retro that says "everything went great" is suspicious — there's always friction.
- **Surface deferred decisions explicitly.** "We'll figure out X later" rots into "we forgot about X" if not logged.
