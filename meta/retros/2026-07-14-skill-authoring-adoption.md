# Retro — skill-authoring standard adoption (v2.15.0, 2026-07-14)

**Cycle:** study mattpocock/skills → rank 18 candidate adoptions by leverage → port the meta-layer first (skill-authoring standard) → first context-load audit → ship with four sessions' pending clusters bundled.

## What worked

- **Meta-first ranking held up.** Porting the skill-writing standard before any object-level skill meant the audit immediately had a rubric to apply — the standard justified itself in the same session it landed (~3.8k tokens/session of description load measured, 2 conversions applied).
- **Propose → approve → execute in strict order.** The operator saw the changelog text before any file was written; zero rework on the public-facing copy.
- **Guards caught real gaps locally** (playbook counts) and in CI (this retro) — the ratchets work.

## What didn't

- **Misdiagnosis shipped into two brain files before verification.** The duplicate-listing finding was blamed on symlink drift because it pattern-matched `hand-maintained-facts-drift` and `ls -la` "confirmed" it — but `ls` follows directory symlinks silently. `readlink` falsified it in one command. Corrected same-session; a task chip was issued and had to be withdrawn. Lesson promoted to `brain/learnings/2026-07-14.md`: an anti-pattern match is a hypothesis, not evidence.
- **A dormant guard bug surfaced late:** `check-changelog` couldn't parse `vX.Y.Z` headers, silently mis-reporting v2.13.0 since Jul 12. Guards need the occasional local full-suite run, not just the subset touching your change.

## Carry forward

- Name-collision dedupe + collision guard (running as its own session), description prunes, and the merge candidates — all listed in the decision log's "flagged, not applied" table, pending the ClauDex/Codex cross-review.
