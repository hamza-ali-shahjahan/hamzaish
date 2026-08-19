# 0003 — Legible plan & receipt: the enablement bookends speak the reader's language

**Date:** 2026-08-01 (night) · **Status:** LIVE — operator approved both formats; rolled into hamzaish.md §5, the SessionStart hook, both templates, and all six product tendrils · **Companion to:** 0002-enablement-protocol.md

## The insight (operator's words)

The first receipts/flight-plans were "visible but will make no sense to a new user" —
jargon-visible is not legible. And the fix is asymmetric: the plan should KEEP the rich
content (goal, steps, commands) because that's how users learn the levers; the receipt
should stay minimal because it confirms value, not process.

## The approved formats

**Plan — 4 lines, ~80-word cap, opens every factory-routed task (teaches the levers):**
```
🏭 Hamzaish plan
- Goal: <what "done" looks like, one plain sentence>
- Steps: <the pieces of this task, in order, plain words>
- Commands: /command — what it does here · /command — what it does here
- Proof before "done": <how the work will be verified, plain words>
```

**Receipt — 3 lines, ~50-word cap, closes it (confirms the value):**
```
🏭 Hamzaish receipt
- What you got: <the value added to the user's work, one plain sentence>
- Checked: <how it was verified before "done" — plus anything deliberately NOT done>
- Try next: /command — <what typing it will do for them>
```

## The rules (both bookends)

1. Value, never mechanism; day-1 vocabulary test — if a term needs the codebase to
   explain it, say what it does instead. No internal nouns (lanes, slices, tendrils, doors).
2. Commands always appear WITH what they do in THIS task — teaching by use.
3. Steps are the user's mental model (features they recognize), never stage names.
4. Numbers only if the user feels them: test counts yes, commit hashes no.
5. Receipt: ONE next command, never a menu. Checked line = the trust line, including
   what was deliberately not done.
