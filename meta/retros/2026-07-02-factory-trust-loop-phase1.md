# 2026-07-02 — Factory · Trust-loop phase 1 shipped (eval ratchet + typed handoffs + enforced disciplines)

> The full-factory audit's Phase 1 landed in one sprint: eval coverage is now a CI ratchet, the six core agent handoffs are typed contracts, and the retro/decision disciplines have mechanical triggers.

## Context

- Goal: convert the top "declared-but-not-wired" findings of the 2026-07-02 full-factory audit into enforced machinery — the "close the trust loop" phase.
- Time budget: one working session.
- Stakes: the audit's core diagnosis was that selection (an honest judge) is the factory's missing organ, and that the retro/decision disciplines were running on good intentions (1 retro, 1 decision-log entry for the year).
- Starting state: v2.0.0; eval cases existed for 3 skills; 0 handoff contracts applied; no coverage or retro guards.

## Timeline (what actually happened)

- Read the eval harness first (README/checks/cases) — its own rules (honest-green floors, LLM cost ceiling, agent-blind) reshaped the plan before any code was written.
- Built `scripts/check-evals.ts` as a **ratchet** (grandfather list + regression check + new-entity block), not a big-bang gate.
- Authored 2 behavioral eval cases (problem-sharpener, devils-advocate) with deterministic template floors + judge gates.
- Applied `agent-handoff-contracts.md` to 6 chains (11 agent SKILL.mds): problem-sharpener→customer-discovery→interview-synthesizer, architect→builder, keyword-researcher→seo-strategist, pricing-strategist→pricing-optimizer, brand-story-builder→landing-page-copywriter.
- Built `scripts/check-retro.ts` (changelog entries ≥ 2026-07-02 need a retro link or explicit skip line).
- Added the decision-capture question to the end-of-session checklist and `/checkpoint`.
- Wired both guards into CI + package.json; bumped to v2.1.0.

## What worked

- **Reading the harness's own constitution before extending it** — the cost-ceiling rule and honest-green rule killed the naive "backfill 22 LLM cases" plan and produced the ratchet design instead.
- **Ratchet over big-bang** — 72 grandfathered entities are *visible debt* in `coverage.json` instead of either a red CI or 72 aspirational cases.
- **The contract playbook already existed** — applying `agent-handoff-contracts.md` was transcription, not invention. Write-once-apply-later works when the write is good.

## What didn't

- **An audit subagent misreported the 3 engineering agents as lacking frontmatter** — they have it. Cost: a planned fix that wasn't needed. Reinforces: verify before editing, even against your own audit.

## Decisions made

- → `brain/decision-log/2026-07-02-eval-coverage-ratchet.md` (ratchet vs. big-bang enforcement)

## Updates to Hamzaish itself

- **New**: `scripts/check-evals.ts`, `scripts/check-retro.ts`, `meta/evals/coverage.json`, 2 eval cases (`meta/evals/skills/{problem-sharpener,devils-advocate}/cases/`)
- **Updated**: 11 agent SKILL.mds (contract blocks), `meta/factory-improving-factory.md`, `factory/commands/checkpoint.md`, `.github/workflows/ci.yml`, `package.json`, `docs/versioning.md`
- **Bumped Hamzaish version?** → yes, v2.1.0 (`meta/changelog.md`)

## Surprises

- The eval harness was better-designed than the audit inventory suggested — the constraint that reshaped the whole phase (LLM cost ceiling at 4m55s/run) was documented inside it, not discovered by running it.

## Open questions / things to revisit

- **Grandfathered debt paydown order** — next candidates: scope-guardian, security-reviewer, interview-synthesizer (forced-verdict agents are the cheapest to floor deterministically). Revisit at the next `/learn-loop` boundary.
- **Should `check-evals` also enforce coverage % milestones?** (e.g., fail below 20% by 2026-Q4) — revisit when coverage passes 15%, decide if the ratchet needs a motor.

## Next

→ **Verify the two new LLM cases honest-green with a live `bun meta/evals/run.ts --skill <name>` run, then start Phase 2 (wire model-policy + finish `factory/runtime/loop.ts`).**
