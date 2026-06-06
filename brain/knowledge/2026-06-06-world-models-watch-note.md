---
name: world-models-watch-note
description: Why world models (LeCun/JEPA, NVIDIA Cosmos 3, World Labs Marble) are NOT applied to Hamzaish now — captured as a watch-and-trigger, not a build. The architecture rhymes with our self-evolution arc; the domain doesn't fit any current product.
type: knowledge
source: chat 2026-06-06 (operator dropped a "World Models" taxonomy infographic, asked how to leverage in Hamzaish)
---

# World models — watch note, not a build (decided 2026-06-06)

## The three frontier bets (verified June 2026)

| Camp | Bet | Flagship | Source |
|---|---|---|---|
| **LeCun / AMI Labs** | Predict in *latent space*; plan over abstractions; rendering pixels wastes capacity. Anti-LLM. $1.03B seed @ ~$3.5B pre. | V-JEPA 2 | [TechCrunch](https://techcrunch.com/2026/03/09/yann-lecuns-ami-labs-raises-1-03-billion-to-build-world-models/) |
| **Jim Fan / NVIDIA** | Generative video as the simulator; omnimodal world+action model. **Open weights.** | Cosmos 3 (two-tower Mixture-of-Transformers) | [NVIDIA](https://nvidianews.nvidia.com/news/nvidia-launches-cosmos-3-the-open-frontier-foundation-model-for-physical-ai) · [arXiv 2606.02800](https://arxiv.org/abs/2606.02800) |
| **Fei-Fei Li / World Labs** | Spatial intelligence; explicit, checkable 3D geometry. $1.23B raised. **API.** | Marble (splats + collision meshes) | [StartupHub](https://www.startuphub.ai/ai-news/ai-figures/2026/figure-fei-fei-li-company-financial-breakdown-2026-06-03) |

## The decision

**Do NOT apply world models to Hamzaish now.** Reasons, in order of weight:

1. **Zero benefit to existing products.** None of the 14 portfolio products touch 3D / spatial / robotics / video / simulation. World models are infrastructure for exactly those domains. The direct product benefit today is zero, not small.
2. **They're an *atoms* play; Hamzaish is a *bits* play.** Text/agent orchestration for software startups. Training or hosting a world model is a $1B frontier bet at the wrong scale and wrong domain for a solo bits-factory. Their own benchmarks still call current world models brittle.
3. **The only real transfer is conceptual, and it's deferred.** The world-model *architecture* — operate on a compressed abstraction, predict the consequence of an action, plan/select over the prediction — is the same shape as our self-evolution arc: **spec = latent space, eval harness = the predictor, headless loop = the planner, `operating-principles.md` = frozen reward.** That validates the spine we're already building; it does not justify new work. The harness is worth building because *selection is the missing evolution ingredient* — complete on its own merits, with or without this analogy. (Disanalogy, kept honest: their latent space is learned high-dim vectors; ours is human-authored symbolic specs. Shared design principle, different mechanism.)

## Revisit trigger

Re-open this **only if** a portfolio product enters a domain world models serve (3D/gaming/spatial/sim/video). At that point Cosmos 3 (open weights) or Marble (API) become buildable infrastructure to wrap — a product-layer decision, behind normal validation-before-build discipline. World-model *exploration* itself happens in dedicated separate sessions, never grafted into the factory core.

See `meta/SELF-EVOLUTION.md` (the arc this rhymes with) and `brain/knowledge/2026-06-04-interactive-vs-headless-self-evolving.md` (the runtime that would "plan over" the harness).
