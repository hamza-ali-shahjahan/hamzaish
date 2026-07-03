# Repolish — Goal (v0 MVP)

> Forged via `/write-a-goal` on 2026-06-23. `/goal` *pursues* a goal; this *is* the goal.

## Capability statement
Given a path to a local code repo, repolish emits (a) a tailored README **draft**
with the full premium structure and (b) an honesty **report** flagging unverified /
overclaimed statements — in one offline command.

## The exact metric (split per Check A)
**M1 — README structural completeness.** Over a matrix of ≥3 distinct real repos ×
5 required sections (centered hero · tagline · badges block · comparison table ·
real quick-start), the fraction of cells present.
- *Robustness guard:* the quick-start must be a **real** command derived from the
  repo's manifest (not the literal "TODO"), and the hero name must equal the repo's
  actual name — a blank/placeholder draft scores ~0, not high.

**M2 — honesty detection.** Over one fixture README seeded with **10 labeled
overclaims** + one **clean control** README. Measured as recall + control FPs.
- *Robustness guard:* passing requires recall ≥ 0.8 **AND** control FP ≤ 1 — a
  flag-everything detector fails the control; a flag-nothing detector fails recall.

## Evals (numeric targets)
- **E1:** M1 ≥ 0.95 (≤ 1 missing cell across the 3×5 matrix).
- **E2:** M2 recall ≥ 0.8 (≥ 8/10 seeded overclaims) **and** ≤ 1 control false positive.
- **E3:** `repolish <path>` exits 0 (no crash) on all 3 real repos.

## Acceptance rule
E1, E2, E3 all pass on a fresh run.

## Non-goals (v0)
Demo-GIF recording (follow-up) · any network/LLM calls (stays offline & deterministic)
· web UI · editing the repo's real README in place · publishing/pushing anything public.

## Feasibility verdict (Check B)
Reachable. All deterministic (manifest parsing + pattern library) — no model needed.
**Ceiling note:** honesty recall is capped by the pattern library (it catches *known*
overclaim shapes, not novel semantic lies); the lever that raises that ceiling is an
optional LLM semantic pass — a deliberate non-goal for v0. README *taste/quality* is
**not** a metric here (a taste call, not a number).
