# 0002 — ClauDex is invocation-only; no default collaboration in hamzaish

**Date**: 2026-07-12
**Status**: accepted

## Context

Decision 0001 shipped the plugin with an advisory skill
(`claudex-second-opinion`) mirrored into `factory/skills/`, making it a
default-loaded suggestion engine in every hamzaish session. Same-day dogfood
runs showed the real cost of the duet: Codex reviews take minutes when they
work and hang on rate limits when they don't (two 10-minute timeouts on
2026-07-12 alone).

## Decision

ClauDex runs ONLY when a human explicitly invokes a command. It is not baked
into hamzaish as a default collaborator in any form:

1. The `factory/skills/claudex-second-opinion` mirror is **removed** (with its
   eval case and coverage entry; README counts corrected). The canonical
   skill lives in the plugin repo — installing the plugin is the opt-in.
2. No hamzaish workflow (`/full-cycle`, `/review`, `/build`, hooks) references
   or invokes ClauDex. The earlier idea of a cross-model gate in
   `code-review-and-quality` is explicitly rejected at the default level.
3. If a session wants the duet, the human types `/claudex`, `/claudex:verdict`,
   or `/claudex:demo` — or asks for it in words. That is the only trigger.

## Consequences

- hamzaish sessions spend zero time and zero Codex quota on ClauDex unless
  asked.
- The plugin keeps its own advisory skill for plugin users (documented,
  suggest-only, never executes) — that's a product feature for people who
  chose to install it, not a factory default.
- Revisit trigger: if manual duet runs produce a consistent "Codex caught
  what Claude missed" record, an OPT-IN factory integration can be proposed
  as its own eval-gated change.
