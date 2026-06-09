---
name: unbounded-git-in-global-hooks
description: Wiring git/network operations into a global Claude Code hook without a timeout, a fail-open path, or a scope gate
type: anti-pattern
---

# Unbounded git/network in global hooks

## The pattern

A safety-net script (auto-commit, auto-pull, auto-anything) is wired **globally** in `~/.claude/settings.json` so it runs on every turn / every session start. The script calls a blocking git or network op — `git push`, `git pull`, `git fetch`, even `git commit` — with **no timeout**, **no fail-open path**, and **no scope check**. So it runs in *every* repo on the machine, and any single slow/hung call (offline, auth prompt, huge repo, flaky remote) stalls the whole turn.

## Why we don't do it

**Incident 2026-06-09**: Hamzaish's global Stop/SessionStart hooks (`scripts/auto-commit.sh`, `scripts/auto-pull-rebase.sh`) ran unbounded git/network ops on **every turn in every repo** on the machine. During a heavy build session this produced **repeated multi-minute session hangs** — each turn waited on a blocking git call that had nothing to bound it, in repos that Hamzaish didn't even manage. A convenience safety-net became the thing wedging the work.

## What to do instead

Any blocking op in a global hook needs all three guards:

1. **Bounded timeout.** Wrap every network/blocking git op in a hard wall-clock limit. macOS has no `timeout` binary — define a portable shim in the script: use `gtimeout`/`timeout` if present (coreutils), else a small `run_with_timeout()` that backgrounds the command and kills it after N seconds. Sane limits: ~20s for network ops, ~10s for a local commit.
2. **Fail-open.** On timeout or error, print one concise warning to stderr and `exit 0`. A hook must never be able to block or hang a turn — degrade silently, never wedge.
3. **Scope gate.** Detect, cheaply and first, whether the current repo is one this hook should act on. If not, `exit 0` immediately. For Hamzaish: the repo is the Hamzaish repo itself, OR its path is registered in `code-paths.local.json`, OR it carries a `.hamzaish-managed` marker. Document the chosen rule in a header comment.

Keep any existing safety behavior (opt-in push, secret scan) intact on top of these guards.

## When this might not apply

- A hook that does only **local, non-blocking** work (writing a file, reading a marker) doesn't need the timeout — but still wants the scope gate if it's wired globally.
- A hook intentionally scoped to a single project (not global) can skip the scope gate, though the timeout + fail-open discipline is still cheap insurance.

## Related

- The durable fix: `scripts/auto-commit.sh` + `scripts/auto-pull-rebase.sh` (timeout shim + fail-open + `is_hamzaish_managed` gate), documented in `CLAUDE.md` §"Auto-commit + auto-push safety net" and `AGENTS.md`.
- Scored & promoted via the learning loop: `brain/learnings/2026-06-09-hook-hang.md` (Composite 33/35, PROMOTED). Rubric: `meta/learning-loop-rubric.md`.
