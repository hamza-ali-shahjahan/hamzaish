#!/usr/bin/env bash
# factory/hooks/factory-freshness.sh
#
# SessionStart: tell the operator when their Hamzaish clone has gone stale. One line,
# at most once every 24 hours, and it NEVER pulls.
#
# ── The gap this closes ───────────────────────────────────────────────────────
# The global slash commands installed by `bun run setup` are POINTER STUBS — each one
# reads the live file in the clone at invoke time. That's what makes updates cheap: pull
# the clone and every command is current, no reinstall. But it also means a stale clone
# is invisible. `auto-pull-rebase.sh` only fires for Hamzaish-managed repos, which in
# practice means it pulls when you open a session INSIDE the clone. Work in your own
# product repos all week and the factory silently rots — old playbooks, old guards,
# missing commands — with nothing to tell you.
#
# So this hook informs. It does not act:
#   • Checks at most once per CHECK_INTERVAL_HOURS (default 24), cached in a state file,
#     so it is not touching the network on every session start.
#   • Runs `git fetch` under a hard timeout, then compares local HEAD to the upstream.
#   • If behind: prints ONE line — how far behind, and the command to fix it.
#   • Never pulls, never rebases, never edits anything but its own cache. Auto-updating
#     someone's factory mid-session is exactly the surprise that makes people disable
#     the mechanism, and then they lose the notice too.
#
# Built to the same two hard rules as auto-commit.sh / auto-pull-rebase.sh:
#   • TIMEOUT-BOUNDED — the fetch runs under a wall-clock limit (portable shim).
#   • FAIL-OPEN — any error, timeout, missing remote or detached state exits 0 silently.
#     A freshness notice is a convenience; it may never be the reason a session fails.
#
# Opt out (and the notice says so, so declining is an informed choice):
#   HAMZAISH_NO_UPDATE_CHECK=1          environment
#   $HAMZAISH_ROOT/.no-update-check     marker file
#
# Usage: factory-freshness.sh            # the hook path: honours the 24h cache
#        factory-freshness.sh --force    # ignore the cache (for testing)

set -u

CHECK_INTERVAL_HOURS="${HAMZAISH_CHECK_INTERVAL_HOURS:-24}"
FETCH_TIMEOUT=10

ROOT="${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}"
STATE="$HOME/.claude/.hamzaish-freshness.json"
FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

# ── opt-outs, cheapest first ──────────────────────────────────────────────────
[ "${HAMZAISH_NO_UPDATE_CHECK:-}" = "1" ] && exit 0
[ -f "$ROOT/.no-update-check" ] && exit 0
[ -d "$ROOT/.git" ] || exit 0
command -v git > /dev/null 2>&1 || exit 0

# ── run_with_timeout <seconds> <command...> ───────────────────────────────────
# Hard wall-clock limit; returns the command's status (124 on timeout). Prefers coreutils
# timeout, else a pure-bash watchdog. Self-contained by design — these hooks deliberately
# avoid a shared-lib dependency so a broken lib can't take down session start.
run_with_timeout() {
  local secs="$1"; shift
  if command -v gtimeout > /dev/null 2>&1; then gtimeout -k 3 "$secs" "$@"; return $?; fi
  if command -v timeout  > /dev/null 2>&1; then timeout  -k 3 "$secs" "$@"; return $?; fi
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

now=$(date +%s)

# ── the 24h cache ─────────────────────────────────────────────────────────────
# Grep rather than a JSON parser: this runs on every session start and must stay cheap
# and dependency-free. A malformed cache reads as "never checked", which is fail-open.
last=0
if [ -f "$STATE" ]; then
  last=$(grep -o '"last_check"[[:space:]]*:[[:space:]]*[0-9]*' "$STATE" 2> /dev/null | grep -o '[0-9]*$')
  [ -z "$last" ] && last=0
fi

interval=$(( CHECK_INTERVAL_HOURS * 3600 ))
if [ "$FORCE" -eq 0 ] && [ "$last" -gt 0 ] && [ $(( now - last )) -lt "$interval" ]; then
  exit 0
fi

# ── fetch + compare ───────────────────────────────────────────────────────────
upstream=$(git -C "$ROOT" rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2> /dev/null) || exit 0
[ -n "$upstream" ] || exit 0

run_with_timeout "$FETCH_TIMEOUT" git -C "$ROOT" fetch --quiet 2> /dev/null
fetch_status=$?

# Record the attempt either way, so a persistently offline machine isn't retried every
# single session start. A failed check is still a check.
mkdir -p "$(dirname "$STATE")" 2> /dev/null
printf '{\n  "last_check": %s,\n  "last_status": "%s"\n}\n' \
  "$now" "$( [ "$fetch_status" -eq 0 ] && echo ok || echo unreachable )" > "$STATE" 2> /dev/null

[ "$fetch_status" -eq 0 ] || exit 0

behind=$(git -C "$ROOT" rev-list --count "HEAD..$upstream" 2> /dev/null)
[ -n "$behind" ] || exit 0
[ "$behind" -eq 0 ] 2> /dev/null && exit 0

# Age of the newest upstream commit we don't have — "3 commits behind" understates the
# problem when those commits are a month old.
age_days=""
newest=$(git -C "$ROOT" log -1 --format=%ct "$upstream" 2> /dev/null)
if [ -n "$newest" ] && [ "$newest" -gt 0 ] 2> /dev/null; then
  age_days=$(( (now - newest) / 86400 ))
fi

commits="commits"
[ "$behind" -eq 1 ] && commits="commit"

if [ -n "$age_days" ] && [ "$age_days" -gt 0 ]; then
  suffix=" (newest is ${age_days}d old)"
else
  suffix=""
fi

printf '▸ Hamzaish is %s %s behind%s — update: cd %s && bun run update   [silence: HAMZAISH_NO_UPDATE_CHECK=1]\n' \
  "$behind" "$commits" "$suffix" "$ROOT" >&2

exit 0
