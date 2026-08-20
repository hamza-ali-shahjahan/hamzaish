#!/usr/bin/env bash
# guardhooks · guard-force-push — protect shared history on protected branches.
#
# What this prevents: an agent "fixing" a diverged branch by rewriting or deleting
# published history — `git push --force origin main` destroys every collaborator's
# base and any CI/deploy pinned to it. Force-pushing a feature branch is normal;
# force-pushing a protected branch is almost always a mistake an agent talked
# itself into.
#
# Rules (matched against the protected-branch list, default: main master production):
#   • git push --force / -f / --force-with-lease to a protected branch → BLOCK.
#   • git push origin +<protected>            (refspec force syntax)   → BLOCK.
#   • git push origin :<protected> / --delete <protected> (remote del) → BLOCK.
#   • Force-pushes that don't name a protected branch are ALLOWED (feature-branch
#     workflows stay friction-free; we can't know the current branch, so we fail open).
#   • Override: env GUARDHOOKS_ALLOW_FORCE_PUSH=yes or token I-CONFIRM-FORCE-PUSH.
# FAIL-OPEN: only blocks on a clear match; everything else exits 0.

# shellcheck source=/dev/null
[ -f "${GUARDHOOKS_CONF:-$HOME/.claude/guardhooks.conf}" ] && . "${GUARDHOOKS_CONF:-$HOME/.claude/guardhooks.conf}"

input="$(cat 2>/dev/null)"

if [ "${GUARDHOOKS_ALLOW_FORCE_PUSH:-}" = "yes" ] || printf '%s' "$input" | grep -q 'I-CONFIRM-FORCE-PUSH'; then
  exit 0
fi

# Build the protected-branch alternation: "main master production" → "main|master|production"
prot_re="$(printf '%s' "${GUARDHOOKS_PROTECTED_BRANCHES:-main master production}" | tr -s ' ' '|')"
[ -z "$prot_re" ] && exit 0

# Only look at git push segments (avoid matching prose or other commands).
if ! printf '%s' "$input" | grep -qE 'git[[:space:]]+push'; then
  exit 0
fi

MSG="BLOCKED by guardhooks — this would rewrite or delete history on a PROTECTED branch ($(printf '%s' "$prot_re" | tr '|' ' ')). Published history is other people's base: force-pushing it breaks every clone, PR, and pinned deploy. If this is genuinely intended, ask the user to approve in chat, then re-run with env GUARDHOOKS_ALLOW_FORCE_PUSH=yes or token I-CONFIRM-FORCE-PUSH. (Force-pushing a feature branch is allowed — name the branch explicitly.)"

# Boundary classes: commands arrive embedded in JSON, so a branch/flag can be
# terminated by a quote, not just whitespace or end-of-string.
FORCE='(--force(-with-lease|-if-includes)?([[:space:]="'"'"']|$)|[[:space:]]-[a-eg-zA-Z]*f[a-zA-Z]*([[:space:]"'"'"']|$))'
BRANCH="([[:space:]:/+\"'])($prot_re)([[:space:]\"':]|\$)"

# Force flags + a protected branch named in the same push segment (either order).
if printf '%s' "$input" | grep -qE "git[[:space:]]+push[^|;&]*${FORCE}[^|;&]*${BRANCH}" \
|| printf '%s' "$input" | grep -qE "git[[:space:]]+push[^|;&]*${BRANCH}[^|;&]*${FORCE}"; then
  echo "$MSG" >&2
  exit 2
fi

# Refspec force syntax: git push origin +main
if printf '%s' "$input" | grep -qE "git[[:space:]]+push[^|;&]*[[:space:]]\+($prot_re)([[:space:]\"']|\$)"; then
  echo "$MSG" >&2
  exit 2
fi

# Remote deletion: git push origin :main  /  git push --delete origin main  /  git push -d origin main
if printf '%s' "$input" | grep -qE "git[[:space:]]+push[^|;&]*[[:space:]]:($prot_re)([[:space:]\"']|\$)" \
|| printf '%s' "$input" | grep -qE "git[[:space:]]+push[^|;&]*(--delete|[[:space:]]-d[[:space:]])[^|;&]*[[:space:]]($prot_re)([[:space:]\"']|\$)"; then
  echo "$MSG" >&2
  exit 2
fi

exit 0
