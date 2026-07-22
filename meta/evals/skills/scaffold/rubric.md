# Eval rubric — scaffold (the starter's birth certificate)

The skill's promise: a scaffolded product installs and works from zero. The heavyweight
assertion (install + typecheck + build) runs as its own CI step (`bun run check-starter`,
upgraded v2.19.0); THIS case keeps the cheap install half in the eval harness so a
regression is caught by `bun run eval` locally too, and so coverage reflects reality —
the scaffold skill was uncovered on paper while being the best-guarded artifact in the repo.

## Assertions

| # | Assertion | Method | Pass |
|---|---|---|---|
| A1 | Fresh scaffold's dependencies all resolve | `check-starter --install-only` | exit 0 |

Full gate (typecheck + build): the `check-starter` CI step — not duplicated here to keep
eval runs fast. Registry flakes: a single npm 404 is a retry, not a diagnosis (2026-07-19).
