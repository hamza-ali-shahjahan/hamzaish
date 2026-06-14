# Hamzaish — Codex adapter

> **Codex reads [`AGENTS.md`](AGENTS.md) natively — that is your full operating context.** This file just adds Codex-specific notes on top; it never restates or overrides `AGENTS.md`. If anything here conflicts with `AGENTS.md`, `AGENTS.md` wins.

**Before doing anything**, read in order: `AGENTS.md` → `brain/operating-principles.md` → `products/_portfolio.md` (+ a product's `product.config.json` + `status.md` if you're working on one).

This repo is **metadata + learnings, not product code** — product source repos live elsewhere, mapped via a gitignored `code-paths.local.json`.

## What works in Codex

- The full context and discipline in `AGENTS.md` + `brain/`.
- Every **playbook** in `factory/playbooks/` (load the relevant one before acting).
- Every **agent**: `factory/agents/**/SKILL.md` — invoke one by reading it and following its protocol exactly.
- The **brain**: `bun brain/ask.ts "<question>"` (refresh with `bun brain/ingest.ts`).
- The **eval harness** and **runtime**: `bun run eval`, `factory/runtime/`.

## What's Claude-Code-specific (and how to do the same here)

The slash commands (`/builder-mode`, `/scaffold`, `/ship`, `/go-live`, …) and auto-discovered skills are a Claude Code convenience. In Codex, achieve the identical result by reading the matching **`factory/commands/<name>.md`** or **`factory/agents/.../SKILL.md`** and executing its steps. Same protocol, no magic.

## Non-negotiable

Never violate the hard rules in `AGENTS.md`: validate before irreversible bets (don't skip silently), never commit secrets, append to a product's `decisions/` for non-trivial calls, never modify another product's code from this one's session, and state the plan before destructive edits.
