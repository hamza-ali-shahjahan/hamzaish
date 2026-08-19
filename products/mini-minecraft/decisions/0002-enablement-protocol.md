# 0002 — Enablement protocol: the factory must be visible, not just used

**Date:** 2026-08-01 · **Status:** LIVE — factory changes committed; SessionStart hook registered in `~/.claude/settings.json` and validated (same day, operator-approved) · **Companion to:** 0001-factory-stickiness-gap.md

## The insight (operator's words)

"When the new user has installed Hamzaish, they should know with every conversation that
Hamzaish was used and which of the skills in it were used or which commands will be used
to execute a task or goal… what is happening is not enablement at all."

0001 fixed *behavior* (sessions staying in the flow). This fixes *legibility*: even when
the factory runs perfectly, invisible usage teaches the user nothing — they never learn
which doors exist, never see them open, and can never drive the system themselves.
**Silent competence is the opposite of enablement.**

## The protocol (now in hamzaish.md §5 + both tendril templates)

- **Factory Flight Plan** (opens every factory-routed task response, 1–2 lines): the lane,
  the slice, and the factory doors the task WILL use — named as their real slash commands.
- **Factory Receipt** (closes it, 2–4 lines): doors/checks that actually ran, factory
  artifacts updated (status.md / learnings.md / ledger), and the *next doors* the user
  could type themselves. Plus a refreshed row in the product's Active-sessions table —
  receipts on disk make factory usage measurable per product (this also answers the
  operator's earlier "which results were better with/without Hamzaish" question with data
  instead of vibes).

## The enforcement (because prose gets dropped — today proved it)

`factory/hooks/factory-session-context.sh` — a SessionStart hook that detects a session
opened inside any repo carrying the tendril marker ("Hamzaish factory product" in
CLAUDE.md), extracts the slug, and injects the protocol + full door catalog into session
context. Zero output outside factory repos. Tested both ways 2026-08-01.
Remaining operator action: register it in `~/.claude/settings.json` hooks.SessionStart
(and add the registration step to install.sh / `bun run setup` for new users).

## Layered defense recap (who catches what)

1. Tendril CLAUDE.md in each product repo → any session, any user, factory-aware (0001).
2. SessionStart hook → protocol injected mechanically, every conversation (0002).
3. hamzaish.md §4–5 → the contract, for sessions routed through the command.
4. `check-product-layout` tendril warning (+ `--strict-tendrils`) → catches unregistered
   or de-tendriled repos; found 5 legacy repos on first run.
