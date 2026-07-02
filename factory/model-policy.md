# Model Policy — right model for the right job, automatically

> **Status: Phase 2 — wired at the spawn boundary (2026-07-02).** Every spawnable agent
> now carries its tier as `model_tier:` frontmatter in its own SKILL.md (the machine-readable
> source of truth, kept next to the agent it governs); this file is the policy's rationale
> and the tier table's human view. Resolution code: `factory/runtime/model-policy.ts`
> (`modelForAgent()` + stakes `escalate()`, tested in `model-policy.test.ts`) — used by the
> headless runtime, and the lookup any orchestrator/Workflow spawner makes.

The goal: you never pick a model. You say "build X," the brain routes the work to the
right agent, and that agent runs on the right model tier — strong models for hard/
irreversible work, cheap-fast models for mechanical work. This is the Lovable-style
"automatic model selection," built on native Claude Code primitives.

## The one architectural fact this depends on

Hamzaish agents are **skills** (`factory/agents/<stage>/<name>/SKILL.md`). A skill runs
*inside the current context* and borrows the session model — a `model:` line on a SKILL.md
does nothing. Models can only be pinned at the **spawn boundary**: when the orchestrator
hands work to a spawned subagent (Agent tool) or a Workflow `agent()` step. So this policy
takes effect only when work is *delegated*, never for the main conversation itself.

## The two knobs

| Knob | Current setting | Notes |
|---|---|---|
| **Cost-vs-quality bias** | **Best model unless clearly trivial** | Solo-founder bias: default to capability; drop only clearly-mechanical work to Haiku. To flip toward cost, demote borderline Sonnet→Haiku and Opus→Sonnet rows below. |
| **Main-loop / router model** | **Opus 4.8** (set via `/model`, not this file) | The router runs in the main loop; its model is whatever you `/model` to. Left on Opus deliberately — routing mistakes cascade. Revisit as a cost lever later. |

## Tiers

| Tier | Model | Use for |
|---|---|---|
| **A — Strategy/Stakes** | `opus` (Opus 4.8) | Hard reasoning, high stakes, irreversible decisions: architecture, security, pricing, adversarial review, portfolio strategy, cross-product synthesis. |
| **B — Workhorse** | `sonnet` (Sonnet 4.6) | Most build, content, and research. The default when a job is real work but not high-stakes or irreversible. |
| **C — Fast/Cheap** | `haiku` (Haiku 4.5) | Bounded judgment and mechanical work: triage, classification, aggregation, data pulls. |
| **(unverified)** | `fable` (Fable 5) | Candidate for creative/brand copy, but Fable 5's strengths and cost are **not yet verified** for this use. Keep brand work on Tier A/B until verified, then revisit. |

## Role → tier (all 31 agents)

### Tier A — Opus (13)
| Agent | Why |
|---|---|
| mvp/architect | Founding architecture; expensive to undo |
| mvp/security-reviewer | High-stakes; a miss ships a vuln |
| idea/devils-advocate | Adversarial reasoning is the whole job |
| idea/problem-sharpener | The entire build rides on the problem statement |
| launch/pricing-strategist | Pricing is high-stakes and sticky |
| launch/brand-story-builder | Creative + foundational; **Fable candidate once verified** |
| scale/pricing-optimizer | Post-PMF pricing; high stakes |
| scale/growth-loops | Strategic, compounding design |
| scale/moat-builder | Long-horizon strategic reasoning |
| scale/compliance-auditor | Regulatory; mistakes are costly |
| portfolio/portfolio-conductor | Cross-cutting prioritization |
| portfolio/cross-product-learner | Synthesis across the whole factory |
| portfolio/kill-or-double-down | Quarterly capital-allocation calls |

### Tier B — Sonnet (14)
| Agent | Why |
|---|---|
| mvp/builder | Most code gen. **Escalate to Opus for auth / payments / migrations / RLS** (Phase 2 rule) |
| mvp/metric-framework-designer | Structured, well-trodden |
| idea/idea-generator | High-volume divergent generation; evaluation (devils-advocate) carries the Opus load |
| idea/market-researcher | Research + synthesis |
| idea/competitor-mapper | Research |
| idea/customer-discovery | Planning + synthesis |
| idea/interview-synthesizer | Synthesis |
| launch/landing-page-copywriter | Copy; bump to Opus for hero/positioning if quality-bias |
| launch/seo-strategist | Structured strategy |
| launch/content-marketer | Content production |
| launch/launch-strategist | Execution planning; Opus candidate for one-shot launches |
| launch/cold-outreach | Templated outreach |
| launch/community-builder | Community ops |
| scale/retention-analyst | Analysis over known patterns |

### Tier C — Haiku (4)
| Agent | Why |
|---|---|
| mvp/scope-guardian | Bounded classification: in-scope / out-of-scope |
| scale/support-triage | Fast triage and routing |
| portfolio/telemetry-aggregator | Aggregation, no deep reasoning |
| launch/keyword-researcher | Data pulls (GSC / DataForSEO) |

### Engineering subagents (added at wiring, 2026-07-02)
| Agent | Tier | Why |
|---|---|---|
| engineering/code-reviewer | A — Opus | Review gates merges; a soft review ships a bug |
| engineering/security-auditor | A — Opus | Same class as mvp/security-reviewer |
| engineering/test-engineer | B — Sonnet | Structured test authoring |

`_orchestrator` carries no tier — it IS the main loop (whatever `/model` is set to),
never spawned.

## Phase 2 escalation rules — ACTIVE (wired 2026-07-02)

Static role→tier is the floor; **stakes beat role**, and escalation only goes UP:

- **Escalate to Opus** when the job touches: auth, payments/billing, database migrations,
  RLS/permissions, deleting data, or anything in a product's `decisions/` marked irreversible.
  Implemented: `escalate()` + `stakesFromPrompt()` in `factory/runtime/model-policy.ts` —
  callers pass `stakes: "high"` explicitly when they know; the prompt-sniffer is the
  belt-and-suspenders fallback.
- **De-escalation to Haiku** (one-line tweaks, renames, lookups, deterministic re-checks)
  stays *manual judgment* — deliberately not automated: a "trivial" auth tweak is the
  classic trap, so nothing automatic ever moves work DOWN a tier.

## How this is used (wired)

1. The orchestrator (`factory/agents/_orchestrator/SKILL.md`) identifies product → stage →
   intent → agent (as it does today).
2. **At the spawn boundary** (Agent tool / Workflow `agent()` / the headless runtime's
   `Task.agent` field): resolve the model from the agent's `model_tier:` frontmatter —
   `modelForAgent(name)` — apply stakes escalation, pass it as `model`.
3. The main-loop conversation is unaffected; only delegated work gets a pinned model.
4. Unknown agent / missing tier → Tier B default (sonnet), never a crash: the policy is
   a routing preference, not a precondition.

The tier table above and the frontmatter are kept in agreement by hand for now; if they
ever drift, **frontmatter wins** (it's what the code reads) and this table gets corrected.

## Tuning loop

This is a starting policy, not a fixed one. Log which tier ran which job and the outcome
(`meta/evals/`), and move rows between tiers as evidence comes in — factory improves the
factory. Demote a row the moment a cheaper tier clears the bar; promote one the moment a
tier visibly underperforms on real work.
