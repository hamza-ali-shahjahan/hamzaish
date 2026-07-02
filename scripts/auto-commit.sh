#!/usr/bin/env bash
# scripts/auto-commit.sh
#
# Auto-commit (local restore-points) + OPT-IN auto-push safety net. Owned by
# Hamzaish; invoked globally via the ~/.claude/settings.json Stop hook, so it
# fires at the end of EVERY Claude Code turn in EVERY git repo on this machine.
#
# Because it runs that often and that widely, it is built to two hard rules:
#   • TIMEOUT-BOUNDED — every blocking git op (commit, push) runs under a hard
#     wall-clock limit. macOS has no `timeout` binary, so we use a portable shim
#     (gtimeout/timeout if present, else a pure-bash watchdog).
#   • FAIL-OPEN — if any git op times out or errors, we print one concise warning
#     to stderr and `exit 0`. The hook must NEVER be able to wedge or hang a turn.
#
# ── Scope: Hamzaish-managed repos ONLY ────────────────────────────────────────
#   This hook is global, but it should only act on repos Hamzaish manages.
#   A repo is "Hamzaish-managed" if ANY of these is true (checked first, fast):
#     (A) it IS the Hamzaish repo itself (canonical path == $HAMZAISH_ROOT,
#         default $HOME/Claude/Hamzaish), OR
#     (B) its toplevel path is registered as a value in the operator's
#         $HAMZAISH_ROOT/code-paths.local.json (the product code-path map), OR
#     (C) it contains a `.hamzaish-managed` marker file in its root.
#   Any other repo → exit 0 immediately, do nothing. This stops the hook from
#   firing (and committing) in every unrelated repo on the machine.
#
# ── Behavior (all checks fail-soft — never blocks Claude) ──────────────────────
#   1. Discover the git repo from cwd (walks up to find .git)
#   2. Exit 0 unless the repo is Hamzaish-managed (see scope rule above)
#   3. Skip if HEAD is detached
#   4. Skip if .no-auto-commit marker exists in repo root  (full opt-out)
#   5. Skip if a multi-step git operation is in progress (rebase/merge/cherry-pick/bisect)
#   6. Skip if working tree is fully clean
#   7. Stage everything (`git add -A`)
#   8. Commit as `wip(auto): YYYY-MM-DDTHH:MM:SS` (--no-verify, defends against
#      pre-commit hooks), under a timeout. This is a LOCAL restore-point — the
#      default stops here.
#   9. PUSH IS OPT-IN, under a timeout. We push only if ALL of these hold:
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
#      is "local commits only"; you opt a repo into auto-push by creating
#      `.auto-push`, and even then secrets are scanned before anything is pushed.
#
# ── Markers (place in repo root) ──────────────────────────────────────────────
#   .hamzaish-managed → opt a non-registered repo INTO this hook's scope
#   .auto-push        → opt IN to auto-push (default is local commit only, no push)
#   .no-auto-push     → never push, even if .auto-push exists (extra guard)
#   .no-auto-commit   → skip both commit and push (full opt-out)
# Markers should be .gitignore'd so they stay operator-local discipline.
#
# ── Recovery ──────────────────────────────────────────────────────────────────
#   List:    git log --oneline | grep "wip(auto):"
#   Inspect: git show <sha>      Roll back: git reset --hard <sha>  (destructive)
#   Squash before sharing: git rebase -i origin/main → mark wip(auto) as fixup/squash.

set -u  # do not `set -e`; we want fail-soft

# Timeouts (seconds). Network ops get more headroom than the local commit.
COMMIT_TIMEOUT=10
PUSH_TIMEOUT=20

# ── run_with_timeout <seconds> <command...> ───────────────────────────────────
# Runs the command under a hard wall-clock limit and returns its exit status
# (124 if it timed out, matching timeout(1)). Prefers coreutils timeout
# (gtimeout on macOS via Homebrew, timeout on Linux); falls back to a pure-bash
# watchdog that backgrounds the command and kills it after N seconds. This is the
# guard that keeps a hung git network call from wedging the turn.
run_with_timeout() {
  local secs="$1"; shift
  if command -v gtimeout > /dev/null 2>&1; then
    gtimeout -k 3 "$secs" "$@"; return $?
  fi
  if command -v timeout > /dev/null 2>&1; then
    timeout -k 3 "$secs" "$@"; return $?
  fi
  # Pure-bash fallback: background the command, kill it if it overruns.
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
  # Command finished first — stop the watchdog so it doesn't linger.
  kill -TERM "$watch_pid" 2> /dev/null
  wait "$watch_pid" 2> /dev/null
  # 143 = 128 + SIGTERM: the watchdog killed an overrunning command → treat as timeout.
  [ "$status" -eq 143 ] && status=124
  return $status
}

