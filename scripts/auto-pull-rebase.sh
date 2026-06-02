#!/usr/bin/env bash
# scripts/auto-pull-rebase.sh
#
# SessionStart safety net: when Claude Code starts in a git repo, pull --rebase
# from origin so the local branch matches the latest remote state.
#
# Why: the cross-machine workflow assumes both ends agree on history. If you
# pushed wip(auto) commits from machine A and then start a Claude Code session
# on machine B without pulling, machine B's first auto-commit push will be
# rejected by --force-with-lease. This script avoids that by pulling first.
#
# Same opt-outs as auto-commit.sh:
#   .no-auto-commit  → skip
#   .no-auto-pull    → commit locally but never push, AND don't auto-pull at session start
#
# All checks fail-soft.

set -u

REPO=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$REPO" 2>/dev/null || exit 0

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

# Pull with rebase. Quiet on success; we don't want session start to be noisy.
git pull --rebase --quiet > /dev/null 2>&1 || true

exit 0
