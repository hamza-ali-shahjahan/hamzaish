---
name: hamzaish-is-an-agent-os-not-a-runtime-framework
description: Mistaking Hamzaish's category — either "modernizing" the factory onto a runtime agent library (CrewAI/Mastra/LangGraph), or labeling Hamzaish a "framework" in docs as if it were one
type: anti-pattern
---

# Hamzaish is an agent OS, not a runtime agent framework

## The pattern

A session (or a well-meaning research detour) notices the 2026 agent-framework
landscape — CrewAI, Mastra, LangGraph, OpenAI Agents SDK — and concludes one of two
things: (a) "Hamzaish should be rebuilt on a *real* framework to modernize it," or
(b) "Hamzaish *is* a framework — let's say so in the README." Both come from the same
category error.

## Why we don't do it

Those libraries are **runtime loops**: code you `pip install`/`npm install` that
gives a *product* its think→call-tool→read→repeat cycle, plus memory and multi-agent
handoffs. Hamzaish is not that layer. Hamzaish's runtime loop **is the Claude Agent
SDK** (the harness behind Claude Code). On top of that runtime, Hamzaish is an
**opinionated agent OS / factory layer** — markdown skills, subagents, `brain/`, the
GOAL→SLICE→SPEC→BUILD cycle — that turns a coding agent into a one-person product
factory across the whole lifecycle (idea → launch → sell → scale).

Its true peer group is **not** CrewAI/Mastra. It's the markdown-on-Claude-Code,
spec-driven systems: **BMAD-Method, Agent OS (Builder Methods), GitHub Spec-Kit,
Anthropic Skills**. Those call themselves "frameworks" loosely too — but the precise
category is "agentic OS / methodology built on a runtime," not "runtime."

Two concrete failures this prevents:

- **Rewriting the factory onto a runtime library.** That trades a working,
  model-native orchestration layer (hooks, MCP, the skill catalog) for a Python/TS
  loop and loses the harness. A downgrade dressed as a modernization.
- **Writing "Hamzaish is a framework" into docs.** Defensible by loose usage, but it
  (1) undersells it — it's an *OS* spanning past code, not just an agent loop — and
  (2) invites a sharp reader's "where's the runtime?" whose honest answer is
  "Anthropic's, not ours." The README hero line stays positioning-first
  ("builds, launches, learns across the lifecycle"); `CLAUDE.md` already carries the
  accurate category word ("operating system").

## What to do instead

- In conversation / PRs / launch copy, say: **"an agentic OS built on the Claude
  Agent SDK"** — accurate *and* more compelling than "framework."
- Reach for a runtime library (default: **Mastra**, TS-native) only **inside a
  product** that needs in-app agent behavior — never for the factory itself. Record
  it as a `stack/` ADR if/when it happens.
- Mine BMAD / Agent OS for *ideas* (e.g. BMAD's Agentic-Planning →
  Context-Engineered-Development split), porting per `references/` discipline — never
  adopt them wholesale.

## When this might not apply

- A **product** Hamzaish builds genuinely needs a runtime agent loop in production →
  Mastra/LangGraph belong there. The rule is about the *factory*, not its products.
- Loose external shorthand ("it's an agent framework") in a casual reply is fine —
  the discipline is for committed docs and architecture decisions.
