# Unattended multi-session autonomy

Run a long task across many Claude Code sessions so it can outlive any single
session's context window. The engine is the **`/goal`** skill (a scored,
self-verifying loop that already resumes from its `.goal/` log). The
**`scripts/autonomy-loop.ts`** relauncher just keeps starting *fresh* sessions —
each with an empty context window — until the goal is achieved, blocked, or the
session budget runs out.

> **Do most of this with zero tooling:** in a product, run `/goal "<objective>"`;
> when a session tires, open a new one and run `/goal` again — it resumes from
> `.goal/<name>/`. The relauncher below only automates that restart.

## How the pieces fit

- **Continuity is on disk, not in memory.** Each session's edits persist as
  files; `/goal` logs every run to `.goal/<slug>/`; the loop reads a tiny
  `.goal/<slug>/loop-state.json` handoff to decide whether to relaunch. A new
  session reads `START-HERE.local.md` + `CLAUDE.md` + the goal log and continues.
- **Fresh session = fresh context.** That's how the task runs longer than one
  context window.

## Safety (all enforced by the relauncher)

| Guard | What it does |
|---|---|
| **Opt-in** | Refuses to run unless the repo has a `.autonomy-ok` marker file. |
| **Kill switch** | Stops before each session if a `STOP` file exists in the repo. Drop one in anytime to halt. |
| **Budget** | Hard `--max-sessions` cap (default 6). Can't run forever. |
| **Branch-only** | Every prompt forbids committing to `main`; work stays on a branch. |
| **No irreversible/outward actions** | Every prompt forbids push-to-main, deploy, make-public, moving money, deleting data, sending external messages — if the goal needs any, the session marks **blocked** and stops for you. |

> The first run should be **watched**. Sit with it for one full multi-session
> loop before you ever leave it unattended.

## Usage

```bash
# 1. Opt the repo in (once):
touch "/path/to/product/.autonomy-ok"

# 2. Dry-run first — prints the prompt + command, launches nothing:
bun run autonomy --repo "/path/to/product" --slug ship-onboarding \
  --goal "Onboarding flow scores >=9/10 on the rubric in CLAUDE.md" --dry-run

# 3. Real (watched) run:
bun run autonomy --repo "/path/to/product" --slug ship-onboarding \
  --goal "Onboarding flow scores >=9/10 on the rubric in CLAUDE.md" \
  --max-sessions 6 --runs-per-session 4 --model sonnet \
  --permission-mode acceptEdits
```

### The permission knob (read this)

Headless Claude can't touch files without a permission mode. This is the real
risk dial — pick it consciously:

- `acceptEdits` (default) — auto-accepts **file edits**; other tools (Bash, git)
  still prompt, so a run needing them may stall. Good for a first watched run.
- `bypassPermissions` — fully unattended (edits **and** Bash/git run without
  prompts). Only after you've watched a run and trust the goal + guardrails.

The loop already forbids irreversible/outward actions in the prompt and keeps
work on a branch, but `bypassPermissions` removes the per-action safety net — so
treat it like handing over the keys.

### Flags

| Flag | Default | Meaning |
|---|---|---|
| `--repo` | _(required)_ | Absolute path to the product repo. |
| `--slug` | _(required)_ | Short name; the `.goal/<slug>/` folder + handoff file. |
| `--goal` | _(required)_ | The measurable objective (quote it). |
| `--max-sessions` | `6` | Hard ceiling on fresh sessions. |
| `--runs-per-session` | `4` | `/goal` scored runs per session (keep small so a session exits before its context fills). |
| `--model` | `sonnet` | Model for each headless session. |
| `--max-turns` | `60` | Per-session turn cap (belt-and-suspenders). |
| `--permission-mode` | `acceptEdits` | Forwarded to `claude`. `acceptEdits` for watched runs; `bypassPermissions` for fully unattended (see above). |
| `--dry-run` | off | Print the plan; launch nothing. |

## Stopping & resuming

- **Stop now:** `touch "/path/to/product/STOP"` (and delete it to allow runs again).
- **Resume later:** just run the same command — `/goal` resumes from its log.
- **Inspect:** `/path/to/product/.goal/<slug>/` holds the run log + `loop-state.json`.

## When NOT to use it

- Anything that needs a human judgment call, a secret/credential, or an
  irreversible/outward action mid-way — those should stay attended. The loop is
  built to *stop and ask* in those cases, not to plough through them.
