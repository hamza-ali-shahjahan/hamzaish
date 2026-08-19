# Eval rubric — market-xray (the citation gate)

The capability's trust rule, held by the harness: **synthesis must cite harvested
corpus files for ≥90% of claims; everything else lives under a visible
"⚠ SPECULATION" heading; a citation to a nonexistent file fails harder than none.**
(SPEC: `factory/skills/market-xray/SPEC.md` — the rule that separates
evidence-grounded research from confident-sounding guessing.)

Both cases are **deterministic** — they invoke the real gate
(`bun scripts/xray-harvest.ts --check-citations … --corpus …`) over synthetic
fixtures; no model, no network, no flake. The same command is what the skill's
stage 4 runs on real research output, so the eval exercises the production path.

| Case | Asserts |
|---|---|
| 01-cited-synthesis-passes | a properly cited synthesis (with honest speculation section) → exit 0, `CITATION GATE: PASS` |
| 02-uncited-claims-fail | uncited claims + a broken reference → exit 1, `FAIL`, the uncited claim and broken ref named on stdout |

Fixtures under `cases/fixtures/` are synthetic (invented text) — the public repo
never redistributes harvested material, even in tests.
