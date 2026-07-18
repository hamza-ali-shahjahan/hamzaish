# Eval rubric — /factory-launch (control-plane setup)

The skill's promise: after it runs, the factory has a bounded, auditable control plane —
orders files with load-bearing sections, and every registered product carrying a valid
gates block. Both halves are deterministic, so the eval is deterministic (no LLM judge).

## Assertions

| # | Assertion | Method | Pass |
|---|---|---|---|
| A1 | Templates carry their load-bearing sections; setup + autonomy-loop stay wired to them | `bun test ./scripts/control-plane-templates.test.ts` | exit 0 |
| A2 | Gate evaluation logic behaves (passed/overdue/next/validate) | `bun scripts/check-gates.ts --self-test` | exit 0 |

## What is NOT asserted here (and why)

- The operator's `.local` files being *filled in* — that's the operator's precommitment,
  checked live by `bun run check-gates` on their machine, not CI-checkable (the files are
  gitignored by design).
- Spend-cap enforcement — covered by `scripts/lib/spend.test.ts` under `bun run test`.

## The loop

A2 failing after a gates-logic change = the kill-discipline arithmetic broke — fix before
ship. A1 failing = a template lost a section the harness depends on (autonomy-loop's
prompt wiring, the heartbeat checklist) — restore it or update the contract consciously.
