---
description: Orchestrate the full engineering cycle — setup → spec → plan → test → build → review → ship — pausing at each gate for approval
---

You are orchestrating the **full development cycle** for the user. Invoke each sub-skill in order, pause at every gate for explicit approval, and do NOT advance until the user says to continue.

## The sequence

```
GOAL  →  SETUP  →  SLICE  →  SPEC  →  PLAN  →  TEST·BUILD·REVIEW  →  SHIP
(set)    Gate 0    Gate 1   Gate 2   Gate 3   Gate 4 (per task)      Gate 5
```

The **goal** is pinned at kickoff; **slice** cuts it into features that can each be proven (eval + end-to-end test) and drops the ones that can't — so the spec only ever describes provable work.

**Gates are non-negotiable.** After each phase, stop and wait for the user to say "continue", "next", "go", "approved", or equivalent before moving on. If the user says "revise X", rerun that phase with the feedback before advancing.

## Step 0 — Kickoff + GOAL

Before invoking any skill, post a one-line summary of what you understood the user wants to build, **and pin the goal**: name what "done" looks like in one measurable line — the outcome that proves it works. Keep it light by default; if the target is fuzzy, ambitious, or game-able, run **`/write-a-goal`** first to forge a reachable goal (a precise metric + ≥2 evals + an acceptance rule + non-goals). Everything downstream — the slices, the spec, the tests — flows from this goal.

Then ask:

> Here's the goal: `<one measurable line>`. I'll run setup → slice → spec → plan → test → build → review → ship, pausing for approval at each gate — and the **slice** step keeps only features we can evaluate and end-to-end test. Ready to start with /setup? (Or tell me to skip any phase, e.g. "skip setup if already done" or "skip ship".)

Wait for the user's response. Honor any skip requests by removing those phases from the sequence.

## Step 1 — SETUP (Gate 0)

Bring the project's Claude Code file structure up to a healthy baseline **before writing any spec**. Re-organizing mid-build is painful; doing this upfront is cheap.

**If `CLAUDE.md` already exists and looks healthy** (covers project context, commands, code style, gotchas, and reference docs in under ~150 lines), skip ahead — just confirm the structure looks right and advance to the gate. Otherwise:

1. **Scaffold or refine `CLAUDE.md`.** If the repo has a codebase, run `/init` first and then critically prune the generic filler. If the repo is empty but a spec or brief exists, write `CLAUDE.md` directly from that source. Target under 100 lines, five sections only, in this order:
   - **Project context** — one paragraph: what is this, what stack.
   - **Commands** — only the ones the user will actually run (build, test, lint, deploy).
   - **Code style** — **non-default** conventions only. Don't restate language defaults.
   - **Gotchas** — project-specific warnings, weird workarounds, things that broke before.
   - **Reference docs** — links to `docs/*.md` with "read when..." annotations for progressive disclosure.

   Every line earns its place. If something is discoverable in one session, leave it out — auto-memory will catch it.

2. **Create the directory skeleton** if missing: `.claude/rules/`, `.claude/commands/`, `.claude/skills/`, `docs/`.

3. **Write path-scoped rules.** For each major subsystem, create `.claude/rules/<subsystem>.md` with YAML frontmatter:
   ```
   ---
   paths: ["src/<area>/**"]
   ---
   ```
   so the rule only loads when Claude edits that area. Ask the user what the major subsystems are if not obvious. Each file should contain only project-specific rules that aren't derivable by reading code in that area.

4. **Set up `CLAUDE.local.md`** for personal overrides. Empty file with a comment header explaining its purpose. Add to `.gitignore` (creating `.gitignore` if missing). Never commit this file.

5. **Create one starter slash command:** `.claude/commands/ship.md` — a reusable prompt for shipping (lint, test, build, commit, push). User can model future commands on it.

