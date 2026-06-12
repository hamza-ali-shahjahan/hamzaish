# web-launch

A portable Claude Code **plugin** that turns "ship a website" from a vibe into a verification-gated process. Stack-agnostic; built to run **inside the product repo you're launching**, not just inside Hamzaish.

## Why this exists

Most launch checklists are flat to-do lists. This one carries three things they skip:

1. **Verification is first-class.** Every item has an objective check — a `curl` test, a tool threshold, a score — and it enforces **Done ≠ Verified**. A thing isn't closed because someone says they did it; it's closed when the check passes.
2. **There's a gate, not just a list.** A pre-launch sign-off where every P0/P1 must be *Verified*. It is a refuse-to-launch condition.
3. **It carries tacit knowledge.** A library of real failure modes with root cause + prevention — the stuff that normally only lives in someone's head after they've been burned.

## What's inside

| Component | Type | What it does |
|---|---|---|
| `web-launch` | skill (spine) | The process: priority/status model, the 181-item master checklist structure, the sign-off gate, the monitoring cadence. Emits a per-project tracking workbook. Routes commodity work to specialist plugins. |
| `launch-gotchas` | skill | The anonymized failure-mode library. Read before any launch; cross-referenced from the spine. |
| `pseo-at-scale` | skill | Programmatic-SEO quality gates: thin-content prevention, sitemap-index architecture, slug discipline, the indexation-ramp expectation curve. |
| `/web-launch` | command | Kicks off a launch: scopes the project, stamps a workbook, walks the phases. |
| `templates/launch-workbook.md` | template | The full master checklist + Definitions + sign-off gate + monitoring cadence. Copied per project and updated in place. |

## What it deliberately does NOT do

This plugin owns the **process, the gate, and the hard-won lessons**. It does **not** re-implement commodity SEO/security/performance crafts that portable specialist plugins already cover. Where those are installed, the spine delegates to them:

- SEO / schema / internal-linking / AEO → `searchfit-seo:*` (`seo-audit`, `technical-seo`, `on-page-seo`, `schema-markup`, `internal-linking`, `broken-links`, `ai-visibility`, `generate-schema`)
- Security baseline → `security-review`
- If a specialist isn't installed, the spine falls back to the workbook's own verification steps so it still works standalone.

## Two doors, one source of truth

This folder is the **single source of truth**. It's reachable two ways, and you don't have to choose:

**Door 1 — Skills (default, zero setup).** Anyone working inside Hamzaish already has these. The skill folders and the `/web-launch` command are symlinked from `factory/skills/` and `factory/commands/` into this plugin folder, so Claude Code auto-discovers them. Clone Hamzaish → they're live. Nothing to install. **This is the new-user / forker experience.**

**Door 2 — Plugin (opt-in, portable).** Install this as a plugin only when you want to run launches in repos that aren't Hamzaish (e.g. directly inside a product's repo), on a machine without Hamzaish, or to share it standalone:

1. In Claude Code, run `/plugin` → **Add marketplace** → point it at the Hamzaish repo root (reads `.claude-plugin/marketplace.json`, marketplace name `hamzaish`).
2. Install **web-launch**.
3. Verify the `/web-launch` command + three skills appear.

> Editing either way edits the same files (the symlinks point here). If you install the plugin *and* work in Hamzaish, the skill may appear twice (bare + `web-launch:…` namespaced) — harmless, namespacing keeps them distinct. So install the plugin only if you want it *outside* Hamzaish.

## Provenance

Distilled from a battle-tested launch workbook (14 phases, ~180 items, a 24-item sign-off gate, a 5-touchpoint monitoring cadence, and 18 documented gotchas). Anonymized: brand names, maintainer lines, and niche-specific framing stripped; concrete stack examples (Cloudflare / Yoast / Next.js / Semrush) kept as *illustrative common-stack examples* behind stated principles so each lesson survives a stack swap.
