# Eval coverage: ratchet, not big-bang

**Date:** 2026-07-02
**Type:** factory guard design / cross-product

## Decision

The eval-coverage debt rule ("adding a skill without an eval is debt" — `meta/evals/README.md`) is enforced as a **ratchet**: everything existing on 2026-07-02 without a case is grandfathered by name in `meta/evals/coverage.json`; anything *new* must ship with a verified case (or a consciously-recorded grandfather reason); anything *covered* that loses its cases is a CI-blocked regression. Enforced by `scripts/check-evals.ts` in CI.

## Why

Two alternatives were rejected:

1. **Big-bang enforcement** (fail CI until all 77 agents/skills have cases) — floods CI red for weeks and pressures exactly the behavior the harness forbids: aspirational cases that were never verified honest-green against the live system.
2. **Mass backfill now** (author ~22 LLM cases in one pass) — violates the harness's own cost ceiling ("new LLM cases must pay for themselves or replace one"; the full run already measures 4m55s against a 5-minute re-scope trigger) and the honest-green rule (each case must be verified live before committing, which mass authoring skips).

The ratchet keeps the debt *visible* (72 names in a committed file, coverage % printed on every run) while making the only enforceable promise that's actually true today: **coverage never goes down, and new capability pays its eval up front.**

## Wrong if

- Grandfathered entries quietly accumulate *new* additions (people re-grandfathering to dodge the debt) — the list should only shrink.
- Coverage % is still ~6% two quarters from now — then the ratchet has no motor and needs milestone enforcement (e.g., a floor % that rises per quarter).

## Revisit trigger

At each `/learn-loop` major-cycle boundary: check coverage % moved up; when it passes 15%, decide whether to add scheduled milestone floors.
