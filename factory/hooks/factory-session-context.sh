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

CTX="🏭 Hamzaish factory session — product: ${SLUG}. ENABLEMENT PROTOCOL (mandatory, from factory/commands/hamzaish.md §5): (1) OPEN every task response with a one-line Factory Flight Plan: lane · slice · the factory doors this task will use, named as real commands. (2) CLOSE with a Factory Receipt: doors that actually ran, factory artifacts updated (status.md / learnings.md / ledger), and the next doors the user can type themselves. (3) A follow-up request is a NEW SLICE — re-enter the flow (§4), pin it in ~/Claude/Hamzaish/products/${SLUG}/status.md BEFORE building, feed the loop after. Factory doors: /hamzaish /work-on /build /spec /plan /test /review /ship /goal /security-check /tidy /portfolio-pulse /brain-ask · checks: bun run check-validation · check-gates · retro: bun run trace-report, bun run friction log. The user must always SEE what Hamzaish did — silent competence is not enablement."

# JSON-escape the context string (quotes are already avoided above; escape backslashes defensively).
ESCAPED=$(printf '%s' "$CTX" | sed 's/\\/\\\\/g; s/"/\\"/g')

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$ESCAPED"
exit 0
