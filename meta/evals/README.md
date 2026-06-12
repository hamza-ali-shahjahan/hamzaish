# meta/evals/ — the honest judge (Movement 1 / Selection)

The eval harness: an **agent-blind, automated verdict** on whether the factory's skills actually do what they claim. This is Selection from `meta/SELF-EVOLUTION.md` — the missing third ingredient of self-evolution. Plan + design rationale: [`PLAN.md`](PLAN.md).

## Run it

```bash
bun run eval                       # everything
bun meta/evals/run.ts --skill brain-ask
bun meta/evals/run.ts --update-baseline   # after intentional changes
```

Each case gets a **four-outcome verdict**:

| Verdict | Meaning | Human needed? |
|---|---|---|
| `PASS` | all executable criteria green | no |
| `FAIL_BUILDABLE` | a clear criterion failed — fix the output | no (fix it) |
| `GAP` | the criterion couldn't be written / spec silent | yes — batched, never guessed |
| `UNCERTAIN` | timeout / judge-needed — can't classify | yes — the only real-time pull |
| `SKIP` | environment missing (non-verdict, never red) | no |

**Regression floor**: `baseline.json` records the PASS set. A previously-passing case that stops passing → exit 1 (regressions block). A *new* case failing → reported, exit 0 (new failures explain). Reports land in `runs/` as markdown + JSON.

## The agent-blind rule (non-negotiable)

> The thing being judged must never see or change its test.

Enforced, not advised: `cases/` and `runs/` are **excluded from the brain index** (`brain/ingest.ts` SKIP_DIRS), so `/brain-ask` cannot retrieve its own exam papers; no skill may reference `meta/evals/`; the LLM judge (when it lands) is a **gate, not an oracle** — it can push a case to `UNCERTAIN`, it can never auto-`PASS`. Trust comes from separation, not re-checking.

## Layout

```
meta/evals/
├── PLAN.md            # design + the four absorbed ideas (verdict, blindness, criterion-or-GAP, critic-as-gate)
├── run.ts             # the runner (zero deps; Bun.YAML)
├── lib/checks.ts      # deterministic check primitives + the stubbed LLM-judge seam
├── baseline.json      # the regression floor (committed)
├── skills/<skill>/cases/*.yaml
└── runs/              # per-run reports (md + json)
```

## Writing a case

```yaml
name: my-case
skill: brain-ask
invoke: { cmd: ["bun", "brain/ask.ts", "--json", "--limit", "5", "<query>"], timeout_ms: 15000 }
preflight: { must_exist: ["brain/brain.db"] }   # missing → SKIP, not fail
checks:
  - { type: exit_code, equals: 0 }
  - { type: json_parse }
  - { type: top_n_contains, n: 3, any_of: ["path/to/expected.md"] }
```

Rules: **verify the expectation against the live system before committing the case** (the floor must be honest-green, not aspirational) — and if you can't write a machine-checkable criterion, that's a `GAP` *now*, at authoring time, not a surprise later. A case with no checks is rejected as GAP by the runner.

## Debt rule (unchanged)

Adding a skill without an eval is **debt**. Pay it down before adding the next skill.
