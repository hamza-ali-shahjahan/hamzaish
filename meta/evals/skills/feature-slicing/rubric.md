# Eval rubric — feature-slicing (the provability gate)

The skill's one rule: *if you can't name the eval and the e2e test for a slice, it doesn't
get built yet.* The case hands it a small goal plus one deliberately unprovable candidate
("users feel more confident") and requires: every selected slice carries a named Eval and
E2E line, and the unprovable candidate is dropped or deferred — not smuggled through.

LLM case (runs `claude -p`; SKIPs under `--no-llm`, so CI's fast lane doesn't pay for it —
the full local `bun run eval` does).

> **Verification status:** authored 2026-07-22; structure/checks verified, but the live run
> was blocked by an expired CLI OAuth session (`claude login`, then
> `bun meta/evals/run.ts --skill feature-slicing`). NOT in baseline.json until it has
> passed live once — an eval that has never been green is not yet a floor.

## Assertions

| # | Assertion | Pass |
|---|---|---|
| A1 | ≥2 selected slices, each with `**Eval:**` and `**E2E:**` lines | stdout counts |
| A2 | The unprovable candidate is explicitly dropped/deferred with a reason | stdout match |
