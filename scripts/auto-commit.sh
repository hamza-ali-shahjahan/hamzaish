#!/usr/bin/env bash
# scripts/auto-commit.sh
#
# Auto-commit (local restore-points) + OPT-IN auto-push safety net for ANY git
# repo Claude Code is working in. Owned by Hamzaish; invoked globally via
# ~/.claude/settings.json Stop hook.
#
# ── Behavior (all checks fail-soft — never blocks Claude) ──────────────────────
#   1. Discover the git repo from cwd (walks up to find .git)
#   2. Skip if not a git repo, or if HEAD is detached
#   3. Skip if .no-auto-commit marker exists in repo root  (full opt-out)
#   4. Skip if a multi-step git operation is in progress (rebase/merge/cherry-pick/bisect)
#   5. Skip if working tree is fully clean
#   6. Stage everything (`git add -A`)
#   7. Commit as `wip(auto): YYYY-MM-DDTHH:MM:SS` (--no-verify, defends against
#      pre-commit hooks). This is a LOCAL restore-point — the default stops here.
#   8. PUSH IS OPT-IN. We push only if ALL of these hold:
#        - a `.auto-push` marker file exists in repo root   (explicit opt-in)
#        - `.no-auto-push` does NOT exist                   (extra hard guard)
#        - an `origin` remote exists
#        - a SECRET SCAN of the to-be-pushed commits comes back clean
#      Push uses `--force-with-lease` (safe: refuses to clobber a remote that has
#      advanced). If the secret scan flags a likely secret, the push is ABORTED;
#      the local restore-point commit still exists, so nothing leaves the machine.
#
#      WHY OPT-IN: pushing every turn is an exfiltration path — a buggy/injected
#      agent could ship work or secrets off the machine automatically. The default
#      is now "local commits only"; you opt a repo into auto-push by creating
#      `.auto-push`, and even then secrets are scanned before anything is pushed.
#
# ── Markers (place in repo root) ──────────────────────────────────────────────
#   .auto-push       → opt IN to auto-push (default is local commit only, no push)
#   .no-auto-push    → never push, even if .auto-push exists (extra guard)
#   .no-auto-commit  → skip both commit and push (full opt-out)
# Markers should be .gitignore'd so they stay operator-local discipline.
#
# ── Recovery ──────────────────────────────────────────────────────────────────
#   List:    git log --oneline | grep "wip(auto):"
#   Inspect: git show <sha>      Roll back: git reset --hard <sha>  (destructive)
#   Squash before sharing: git rebase -i origin/main → mark wip(auto) as fixup/squash.

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

# ── Secret scan ───────────────────────────────────────────────────────────────
# Returns 0 if the commits in $1 (a git revision range) look clean, non-zero if a
# likely secret is found. Bounded to the to-be-pushed range so it never walks the
# whole history and never hangs. Prefers gitleaks; falls back to a pattern grep.
secret_scan_clean() {
  local range="$1"

  if command -v gitleaks > /dev/null 2>&1; then
    # gitleaks exits non-zero when it finds leaks. --log-opts bounds it to $range.
    if [ -f "$REPO/.gitleaks.toml" ]; then
      gitleaks detect --no-banner --redact --log-opts="$range" \
        --config "$REPO/.gitleaks.toml" > /dev/null 2>&1
    else
      gitleaks detect --no-banner --redact --log-opts="$range" > /dev/null 2>&1
    fi
    return $?
  fi

  # Fallback: scan only the ADDED lines of the to-be-pushed commits.
  local added
  if [ "$range" = "HEAD" ]; then
    added=$(git show --no-color HEAD 2>/dev/null | grep '^+' || true)
  else
    added=$(git diff --no-color "$range" 2>/dev/null | grep '^+' || true)
  fi
  [ -z "$added" ] && return 0

  # High-signal token formats (case-sensitive).
  printf '%s\n' "$added" | grep -Eq \
    '-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|gh[posru]_[A-Za-z0-9]{20,}|xox[baprs]-[0-9A-Za-z-]{10,}|sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{35}' \
    && return 1

  # Generic `secret = <longvalue>` style assignments (case-insensitive).
  printf '%s\n' "$added" | grep -Eiq \
    '(secret|token|api[_-]?key|access[_-]?key|password|passwd|client[_-]?secret|private[_-]?key)[[:space:]]*[:=][[:space:]]*[A-Za-z0-9/+_=-]{16,}' \
    && return 1

  return 0
}

# 8. Push — OPT-IN ONLY. Default above already left us with a local commit.
if [ -f "$REPO/.auto-push" ] && [ ! -f "$REPO/.no-auto-push" ]; then
  if git remote get-url origin > /dev/null 2>&1; then
    BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null) || exit 0

    # Range of commits that would be pushed: everything local not yet on the
    # remote branch. If the remote branch doesn't exist yet (first push), scan
    # the tip commit so we never walk the entire history.
    if git rev-parse --verify --quiet "origin/$BRANCH" > /dev/null 2>&1; then
      RANGE="origin/$BRANCH..HEAD"
    else
      RANGE="HEAD"
    fi

    if secret_scan_clean "$RANGE"; then
      git push --force-with-lease origin "$BRANCH" > /dev/null 2>&1 || true
      # rejection is fine — local commit persists; user pulls --rebase next session
    fi
    # If the scan flagged a likely secret we ABORT the push (no-op here). The
    # local restore-point commit stays; rotate/remove the secret, then re-run.
  fi
fi

exit 0
