#!/usr/bin/env bash
# factory-session-context.sh — SessionStart hook: make Hamzaish visible BY DEFAULT.
#
# The defect this exists for (2026-08-01): a session used the factory correctly on
# build #1, then silently dropped it for builds #2–3 — and even build #1's factory
# work was invisible to the user. Operator verdict: "not enablement at all." Prose
# rules get dropped; hooks fire every time. This hook detects that a session opened
# inside a registered Hamzaish product repo (by its CLAUDE.md tendril marker) and
# injects the enablement protocol + door catalog into the session context.
#
# Register in ~/.claude/settings.json (install/setup offers this):
#   "hooks": { "SessionStart": [ { "hooks": [ { "type": "command",
#     "command": "$HOME/Claude/Hamzaish/factory/hooks/factory-session-context.sh" } ] } ] }
#
# Emits nothing (exit 0) outside factory-managed surfaces — a registered product
# repo or the factory repo itself (2026-08-06: factory-repo sessions are a primary
# operator surface and previously got zero enablement — see
# meta/retros/2026-08-06-enablement-gap-factory-repo.md). Zero noise elsewhere.
#
# Modes:
#   (default)  SessionStart — full protocol + command catalog, once per session
#   --brief    UserPromptSubmit — one short reminder line on EVERY message, so
#              long-lived sessions (started before hooks existed, or running for
#              days) can never drift out of the plan/receipt bookends. The drift
#              is not hypothetical: it happened live on 2026-08-06 in a session
#              that predated hook registration.
#   --stamp    PostToolUse on Skill — records that this session invoked a
#              Hamzaish command, so the session stays recognized even though its
#              folder is nowhere near a product repo. Added 2026-08-16 after a
#              session rooted at $HOME ran /hamzaish and /work-on, worked a
#              registered product for hours, and matched none of the directory
#              checks — so it never got a single reminder and drifted out of the
#              bookends repeatedly. Detection asked "which folder is this?" when
#              the load-bearing question is "has this session entered the
#              factory?". Both questions are now asked.

set -euo pipefail

BRIEF=0
STAMP=0
case "${1:-}" in
  --brief) BRIEF=1 ;;
  --stamp) STAMP=1 ;;
esac

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)

# Claude Code delivers the hook payload as JSON on stdin. Read it without ever
# blocking — the tests and manual runs invoke this hook with no stdin at all.
INPUT=""
if [ ! -t 0 ]; then INPUT=$(cat 2>/dev/null || true); fi

json_field() {
  [ -n "$INPUT" ] || return 0
  command -v jq >/dev/null 2>&1 || return 0
  printf '%s' "$INPUT" | jq -r "$1 // empty" 2>/dev/null || true
}

# The session marker: how a session that ENTERED the factory stays recognized
# even when its folder is nowhere near a product repo.
SESSION_ID=$(json_field '.session_id')
MARKER=""
[ -n "$SESSION_ID" ] && MARKER="${TMPDIR:-/tmp}/hamzaish-active-${SESSION_ID//[^A-Za-z0-9_-]/}"

# --stamp (PostToolUse on Skill): a Hamzaish command just ran, so remember that
# this session is factory-active for the rest of its life.
if [ "$STAMP" = "1" ]; then
  [ -n "$MARKER" ] || exit 0
  SKILL=$(json_field '.tool_input.skill')
  case "${SKILL##*:}" in
    hamzaish|builder-mode|work-on|full-cycle|build|spec|plan|test|review|ship|goal|setup|code-simplify|security-check|tidy|portfolio-pulse|brain-ask|brain-ingest)
      TOKEN=$(json_field '.tool_input.args' | awk '{print tolower($1)}' | tr -cd 'a-z0-9._-')
      if [ -n "$TOKEN" ] && [ -d "$ROOT/products/$TOKEN" ]; then
        printf '%s' "$TOKEN" > "$MARKER"
      elif [ ! -s "$MARKER" ]; then
        : > "$MARKER"
      fi
      ;;
  esac
  exit 0
fi

DIR="${CLAUDE_PROJECT_DIR:-$PWD}"

# Walk up from cwd looking for the tendril marker (planted at registration).
SLUG=""
probe="$DIR"
for _ in 1 2 3 4 5 6; do
  if [ -f "$probe/CLAUDE.md" ] && grep -qi "hamzaish factory product" "$probe/CLAUDE.md" 2>/dev/null; then
    SLUG=$(grep -oE 'slug: `[^`]+`' "$probe/CLAUDE.md" 2>/dev/null | head -1 | sed 's/slug: `//; s/`//')
    break
  fi
  # The factory repo itself: committed marker + both layer dirs (portable — no
  # hardcoded home path; works for any clone location).
  if [ -f "$probe/.hamzaish-managed" ] && [ -d "$probe/factory" ] && [ -d "$probe/brain" ]; then
    SLUG="__factory__"
    break
  fi
  parent=$(dirname "$probe")
  [ "$parent" = "$probe" ] && break
  probe="$parent"
