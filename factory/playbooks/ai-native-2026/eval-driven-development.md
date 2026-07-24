# Eval-Driven Development for AI Products

## The framework in one paragraph

When AI is part of your product, **evals are tests for non-deterministic systems**. Without evals, you ship a prompt that "feels right" and degrades silently over time as you change context, switch models, or add features. With evals, you change confidently — every prompt edit runs against a known set of input/expected-output pairs, and you catch regressions before users do. This is the AI-product equivalent of unit tests for deterministic code, and the discipline gap between products that get it and products that don't is enormous.

## When eval-driven development applies

- Any product feature that uses an LLM call
- Particularly: agents (multi-step), structured output, classification, customer-facing copy generation

## What an eval is, concretely

An eval is a triple: **(input, expected behavior, scoring function)**.

Example for a meeting-summary tool:
```yaml
eval: "Summary should include all action items"
input: <full meeting transcript>
expected_behavior: "Output contains every action item with a clear owner"
scoring_function: |
  llm_judge("Did this summary include all 5 action items from the transcript? 
            Score 0-1 where 1 = all included, 0 = none.")
```

Different evals scored differently:
- **Exact match**: classifications, structured extraction → string compare
- **LLM-judge**: subjective quality → Claude judging Claude's output
- **Heuristic**: length, structure, presence of keywords → regex / parse
- **Code**: runs the output as code, checks behavior → for code-gen features
- **Human spot-check**: 10% sampled → manual review

## The eval pyramid

```
       /\
      /  \   Manual review (10% of outputs sampled, human eyes)
     /----\
    /      \  LLM-judge evals (broad coverage, automated)
   /--------\
  /          \  Heuristic evals (cheap, fast, catch obvious regressions)
 /------------\
/______________\  Exact-match evals (where applicable — classifications etc.)
```

Most eval suites should be heavy at the bottom (cheap, automated) and lighter at the top.

## Setting up evals for a new AI feature

### Step 1: Collect a "golden dataset"
20-100 (input, ideal_output) pairs. Sources:
- Real user inputs from production logs (PII scrubbed)
- Synthetic edge cases you generate
- Cases where the AI previously failed (the most valuable!)

Store in `<product>/evals/dataset.jsonl`.

### Step 2: Pick scoring functions
For each eval, decide:
- Exact match? Heuristic? LLM-judge? Human?
- What threshold counts as "pass"?

### Step 3: Run baseline
With your current prompt, run all evals. Record baseline pass rate.

### Step 4: Run on every prompt change
Before merging any prompt change, run evals. If pass rate drops by > 5%, investigate.

### Step 5: Add to CI
Every prompt change → CI runs evals → fail build on regression.

## Tools

| Tool | Purpose | Cost |
|---|---|---|
| **PromptFoo** | OSS eval framework, lots of integrations | free |
| **Braintrust** | Hosted evals + observability | paid, generous free tier |
| **Helicone** | LLM observability + evals | paid, free tier |
| **DIY in code** | Just write tests that hit your LLM endpoint | free |

For most factory products, start with DIY in code. Move to PromptFoo or Braintrust when you have > 5 eval suites.

## Patterns that work

### Eval at the boundary of LLM and code
Don't eval intermediate prompts; eval the final user-facing output.

### Include "negative" evals
Things the model should NOT do. ("Should never recommend a competitor.")

### Track eval pass rate over time
Trend matters more than absolute. If pass rate drops from 92% to 87% over a quarter, something's drifting.

### Eval across multiple models
Run the same eval suite against Claude Sonnet, Opus, Haiku, and Hermes. The relative ranking informs model choice.

### Eval at different temperatures
If you're using temperature > 0, run each eval 3-5 times and check variance.

## Anti-patterns

- **Treating evals as a one-time thing.** Evals need to be CI-integrated and run on every prompt change.
- **Scoring with the same model that generated the output.** Self-judging tilts positive. Use a different model as judge.
- **"Looks good to me" is not an eval.** It must be reproducible.
- **Evals with no thresholds.** Without a pass/fail bar, the eval is just observation.
- **Adding evals only when something breaks.** Add evals proactively for each new capability.

## In this factory

Each product with AI features should have:
- `<product>/evals/dataset.jsonl` — the golden dataset
- `<product>/evals/run.ts` — the runner
- `<product>/evals/README.md` — what's tested, how to run, what to do on regression
- CI step that runs evals on every PR touching prompts

The `agents/mvp/builder/` agent enforces this — any new AI feature gets an eval suite as part of the build.

**The product RLE (the reward channel).** A product's eval suite + its usage tracking are the *reward environment* for that product: the customer-valued outcome — an executed eval pass, an end-to-end pass, an `activated` / `key_action_performed` event — is logged with `bun run reward log --signal <eval|e2e|activation|key_action> --outcome pass|fail --source <product>`. That reward ledger (`meta/telemetry/reward.local.jsonl`) is the one axis that unifies agent-evals and product metrics, and it's what a hill-climb optimizes against. This is the RLE analog Hamzaish *can* run: it optimizes the harness / router / skill selection against real outcomes, never model weights. See `factory/playbooks/ai-native-2026/cost-to-outcome-and-model-independence.md`.

## Source for follow-up

- Hamel Husain's eval essays (very practical) — eugeneyan.com
- PromptFoo docs: promptfoo.dev
- Anthropic's evaluation best practices in docs.anthropic.com
- Braintrust blog and tutorials
