# Portable craft plugins vs. Hamzaish operating skills

**Date:** 2026-06-09
**Type:** factory restructure / cross-product

## Decision

Hamzaish now distinguishes two kinds of capability, with two homes:

1. **Operating skills** — `factory/skills/` (symlinked to `.claude/skills`). Skills that only make sense *inside* Hamzaish because they reach into the brain/products/factory tree: `brain-ask`, `portfolio-pulse`, `scaffold`, `name-product`, `seo-aeo-bootstrap`, etc. These stay where they are.

2. **Portable craft plugins** — `factory/plugins/<name>/`, published via a repo-root `.claude-plugin/marketplace.json` (marketplace name: `hamzaish`). Stack-agnostic, self-contained capability suites meant to run **inside a product's own repo**, not just inside Hamzaish. First one: **`web-launch`**.

## Why

- The launch suite (and future craft suites) must run where the work happens — the product repo — and loose skills in `factory/skills/` only resolve when cwd is Hamzaish. A plugin installs once and travels everywhere.
- Plugin namespacing (`web-launch:…`) prevents trigger collisions with existing SEO/security skills (`searchfit-seo:*`, `security-review`, `seo-aeo-bootstrap`).
- It draws the seam the operator's "best skills folder" instinct was reaching for — *my brain* vs *my reusable tooling* — without bloating `factory/skills/`.

## Refinement (same day): both doors, one source

After weighing new-user setup ease, the packaging settled on **both, single-source** rather than plugin-only:

- **Source of truth:** `factory/plugins/web-launch/` (skills + command + template live here once).
- **Skills door (default, zero setup):** `factory/skills/{web-launch,launch-gotchas,pseo-at-scale}` and `factory/commands/web-launch.md` are **symlinks into the plugin folder**. Auto-discovered via the existing `.claude/skills`→`factory/skills` chain. A new user clones Hamzaish and has them — no install. This is the easy-setup experience.
- **Plugin door (opt-in, portable):** the same folder installs as a plugin via the repo-root marketplace, for use in non-Hamzaish repos / other machines / sharing.

Why not duplicate copies: drift. One source + symlinks = edit once, both doors update. Why not force a "pick a path" choice: that's friction on day one. Framing is **skills by default, plugin as opt-in upgrade**, so no new user has to decide.

Template path must resolve in both contexts → the spine SKILL references `templates/launch-workbook.md` adjacent to itself; the command notes both the `${CLAUDE_PLUGIN_ROOT}` (plugin) and the adjacent-skill (skill) resolution.

Best door by user: new user / forker → **skills**. Active builder shipping across product repos / off-Hamzaish / sharing → **plugin**.

## Hard rule for self-contained-ness

A plugin must **not** assume Hamzaish's filesystem exists. It routes commodity work to *other plugins* (`searchfit-seo:*`) and degrades to its own bundled verification steps when a specialist isn't installed. Hamzaish-local skills (`/security-check`, `seo-aeo-bootstrap`) are used only as "if present" enhancements.

## web-launch — what got built

Lean 4-skill suite (talked down from an initial 12 to avoid duplicating `searchfit-seo:*` / `security-review`): spine `web-launch` + `launch-gotchas` + `pseo-at-scale` (`site-directory` deferred pending need). Plus `/web-launch` command and a 181-item `launch-workbook.md` template (14 phases, 24-item sign-off gate, Day 1/3/7/14/30 cadence). Distilled + anonymized from a battle-tested external launch workbook; the crown-jewel idea is **Done ≠ Verified** — the launch equivalent of Hamzaish's verdict engine.

## What would prove this wrong / revisit trigger

- If `web-launch` proves it's only ever used inside Hamzaish, the plugin overhead wasn't worth it → collapse back to `factory/skills/`.
- If the suite grows and several plugins emerge, consider whether the marketplace needs versioning/CI.

## Open thread

The MCP-server / "events" site-type module is unresolved (operator deemed it non-consequential for now) → would become a `site-mcp` skill if the site exposes an MCP server, else folds into `pseo-at-scale` or `launch-analytics`.
