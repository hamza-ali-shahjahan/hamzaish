# Hamzaish — AGENTS.md

> Universal context for any coding agent working in this repo (Claude Code, Codex, Cursor, Aider, Continue, Goose, or anything else that reads `AGENTS.md`). Tool-specific routing extends this file — see "Tool-specific files" at the bottom.

## What Hamzaish is

A personal AI Co-builder & Startup OS for one operator running a portfolio of products. Brain + orchestrator + per-product workspace + self-improvement loop. Built on Anthropic's *Founder's Playbook* (Idea → MVP → Launch → Scale) and informed by gbrain (knowledge graph), hermes-agent (self-improving skills), openclaw (multi-channel gateway).

The repo is **metadata + learnings, not product code.** Product source repos live elsewhere on the operator's machine and are mapped via a gitignored `code-paths.local.json`.

## Architecture (4 layers + study material)

```
brain/        — WHAT YOU KNOW         identity, persona, principles, learnings, anti-patterns,
                                       decision log, ingested knowledge, SQLite FTS5 index
factory/      — HOW YOU ACT           agents (idea/mvp/launch/scale/portfolio stages),
                                       skills, commands, workflows, playbooks
products/     — WHAT YOU'RE WORKING   one folder per product: config + scope + status +
              ON                       decisions + learnings (NO code)
meta/         — HOW YOU IMPROVE       changelog, retros, evals, factory-improving-factory rules
references/   — STUDY MATERIAL ONLY   gbrain / hermes-agent / openclaw, gitignored; never import
stack/        — TECH DEFAULTS         ADRs for the bootstrapped 2026 stack
templates/    — SCAFFOLDING           Next.js starter + doc templates
docs/         — WHY                   philosophy, architecture, momentum router, contributing
```

## Before doing anything in a fresh session

Read in this order:

1. This file (`AGENTS.md`)
2. Your tool's specific routing file if it exists (see bottom — `CLAUDE.md`, `CODEX.md`, etc.)
3. `brain/operating-principles.md` — hard rules
4. `brain/identity/operator.local.md` (if exists, else `operator.example.md`) — operator voice + style + stack defaults
5. `products/_portfolio.md` — what's active right now
6. The relevant product's `product.config.json` + `status.md` if working on a specific product

## Operating discipline (hard rules — tool-agnostic)

