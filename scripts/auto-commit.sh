#!/usr/bin/env bash
# scripts/auto-commit.sh
#
# Auto-commit safety net for Hamzaish. Wired as a Stop hook via .claude/settings.json
# so it fires at the end of each Claude Code turn.
#
# Behavior:
#   - cd into the Hamzaish repo root
#   - skip if a rebase / merge / cherry-pick / bisect is in progress
#   - skip if the working tree is clean
#   - otherwise: `git add -A && git commit -m "wip(auto): YYYY-MM-DDTHH:MM:SS"`
#   - never push (push is explicit, never automatic)
#
# Squash before sharing: `git rebase -i origin/main` then mark all `wip(auto):` commits
# as fixup/squash into the real commit just before.

set -u  # strict-ish; do not `set -e` because we want to fail soft on any error

REPO="/Users/hamza/Claude/Hamzaish"

cd "$REPO" 2>/dev/null || exit 0

# Skip if not a git repo
[ -d .git ] || exit 0

# Skip if a multi-step git operation is in progress
for f in .git/MERGE_HEAD .git/REBASE_HEAD .git/CHERRY_PICK_HEAD .git/BISECT_LOG; do
  if [ -e "$f" ]; then
    exit 0
  fi
done
if [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
  exit 0
fi

# Skip if working tree is clean (no tracked changes, no staged changes)
if git diff --quiet HEAD -- 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
  # Still check for untracked files that .gitignore doesn't cover
  untracked=$(git ls-files --others --exclude-standard | head -1)
  if [ -z "$untracked" ]; then
    exit 0
  fi
fi

# Stage everything
git add -A 2>/dev/null || exit 0

# Skip if the stage is still empty (nothing actually changed after the add)
if git diff --cached --quiet 2>/dev/null; then
  exit 0
fi

# Commit. --no-verify because pre-commit hooks (if any) shouldn't block a safety snapshot.
TS=$(date +%Y-%m-%dT%H:%M:%S)
git commit --no-verify -m "wip(auto): $TS" > /dev/null 2>&1 || exit 0

exit 0
