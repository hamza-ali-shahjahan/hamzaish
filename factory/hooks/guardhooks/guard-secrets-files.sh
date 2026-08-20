#!/usr/bin/env bash
# guardhooks · guard-secrets-files — the agent must NEVER touch real-secrets files.
#
# Root cause this prevents (real incident, 2026): the agent created .env.local with
# its Write tool; any file the agent touches becomes harness-watched, so when the
# USER later pasted real keys into it, the harness echoed the file's contents — the
# secrets — into the chat transcript. Both keys had to be rotated. Policy without
# enforcement fails at the tool layer; this hook IS the enforcement.
#
# Rules:
#   • Read/Write/Edit/NotebookEdit on secrets files → BLOCK.
#     The agent creates only "<name>.example" templates; the USER copies + pastes keys.
#   • Bash commands that would PRINT or COPY those files (cat/head/sed/cp/…) → BLOCK.
#   • Bash commands that would SEND those files anywhere (curl/wget/nc/…) → BLOCK.
#     Non-printing checks stay allowed: grep -q / grep -c / grep -l, test -s, wc, ls.
#   • Override (only after the user explicitly approves in chat):
#     env GUARDHOOKS_ALLOW_SECRETS=yes  or token I-CONFIRM-SECRETS-FILE-ACCESS in the call.
# FAIL-OPEN: only blocks on a clear match; everything else exits 0.

# shellcheck source=/dev/null
[ -f "${GUARDHOOKS_CONF:-$HOME/.claude/guardhooks.conf}" ] && . "${GUARDHOOKS_CONF:-$HOME/.claude/guardhooks.conf}"

input="$(cat 2>/dev/null)"

# ── override gate ─────────────────────────────────────────────────────────────
if [ "${GUARDHOOKS_ALLOW_SECRETS:-}" = "yes" ] || printf '%s' "$input" | grep -q 'I-CONFIRM-SECRETS-FILE-ACCESS'; then
  exit 0
fi

SECRETPAT='\.env\.local|\.env\.[A-Za-z0-9_-]+\.local|\.dev\.vars|id_rsa|\.pem([^A-Za-z]|$)|credentials\.json|secrets\.(json|ya?ml|toml)'
[ -n "${GUARDHOOKS_EXTRA_SECRET_PATTERNS:-}" ] && SECRETPAT="$SECRETPAT|$GUARDHOOKS_EXTRA_SECRET_PATTERNS"

BLOCK_MSG_FILES='BLOCKED by guardhooks — agents never read/write real-secrets files (.env.local etc.). Reason: any file the agent touches becomes harness-watched, and the user'"'"'s later edits (their real keys) get echoed into the chat transcript. Do this instead: (1) create/edit "<name>.example" with placeholders, (2) tell the user to copy it and paste their keys themselves, (3) verify presence with non-printing checks only, e.g. Bash: grep -c "^KEY=." .env.local. Override only if the user explicitly approves in chat: token I-CONFIRM-SECRETS-FILE-ACCESS.'
BLOCK_MSG_BASH='BLOCKED by guardhooks — this command would print, copy, or transmit a secrets file'"'"'s contents. Use non-printing checks instead: grep -q/-c PATTERN <file>, test -s <file>, wc -l <file>, ls. Never cat/head/tail/sed/awk/cp/curl a real-secrets file. Override only if the user explicitly approves in chat: token I-CONFIRM-SECRETS-FILE-ACCESS.'

# ── tool name ─────────────────────────────────────────────────────────────────
tool_name="$(printf '%s' "$input" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"

case "$tool_name" in
  Read|Write|Edit|NotebookEdit)
    # Extract the target path (first "file_path" / "notebook_path" key in tool_input).
    file_path="$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
    [ -z "$file_path" ] && file_path="$(printf '%s' "$input" | sed -n 's/.*"notebook_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
    if [ -n "$file_path" ] && printf '%s' "$file_path" | grep -qiE "$SECRETPAT"; then
      # .example templates are always fine (that IS the sanctioned pattern).
      if ! printf '%s' "$file_path" | grep -qiE '\.example($|\.)'; then
        echo "$BLOCK_MSG_FILES" >&2
        exit 2
      fi
    fi
    ;;
  Bash|"")
    # Normalize before matching, to kill known false-positive classes while
    # keeping every real leak vector blocked:
    #   1. strip the standard timeout wrapper (perl -e 'alarm shift; exec @ARGV' N)
    #      so the wrapper's "perl" doesn't count as an interpreter reading files;
    #   2. strip -m "..." / -m '...' message arguments (commit-message PROSE that
    #      merely mentions a secrets filename is not an access).
    cmd="$(printf '%s' "$input" \
      | sed -E "s/perl -e 'alarm shift; exec @ARGV' [0-9]+ //g" \
      | sed -E 's/-m [\\]?"([^"\\]|\\.)*[\\]?"//g' \
      | sed -E "s/-m '([^'])*'//g")"
    # Fast path: no secrets path mentioned at all → allow.
    if ! printf '%s' "$cmd" | grep -qiE "$SECRETPAT"; then
      exit 0
    fi
    # Block content-printing commands aimed at secrets paths (word-boundary on
    # the command name; same pipeline segment as the path).
    if printf '%s' "$cmd" | grep -qiE "(^|[^A-Za-z0-9_./-])(cat|head|tail|less|more|bat|strings|xxd|od|nl|tac|column|paste|source|pbcopy)[^|;&]*($SECRETPAT)"; then
      echo "$BLOCK_MSG_BASH" >&2
      exit 2
    fi
    # Interpreters reading a secrets file (printing by default).
    if printf '%s' "$cmd" | grep -qiE "(^|[^A-Za-z0-9_./-])(sed|awk|perl|ruby|python[0-9.]*|node|deno|bun)[^|;&]*($SECRETPAT)"; then
      echo "$BLOCK_MSG_BASH" >&2
      exit 2
    fi
    # Anything that would transmit a secrets file off the machine.
    if printf '%s' "$cmd" | grep -qiE "(^|[^A-Za-z0-9_./-])(curl|wget|nc|ncat|socat|ftp|sftp|ssh|scp|rsync|http|https|xh)[^|;&]*($SECRETPAT)"; then
      echo "$BLOCK_MSG_BASH" >&2
      exit 2
    fi
    # grep/rg on secrets files allowed ONLY in quiet/count/list modes.
    if printf '%s' "$cmd" | grep -qiE "(^|[^A-Za-z0-9_./-])(grep|rg)[^|;&]*($SECRETPAT)"; then
      if ! printf '%s' "$cmd" | grep -qE '(grep|rg)[^|;&]*[[:space:]]-[A-Za-z]*(q|c|l)[A-Za-z]*[[:space:]]'; then
        echo "$BLOCK_MSG_BASH" >&2
        exit 2
      fi
    fi
    # Copying/moving a secrets file (would create an unwatched-name copy).
    if printf '%s' "$cmd" | grep -qiE "(^|[^A-Za-z0-9_./-])(cp|mv|install)[^|;&]*($SECRETPAT)"; then
      echo "$BLOCK_MSG_BASH" >&2
      exit 2
    fi
    ;;
esac

exit 0
