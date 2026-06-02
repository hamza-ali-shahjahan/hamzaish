# Phase D — Eval Harness · Plan

**Status**: planned, not built. Approved as the next 10x bet (2026-06-02). Build sprint will start after Muakkil's buildathon retro closes Phase B.

**Why this is 10x, restated**: Hamzaish has skills, agents, and a brain. None of them have an automated "did this actually work?" check. Today, "test pass" means "Claude said it worked" — which means agent regressions go undetected, skills drift, and we can't bet on which skills carry weight. The eval harness changes that. It's also the foundation for everything downstream: vector embeddings (Phase C) need an eval bench to prove they help; `/scaffold` (Phase E) needs evals to know if scaffolded products start from a sane state; the dashboard (Phase F) needs evals to measure agent quality over time.

## Design principles

1. **Lightweight first.** A working tiny harness ships before a comprehensive one. 6-9 cases beats 100 cases that never landed.
2. **Cases live next to what they test.** `meta/evals/skills/<skill>/cases/*.yaml` and `meta/evals/agents/<stage>/<agent>/cases/*.yaml`. Move-with-the-tested-thing principle.
3. **Two check modes**: deterministic (file existence, regex match, JSON-schema validation) and **LLM-as-judge** (Claude grades against a rubric). Most cases use both.
4. **Idempotent runner.** `bun meta/evals/run.ts` runs everything; `--skill <name>` or `--agent <name>` scopes. Re-runs are cheap.
5. **Reports as markdown + JSON.** Human-readable in `meta/evals/runs/YYYY-MM-DDTHH-MM-SS.md`. Machine-readable JSON for trending later.
6. **Skip on missing dependencies.** If a case needs an API key the operator doesn't have, skip with a clear note — don't fail.
7. **Regressions block, new failures explain.** A previously-passing case failing = red. A new case failing = yellow with details, doesn't break the gate.

## Case file format (proposal)

```yaml
# meta/evals/skills/scaffold/cases/saas-idea-stage.yaml
name: scaffold-saas-idea-stage
skill: scaffold
description: Scaffolding a SaaS idea at idea-stage produces a viable starting point without premature build code.

inputs:
  args: '"todo-app" "task manager with deadlines and reminders"'
  preconditions:
    cwd: "/tmp/hamzaish-eval-sandbox"
    fresh: true   # runner creates fresh dir per case

expected:
  must_exist:
    - "{out}/products/todo-app/product.config.json"
    - "{out}/products/todo-app/README.md"
    - "{out}/products/todo-app/scope.md"
    - "{out}/products/todo-app/status.md"
  must_not_exist:
    - "{out}/.env"             # secrets discipline
    - "{out}/products/todo-app/src/"  # no premature build code at idea stage

  output_must_match:
    - regex: 'stage["\s:]+["]?idea'
      msg: "Stage should be 'idea' when scaffolding from a one-liner"
    - regex: 'status["\s:]+["]?slot_reserved|active'

  schema_check:
    file: "{out}/products/todo-app/product.config.json"
    must_have_keys: [slug, name, one_liner, stage, status, created]

  judge_prompt: |
    Read products/todo-app/. Did the scaffolding produce a viable
    idea-stage starting point? Specifically:
    - Is the one-liner specific (names a user + their job)?
    - Does scope.md include both what-it-does AND what-it-deliberately-doesn't?
    - Is the discipline (validate before build) respected — no app code yet?
    Answer YES if all three are true; NO with reasons otherwise.

  judge_must_answer: YES

cost_estimate: low   # one Claude call for the skill, one for the judge
```

## Runner shape

```ts
// meta/evals/run.ts (sketch)
//
// 1. Parse args: --skill <name> | --agent <stage>/<name> | --all
// 2. Discover case files matching the filter
// 3. For each case:
//    a. Set up sandbox if requested (fresh tmpdir, .git init if needed)
//    b. Invoke the skill/agent (shell out to Claude with the skill prompt + inputs)
//    c. Run deterministic checks (file existence, regex, schema)
//    d. If judge_prompt present, call Claude with the rubric
//    e. Score: pass / fail / skip (with reason)
// 4. Write markdown report + JSON
// 5. Exit code: 0 if no regressions, 1 if any case that was passing-last-run is now failing
```

## First three skills to evaluate (smallest viable seed)

Pick skills that are **simple-to-invoke** and **important enough that regressions would hurt**:

1. **`/ideate`** — produces a list of product ideas grounded in a stated need. Easy to test: given a prompt, does it produce ≥5 distinct ideas, each with a target user and problem statement?
2. **`/validate <idea>`** — supposed to surface disconfirming evidence. Tests: given an idea with deliberately weak validation, does it actually flag what's missing? Given a strong validation, does it accept it?
3. **`/brain-ask "<query>"`** — retrieval. Tests: given a known fact in a known file, does the right file rank top-3?

Three skills × 2-3 cases each = ~9 cases. Manageable for v1.

## What's explicitly OUT for v1

- Agent-level evals (hold for v2 once skill evals prove the harness)
- Trending dashboards / charts (markdown report is enough until pain is felt)
- Multi-model evals (test against multiple Claude versions) — only when migration looms
- Automated CI gating — local-run only; CI integration if Hamzaish goes public

## Layout

```
meta/evals/
├── PLAN.md                          # this file
├── README.md                         # how to run / contribute cases
├── run.ts                            # Bun runner
├── lib/                              # helpers (judge invocation, sandbox setup, etc.)
├── skills/
│   ├── ideate/cases/*.yaml
│   ├── validate/cases/*.yaml
│   └── brain-ask/cases/*.yaml
├── agents/                           # v2+
└── runs/
    └── YYYY-MM-DDTHH-MM-SS.md       # per-run report
```

## Effort estimate

- Runner skeleton + case loader + report writer: **2-3h**
- Deterministic check primitives (regex, file-exists, schema): **1h**
- LLM-judge wiring (Anthropic API call with rubric): **1-2h**
- First 9 cases authored: **2h**
- First end-to-end run + debugging: **1-2h**

**Total: 7-10h of focused work.** One real sprint.

## Open questions before build

1. **Sandbox isolation** — do we want each case to run in a fresh tmpdir, or shared? Recommend fresh tmpdir so cases don't leak state.
2. **Cost** — running 9 cases × (skill call + judge call) ≈ 18 Claude calls per full run. At Sonnet 4.6 pricing for ~2k token responses: ~$0.40 per full run. Cheap enough to run on every change.
3. **Judge model** — Sonnet 4.6 or Haiku for the judge? Haiku is 5× cheaper and probably sufficient for "did this output meet the rubric?" semantic checks. Default Haiku, escalate to Sonnet for edge cases.
4. **First-run baseline** — should we capture "first-time pass list" and use that as the regression floor? Recommend yes — first run establishes the floor, future runs alarm on regressions only.

## Triggers to revisit this plan

- A skill regresses in production and we didn't catch it → confirms eval harness was load-bearing
- We add a new skill and don't write an eval for it → that's the debt rule. Capture in `meta/changelog.md`, write the eval before next skill.
- Cost-per-run exceeds $1 or run-time exceeds 5 minutes → re-scope to cheaper checks, fewer judge calls, or parallelize.

## Next step (when build sprint starts)

Approval gate: I'll write the runner skeleton + 1 case end-to-end first, run it, share the report. If the shape feels right, expand to 9 cases. If the shape is wrong, fix it before scaling.
