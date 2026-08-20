#!/usr/bin/env bash
# guardhooks · guard-mass-delete — stop recursive-force deletes aimed at dangerous roots.
#
# What this prevents: the category of loss where an agent, mid-cleanup, runs
# `rm -rf` against a home directory, a project root it misidentified, or a glob
# that expands wider than it reasoned about. Deleting node_modules or a temp dir
# is normal; deleting a root is unrecoverable.
#
# Rules — BLOCK `rm` with recursive+force flags when a target is:
#   • filesystem root or root glob:            /   /*
#   • a home directory or its glob:            ~   ~/   $HOME   /Users/<name>   /home/<name>   ~/*
#   • a system dir:                            /etc /var /usr /opt /bin /sbin /Library /System /Applications
#   • the bare current/parent dir or bare glob: .   ..   *   ./*
#   Everything else (rm -rf node_modules, rm -rf /tmp/x, rm -rf ./dist) is ALLOWED.
#   • Override: env GUARDHOOKS_ALLOW_MASS_DELETE=yes or token I-CONFIRM-MASS-DELETE.
# FAIL-OPEN: only blocks on a clear match; everything else exits 0.

# shellcheck source=/dev/null
[ -f "${GUARDHOOKS_CONF:-$HOME/.claude/guardhooks.conf}" ] && . "${GUARDHOOKS_CONF:-$HOME/.claude/guardhooks.conf}"

input="$(cat 2>/dev/null)"

if [ "${GUARDHOOKS_ALLOW_MASS_DELETE:-}" = "yes" ] || printf '%s' "$input" | grep -q 'I-CONFIRM-MASS-DELETE'; then
  exit 0
fi

# Fast path: no rm with recursive+force flags at all → allow.
# Matches: -rf -fr -Rf -r -f (split), --recursive --force (either order).
RMFORCE='rm[[:space:]]+(-[a-zA-Z]*[rR][a-zA-Z]*[[:space:]]+)*(-[a-zA-Z]*([rR][a-zA-Z]*f|f[a-zA-Z]*[rR])[a-zA-Z]*|--recursive[[:space:]]+.*--force|--force[[:space:]]+.*--recursive|-[a-zA-Z]*[rR][a-zA-Z]*[[:space:]]+(-[a-zA-Z]*[[:space:]]+)*-[a-zA-Z]*f[a-zA-Z]*|-[a-zA-Z]*f[a-zA-Z]*[[:space:]]+(-[a-zA-Z]*[[:space:]]+)*-[a-zA-Z]*[rR][a-zA-Z]*)'
if ! printf '%s' "$input" | grep -qE "$RMFORCE"; then
  exit 0
fi

# Dangerous targets, matched inside the same pipeline segment as the rm.
DANGER='((^|[[:space:]])/([[:space:]*"]|$)|(^|[[:space:]])/\*|(^|[[:space:]])~/?([[:space:]"]|$)|(^|[[:space:]])~/\*|\$HOME([[:space:]/"]*\*?)?([[:space:]"]|$)|(^|[[:space:]])/(Users|home)/[^/[:space:]]+/?([[:space:]"]|$)|(^|[[:space:]])/(etc|var|usr|opt|bin|sbin|Library|System|Applications)(/[[:space:]]*)?([[:space:]"]|$)|(^|[[:space:]])\.\.?([[:space:]"]|$)|(^|[[:space:]])\*([[:space:]"]|$)|(^|[[:space:]])\./\*([[:space:]"]|$))'

if printf '%s' "$input" | grep -qE "rm[[:space:]][^|;&]*$DANGER"; then
  echo 'BLOCKED by guardhooks — this recursive-force delete targets a dangerous root (/, a home directory, a system dir, ".", "..", or a bare glob). That class of delete is unrecoverable and is how agents wipe machines. Name the exact subdirectory instead (rm -rf ./dist is fine). If this is genuinely intended, ask the user to approve in chat, then re-run with env GUARDHOOKS_ALLOW_MASS_DELETE=yes or token I-CONFIRM-MASS-DELETE.' >&2
  exit 2
fi

exit 0
