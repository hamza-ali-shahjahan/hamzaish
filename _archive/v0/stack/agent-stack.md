# Agent Stack — How Claude Powers the Factory

## Model routing

Three Claude models, one fallback. Different tasks → different models. Cost-aware.

| Task type | Default model | Why |
|---|---|---|
| Strategic decisions, idea pressure-testing, devil's advocate, scope arbitration | **Claude Opus 4.7** (`claude-opus-4-7`) | Best judgment + reasoning. Cost worth it for rare-but-high-stakes calls. |
| Most agent work: writing copy, code review, customer interview synthesis, knowledge-base reads | **Claude Sonnet 4.6** (`claude-sonnet-4-6`) | Best price/performance. Default. |
| Bulk reads, summaries, label/classify, dashboard pulls, formatting work | **Claude Haiku 4.5** (`claude-haiku-4-5`) | Fast + cheap. Good enough for high-volume mechanical tasks. |
| Bulk reasoning where Claude is overkill (e.g. 10K-row data cleanup) | **Nous Hermes** (via OpenRouter) | Open-weights, cheap, useful as fallback for non-critical work |

## Prompt caching — ALWAYS ON for agent calls

All agent invocations use `cache_control` on the system prompt + knowledge-base files. The system prompt + relevant `agents/<agent>/SKILL.md` + relevant `knowledge-base/*.md` are pinned and reused across calls within a 5-min window.

Why: most agent calls re-read the same 3–10K tokens of context. Caching drops that to ~10% of the per-call cost.

Implementation pattern in product code:
```ts
const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  system: [
    { type: 'text', text: AGENT_SKILL_MD, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: KNOWLEDGE_BASE_CONTENT, cache_control: { type: 'ephemeral' } },
  ],
  messages: [...]
});
```

## Agent organization

Two layers of agents:

**Layer 1 — `agents/` (the brain).** Markdown SKILL.md files that I (the Claude Code session reading this factory) consult to do work. They're not deployed; they're instructions for me.

**Layer 2 — agents that ship inside products.** Each product can have its own `<product>/agents/` directory with deployable agents (built on the Claude Agent SDK) that run as part of the product's runtime. Example: an SDR agent for `linkedup`, a triage agent for `hamza-health`.

This factory's Layer 1 agents help BUILD Layer 2 agents.

## MCP servers (per product)

Default MCPs to wire up for any new product:

| MCP | Purpose | Notes |
|---|---|---|
| **filesystem** | Read/write project files | Built-in for Claude Code |
| **github** | Repo operations | When the product has a GitHub repo |
| **postgres** (via Supabase MCP) | Query the product's DB | Read-only credentials only |
| **stripe** | Customer / subscription lookups | Read-only by default; mutations require explicit user approval |
| **posthog** | Event/funnel queries | Read-only |
| **sentry** | Issue / event lookups | Already configured globally — see top-level system prompt |
| **search-console** | Keyword data | Via Google's MCP if available, else direct API |

Per-product MCP config lives in each product's `.claude/mcp.json` (gets templated by `/scaffold`).

## Claude Agent SDK — when products deploy agents

For products that ship AI agents to users (e.g. linkedup's outreach agent, ai-growth-engine's automation), use the Claude Agent SDK.

Reference patterns to copy into each product's `lib/agents/`:
- **Tool-use loop** with retry-on-rate-limit
- **Prompt caching** as default
- **Telemetry hook** that posts every agent call to PostHog with `$agent_invocation` event for observability
- **Cost meter** that tags every call with `$cost_usd_estimate` for per-product spend tracking

The factory's `agents/mvp/builder/SKILL.md` includes a checklist for setting these up correctly the first time.

## When to use which Claude surface inside the factory

| Working on... | Surface | Notes |
|---|---|---|
| The factory itself (this folder) | **Claude Code** | You are here |
| A specific product's codebase | **Claude Code, inside the product folder** | Each product has its own `CLAUDE.md` |
| Research / interview synthesis / weekly review docs | **Claude Cowork** | Better for synthesizing across files + scheduled runs |
| Quick lookup mid-flow | **Chat** | Don't context-switch unless quick |

## Cost discipline

Track monthly Claude spend in `brain/decision-log/cost-tracking.md` (updated weekly). Cap: **$200/month combined across all products and the factory itself**, until any single product hits $1K MRR. Above that cap, alarm: investigate which agent is over-calling.

Cheapest path to "agent-powered everywhere" is:
1. Prompt caching on EVERY call
2. Haiku for high-volume mechanical work
3. Hermes-via-OpenRouter for bulk reasoning that doesn't need Claude quality
4. Sonnet as the workhorse
5. Opus only for genuinely hard judgment
