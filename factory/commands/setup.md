---
description: Scaffold or refresh a project's Claude Code file structure — CLAUDE.md, path-scoped rules, docs, gitignored personal overrides, and a starter /ship command
---

Bring this project's Claude Code file structure up to a healthy baseline. Safe to run on a fresh repo (scaffolds from scratch) or an existing one (extends what's there without clobbering).

## Step 0 — Detect state

Before doing anything, check:

- Does `CLAUDE.md` exist? If yes, read it and judge whether it's healthy (covers project context, commands, code style, gotchas, references — under ~150 lines).
- Does `.claude/` exist? List its contents.
- Is there a codebase to scan, or is this a fresh repo with only a spec/brief?

Report what you found in one short paragraph, then proceed.

## Step 1 — `CLAUDE.md`

**If healthy `CLAUDE.md` exists**, leave it alone. Don't rewrite working content.

**If missing or weak:**
- If there's a codebase, run `/init` first and then critically prune the generic filler that scaffolding emits.
- If the repo is empty but a `SPEC.md` / brief / README exists, write `CLAUDE.md` directly from that source.
- If neither, ask the user for a one-paragraph project description before writing.

Target **under 100 lines**, five sections, in this order:

1. **Project context** — what is this, what stack. One paragraph.
2. **Commands** — only commands the user will actually run (build, test, lint, deploy). Skip default ones nobody types.
3. **Code style** — **non-default** conventions only. Don't restate language defaults.
4. **Gotchas** — project-specific warnings, weird workarounds, things that broke before.
5. **Reference docs** — links to `docs/*.md` with "read when..." annotations.

Every line earns its place. If something is discoverable in one session, leave it out — auto-memory will catch it.

## Step 2 — Directory skeleton

Create if missing:

- `.claude/rules/` — path-scoped rules
- `.claude/commands/` — slash commands
- `.claude/skills/` — local skills
- `docs/` — reference docs

## Step 3 — Path-scoped rules

For each major subsystem, create `.claude/rules/<subsystem>.md` with YAML frontmatter:

```
---
paths: ["src/<area>/**"]
---
```

so the rule only loads when Claude edits that area.

**How to pick subsystems:**
- If there's a codebase, infer from the directory structure — one file per top-level subdirectory that has distinct conventions.
- If there's a spec, use the architecture sections to identify subsystems.
- If still ambiguous, ask the user: "What are the major subsystems in this project?"

Each rule file should contain only **project-specific** rules that aren't derivable by reading code in that area. Avoid restating what good linters or types already enforce.

## Step 4 — Personal overrides

Create `CLAUDE.local.md` (empty, with comment header explaining its purpose) and add it to `.gitignore`. Create `.gitignore` if missing.

Never commit `CLAUDE.local.md`.

## Step 5 — Starter slash command

Create `.claude/commands/ship.md` — a reusable prompt for shipping changes (lint, test, build, commit, push). The user can model future commands on this one.

## Step 6 — Reference docs

**Do not auto-generate `docs/*.md` content.** Ask the user which of these apply, and what should go in each:

- `docs/architecture.md` — read when making structural changes
- `docs/decisions.md` — ADR log, read when revisiting past choices
- `docs/deployment.md` — read when shipping to a new environment
- `docs/prompts.md` — if the project uses LLM prompts as load-bearing infrastructure
- `docs/<other>.md` — anything domain-specific the user surfaces

Skip any the user says don't apply. Don't create empty placeholders.

## Step 7 — Verify

List every file created or modified with a one-line description. Confirm:
- `CLAUDE.md` is under 100 lines.
- `CLAUDE.local.md` is in `.gitignore`.
- Path-scoped rules use `paths:` frontmatter correctly.

Flag anything you'd recommend the user add manually that you couldn't infer (LICENSE, README for humans, `.nvmrc`, brand assets, etc).

## Do NOT

- Bloat `CLAUDE.md` past 100 lines
- Document things linters or formatters should enforce
- Create empty placeholder files
- Auto-generate `docs/` content — ask first
- Write a `MEMORY.md` (that's auto-managed by Claude Code)
