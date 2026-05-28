# Hermes & Fallback Model Strategy

## The framework in one paragraph

In 2026, Claude is the right primary model for almost every quality-sensitive task — but it's not always the cheapest. **Nous Research Hermes** (open-weights, accessed via OpenRouter) is a useful fallback for bulk reasoning where Claude is overkill. The right pattern: route by task type. Claude Opus for high-judgment decisions, Claude Sonnet for default agent work, Claude Haiku for bulk mechanical tasks, Hermes for very-high-volume reasoning where quality difference is acceptable.

## What is Nous Hermes

**Nous Research** is an open-weights model lab (Teknium et al.) shipping the Hermes series — instruction-tuned variants of Llama, Mistral, and Qwen base models. As of 2026, **Hermes 4** is current; it's available via OpenRouter and various inference providers.

Strengths:
- Open weights → cheap inference via OpenRouter (typically $0.10–$0.50 per million tokens)
- Strong at structured output, JSON, tool calls
- Less aggressive RLHF — sometimes follows instructions more literally
- Good at long-form reasoning

Weaknesses:
- Smaller context window than Claude (typically 128K vs 200K-1M)
- Weaker at multi-step reasoning that requires chain-of-thought planning
- Less safety tuning — outputs more variable
- Less reliable for complex tool use

## Routing patterns

### Pattern 1: Always-Claude (default)
Use Claude for everything. Simplest, most reliable, most expensive.

When this is right: low-volume agent calls (< 10K/month), early stage, quality matters more than $50/mo difference.

### Pattern 2: Tiered routing
| Task | Model |
|---|---|
| Hard reasoning, customer-facing output, novel synthesis | Claude Opus |
| Default agent work, code generation, doc writing | Claude Sonnet |
| Classification, summarization, formatting, label tasks | Claude Haiku |
| Bulk reasoning at > 1M tokens/month | Hermes (via OpenRouter) |
| Very high-volume mechanical tasks (>10M tokens/month) | Hermes or Qwen via OpenRouter |

When this is right: portfolio of products, > 100K agent calls/month, conscious cost management.

### Pattern 3: Quality + cost router
Programmatic routing based on:
- Task complexity estimate (use Claude Haiku to classify)
- Volume budget (if monthly $-cap hit, downgrade)
- User tier (paid users get Claude; free users get Hermes)

When this is right: at scale where saving $1K/month matters and you have eng time to maintain the router.

## How to wire up OpenRouter

```ts
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const response = await client.chat.completions.create({
  model: 'nousresearch/hermes-4-405b', // example
  messages: [...],
  // Or Claude through the same router for unified billing:
  // model: 'anthropic/claude-sonnet-4.6',
});
```

OpenRouter acts as a unified billing layer — one API key, many models. Pros: easy to swap; cons: small markup vs direct API.

## When to NOT use Hermes

- **Customer-facing output where quality is the product** (chatbot responses, content generation users see)
- **Multi-step tool use** with > 3 tool calls (Hermes drift compounds)
- **Long-context tasks** (Hermes' window is smaller; truncation loses info)
- **Safety-critical** (less RLHF means more variable outputs — fine for internal, risky for customer)
- **Anything with prompt caching** (Hermes via OpenRouter doesn't cache the same way Claude does — caching savings might exceed Hermes' cheaper unit cost)

## The "cost per useful output" trap

Cheaper per token ≠ cheaper per outcome. If you have to retry Hermes 2x to get acceptable output, you spent more than Claude Sonnet would have cost on the first try.

Measure: cost per accepted output, not cost per token.

## In this factory

We default to Claude (Sonnet) for all agent work. We use Hermes only when:
- A specific product has identified a high-volume mechanical workload (e.g., classifying 100K support tickets)
- The accuracy drop is acceptable (measured against Claude baseline)
- The savings exceed $50/mo (otherwise not worth the complexity)

We document the routing decision in the product's `decisions/` folder when adopted.

## Source for follow-up

- nousresearch.com / Hermes model cards on Hugging Face
- openrouter.ai (model pricing, routing docs)
- Anthropic prompt caching docs (for understanding why caching changes the math)
