# factory/hooks — session hooks: capture · rescue · nudge · enablement

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
user prompt ────▶ capture-learning.ts (UserPromptSubmit hook)
                 │  regex-detect correction/guardrail/explicit/praise
                 │  skip if secret-shaped
pre-compaction ─▶ precompact-rescue.ts (PreCompact hook)
                 │  same classifier over the transcript's user turns —
                 │  rescues what live capture missed, dedupes vs the queue
                 ▼
     ~/.claude/projects/<cwd>/hamzaish-learnings-queue.json   (gitignored, off-repo)
                 │
                 ▼   /reflect  (human review: Apply / Edit / Skip — DISTILL, never paste)
     brain/learnings/YYYY-MM-DD.md
                 │
                 ▼   /learn-loop  (unchanged promotion gate: Composite ≥24/35, fresh-eyes)
     guardrail / rule / SKILL.md

session Stop ───▶ session-learning-nudge.ts — if real (non-wip) commits landed
                 today but neither the queue nor brain/learnings/ saw anything:
                 ONE nudge to distill a learning before stopping (the floor).
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

## `precompact-rescue.ts` (PreCompact)

Same fail-open + never-capture-secrets rules; reuses the capture classifier and
the same queue, so `/reflect` stays the single review gate. Exists because live
capture only sees prompts typed after hook registration — compaction is the
last exit for everything earlier. Activation (merge into `"hooks"`):

```json
"PreCompact": [
  {
    "hooks": [
      { "type": "command", "command": "bun \"$HOME/Claude/Hamzaish/factory/hooks/precompact-rescue.ts\"" }
    ]
  }
]
```

## `session-learning-nudge.ts` (Stop)

The learning rule's mechanical floor: managed repo + real (non-`wip(auto)`)
commits today + no `brain/learnings/` entry + quiet queue → ONE blocking nudge
per session (marker-throttled, `stop_hook_active`-guarded, fail-open — never
traps a session). Activation (merge into `"hooks"`):

```json
"Stop": [
  {
    "hooks": [
      { "type": "command", "command": "bun \"$HOME/Claude/Hamzaish/factory/hooks/session-learning-nudge.ts\"" }
    ]
  }
]
```

## `factory-session-context.sh` (SessionStart + UserPromptSubmit `--brief`)

The enablement announcer — registered via `bun run setup` step 9 (consent
prompt), not hand-pasted; see `meta/changelog.md` v2.24.0–v2.24.2.

## Tests

```
bun test factory/hooks
```
