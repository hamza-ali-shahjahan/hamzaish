# meta/evals/ — the honest judge (Movement 1 / Selection)

The eval harness: an **agent-blind, automated verdict** on whether the factory's skills actually do what they claim. This is Selection from `meta/SELF-EVOLUTION.md` — the missing third ingredient of self-evolution. Plan + design rationale: [`PLAN.md`](PLAN.md).

## Run it

```bash
bun run eval                       # everything (incl. LLM cases via claude -p)
bun run eval --no-llm              # deterministic cases only — fast, free, no claude calls
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

**Regression floor**: `baseline.json` records the PASS set. A previously-passing case that goes `FAIL_BUILDABLE` → exit 1 (regressions block). A baseline-PASS case going `UNCERTAIN`/`GAP`/`SKIP` is a **floor warning** — printed loudly, exit 0 (LLM cases are nondeterministic; a judge hiccup must never read as a regression). A *new* case failing → reported, exit 0 (new failures explain). LLM cases get one automatic retry on a non-PASS first attempt. Reports land in `runs/` as markdown + JSON.

## The LLM judge — a gate, never an oracle

`lib/judge.ts`. Runs **only after every deterministic check passes**, via `claude -p --model haiku` (no API key, no deps; missing `claude` binary → SKIP). It grades the SUT's output against the case's named criteria and returns per-criterion `PASS`/`FAIL`/`UNSURE` with evidence:

- any criterion `FAIL` → case is `FAIL_BUILDABLE`, naming the criterion
- any criterion `UNSURE` (or judge unreachable/unparseable) → case is `UNCERTAIN`
- all green → the case keeps whatever the deterministic checks decided

The contract is enforced by the return type: **there is no value the judge can return that turns a failing case green.** A case whose only check is `llm_judge` is rejected as `GAP` at load time — the judge gates a deterministic floor, it never replaces one.

**Cost ceiling**: a full 9-case run ≈ 6 headless SUT calls (Sonnet) + ≤6 judge calls (Haiku), riding the subscription. Re-scope trigger (from PLAN.md): > $1/run or > 5 min wall time. Measured 2026-06-13: **4m55s** (concurrency 3, ideate cases constrained to exactly 5 ideas) — at the ceiling, so new LLM cases must pay for themselves or replace one. `--no-llm` is the free gate for quick checks (≈1s).

## The agent-blind rule (non-negotiable)

> The thing being judged must never see or change its test.

Enforced, not advised: `cases/` and `runs/` are **excluded from the brain index** (`brain/ingest.ts` SKIP_DIRS), so `/brain-ask` cannot retrieve its own exam papers; no skill may reference `meta/evals/`; the judge prompt is built inside `lib/judge.ts` from the case's frozen criteria — the SUT never sees it, and the judge sees only the SUT's *output*, never its prompt. Trust comes from separation, not re-checking.

**Known limitation** (documented, not hidden): `claude -p` SUTs run read-only (`--allowedTools "Read Glob Grep"`) in the repo cwd, so one *could* wander into `meta/evals/` via Read — full sandboxing would break their legitimate need to read `products/` and playbooks. The SUT prompt never contains expectations or rubric. Revisit trigger: any evidence of test-peeking in a run transcript.

## Layout

```
meta/evals/
├── PLAN.md            # design + the four absorbed ideas (verdict, blindness, criterion-or-GAP, critic-as-gate)
├── run.ts             # the runner (zero deps; Bun.YAML)
├── lib/checks.ts      # deterministic check primitives
├── lib/judge.ts       # the LLM judge — a gate, never an oracle (claude -p, Haiku)
├── baseline.json      # the regression floor (committed)
├── skills/<skill>/cases/*.yaml
└── runs/              # per-run reports (md + json)
```

## Writing a case

```yaml
name: my-case
skill: brain-ask
invoke: { cmd: ["bun", "brain/ask.ts", "--json", "--limit", "5", "<query>"], timeout_ms: 15000 }
preflight: { must_exist: ["brain/brain.db"], commands: ["bun"] }   # missing → SKIP, not fail
checks:
  - { type: exit_code, equals: 0 }
  - { type: json_parse }
  - { type: top_n_contains, n: 3, any_of: ["path/to/expected.md"] }
```

LLM-skill cases invoke `claude -p` (read-only tools, stdout-only output, default timeout 240s) and add a judge gate on top of the deterministic floor:

```yaml
invoke:
  cmd: ["claude", "-p", "<prompt — never contains expectations>", "--model", "sonnet", "--allowedTools", "Read Glob Grep", "--max-turns", "30"]
checks:
  - { type: exit_code, equals: 0 }
  - { type: stdout_count_min, regex: "^## Idea", min: 5 }   # counting criterion
  - type: llm_judge                                          # gate on top, never the floor
    criteria:
      - { id: distinct_ideas, requirement: "The ideas are genuinely distinct problems, not variants of one idea" }
```

Rules: **verify the expectation against the live system before committing the case** (the floor must be honest-green, not aspirational) — and if you can't write a machine-checkable criterion, that's a `GAP` *now*, at authoring time, not a surprise later. A case with no checks is rejected as GAP by the runner.

## Debt rule (unchanged)

Adding a skill without an eval is **debt**. Pay it down before adding the next skill.