# ── is_hamzaish_managed ───────────────────────────────────────────────────────
# Returns 0 if $REPO is Hamzaish-managed per the scope rule documented above.
# Designed to be cheap and never block (no network, bounded file reads).
is_hamzaish_managed() {
  # (C) explicit marker file — cheapest, check first
  [ -f "$REPO/.hamzaish-managed" ] && return 0

  local hamzaish_root="${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}"

  # (A) the repo IS the Hamzaish repo itself (compare canonical, symlink- and
  # case-resolved paths so e.g. .../Hamzaish and .../hamzaish match).
  local repo_canon root_canon
  repo_canon=$( cd "$REPO" 2> /dev/null && pwd -P )
  root_canon=$( cd "$hamzaish_root" 2> /dev/null && pwd -P )
  [ -n "$repo_canon" ] && [ "$repo_canon" = "$root_canon" ] && return 0

  # (B) the repo path is registered in code-paths.local.json. Best-effort
  # substring match on the quoted absolute path — avoids a jq dependency and any
  # JSON parser that could hang on malformed input.
  local cp_file="$hamzaish_root/code-paths.local.json"
  if [ -f "$cp_file" ] && [ -n "$repo_canon" ]; then
    grep -Fiq "\"$repo_canon\"" "$cp_file" && return 0
    grep -Fiq "\"$REPO\"" "$cp_file" && return 0
  fi

  return 1
}

# 1. Discover repo root from current working directory
REPO=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$REPO" 2>/dev/null || exit 0

# 2. SCOPE GATE — do nothing unless this is a Hamzaish-managed repo.
is_hamzaish_managed || exit 0

# 3. Skip detached HEAD (can't reasonably push)
git symbolic-ref --quiet HEAD > /dev/null 2>&1 || exit 0

# 4. Full opt-out via marker
[ -f "$REPO/.no-auto-commit" ] && exit 0

# 5. Skip during multi-step git operations
for f in .git/MERGE_HEAD .git/REBASE_HEAD .git/CHERRY_PICK_HEAD .git/BISECT_LOG; do
  [ -e "$f" ] && exit 0
done
[ -d .git/rebase-merge ] && exit 0
[ -d .git/rebase-apply ] && exit 0

# 6. Skip if working tree is clean (tracked + staged + untracked all empty)
if git diff --quiet HEAD -- 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
  untracked=$(git ls-files --others --exclude-standard | head -1)
  [ -z "$untracked" ] && exit 0
fi

# 7. Stage everything
git add -A 2>/dev/null || exit 0

# Re-check: skip if the stage is still empty after add (e.g., everything was gitignored)
git diff --cached --quiet 2>/dev/null && exit 0

# 7.5 IDENTITY GUARD (2026-07-03 "noreply from China" incident): a placeholder
#     git email makes GitHub attribute your commits to a STRANGER's account
#     (noreply@users.noreply.github.com maps to the real GitHub user "noreply").
#     Local restore-point commits still happen (losing work is worse), but we
#     warn loudly here — and the PUSH path below hard-refuses these identities,
#     so a misattributed commit can never leave the machine automatically.
#     Cheap (one git config read), fail-open like everything else in this file.
GIT_EMAIL=$(git config user.email 2>/dev/null || echo "")
BAD_IDENTITY=""
case "$GIT_EMAIL" in
  ""|"noreply@github.com"|"noreply@users.noreply.github.com"|"you@example.com")
    BAD_IDENTITY="yes"
    echo "auto-commit: WARNING — git user.email is '$GIT_EMAIL' (placeholder). Commits will be misattributed on GitHub. Fix: git config --global user.email '<id>+<username>@users.noreply.github.com' (your value: gh api user --jq '\"\(.id)+\(.login)@users.noreply.github.com\"')" >&2
    ;;
esac

# 8. Commit (timeout-bounded). --no-verify so pre-commit hooks (linters etc.)
#    can't block a safety snapshot. Fail-open on timeout/error.
TS=$(date +%Y-%m-%dT%H:%M:%S)
if ! run_with_timeout "$COMMIT_TIMEOUT" git commit --no-verify -m "wip(auto): $TS" > /dev/null 2>&1; then
  echo "auto-commit: commit timed out or failed (>${COMMIT_TIMEOUT}s) — skipping this turn, nothing lost" >&2
  exit 0
fi

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

# 9. Push — OPT-IN ONLY, timeout-bounded. Step 8 already left a local commit.
#    HARD GUARD: never auto-push commits made under a placeholder identity —
#    that's how a stranger's avatar ends up on your public repo (2026-07-03).
if [ -n "$BAD_IDENTITY" ]; then
  [ -f "$REPO/.auto-push" ] && echo "auto-commit: push REFUSED — placeholder git identity would misattribute your commits publicly. Fix user.email first (see warning above)." >&2
elif [ -f "$REPO/.auto-push" ] && [ ! -f "$REPO/.no-auto-push" ]; then
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
      if ! run_with_timeout "$PUSH_TIMEOUT" git push --force-with-lease origin "$BRANCH" > /dev/null 2>&1; then
        # Timeout, network error, or a remote that advanced (force-with-lease
        # rejection) — all fine. The local commit persists; pull --rebase next
        # session and the next push catches up. Fail-open, never block the turn.
        echo "auto-commit: push skipped (timed out >${PUSH_TIMEOUT}s, offline, or remote advanced) — local commit kept" >&2
      fi
    fi
    # If the scan flagged a likely secret we ABORT the push (no-op here). The
    # local restore-point commit stays; rotate/remove the secret, then re-run.
  fi
fi

exit 0