1. **Never claim PMF from launch-week numbers.** Sean Ellis ≥40% over 2 weeks + retention pattern. Otherwise "early traction."
2. **Build is the default — validate before irreversible bets, not before every scaffold.** Cheap, fast, reversible builds are their own validation (the ship is the test). Before expensive or hard-to-undo moves (paid ads, a sales push, a big build) aim for ~5 target-profile conversations. The one hard rule: don't skip it *silently* — `bun run check-validation <slug>` makes you either validate or explicitly record the debt.
3. **Every product change goes into that product's `decisions/`** as an append-only paragraph (date · decision · why · what would prove it wrong · revisit trigger).
4. **Never commit secrets.** `product.config.json` references env var *names*, not values.
5. **Never recommend a GitHub repo or external tool without verifying it's healthy** (last commit < 12 months, > 100 stars, or you've personally verified).
6. **Playbook files are short** (300–800 words). Depth lives in linked sources, not inline essays.
7. **Default tech stack lives in `stack/`.** Deviate only with a written reason in the product's `decisions/`.
8. **Never modify another product's code from this product's session.** Cross-product changes require explicit invitation.
9. **Before destructive edits, state the plan.** Whole-file rewrites, large deletions, schema changes get a one-paragraph "what I'm about to do" BEFORE the edit.
10. **Before creating any new repo, check filesystem + existing remotes for the name.** See `brain/anti-patterns/accidental-public-repo.md`.
11. **Never resolve an ambiguous instruction silently.** Readings diverge into materially different actions and one is destructive/irreversible/external → stop and ask (readings listed, recommended first). Otherwise → take the momentum-preserving reading and **say which reading you took**, preferring the reversible path while doubt stands. Guessing is fine; silent guessing is not. See `brain/anti-patterns/silently-resolving-ambiguous-instructions.md`.
12. **Write for the next agent: concrete names, why-only comments.** Never name a file/module `utils`, `helpers`, `common`, or `misc` — name it after the domain concept it contains (`terminal-orphan-cleanup.ts`, not `terminal-utils.ts`); if no concrete name fits, it has too many responsibilities. Comments are 1–2 lines on the non-obvious constraint (safety rule, compat shim, logged decision) — never restating what the code does. Everything in this repo is read by agents more often than by humans; legibility rules are throughput rules.
13. **Anything the user must paste goes in chat as full contents, in a fenced code block.** A file *path* is never a substitute for the file's *contents* when the user has to relay them to an external surface (SQL editor, dashboard, web form) — paste the whole thing at the step where it's needed; the path may ride along as reference. Exception: real-secrets files are never pasted (rule stands: `.example` + user-copies + non-printing checks). See `brain/anti-patterns/file-path-instead-of-paste-contents.md`.
14. **End every reply with its relevant links — clickable AND copyable, both.** Any turn that touches a live/deployed URL, a localhost server, a repo, or a PR ends with a links footer: each link as a **bare URL written out in plain prose** (`→ Live: https://…` — bare URLs auto-linkify in every client; `[label](url)` markdown renders styled-but-unclickable in some, so never rely on the label form) AND in its own fenced code block (one per block — the copy button is the point; no trailing punctuation inside). Neither form substitutes for the other. Localhost links only after verifying the server actually answers (2xx) — never a dead link. (Hardcoded 2026-07-24 at the operator's request after repeat lapses; bare-URL clause added same day.)

## The self-improvement loop

Every session that produces real work appends to `brain/learnings/YYYY-MM-DD.md` and, where applicable, updates `factory/playbooks/` (if pattern worth keeping) or `brain/anti-patterns/` (if pattern to avoid). Sprint completions get a retro in `meta/retros/`. The factory's job is to make sure each product cycle leaves the factory more capable than it found it.

See `meta/factory-improving-factory.md` for the full rule.

## The brain layer (SQLite FTS5)

Markdown source of truth + a derived SQLite FTS5 index for ranked search across all factory content. Refresh: `bun brain/ingest.ts`. Query: `bun brain/ask.ts "<question>" [--product <slug>] [--source <path>] [--limit N] [--json]`.

The DB (`brain/brain.db`) is gitignored — it's regenerable derived state. Source of truth is the markdown files.

## Personal vs. shareable files — the `.local` / `.example` convention

Anything personal to the operator (identity, local code paths, machine-specific context) uses this pattern:

| Pattern | Tracked? | Purpose |
|---|---|---|
| `*.example.<ext>` | ✓ committed | Template that anyone forking the repo can copy |
| `*.local.<ext>` | ✗ gitignored | Operator's actual filled-in version; never leaves the machine |

Sessions should read `<name>.local.<ext>` if it exists, else fall back to `<name>.example.<ext>`.

When adding a new file with personal content: create it as `.local.<ext>` AND ship a `.example.<ext>` template next to it. Anything universally useful stays as a regular committed file.

## Path portability rule

**Never hardcode `/Users/<name>/Claude/Hamzaish/`** in any committed file. Use `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}` in scripts, slash commands, and instructions. The default works for anyone who clones to `~/Claude/Hamzaish`; the env var override lets them clone anywhere.

## Auto-commit safety net (on the operator's machine, not in the repo)

The operator may have configured Claude-Code-specific hooks (`~/.claude/settings.json`) that auto-commit at end of every turn and auto-pull at session start. The posture is **safe-by-default**:

- **Scoped to Hamzaish-managed repos.** Though wired globally, the hooks only act on a repo if it's the Hamzaish repo itself, its path is registered in `code-paths.local.json`, or it carries a `.hamzaish-managed` marker file. Every other repo on the machine is left completely untouched (the hook exits immediately).
- **Timeout-bounded + fail-open.** Every blocking git op (commit ≤10s, push/pull ≤20s) runs under a hard wall-clock limit via a portable timeout shim; any timeout or error logs one stderr line and exits 0. A hung network call can never wedge or hang a turn.
- **Local restore-point commits by default.** End of every turn, a dirty tree becomes a `wip(auto):` commit on the current branch. That's it — nothing is pushed.
- **Auto-push is opt-in** via a `.auto-push` marker in the repo root. Without it, work never leaves the machine automatically.
- **Secrets are scanned before any push.** Even on an opted-in repo, the hook scans the to-be-pushed commits (gitleaks if present, else a key-pattern grep) and aborts the push if it finds a likely secret — the local commit still stands.
- **Markers** (`.gitignore`'d, operator-local): `.hamzaish-managed` (opt a repo into the hooks' scope), `.auto-push` (opt in to push), `.no-auto-push` (never push, hard guard), `.no-auto-commit` (full opt-out), `.no-auto-pull` (skip session-start rebase).

See `CLAUDE.md` if you're Claude Code. If you're a different agent, your equivalent hook system can mirror the pattern — or rely on explicit operator commits.

## Tool-specific files

| Agent | File | Status |
|---|---|---|
| Claude Code | [`CLAUDE.md`](CLAUDE.md) | ✓ canonical; routing tables, slash commands, hook config |
| Codex (OpenAI CLI) | [`CODEX.md`](CODEX.md) | ✓ thin adapter — Codex reads `AGENTS.md` natively; this adds Codex notes |
| Cursor | [`.cursor/rules/hamzaish.mdc`](.cursor/rules/hamzaish.mdc) | ✓ always-on rule pointing at `AGENTS.md` |
| Windsurf | [`.windsurf/rules/hamzaish.md`](.windsurf/rules/hamzaish.md) | ✓ always-on rule pointing at `AGENTS.md` |
| Aider | `CONVENTIONS.md` | not yet — add when the operator actively uses it |
| Other | — | use this file (`AGENTS.md`) as your full context; mirror the discipline above |

The three adapters above are **thin by design**: each is a few lines telling its agent to read `AGENTS.md` (the single source of truth), plus an honest note that the slash-command UX is Claude-Code-specific and how to get the same result elsewhere (read the matching `factory/commands/*.md` or `factory/agents/**/SKILL.md` and execute it). Edit the rules here; the adapters just point.

Tool-specific files **extend** this file — they should never contradict the rules here. If a rule changes, change it here first, then update the tool-specific files.

## What this repo is NOT

- Not a hosted product or SaaS — it's a personal OS template
- Not a public framework with backwards-compatibility guarantees — it's evolving in service of the operator
- Not the operator's product code — products live in their own repos; this is the metadata + learnings layer

## Where to learn more

- Philosophy: [`docs/philosophy.md`](docs/philosophy.md)
- Full architecture: [`docs/architecture.md`](docs/architecture.md)
- The `/hamzaish` momentum router (Claude Code): [`docs/the-momentum-router.md`](docs/the-momentum-router.md)
- Contributing: [`docs/contributing.md`](docs/contributing.md) — the repo is public and open-source under AGPL-3.0; fork, add your product, open a PR
- Changelog: [`meta/changelog.md`](meta/changelog.md)

## Owner

Hamza Ali — see `brain/identity/operator.local.md` for current operator details.
