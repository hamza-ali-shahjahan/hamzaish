# Cost-to-Outcome & Model-Independence

## The framework in one paragraph

When software has real marginal cost — every token is money — the job isn't "use the best model," it's **optimize the cost-to-outcome frontier**: the right model for each task, with the context, skills, tools, and harness optimized *around* it. Two disciplines keep that safe. First, **model-independence**: your evals must keep hill-climbing even if any one model is removed — so the harness, memory, context, and skills live *outside* the model, and no skill is allowed to depend on a single model to pass. Second, **route on measured capability-per-dollar, not a hand-maintained table**: pick the cheapest model that clears the skill's eval bar, and escalate only the failures. Said the way the metaharness work we studied says it: *the model is replaceable; the harness is the product.*

## The two control criteria

1. **No skill depends on one model.** Every covered skill's eval should pass on more than one tier. If a skill only works on Opus, that's a model-dependence smell — the eval is measuring the model, not the skill. Surfaced by the cross-model eval sweep (`bun run eval --models …`) and `scripts/check-model-independence.ts` (a ratchet, like `check-evals` — it reports, it doesn't silently pass). This is the operational form of *"evals keep hill-climbing even when a model is removed."*

2. **Route on evidence, not vibes.** The tier a skill runs on should come from a measured **capability-per-dollar leaderboard** (`meta/evals/leaderboard.json`), not a guess. Cheaper-per-token ≠ cheaper-per-outcome — a model you retry twice cost more than the frontier model on the first try. Measure **cost per accepted output** (see `hermes-and-fallback-models.md` §"The 'cost per useful output' trap"), let the cheap tier attempt first, verify, and escalate only what fails.

## Why this is already our architecture

Hamzaish is a four-layer agent OS — brain (memory) / factory (harness + skills) / products / meta — on the Claude Agent SDK. The harness, memory, context, and skills already live outside the model as plain markdown + Bun/TS. That *is* the externalization the frontier now demands; the leverage is closing the loops on top of it. The tier router (`factory/runtime/model-policy.ts`) already resolves a model per spawned agent and escalates high-stakes work up — but it was a static hand table. The eval harness (`meta/evals/`) already runs daily — but pinned one model per case. This doctrine turns both into measured, model-independent loops.

## The honest boundary — we do not train models

The frontier labs close this loop by training a model *inside* a product RL environment. **We don't, and shouldn't** — Hamzaish is an agent OS, not a training lab. Our version of an "RLE" optimizes the **harness, router, and skill selection** against real outcomes — the eval result, the end-to-end pass, the customer-valued event — and never touches model weights. Same hill, different climber: we change the system *around* the model, not the model.

## In this factory

- **Model routing:** `factory/model-policy.md` (policy) + `factory/runtime/model-policy.ts` (resolver — spawn-boundary only; skills run in-context on the borrowed session model).
- **Model-independence bench:** `bun run eval --models opus,sonnet,haiku[,hermes]` → `meta/evals/leaderboard.json`; guard `scripts/check-model-independence.ts`.
- **Cheap→frontier cascade:** the verdict router in `factory/runtime/loop.ts` — a `FAIL_BUILDABLE`/`UNCERTAIN` verdict escalates the failing attempt to a higher tier instead of retrying in place.
- **Reward signal:** product-valued outcomes wired into telemetry feed the `/goal` hill-climb (`factory/commands/goal.md`).

## Source for follow-up

- Satya Nadella, "Hill-Climbing MAI Models for GitHub Copilot and Excel" — microsoft.ai/news — the cost-to-outcome-frontier and model-independence framing.
- `brain/knowledge/2026-07-07-metaharness-factory-for-harnesses.md` — the cost-predicting router, the cheap→frontier cascade, and capability-per-dollar as a first-class metric.
- `factory/playbooks/ai-native-2026/eval-driven-development.md` (§"Eval across multiple models") and `hermes-and-fallback-models.md` (§"The 'cost per useful output' trap").
