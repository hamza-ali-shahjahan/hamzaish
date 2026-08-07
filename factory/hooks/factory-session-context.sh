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

set -euo pipefail

BRIEF=0
[ "${1:-}" = "--brief" ] && BRIEF=1

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

[ -z "$SLUG" ] && exit 0

# A product session and a factory-repo session share the protocol; only the
# label and the step-3 tail (follow-up tracking target + command catalog) differ.
if [ "$SLUG" = "__factory__" ]; then
  LABEL="the factory repo"
  STEP3="(3) A follow-up request is a new tracked step — re-enter the flow (§4): track it BEFORE building, append the session's learnings to brain/learnings/ after. Commands you can name in 'Try next': /hamzaish /work-on /portfolio-pulse /brain-ask /brain-ingest /reflect /learn-loop /repo-scout /pr /release /security-check /tidy /checkpoint."
else
  LABEL="product: ${SLUG}"
  STEP3="(3) A follow-up request is a new tracked step — re-enter the flow (§4): pin it in ~/Claude/Hamzaish/products/${SLUG}/status.md BEFORE building, feed status + learnings after. Commands you can name in 'Try next': /hamzaish /work-on /build /spec /plan /test /review /ship /goal /security-check /tidy /portfolio-pulse /brain-ask."
fi

if [ "$BRIEF" = "1" ]; then
  BL="$SLUG"; [ "$SLUG" = "__factory__" ] && BL="factory repo"
  BCTX="🏭 Hamzaish session (${BL}) — every task response OPENS with the 4-line '🏭 Hamzaish plan' (Goal/Steps/Commands/Proof) and CLOSES with the 3-line '🏭 Hamzaish receipt' (What you got/Checked/Try next), plain day-1 language, legibility gate applies (hamzaish.md §5)."
  printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$(printf '%s' "$BCTX" | sed 's/\\/\\\\/g; s/"/\\"/g')"
  exit 0
fi

CTX="🏭 Hamzaish factory session — ${LABEL}. ENABLEMENT PROTOCOL (mandatory, hamzaish.md §5). Write both bookends in plain day-1 language — value, never mechanism; no factory jargon (lanes, slices, tendrils, doors); if a term needs the codebase to explain it, say what it does instead. (1) OPEN each task response with the 4-line plan (about 80 words max): '🏭 Hamzaish plan' / '- Goal: <what done looks like, one plain sentence>' / '- Steps: <the pieces of this task, in order, plain words>' / '- Commands: /command — what it does here (EACH command named with its job in this task)' / '- Proof before done: <how the work will be verified>'. (2) CLOSE with the 3-line receipt, max ~50 words: '🏭 Hamzaish receipt' / '- What you got: <the value added to the user's work>' / '- Checked: <how it was verified before done, plus anything deliberately not done>' / '- Try next: /command — <what typing it will do>'. GATE both bookends before sending: day-1 words only (banned in bookends: lane, slice, tendril, door, artifact, retro, e2e, typecheck — say what it does instead); exact shapes; caps ~80/~50 words; exactly ONE command in Try next; no commit hashes or file paths; numbers only if the user feels them (test counts yes). ${STEP3}"

# JSON-escape the context string (quotes are already avoided above; escape backslashes defensively).
ESCAPED=$(printf '%s' "$CTX" | sed 's/\\/\\\\/g; s/"/\\"/g')

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$ESCAPED"
exit 0
