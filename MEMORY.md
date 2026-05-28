# Hamzaish Memory Index

Factory-scoped memory. Append-only index. Each line is one short pointer to a memory file under `brain/`. Keep entries under ~150 chars. **Do not write memory content here** — write it to its own file and link it from this index.

Memory files live in:
- `brain/identity/` — who Hamza is, working preferences, role
- `brain/learnings/` — append-only retro entries (YYYY-MM-DD.md), what worked / what didn't / what surprised
- `brain/anti-patterns/` — things we've decided not to do, with the reason
- `brain/decision-log/` — cross-product strategic decisions
- `brain/knowledge/` — ingested external knowledge (notes, papers, links)

Per-product memory lives at `products/<slug>/decisions/` — those don't go here.

## Hamza (identity)

_(populate as we learn — initial seed pulled from existing brain/persona.md)_

## Working preferences

_(append as discovered)_

## Active learnings

_(append as sessions produce them; newest first)_

## Anti-patterns

_(append as we decide what not to do)_

## Cross-product decisions

_(strategic decisions that span products — e.g. default stack changes, factory restructures)_

- 2026-05-26 — Restructured factory into Brain/Factory/Products/Meta layers; cloned gbrain/hermes/openclaw into references/; registered Muakkil as product #11. → `meta/changelog.md` v1.0.

## How to use this file

When you (Hamzaish) write a memory:
1. Write the memory body to its own file under the right `brain/` subfolder
2. Add a one-line entry here pointing at it
3. Use `[[file-name]]` syntax to link related memories

When you reference memory: read the index here first, then load only the files relevant to the current task.
