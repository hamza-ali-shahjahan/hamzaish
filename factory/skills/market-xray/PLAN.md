# Plan: market-xray build (Phase 2+3 of the spec at ./SPEC.md, v2.24.4)

> Status: awaiting operator review. Approval starts implementation at T1.
> Location note: the /plan command defaults to `tasks/plan.md` in a product repo;
> for factory capabilities the plan lives beside its spec (house pattern from SPEC.md).

## Components & dependency graph

```
[A] Harvester core (pure parsers, caps, provenance, robots, author-strip)
        │  fixtures: SYNTHETIC only — hand-written fake pages/reviews, never real
        │  harvested text (the public repo must not redistribute; spec §Boundaries)
        ▼
[B] Harvester CLI (fetch orchestration, per-domain delay, on-disk layout:
    corpus/ · sources.md manifest · runs.md log) ──► [B2] .gitignore entry
        │                                            (products/*/research/corpus/ —
        │                                             extends the existing
        ▼                                             meta/research/ precedent)
[C] brain/ingest.ts extension — index products/<slug>/research/*.md + corpus/*.md
    (today ingest only reads config, listed docs, and decisions/; verified L202-223)
        │
        ▼
[D] SKILL.md orchestration (5 stages, 2 consent gates, citation-or-SPECULATION
    contract, validation-ledger handoff) ──► [D2] competitor-research SKILL.md
    upgraded to ALSO emit competitors.csv beside its compounding competitors.md
        │
        ▼
[E] Citation-gate eval (meta/evals/skills/market-xray/, coverage 9→10, ratchet)
        │
        ▼
[F] Dogfood: patently (products/copyright) → hypothesis + interview script +
    v2.25.0 changelog entry + retro (grounded in the run's traces)
```

Parallelizable: D can be drafted alongside A/B (disjoint files). E depends on A's
types + fixtures. F is strictly last. B2/C ride with B.

## Build order & checkpoints

| Checkpoint | After | Gate |
|---|---|---|
| CP1 | T1 | `bun test ./scripts` green — all parsers fixture-proven, zero network in tests |
| CP2 | T2 | operator inspects a real capped mini-harvest (2 docs/source) + its provenance manifest |
| CP3 | T3+T4 | full guard battery + `bun run eval --no-llm` + `check-evals` (10 covered) in a clean worktree |
| CP4 | T5 | spec Success Criteria 4–6 met; operator sign-off; ship PR as v2.25.0 with retro |

## Risks & mitigations

- **Endpoint shape drift** (EDGAR/iTunes/Reddit/HN respond differently than fixtures) →
  per-source graceful skip with a LOUD note in runs.md; fixtures pin the parser contract.
- **Reddit rate-limiting** → ≥1s/domain delay, honest UA, caps, skip-on-429 recorded.
- **JS-heavy competitor sites come back thin** → accept the v1 gap, record it in
  runs.md; the dogfood decides the keyless-Jina open question with real friction data.
- **Fixture copyright** → synthetic fixtures only; a reviewer can verify no fixture
  text matches any real site.
- **Eval flakiness** → the gate's math (citation rate, speculation block) runs on
  deterministic string fixtures; no model call inside the check.
- **patently's market may live on G2/Capterra (no API)** → the hypothesis must name
  that blind spot explicitly (spec Open Questions), not paper over it.

## Verification per task

See TASKS.md — every task carries acceptance criteria and an executable verify step;
nothing advances on "looks done."