6. **Ask about reference docs.** Surface candidates the user might want (`docs/architecture.md`, `docs/decisions.md` for ADRs, `docs/deployment.md`) — but **do not auto-generate content**. Ask what should go in each, or skip if not needed. No empty placeholders.

**Gate 0:** List every file created or modified with a one-line description. Confirm `CLAUDE.local.md` is in `.gitignore`. Flag anything you'd recommend the user add manually that you couldn't infer. Then ask:

> Setup ready. Approve to move to /spec, or tell me what to revise.

Do not continue until approved.

## Step 2 — SLICE (Gate 1)

Invoke the `feature-slicing` skill. Cut the goal into the smallest vertical feature slices, and for each one define an **eval** (the measurable check) and an **end-to-end test** (the real user journey). Apply the selection gate: **keep only slices you can evaluate and test** — sharpen or defer the rest. This is what stops the spec from becoming a wishlist.

**Gate 1:** Present the selected slices (each with its eval + e2e test) and the deferred list, then ask:
> Slices ready — N selected, M deferred (can't prove yet). Approve to spec these, or tell me what to revise.

Do not continue until approved.

## Step 3 — SPEC (Gate 2)

Invoke the `spec` skill. Produce the specification artifact **for the selected slices** — each slice's eval + end-to-end test is part of its acceptance.

**Gate 2:** Present the spec, list any open questions, and ask:
> Spec ready. Approve to move to /plan, or tell me what to revise.

Do not continue until approved.

## Step 4 — PLAN (Gate 3)

Invoke the `plan` skill. Break the selected slices into small verifiable tasks with acceptance criteria and dependency ordering — each task carries its slice's eval + end-to-end test as its definition of done.

**Gate 3:** Present the task list and ask:
> Plan ready — N tasks. Approve to start the test → build → review loop, or tell me what to revise.

Do not continue until approved.

## Step 5 — Per-task loop: TEST → BUILD → REVIEW

For each task in the plan, in order:

1. **TEST** — invoke the `test` skill to write the slice's **eval + end-to-end test** for this task as failing tests first (TDD). (For bug fixes, use the Prove-It pattern.)
2. **BUILD** — invoke the `build` skill to implement the task until the tests pass. Commit.
3. **REVIEW** — invoke the `review` skill to run the five-axis review (correctness, readability, architecture, security, performance) on the diff. Fix anything flagged as blocking.

After each task, post a one-line status (`Task X/N done — tests green, review clean`) and move to the next. Do NOT pause between individual tasks unless the review surfaces something blocking, or the user interjects.

**Gate 4 (after all tasks):** Post a summary of everything built and ask:
> All tasks complete. Approve to move to /ship, or let me know what to revise first.

Do not continue until approved.

## Step 6 — SHIP (Gate 5)

Invoke the `shipping-and-launch` skill. Run the full pre-launch checklist (code quality, security, performance, a11y, infra, docs). Define the rollback plan.

**Gate 4:** Present the checklist results and ask:
> Ship checklist complete. Ready to deploy — want me to run `/ship` (promote the reviewed commits to the product's production branch), or handle it yourself?

Do not run deploy without explicit confirmation.

## Orchestrator rules

- **Never skip a gate.** Even if the user seems eager, ask before advancing.
- **Never batch phases.** Run SETUP fully, stop, wait. Then SPEC fully, stop, wait. And so on.
- **Honor skip requests** at kickoff (e.g. "skip ship", "skip setup") but confirm anything that sounds ambiguous.
- **Resumability:** if the user comes back mid-cycle, ask which phase they're in and resume from the next gate.
- **Don't re-invoke a prior skill** unless the user asks to revise — advance forward by default.
- **Surface blockers immediately** — if a phase fails (tests can't pass, review blocks, ship checklist red), stop and report rather than pushing through.

## When NOT to use /full-cycle

- Single-file bug fixes — use `/build` directly
- Questions or exploration — no spec needed
- Tasks under ~30 minutes — the overhead of the full cycle costs more than the safety it provides
