#!/usr/bin/env bash
# scripts/auto-commit.sh
#
# Auto-commit-and-push safety net for ANY git repo Claude Code is working in.
# Owned by Hamzaish; invoked globally via ~/.claude/settings.json Stop hook.
#
# Behavior (all checks fail-soft — never blocks Claude):
#   1. Discover the git repo from cwd (walks up to find .git)
#   2. Skip if not a git repo, or if .git/HEAD is detached
#   3. Skip if .no-auto-commit marker exists in repo root  (full opt-out)
#   4. Skip if a multi-step git operation is in progress (rebase/merge/cherry-pick/bisect)
#   5. Skip if working tree is fully clean
#   6. Stage everything (`git add -A`)
#   7. Commit as `wip(auto): YYYY-MM-DDTHH:MM:SS` (no-verify, defends against pre-commit hooks)
#   8. If no .no-auto-push marker AND a tracking upstream exists → `git push --force-with-lease`
#       - force-with-lease is SAFE: refuses to overwrite if remote has advanced (e.g. another
#         machine pushed first). On rejection, the local commit still exists; user pulls --rebase
#         and the next turn's push succeeds.
#
# Opt-out markers (place in repo root):
#   .no-auto-commit  → skip both commit and push
#   .no-auto-push    → commit locally but never push (good for Lovable-synced repos like Muakkil)
#
# Recovery from a wip commit: `git log --oneline | grep "wip(auto):"` then `git show <sha>` or
# `git reset --hard <sha>` (destructive — be sure).
#
# Squash before sharing: `git rebase -i origin/main` then mark wip(auto) commits as fixup/squash
# into the real commit just before.

set -u  # do not `set -e`; we want fail-soft

# 1. Discover repo root from current working directory
REPO=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$REPO" 2>/dev/null || exit 0

# 2. Skip detached HEAD (can't reasonably push)
git symbolic-ref --quiet HEAD > /dev/null 2>&1 || exit 0

# 3. Full opt-out via marker
[ -f "$REPO/.no-auto-commit" ] && exit 0

# 4. Skip during multi-step git operations
for f in .git/MERGE_HEAD .git/REBASE_HEAD .git/CHERRY_PICK_HEAD .git/BISECT_LOG; do
  [ -e "$f" ] && exit 0
done
[ -d .git/rebase-merge ] && exit 0
[ -d .git/rebase-apply ] && exit 0

# 5. Skip if working tree is clean (tracked + staged + untracked all empty)
if git diff --quiet HEAD -- 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
  untracked=$(git ls-files --others --exclude-standard | head -1)
  [ -z "$untracked" ] && exit 0
fi

# 6. Stage everything
git add -A 2>/dev/null || exit 0

# Re-check: skip if the stage is still empty after add (e.g., everything was gitignored)
git diff --cached --quiet 2>/dev/null && exit 0

# 7. Commit. --no-verify so pre-commit hooks (linters etc.) can't block a safety snapshot.
TS=$(date +%Y-%m-%dT%H:%M:%S)
git commit --no-verify -m "wip(auto): $TS" > /dev/null 2>&1 || exit 0

# 8. Push to origin, if:
#    - no .no-auto-push marker
#    - there's a remote called `origin`
# We push with explicit branch name (not relying on @{u} tracking — which may
# be missing after a rebase or a fresh clone with --no-checkout). `--force-with-lease`
# without args still uses the remote-tracking ref check, so it's safe.
if [ ! -f "$REPO/.no-auto-push" ]; then
  if git remote get-url origin > /dev/null 2>&1; then
    BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null) || exit 0
    git push --force-with-lease origin "$BRANCH" > /dev/null 2>&1 || true
    # rejection is fine — local commit persists; user pulls --rebase on next session
  fi
fi

exit 0
