#!/usr/bin/env bash
# scripts/auto-pull-rebase.sh
#
# SessionStart safety net: when Claude Code starts in a git repo, pull --rebase
# from origin so the local branch matches the latest remote state. Owned by
# Hamzaish; invoked globally via the ~/.claude/settings.json SessionStart hook.
#
# Why: the cross-machine workflow assumes both ends agree on history. If you
# pushed wip(auto) commits from machine A and then start a Claude Code session
# on machine B without pulling, machine B's first auto-commit push will be
# rejected by --force-with-lease. This script avoids that by pulling first.
#
# Built to the same two hard rules as auto-commit.sh:
#   • TIMEOUT-BOUNDED — the `git pull --rebase` network op runs under a hard
#     wall-clock limit (portable shim: gtimeout/timeout if present, else a
#     pure-bash watchdog). A hung pull can never wedge session start.
#   • FAIL-OPEN — any timeout or error prints one concise stderr warning and
#     exits 0.
#
# ── Scope: Hamzaish-managed repos ONLY ────────────────────────────────────────
#   Same rule as auto-commit.sh. A repo is Hamzaish-managed if ANY of:
#     (A) it IS the Hamzaish repo itself ($HAMZAISH_ROOT, default
#         $HOME/Claude/Hamzaish), OR
#     (B) its toplevel path is registered in $HAMZAISH_ROOT/code-paths.local.json, OR
#     (C) it contains a `.hamzaish-managed` marker file in its root.
#   Any other repo → exit 0 immediately. This stops the hook from auto-pulling
#   in every unrelated repo on the machine.
#
# Same opt-outs as auto-commit.sh:
#   .no-auto-commit  → skip
#   .no-auto-pull    → commit locally but never push, AND don't auto-pull at session start
#
# All checks fail-soft.

set -u

# Timeout (seconds) for the network pull.
PULL_TIMEOUT=20

# ── run_with_timeout <seconds> <command...> ───────────────────────────────────
# Hard wall-clock limit; returns the command's exit status (124 on timeout).
# Prefers coreutils timeout (gtimeout/timeout), else a pure-bash watchdog.
# (Kept self-contained — these hooks deliberately avoid a shared-lib dependency.)
run_with_timeout() {
  local secs="$1"; shift
  if command -v gtimeout > /dev/null 2>&1; then
    gtimeout -k 3 "$secs" "$@"; return $?
  fi
  if command -v timeout > /dev/null 2>&1; then
    timeout -k 3 "$secs" "$@"; return $?
  fi
  "$@" &
  local cmd_pid=$!
  (
    sleep "$secs"
    kill -TERM "$cmd_pid" 2> /dev/null
    sleep 3
    kill -KILL "$cmd_pid" 2> /dev/null
  ) > /dev/null 2>&1 &
  local watch_pid=$!
  wait "$cmd_pid" 2> /dev/null
  local status=$?
  kill -TERM "$watch_pid" 2> /dev/null
  wait "$watch_pid" 2> /dev/null
  [ "$status" -eq 143 ] && status=124
  return $status
}

# ── is_hamzaish_managed ───────────────────────────────────────────────────────
# Returns 0 if $REPO is Hamzaish-managed per the scope rule above. Cheap, no network.
is_hamzaish_managed() {
  [ -f "$REPO/.hamzaish-managed" ] && return 0

  local hamzaish_root="${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}"

  local repo_canon root_canon
  repo_canon=$( cd "$REPO" 2> /dev/null && pwd -P )
  root_canon=$( cd "$hamzaish_root" 2> /dev/null && pwd -P )
  [ -n "$repo_canon" ] && [ "$repo_canon" = "$root_canon" ] && return 0

  local cp_file="$hamzaish_root/code-paths.local.json"
  if [ -f "$cp_file" ] && [ -n "$repo_canon" ]; then
    grep -Fiq "\"$repo_canon\"" "$cp_file" && return 0
    grep -Fiq "\"$REPO\"" "$cp_file" && return 0
  fi

  return 1
}

REPO=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$REPO" 2>/dev/null || exit 0

# SCOPE GATE — do nothing unless this is a Hamzaish-managed repo.
is_hamzaish_managed || exit 0

# Skip if any opt-out marker is present
[ -f "$REPO/.no-auto-commit" ] && exit 0
[ -f "$REPO/.no-auto-pull" ] && exit 0

# Skip if mid-rebase / merge / etc.
for f in .git/MERGE_HEAD .git/REBASE_HEAD .git/CHERRY_PICK_HEAD .git/BISECT_LOG; do
  [ -e "$f" ] && exit 0
done
[ -d .git/rebase-merge ] && exit 0
[ -d .git/rebase-apply ] && exit 0

# Skip detached HEAD
git symbolic-ref --quiet HEAD > /dev/null 2>&1 || exit 0

# Skip if no upstream (nothing to pull from)
git rev-parse --abbrev-ref --symbolic-full-name @{u} > /dev/null 2>&1 || exit 0

# Skip if working tree is dirty — don't try to rebase on top of uncommitted work
if ! git diff --quiet HEAD -- 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
  exit 0
fi

# Pull with rebase, timeout-bounded. Quiet on success; fail-open on timeout/error
# so session start is never blocked by a hung network call.
if ! run_with_timeout "$PULL_TIMEOUT" git pull --rebase --quiet > /dev/null 2>&1; then
  echo "auto-pull-rebase: pull timed out (>${PULL_TIMEOUT}s) or failed — continuing without rebase" >&2
fi

exit 0
