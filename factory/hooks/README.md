# factory/hooks — automatic learning capture

The one weak link in Hamzaish's learning machine is **capture**: `/learn-loop`
(5-axis scoring + fresh-eyes verify) and `/kill-or-keep` (outcome-based sunset)
are strong, but they can only score what got written down — and until now a
correction survived only if the model *remembered* to append it to
`brain/learnings/YYYY-MM-DD.md`. This directory makes capture automatic while
leaving promotion human-gated.

Adapted from Bayram Annakov's [claude-reflect](https://github.com/BayramAnnakov/claude-reflect)
(MIT). We borrow the **capture mechanism**, not its storage target — claude-reflect
auto-appends bullets into `CLAUDE.md`, which would fight Hamzaish's 300-line cap and
the `hand-maintained-facts-drift` anti-pattern. See
`brain/decision-log/2026-07-14-adopt-auto-capture-from-claude-reflect.md`.

## The pipeline

```
user prompt ──▶ capture-learning.ts (UserPromptSubmit hook)
                 │  regex-detect correction/guardrail/explicit/praise
                 │  skip if secret-shaped
                 ▼
     ~/.claude/projects/<cwd>/hamzaish-learnings-queue.json   (gitignored, off-repo)
                 │
                 ▼   /reflect  (human review: Apply / Edit / Skip — DISTILL, never paste)
     brain/learnings/YYYY-MM-DD.md
                 │
                 ▼   /learn-loop  (unchanged promotion gate: Composite ≥24/35, fresh-eyes)
     guardrail / rule / SKILL.md
```

## `capture-learning.ts`

A `UserPromptSubmit` hook. Two hard rules, same as `scripts/auto-commit.sh`:

- **Fail-open** — any error → `exit 0`, no stdout. (stdout from a `UserPromptSubmit`
  hook is injected into the model's context; a non-zero exit *blocks* the prompt.
  Neither may ever happen.)
- **Never capture secrets** — prompts matching key/token/private-key shapes are
  dropped before anything is written (ties to the global secrets guardrail).

The queue holds raw prompt text, which is safe **only** because it lives in
`~/.claude` (gitignored, never a repo). **Promotion into any committed file must
distill the lesson — never paste the raw line** (conversations-never-in-a-repo).

## Activation (opt-in — you wire it, nothing auto-enables)

This branch ships the hook **inert**. To turn it on, add a `UserPromptSubmit`
entry to your global hooks in `~/.claude/settings.json` (merge into the existing
`"hooks"` object — do not overwrite sibling events):

```json
"UserPromptSubmit": [
  {
    "hooks": [
      { "type": "command", "command": "bun \"$HOME/Claude/Hamzaish/factory/hooks/capture-learning.ts\"" }
    ]
  }
]
```

To disable, remove that entry. To watch what it captures without enabling it, run
the smoke test in the PR description against a temp queue.

## Tests

```
bun test factory/hooks/capture-learning.test.ts
```
