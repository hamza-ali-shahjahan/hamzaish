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
# Emits nothing (exit 0) outside factory product repos — zero noise elsewhere.

set -euo pipefail

DIR="${CLAUDE_PROJECT_DIR:-$PWD}"

# Walk up from cwd looking for the tendril marker (planted at registration).
SLUG=""
probe="$DIR"
for _ in 1 2 3 4 5 6; do
  if [ -f "$probe/CLAUDE.md" ] && grep -qi "hamzaish factory product" "$probe/CLAUDE.md" 2>/dev/null; then
    SLUG=$(grep -oE 'slug: `[^`]+`' "$probe/CLAUDE.md" 2>/dev/null | head -1 | sed 's/slug: `//; s/`//')
    break
  fi
  parent=$(dirname "$probe")
  [ "$parent" = "$probe" ] && break
  probe="$parent"
done

[ -z "$SLUG" ] && exit 0

CTX="🏭 Hamzaish factory session — product: ${SLUG}. ENABLEMENT PROTOCOL (mandatory, hamzaish.md §5). Write both bookends in plain day-1 language — value, never mechanism; no factory jargon (lanes, slices, tendrils, doors); if a term needs the codebase to explain it, say what it does instead. (1) OPEN each task response with the 4-line plan (about 80 words max): '🏭 Hamzaish plan' / '- Goal: <what done looks like, one plain sentence>' / '- Steps: <the pieces of this task, in order, plain words>' / '- Commands: /command — what it does here (EACH command named with its job in this task)' / '- Proof before done: <how the work will be verified>'. (2) CLOSE with the 3-line receipt, max ~50 words: '🏭 Hamzaish receipt' / '- What you got: <the value added to the user's work>' / '- Checked: <how it was verified before done, plus anything deliberately not done>' / '- Try next: /command — <what typing it will do>'. GATE both bookends before sending: day-1 words only (banned in bookends: lane, slice, tendril, door, artifact, retro, e2e, typecheck — say what it does instead); exact shapes; caps ~80/~50 words; exactly ONE command in Try next; no commit hashes or file paths; numbers only if the user feels them (test counts yes). (3) A follow-up request is a new tracked step — re-enter the flow (§4): pin it in ~/Claude/Hamzaish/products/${SLUG}/status.md BEFORE building, feed status + learnings after. Commands you can name in 'Try next': /hamzaish /work-on /build /spec /plan /test /review /ship /goal /security-check /tidy /portfolio-pulse /brain-ask."

# JSON-escape the context string (quotes are already avoided above; escape backslashes defensively).
ESCAPED=$(printf '%s' "$CTX" | sed 's/\\/\\\\/g; s/"/\\"/g')

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$ESCAPED"
exit 0