done

# Directory detection is the primary signal, but factory work is not always
# folder-bound. A session rooted anywhere (e.g. $HOME) can enter the factory via
# /hamzaish or /work-on and then operate on a product repo for hours — and that
# session matched nothing here, so it got ZERO reminders and drifted right back
# out of the bookends. Observed live 2026-08-16: the exact failure the 2026-08-01
# hook was written to end, reappearing through a gap in *when* it fires rather
# than what it says. The marker closes it — entering the factory is remembered
# for the whole session, wherever that session happens to run.
if [ -n "$SLUG" ]; then
  [ -n "$MARKER" ] && printf '%s' "$SLUG" > "$MARKER"
elif [ -n "$MARKER" ] && [ -f "$MARKER" ]; then
  SLUG=$(cat "$MARKER" 2>/dev/null || true)
  [ -z "$SLUG" ] && SLUG="__active__"
fi

[ -z "$SLUG" ] && exit 0

# A product session and a factory-repo session share the protocol; only the
# label and the step-3 tail (follow-up tracking target + command catalog) differ.
if [ "$SLUG" = "__factory__" ]; then
  LABEL="the factory repo"
  STEP3="(3) A follow-up request is a new tracked step — re-enter the flow (§4): track it BEFORE building, append the session's learnings to brain/learnings/ after. Commands you can name in 'Try next': /hamzaish /work-on /portfolio-pulse /brain-ask /brain-ingest /reflect /learn-loop /repo-scout /pr /release /security-check /tidy /checkpoint."
elif [ "$SLUG" = "__active__" ]; then
  LABEL="an active factory session"
  STEP3="(3) A follow-up request is a new tracked step — re-enter the flow (§4): pin it in the product's status.md under ~/Claude/Hamzaish/products/ BEFORE building, feed status + learnings after. Commands you can name in 'Try next': /hamzaish /work-on /build /spec /plan /test /review /ship /goal /security-check /tidy /portfolio-pulse /brain-ask."
else
  LABEL="product: ${SLUG}"
  STEP3="(3) A follow-up request is a new tracked step — re-enter the flow (§4): pin it in ~/Claude/Hamzaish/products/${SLUG}/status.md BEFORE building, feed status + learnings after. Commands you can name in 'Try next': /hamzaish /work-on /build /spec /plan /test /review /ship /goal /security-check /tidy /portfolio-pulse /brain-ask."
fi

if [ "$BRIEF" = "1" ]; then
  BL="$SLUG"
  [ "$SLUG" = "__factory__" ] && BL="factory repo"
  [ "$SLUG" = "__active__" ] && BL="active"
  BCTX="🏭 Hamzaish session (${BL}) — every task response OPENS with the 4-line '🏭 Hamzaish plan' (Goal/Steps/Commands/Proof) and CLOSES with the 3-line '🏭 Hamzaish receipt' (What you got/Checked/Try next), plain day-1 language, legibility gate applies (hamzaish.md §5)."
  printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$(printf '%s' "$BCTX" | sed 's/\\/\\\\/g; s/"/\\"/g')"
  exit 0
fi

CTX="🏭 Hamzaish factory session — ${LABEL}. ENABLEMENT PROTOCOL (mandatory, hamzaish.md §5). Write both bookends in plain day-1 language — value, never mechanism; no factory jargon (lanes, slices, tendrils, doors); if a term needs the codebase to explain it, say what it does instead. (1) OPEN each task response with the 4-line plan (about 80 words max): '🏭 Hamzaish plan' / '- Goal: <what done looks like, one plain sentence>' / '- Steps: <the pieces of this task, in order, plain words>' / '- Commands: /command — what it does here (EACH command named with its job in this task)' / '- Proof before done: <how the work will be verified>'. (2) CLOSE with the 3-line receipt, max ~50 words: '🏭 Hamzaish receipt' / '- What you got: <the value added to the user's work>' / '- Checked: <how it was verified before done, plus anything deliberately not done>' / '- Try next: /command — <what typing it will do>'. GATE both bookends before sending: day-1 words only (banned in bookends: lane, slice, tendril, door, artifact, retro, e2e, typecheck — say what it does instead); exact shapes; caps ~80/~50 words; exactly ONE command in Try next; no commit hashes or file paths; numbers only if the user feels them (test counts yes). ${STEP3}"

# JSON-escape the context string (quotes are already avoided above; escape backslashes defensively).
ESCAPED=$(printf '%s' "$CTX" | sed 's/\\/\\\\/g; s/"/\\"/g')

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$ESCAPED"
exit 0
