#!/usr/bin/env bash
# guardhooks · guard-repo-visibility — protect public repos from silent privatization.
#
# Root cause this prevents (real incident, 2026): an agent inferred that "the repo"
# should be made private and flipped a public repo's visibility — permanently losing
# its stars, watchers, and every shared link. Public→private is NOT cleanly reversible.
#
# Rules:
#   • Repos listed in GUARDHOOKS_NEVER_PRIVATE: hard-block private/archive. No agent
#     override exists — only the user can, by editing this file or their conf.
#   • Any OTHER repo: block making it private/archived UNLESS the user has
#     double-confirmed (env GUARDHOOKS_CONFIRM_PRIVATE=yes-twice, or token
#     I-DOUBLE-CONFIRM-PRIVATE in the command).
#   • Everything else is allowed: private→public, `gh repo create --private`,
#     and all normal commands.
# FAIL-OPEN: only ever exits non-zero when a clear make-private / archive pattern matches.

# shellcheck source=/dev/null
[ -f "${GUARDHOOKS_CONF:-$HOME/.claude/guardhooks.conf}" ] && . "${GUARDHOOKS_CONF:-$HOME/.claude/guardhooks.conf}"

input="$(cat 2>/dev/null)"

# Intent to make an EXISTING repo private, or to archive it.
# Deliberately does NOT match `gh repo create --private` (creating a new private repo is fine).
if printf '%s' "$input" | grep -qiE 'gh repo edit[^|]*--visibility[=[:space:]]+private|gh api[^|]*repos/[^|]*private[[:space:]]*[=:][[:space:]]*true|"private"[[:space:]]*:[[:space:]]*true|gh repo archive([[:space:]]|$)'; then

  # --- Never-private repo targeted? (named in the command, or the cwd IS that repo) ---
  for repo in ${GUARDHOOKS_NEVER_PRIVATE:-}; do
    hit=0
    printf '%s' "$input" | grep -qi -- "$repo" && hit=1
    printf '%s' "${PWD:-$(pwd)}" | grep -qi -- "$repo" && hit=1
    if [ "$hit" = 1 ]; then
      echo "BLOCKED by guardhooks — HARD INVARIANT: '$repo' is configured NEVER-PRIVATE (GUARDHOOKS_NEVER_PRIVATE). Making it private or archived is never allowed by any session/agent. No agent override exists — only the user can change this, by editing ~/.claude/guardhooks.conf. (If you meant a DIFFERENT repo, name it explicitly and cd out of this folder first.)" >&2
      exit 2
    fi
  done

  # --- Other repo: requires the user's gated DOUBLE-confirmation ---
  if [ "${GUARDHOOKS_CONFIRM_PRIVATE:-}" != "yes-twice" ] && ! printf '%s' "$input" | grep -q 'I-DOUBLE-CONFIRM-PRIVATE'; then
    echo 'BLOCKED by guardhooks — making a PUBLIC repo private (or archiving it) can permanently lose stars/forks/watchers and break every shared link. This needs the user'"'"'s GATED DOUBLE-CONFIRMATION. Ask them to confirm TWICE in chat, then re-run prefixed with:  GUARDHOOKS_CONFIRM_PRIVATE=yes-twice <command>  (or include the token I-DOUBLE-CONFIRM-PRIVATE in the command).' >&2
    exit 2
  fi
fi
exit 0
