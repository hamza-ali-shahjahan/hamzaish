# 200 Repos to Learn From — and Credit

> **What this is.** A working syllabus: 200 open-source repositories worth studying as Hamzaish grows up from a personal workspace snapshot into a product people star. For each repo you get (1) **what Hamzaish (the factory) can learn** — concrete patterns to study or port; (2) **what I (Hamza) can learn** — the craftsmanship/skill angle; (3) **credit** — owner + link. It closes with a consolidated CREDITS section.
>
> **House rule honored:** *when in doubt, credit.* We name the specific debt, not a vague "thanks to the community." We port ideas, never import code (see [`references/README.md`](../references/README.md) and [`ACKNOWLEDGMENTS.md`](../ACKNOWLEDGMENTS.md)).

## How to read this

**Provenance tags**
- 📚 — surfaced by our own prior research (the two 2026-06-11 star-cohort studies, `ACKNOWLEDGMENTS.md`, `references/README.md`, `stack/repos.md`, or the `stack/` ADRs). These get deeper treatment.
- ➕ — an added, widely-known exemplar included to round the syllabus to 200. Lighter-but-useful notes.

**Integrity notes**
- Star counts are point-in-time snapshots (API-verified 2026-06-11) — treat them as historical and re-verify before quoting publicly (CLAUDE.md hard rule #5).
- A few repos from the star-cohort research carry handles/figures I could **not** independently re-confirm from general knowledge (e.g. some of the very-high-star "Claude-Code-native generation" entries). These are tagged **⚠ verify** — present per our research, owner/URL to be confirmed before any public citation. Where I was unsure of a fact about a repo, I flagged it rather than inventing one.

## Categories (jump table)

| # | Category | Count |
|---|---|---|
| 1 | [Agent frameworks & autonomous agents](#1-agent-frameworks--autonomous-agents) | 20 |
| 2 | [Claude-Code-native tooling & agent harnesses](#2-claude-code-native-tooling--agent-harnesses) | 18 |
| 3 | [AI SDKs & LLM app frameworks](#3-ai-sdks--llm-app-frameworks) | 15 |
| 4 | [Self-hosted apps (the growth winners)](#4-self-hosted-apps-the-growth-winners) | 22 |
| 5 | [Developer CLI / DX tools](#5-developer-cli--dx-tools) | 20 |
| 6 | [Web & app boilerplates / starters](#6-web--app-boilerplates--starters) | 14 |
| 7 | [UI components & design systems](#7-ui-components--design-systems) | 12 |
| 8 | [Backend / database / infra](#8-backend--database--infra) | 14 |
| 9 | [Testing & quality](#9-testing--quality) | 10 |
| 10 | [Docs & DX writing](#10-docs--dx-writing) | 10 |
| 11 | [Release & versioning tooling](#11-release--versioning-tooling) | 10 |
| 12 | [Security & secrets](#12-security--secrets) | 10 |
| 13 | [Architecture, learning & "awesome" repos](#13-architecture-learning--awesome-repos) | 11 |
| 14 | [Build tools, bundlers & monorepo](#14-build-tools-bundlers--monorepo) | 9 |
| 15 | [Observability, analytics & transactional infra](#15-observability-analytics--transactional-infra) | 5 |
| | **Total** | **200** |

---

## 1. Agent frameworks & autonomous agents

The 2023 generation that defined "autonomous agent," plus the orchestration libraries that out-lasted the hype.

### 1.1 AutoGPT 📚
- **Hamzaish learns:** The category-defining "give it a goal, watch it loop" demo. Study how a *single mesmerizing demo* (not features) drove ~185k stars in our pull — and how the project later struggled to convert that into a durable product. This is the cautionary mirror for Hamzaish's "watch an agent ship a product" pitch: lead with the demo GIF, but don't mistake the spike for PMF (hard rule #1).
- **Hamza learns:** How to frame an idea so it's instantly graspable in 10 seconds. AutoGPT's README and naming made an abstract concept concrete. That's the skill our research says Hamzaish's own README is missing.
- **Credit:** Significant-Gravitas — https://github.com/Significant-Gravitas/AutoGPT

### 1.2 dify 📚
- **Hamzaish learns:** A GUI/visual layer over agentic workflows. Study how it turns "build an agent" into drag-drop blocks and how that lowered the activation cost — the same activation problem our funnel diagnosis flagged (79 cloners, 1 star).
- **Hamza learns:** Product-izing a developer primitive into something a non-coder can succeed with in one sitting. The "value reproducible in one sitting" skill.
- **Credit:** langgenius — https://github.com/langgenius/dify

### 1.3 OpenHands 📚
- **Hamzaish learns:** An AI software-dev agent with a real execution sandbox. Study its agent-action/observation loop and how it scopes file/terminal access safely — directly relevant to a factory that runs agents against product repos.
- **Hamza learns:** Reading a mature agent loop end-to-end (planner → action → observation → reflection) to internalize how production agent control flow is structured.
- **Credit:** All-Hands-AI — https://github.com/All-Hands-AI/OpenHands

### 1.4 MetaGPT 📚
- **Hamzaish learns:** The "AI software company" metaphor — role agents (PM, architect, engineer) with SOPs between them. Our research calls this the closest *structural* analog to Hamzaish's stage agents, but note: it frames "simulated dev team," not "startup-lifecycle OS." Study the SOP-encoded handoffs; mirror that rigor in `factory/agents/`.
- **Hamza learns:** Encoding a real-world org chart and its standard operating procedures into prompts — the discipline of turning tacit process into explicit, inspectable instructions.
- **Credit:** FoundationAgents (formerly geekan) — https://github.com/FoundationAgents/MetaGPT

### 1.5 crewAI 📚
- **Hamzaish learns:** Role-based multi-agent orchestration as a *substrate* (our research's word) rather than an OS. Study how it defines agents, tasks, and processes as composable objects — a clean mental model for our agent/skill/workflow split.
- **Hamza learns:** API design for orchestration: what to make a first-class object vs. a config field. Good taste in abstraction boundaries.
- **Credit:** crewAIInc — https://github.com/crewAIInc/crewAI

### 1.6 gpt-engineer 📚
- **Hamzaish learns:** "Specify an app in prose, get a codebase." Study its spec→clarify→build flow — the ancestor of our `/spec` → `/plan` → `/build` discipline. Also study its *pivot* (it became Lovable): when a repo's real value is the product, not the stars.
- **Hamza learns:** How a clarifying-questions loop materially improves generated output — and when a side project signals it should become a company.
- **Credit:** AntonOsika — https://github.com/AntonOsika/gpt-engineer

### 1.7 gpt-pilot 📚
- **Hamzaish learns:** "The first real AI developer" — incremental build with a human checkpoint at each step. Study its step-gating; it's the same gate-at-each-stage pattern as `/full-cycle`.
- **Hamza learns:** Designing human-in-the-loop checkpoints that build trust without killing momentum — the exact tension our momentum-router balances.
- **Credit:** Pythagora-io — https://github.com/Pythagora-io/gpt-pilot

### 1.8 smol-ai/developer 📚
- **Hamzaish learns:** A deliberately *small* agent — the anti-bloat exemplar. Our research flagged it as the repo whose **stars froze the moment pushes stopped** (frozen 2024). Lesson: minimalism is studyable, but cadence/distribution sustains attention.
- **Hamza learns:** The discipline of keeping a tool small enough to fully understand — and the reminder that abandonment is visible and costly in public.
- **Credit:** smol-ai — https://github.com/smol-ai/developer

### 1.9 LangChain ➕
- **Hamzaish learns:** The chains/tools/memory vocabulary that the whole field borrowed. Study its abstractions to *name* ours consistently (even where we don't use it).
- **Hamza learns:** How a fast-moving abstraction layer manages breaking changes and a huge surface — and the cost when abstractions leak.
- **Credit:** langchain-ai — https://github.com/langchain-ai/langchain

### 1.10 LangGraph ➕
- **Hamzaish learns:** Agent control flow as an explicit **graph** with persisted state and checkpoints. The cleanest model for durable, resumable agent runs — relevant to our resumable `/go-live` ledger.
- **Hamza learns:** Modeling stateful workflows as graphs rather than ad-hoc loops; thinking in nodes/edges/state.
- **Credit:** langchain-ai — https://github.com/langchain-ai/langgraph

### 1.11 AutoGen ➕
- **Hamzaish learns:** Conversational multi-agent patterns — agents that talk to each other to converge on a result. Study its "group chat" orchestration for our cross-agent handoffs.
- **Hamza learns:** Research-grade rigor in a framework; reading how a lab structures reproducible agent experiments.
- **Credit:** microsoft — https://github.com/microsoft/autogen

### 1.12 AgentGPT ➕
- **Hamzaish learns:** Browser-based autonomous agents with a clean, shareable UI — low-friction trial (the "value in one sitting" lesson again).
- **Hamza learns:** Packaging an agent as a hosted web app a stranger can try in 30 seconds. The activation-design skill.
- **Credit:** reworkd — https://github.com/reworkd/AgentGPT

### 1.13 SuperAGI ➕
- **Hamzaish learns:** A dev-first autonomous-agent framework with a GUI, tool marketplace, and run telemetry. Study the telemetry/observability around agent runs — relevant to our dashboard.
- **Hamza learns:** Instrumenting agent runs so cost and behavior are observable, not opaque.
- **Credit:** TransformerOptimus — https://github.com/TransformerOptimus/SuperAGI

### 1.14 BabyAGI ➕
- **Hamzaish learns:** The smallest possible task-creation/prioritization loop — ~100 lines that taught a generation how an agent self-organizes work. The "minimal viable agent" reference.
- **Hamza learns:** How much conceptual clarity fits in a tiny script; the value of a teaching-sized artifact.
- **Credit:** yoheinakajima — https://github.com/yoheinakajima/babyagi

### 1.15 pydantic-ai ➕
- **Hamzaish learns:** Type-safe, schema-validated agent outputs (Pydantic models as the contract). Study how structured output + validation removes a class of agent bugs — mirror with Zod in our TS products.
- **Hamza learns:** Treating LLM outputs as typed data with validation at the boundary, not free text to parse.
- **Credit:** Pydantic — https://github.com/pydantic/pydantic-ai

### 1.16 Letta (formerly MemGPT) ➕
- **Hamzaish learns:** Long-term agent memory — paging memory in/out of context like an OS. Directly relevant to our brain layer's "what does the brain not know yet" gap analysis.
- **Hamza learns:** The "LLM as OS" mental model — context window as RAM, external store as disk. A sharp abstraction worth internalizing.
- **Credit:** Letta (formerly MemGPT) — https://github.com/letta-ai/letta

### 1.17 Agno (formerly Phidata) ➕
- **Hamzaish learns:** A lightweight, batteries-included agent framework with memory, tools, and knowledge built in. Study its ergonomics for "agent + RAG + tools" in few lines.
- **Hamza learns:** API ergonomics — minimizing the lines between intent and a working agent.
- **Credit:** Agno (formerly Phidata) — https://github.com/agno-agi/agno

### 1.18 OpenAI Swarm ➕
- **Hamzaish learns:** A deliberately minimal handoff-and-routines pattern for multi-agent coordination. The reference for "how little orchestration code you actually need" — anti-bloat for our workflows.
- **Hamza learns:** Reading an intentionally educational/experimental framework to extract the core idea (handoffs) without the ceremony.
- **Credit:** openai — https://github.com/openai/swarm

### 1.19 Aider ➕
- **Hamzaish learns:** A terminal-native AI pair programmer with excellent git integration (every change is a commit). This is *exactly* our auto-commit philosophy — study how Aider scopes diffs and writes commit messages.
- **Hamza learns:** CLI-first AI ergonomics and disciplined git hygiene as a feature, not an afterthought.
- **Credit:** Aider-AI — https://github.com/Aider-AI/aider

### 1.20 Cline ➕
- **Hamzaish learns:** An autonomous coding agent in the editor with explicit human approval of each file edit/command — the trust-through-transparency model. Study its plan/act mode separation.
- **Hamza learns:** Designing approval UX that keeps a human confidently in control of an autonomous agent.
- **Credit:** Cline — https://github.com/cline/cline

## 2. Claude-Code-native tooling & agent harnesses

Hamzaish's **true peer group** (per our research): opinionated Claude-Code setups, skill/memory harnesses, and the "startup-OS / AI-cofounder" framing repos. Our headline finding: the *opinionated-setup* framing routinely crosses 50k–200k stars while the *startup-OS* framing has never cleared ~2.2k. Several very-high-star entries below come only from the dated star-cohort pull — handles/figures tagged **⚠ verify**.

### 2.1 claude-code 📚
- **Hamzaish learns:** The engine the whole factory runs on — hooks, slash commands, MCP, settings, sub-agents. Study the official patterns so our `factory/commands` and hooks stay idiomatic and forward-compatible.
- **Hamza learns:** How the tool you build on is *designed* — reading first-party conventions to write extensions that age well.
- **Credit:** anthropics — https://github.com/anthropics/claude-code

### 2.2 gstack 📚 ⚠ verify
- **Hamzaish learns:** Per our pull, "Garry Tan's exact Claude Code setup" — ~109k stars in ~3 months, growing ~1,200★/day. The single clearest proof that **famous-founder distribution + an opinionated setup** is the category's fastest path. Study its README packaging and minimal-friction install.
- **Hamza learns:** Distribution is a feature. The same artifact lands differently depending on whose name is on the door — study what's portable (the packaging) vs. not (the fame).
- **Credit:** garrytan — https://github.com/garrytan/gstack *(⚠ owner/handle + star figure per 2026-06-11 research; confirm before public citation)*

### 2.3 claude-flow 📚
- **Hamzaish learns:** A Claude meta-harness / orchestration layer (ex "claude-flow", listed as ruflo in our pull). Study how it sequences multi-step Claude work — a direct analog to our `factory/workflows/`.
- **Hamza learns:** Building a harness *on top of* an agent tool without forking it — the same restraint our references-discipline enforces.
- **Credit:** ruvnet — https://github.com/ruvnet/claude-flow

### 2.4 BMAD-METHOD 📚
- **Hamzaish learns:** Our research calls this the **closest structural analog** to Hamzaish — a markdown-driven "agile AI" method: roles, templates, and a repeatable process expressed entirely in docs. Study how it makes a *method* installable and how it teaches the workflow inside the repo.
- **Hamza learns:** Encoding a methodology as portable markdown others can adopt — turning "how I work" into a product.
- **Credit:** bmad-code-org — https://github.com/bmad-code-org/BMAD-METHOD

### 2.5 awesome-claude-code 📚
- **Hamzaish learns:** The category's **discovery surface** — a curated list is where evaluators browse. Getting listed is a distribution channel; study its inclusion bar and entry format, then earn a place in it.
- **Hamza learns:** Curation as influence — the person who maps a category shapes it. The skill of editorial taste.
- **Credit:** hesreallyhim — https://github.com/hesreallyhim/awesome-claude-code

### 2.6 claude-code-templates 📚
- **Hamzaish learns:** Installable Claude Code templates — the "clone-and-go" packaging Hamzaish needs (our funnel diagnosis: cloners arrive, conversion fails). Study how each template delivers a win in one sitting.
- **Hamza learns:** Reducing time-to-first-value to near zero; the template-author's empathy for a cold-start user.
- **Credit:** davila7 — https://github.com/davila7/claude-code-templates

### 2.7 SuperClaude_Framework 📚
- **Hamzaish learns:** A configuration framework layering personas/commands onto Claude Code. Study its config schema and how it composes behaviors — relevant to keeping our CLAUDE.md routing maintainable as it grows.
- **Hamza learns:** Designing a config surface that's powerful but doesn't collapse under its own options.
- **Credit:** SuperClaude-Org — https://github.com/SuperClaude-Org/SuperClaude_Framework

### 2.8 ECC 📚 ⚠ verify
- **Hamzaish learns:** Per our pull, an agent-harness with skills/memory/security at ~213k stars in 5 months — the top of the Claude-Code-native cohort. If accurate, study its skills+memory+security triad; that's Hamzaish's exact surface area (security gate, brain, skills).
- **Hamza learns:** What a category-leading harness chooses to make first-class — and how fast attention compounds when the shape is right.
- **Credit:** affaan-m — https://github.com/affaan-m/ECC *(⚠ owner/handle + star figure per 2026-06-11 research; confirm before public citation)*

### 2.9 agency-agents 📚 ⚠ verify
- **Hamzaish learns:** Per our pull, a "complete AI agency" of role agents (~111k stars). The agency-of-roles framing sits between MetaGPT's "dev team" and our "startup OS" — study where it draws the line that ours doesn't.
- **Hamza learns:** Positioning: "AI agency" reads as a service you run; "startup OS" reads as personal config. Words move stars.
- **Credit:** msitarzewski — https://github.com/msitarzewski/agency-agents *(⚠ owner/handle + star figure per 2026-06-11 research; confirm before public citation)*

### 2.10 agent-skills 📚
- **Hamzaish learns:** The **spec → build → ship discipline** at the core of our factory (credited in `ACKNOWLEDGMENTS.md`). Study how skills are scoped, named, and chained — the source of our skill conventions.
- **Hamza learns:** Addy Osmani's clarity in turning a workflow into reusable skills; the habit of documenting process as executable steps.
- **Credit:** Addy Osmani — https://github.com/addyosmani/agent-skills

### 2.11 gbrain 📚
- **Hamzaish learns:** Our Phase-C brain blueprint (cloned in `references/gbrain`). Port: entity-extraction + typed edges on every write, **hybrid retrieval (vector + BM25 + RRF)**, and synthesis-with-citations that always states *what the brain doesn't know yet*. +31.4 P@5 over BM25+vector-only on its own bench.
- **Hamza learns:** Garry Tan's prompt-engineering and eval methodology — and the rare humility of an answer format that reports its own gaps.
- **Credit:** garrytan — https://github.com/garrytan/gbrain *(cloned locally for study; see `references/README.md`)*

### 2.12 hermes-agent 📚
- **Hamzaish learns:** Self-improving skills + memory loops (cloned in `references/hermes-agent`). Port the *concepts* into `meta/` and `brain/`: when to extract a new skill from experience, FTS5 session search + LLM summarization for cross-session recall, trajectory compression. Stay Claude-Code-native; don't run the Python.
- **Hamza learns:** Designing a closed learning loop — deciding what's worth remembering and when to promote a one-off into a reusable skill.
- **Credit:** Nous Research — https://github.com/nousresearch/hermes-agent *(cloned locally for study)*

### 2.13 openclaw 📚
- **Hamzaish learns:** Multi-channel gateway patterns (cloned in `references/openclaw`) — the Phase-E parking-lot for cross-channel GTM. Port: the **channel-adapter pattern** abstracting 20+ messaging platforms behind one interface; the gateway control plane (sessions/channels/tools/event routing).
- **Hamza learns:** Abstracting many noisy external integrations behind one clean interface — the adapter-pattern muscle.
- **Credit:** openclaw — https://github.com/openclaw/openclaw *(cloned locally for study)*

### 2.14 ponytail 📚
- **Hamzaish learns:** The **one-skill-many-agents** portability layout (credited in `ACKNOWLEDGMENTS.md`) — and the lazy-senior-dev creed that *the best code is the code never written.* Study how it keeps a skill usable across agents without duplication.
- **Hamza learns:** The senior-engineer instinct to delete rather than add; restraint as craft.
- **Credit:** DietrichGebert (MIT) — https://github.com/DietrichGebert/ponytail

### 2.15 servers (Model Context Protocol) 📚
- **Hamzaish learns:** The official MCP server catalog — reference implementations for filesystem, git, postgres, etc. Study these before wiring any per-product MCP (`stack/agent-stack.md` lists our defaults).
- **Hamza learns:** Reading reference servers to understand a protocol's intended shape before building your own.
- **Credit:** modelcontextprotocol — https://github.com/modelcontextprotocol/servers

### 2.16 anthropic-sdk-typescript 📚
- **Hamzaish learns:** First-party patterns for **prompt caching + tool-use loops** (called out in `stack/repos.md`). Our products' `lib/agents/` should mirror the SDK's caching/retry idioms exactly.
- **Hamza learns:** How an SDK encodes correct usage (streaming, retries, tool loops) so you don't reinvent error-prone plumbing.
- **Credit:** anthropics — https://github.com/anthropics/anthropic-sdk-typescript

### 2.17 cabinet 📚 ⚠ verify
- **Hamzaish learns:** Per our pull, an active "startup OS" repo (~2.2k stars, then ~2 months old) — our research's named **canary to watch** for the startup-OS framing ceiling. Track whether it breaks past ~2.2k; if it does, the ceiling thesis needs revisiting.
- **Hamza learns:** Watching a direct-framing competitor as a live experiment in positioning — cheaper than running your own.
- **Credit:** hilash — https://github.com/hilash/cabinet *(⚠ owner/handle per 2026-06-11 research; confirm before public citation)*

### 2.18 HustleGPT-Challenge 📚 ⚠ verify
- **Hamzaish learns:** The original "AI co-founder" framing — ~2.1k stars, **dead since June 2023**. Concrete proof in our research that the literal "AI cofounder" frame both peaks low and decays. Study the README to see the framing trap up close.
- **Hamza learns:** A viral framing without a durable product evaporates — momentum needs a shipping engine behind it.
- **Credit:** HustleGPT community project — search "HustleGPT-Challenge" on GitHub *(⚠ exact owner/handle unconfirmed; verify before public citation)*

## 3. AI SDKs & LLM app frameworks

The plumbing layer — model SDKs, retrieval, vector stores, and the abstractions products are built on. `stack/agent-stack.md` makes Claude primary with Hermes-via-OpenRouter as the cheap fallback.

### 3.1 ai (Vercel AI SDK) 📚
- **Hamzaish learns:** A clean cross-model abstraction (`stack/repos.md` keeps it as the "if cross-model is ever needed" layer). Study its streaming, tool-calling, and React hooks for product UIs that stream agent output.
- **Hamza learns:** Designing an abstraction thin enough to swap providers without rewriting product code.
- **Credit:** vercel — https://github.com/vercel/ai

### 3.2 anthropic-cookbook ➕
- **Hamzaish learns:** Runnable recipes for caching, tool use, RAG, and evals — the fastest way to copy *correct* Claude patterns into `factory/` and product `lib/agents/`.
- **Hamza learns:** Learning a model's full capability surface from worked examples rather than the API reference alone.
- **Credit:** anthropics — https://github.com/anthropics/anthropic-cookbook

### 3.3 openai-python ➕
- **Hamzaish learns:** The reference SDK shape much of the ecosystem mirrors — useful for understanding conventions even though we default to Claude. Study its retry/pagination/streaming ergonomics.
- **Hamza learns:** What a polished, widely-copied SDK API feels like from the consumer side.
- **Credit:** openai — https://github.com/openai/openai-python

### 3.4 openai-node ➕
- **Hamzaish learns:** TypeScript SDK conventions (typed responses, streaming helpers) that complement our TS stack; a comparison point for the Anthropic TS SDK.
- **Hamza learns:** Idiomatic TS API design for an external service.
- **Credit:** openai — https://github.com/openai/openai-node

### 3.5 llama_index ➕
- **Hamzaish learns:** RAG done thoroughly — ingestion, chunking, indexing, query engines. Study its retrieval abstractions to sharpen our Phase-C brain beyond gbrain's patterns.
- **Hamza learns:** The full vocabulary of retrieval (nodes, query engines, post-processors) — naming that clarifies thinking.
- **Credit:** run-llama — https://github.com/run-llama/llama_index

### 3.6 ollama ➕
- **Hamzaish learns:** One-command local model serving with a clean REST API and model packaging (`Modelfile`). Relevant for any local-LLM path (our memory notes a local-LLM setup project).
- **Hamza learns:** How thoughtful packaging (a Dockerfile-like `Modelfile`) turns a complex capability into `ollama run`.
- **Credit:** ollama — https://github.com/ollama/ollama

### 3.7 llama.cpp ➕
- **Hamzaish learns:** State-of-the-art inference engineering in portable C/C++ — quantization, GGUF, CPU/GPU offload. The reference for "run a big model on small hardware."
- **Hamza learns:** Low-level performance craft — how much speed lives in memory layout and quantization, not just the algorithm.
- **Credit:** ggml-org — https://github.com/ggml-org/llama.cpp

### 3.8 transformers ➕
- **Hamzaish learns:** The canonical model-loading/inference library and its `pipeline` ergonomics. Study its docs-as-onboarding — among the best in ML.
- **Hamza learns:** How a sprawling library stays approachable through relentless documentation and consistent APIs.
- **Credit:** Hugging Face — https://github.com/huggingface/transformers

### 3.9 mem0 ➕
- **Hamzaish learns:** A dedicated memory layer for agents (extraction, storage, retrieval of salient facts). A focused alternative pattern to gbrain for our brain layer.
- **Hamza learns:** Treating "memory" as a product surface with its own API, not an afterthought bolted onto a chat loop.
- **Credit:** mem0ai — https://github.com/mem0ai/mem0

### 3.10 chroma ➕
- **Hamzaish learns:** An embeddable vector DB with a tiny API — good for the lightweight, local-first end of our retrieval needs (gbrain defaults to PGLite; Chroma is the comparison).
- **Hamza learns:** API minimalism in infrastructure — how few concepts a vector store actually needs.
- **Credit:** chroma-core — https://github.com/chroma-core/chroma

### 3.11 qdrant ➕
- **Hamzaish learns:** A production vector DB in Rust — payload filtering, hybrid search, quantization. Study its filtering model for retrieval that mixes semantic + structured constraints.
- **Hamza learns:** Performance-oriented systems design and clear API docs for a stateful service.
- **Credit:** qdrant — https://github.com/qdrant/qdrant

### 3.12 weaviate ➕
- **Hamzaish learns:** Vector search with built-in modules and a GraphQL-ish query surface; hybrid (keyword+vector) search out of the box — the pattern gbrain implements by hand.
- **Hamza learns:** Trade-offs between batteries-included infra vs. composing primitives yourself.
- **Credit:** weaviate — https://github.com/weaviate/weaviate

### 3.13 litellm ➕
- **Hamzaish learns:** A unified proxy/SDK that normalizes 100+ providers to the OpenAI schema, with cost tracking and fallbacks. This is the cleanest way to wire our "Claude primary, Hermes fallback" routing with one cost meter.
- **Hamza learns:** Building a normalizing adapter over messy provider APIs — and why cost observability belongs in the proxy.
- **Credit:** BerriAI — https://github.com/BerriAI/litellm

### 3.14 instructor ➕
- **Hamzaish learns:** Structured LLM outputs via schema + automatic retries on validation failure. The Python sibling of our Zod-validated-output discipline; study its retry-on-invalid loop.
- **Hamza learns:** Making "the model must return valid X" a hard guarantee through validation + retry, not hope.
- **Credit:** jxnl — https://github.com/jxnl/instructor

### 3.15 guidance ➕
- **Hamzaish learns:** Constrained generation — interleaving control flow with generation to force structure (grammars, regex, selection). Useful when an agent must emit exactly-shaped output.
- **Hamza learns:** Thinking of prompting as a small program with control flow, not a single string.
- **Credit:** guidance-ai — https://github.com/guidance-ai/guidance

## 4. Self-hosted apps (the growth winners)

This is Hamzaish's **home turf** per the AGPL research: self-hosted, privacy-first apps where AGPL is the norm and stars are license-blind. The winners share a formula — *incumbent-anchored positioning ("open-source alternative to X") as the literal title, hero screenshot/GIF above the fold, zero-friction trial, relentless visible release cadence as a content engine, milestone marketing, and launching where the audience already is (HN + Reddit; Product Hunt was irrelevant for all eight studied).*

### 4.1 immich 📚
- **Hamzaish learns:** The **compounding-community** masterclass: it *flopped on HN 7+ times* (1–6 points each) yet hit 22k+ stars via Discord (4,500+ members), Reddit, podcasts, and a release every ~7 days. Lesson for us: cadence + community beat a launch spike. Steal the release-as-content-engine rhythm.
- **Hamza learns:** Persistence through early silence — the willingness to ship weekly to an empty room until the room fills.
- **Credit:** immich-app — https://github.com/immich-app/immich

### 4.2 AppFlowy 📚
- **Hamzaish learns:** **Ignition-by-front-page**: a 304-pt HN hit *3 days* after launch on the literal title "open-source Notion alternative," then 2–3 releases/month for 4.5 years. Study the incumbent-anchored title + sustained cadence.
- **Hamza learns:** Naming the thing by what it replaces — clarity beats cleverness for discovery.
- **Credit:** AppFlowy-IO — https://github.com/AppFlowy-IO/AppFlowy

### 4.3 vaultwarden 📚
- **Hamzaish learns:** 62k stars over 8 years with **no launch moment at all** — pure compounding utility (a lightweight Bitwarden server). Proof that a genuinely useful, well-scoped tool wins slowly without any growth hack.
- **Hamza learns:** Patience and scope discipline — doing one compatible thing extremely well for years.
- **Credit:** dani-garcia — https://github.com/dani-garcia/vaultwarden

### 4.4 Plane 📚
- **Hamzaish learns:** **Ignition-by-front-page**: a 638-pt HN hit on "Open-Source Alternative to Jira." Study its README hero and live-demo trial path — the textbook above-the-fold our README is missing.
- **Hamza learns:** Building a credible incumbent-alternative and saying so plainly in the title.
- **Credit:** makeplane — https://github.com/makeplane/plane

### 4.5 Mastodon 📚
- **Hamzaish learns:** AGPL at the center of a federated, privacy-first network (50k+ stars in our pull). Study how a protocol-shaped product grows via the network it enables, not a single repo.
- **Hamza learns:** Designing for federation/interop — value that compounds across instances you don't control.
- **Credit:** mastodon — https://github.com/mastodon/mastodon

### 4.6 Nextcloud 📚
- **Hamzaish learns:** The self-hosted-suite incumbent (35k+ in our pull) — an app platform with its own ecosystem. Study how an extensible app store creates lock-in and contributor pull.
- **Hamza learns:** Platform thinking — when to stop adding features and start enabling others to.
- **Credit:** nextcloud — https://github.com/nextcloud/server

### 4.7 Grafana 📚
- **Hamzaish learns:** The **natural experiment** at the heart of our AGPL study: relicensing Apache-2.0→AGPL (Apr 2021) *accelerated* star growth (+6,642 → +6,975 yr-over-yr) and adoption; no meaningful fork emerged; AWS partnered instead of forking. The empirical backbone of "keep AGPL."
- **Hamza learns:** Making a bold license decision from evidence, then communicating it openly (the CEO's on-record posts). Conviction + transparency.
- **Credit:** grafana — https://github.com/grafana/grafana

### 4.8 MinIO 📚
- **Hamzaish learns:** S3-compatible object storage (61k in our pull) — winning by being **API-compatible with the incumbent** (the AWS S3 API). The compatibility-as-distribution lever.
- **Hamza learns:** Choosing a standard to implement so users can adopt you with zero relearning.
- **Credit:** minio — https://github.com/minio/minio

### 4.9 Logseq 📚
- **Hamzaish learns:** Local-first, privacy-first knowledge tool (43k in our pull) with a passionate community. Study local-first data ownership as a positioning wedge — relevant to our `.local`/privacy ethos.
- **Hamza learns:** Local-first architecture and the trust it buys with privacy-conscious users.
- **Credit:** logseq — https://github.com/logseq/logseq

### 4.10 SiYuan 📚
- **Hamzaish learns:** Privacy-first notes shipping **dev builds every 2–3 days** (44k in our pull) — the most aggressive cadence in the cohort. The clearest case that visible velocity itself is marketing.
- **Hamza learns:** Sustaining an extreme release rhythm without burning out the codebase — disciplined small increments.
- **Credit:** siyuan-note — https://github.com/siyuan-note/siyuan

### 4.11 AList 📚
- **Hamzaish learns:** A file-listing program unifying many storage backends (49k in our pull) — utility + broad integration surface. Study how "works with everything you already use" drives adoption.
- **Hamza learns:** The adapter-pattern payoff again: breadth of integrations as a growth engine.
- **Credit:** AlistGo — https://github.com/AlistGo/alist

### 4.12 RSSHub 📚
- **Hamzaish learns:** An "everything-to-RSS" aggregator (44k in our pull) that grows via a long tail of community-contributed routes. Study how contribution surface area = growth.
- **Hamza learns:** Designing a codebase where adding value (a new route) is trivially easy for contributors.
- **Credit:** DIYgod — https://github.com/DIYgod/RSSHub

### 4.13 khoj 📚
- **Hamzaish learns:** **Ignition-by-front-page**: a 565-pt Show HN riding the Llama-2 wave (35k in our pull). Study timing — launching into a hype wave amplifies a good demo.
- **Hamza learns:** Reading the macro moment and shipping into it; timing as a multiplier on quality.
- **Credit:** khoj-ai — https://github.com/khoj-ai/khoj

### 4.14 glance 📚
- **Hamzaish learns:** **Ignition-by-front-page**: a 211-pt HN hit on day 17 for a self-hosted dashboard. Proof a small, beautiful, single-purpose tool can ignite fast on a strong screenshot.
- **Hamza learns:** Visual polish as a launch asset — one gorgeous screenshot can carry a Show HN.
- **Credit:** glanceapp — https://github.com/glanceapp/glance

### 4.15 maybe (maybe-finance) 📚
- **Hamzaish learns:** Our research's **counter-lesson #1**: 54k stars, product dead by mid-2025. **Stars ≠ PMF** (CLAUDE.md hard rule #1, confirmed by data). Study what star-count hid about the underlying business.
- **Hamza learns:** Not confusing GitHub vanity metrics with a working business — the discipline behind our "never claim PMF from launch-week numbers" rule.
- **Credit:** maybe-finance — https://github.com/maybe-finance/maybe

### 4.16 rustdesk 📚
- **Hamzaish learns:** An AGPL remote-desktop tool in the top-100 (116k in our pull) — incumbent-anchored ("open-source TeamViewer/AnyDesk alternative") in a high-pain category. Study category selection: high-pain + expensive-incumbent = fertile.
- **Hamza learns:** Picking a battle where the incumbent is widely resented — positioning leverage from user frustration.
- **Credit:** rustdesk — https://github.com/rustdesk/rustdesk

### 4.17 stable-diffusion-webui 📚
- **Hamzaish learns:** A top-AGPL repo (163k in our pull) that became *the* UI for an entire model ecosystem by riding the SD wave and being radically extensible. Study extension architecture as a growth flywheel.
- **Hamza learns:** Being the friendly front-end to a powerful-but-raw technology at exactly the right moment.
- **Credit:** AUTOMATIC1111 — https://github.com/AUTOMATIC1111/stable-diffusion-webui

### 4.18 firecrawl 📚
- **Hamzaish learns:** AGPL in the top-100 (131k in our pull) — turning websites into LLM-ready data with a clean API. Study the "developer tool with a delightful API + self-host option" dual model.
- **Hamza learns:** Productizing a gnarly problem (web scraping for LLMs) behind a one-call API.
- **Credit:** mendableai — https://github.com/mendableai/firecrawl

### 4.19 Deep-Live-Cam 📚
- **Hamzaish learns:** AGPL hall-of-famer (93k in our pull) that went viral on a **jaw-dropping demo** (real-time face swap). The clearest "demo-drives-everything" case in the cohort — exactly the lever our README diagnosis says to pull.
- **Hamza learns:** A single visceral demo can outrun any amount of copy. Show, don't tell.
- **Credit:** hacksider — https://github.com/hacksider/Deep-Live-Cam

### 4.20 n8n ➕
- **Hamzaish learns:** Fair-code workflow automation with a huge node/integration library and self-host-first distribution. Study its node SDK (community-extensible) and how it monetizes around an open core.
- **Hamza learns:** Open-core business design — what's free, what's paid, and keeping the community whole.
- **Credit:** n8n-io — https://github.com/n8n-io/n8n

### 4.21 coolify ➕
- **Hamzaish learns:** A self-hostable Heroku/Vercel alternative — incumbent-anchored positioning in the PaaS category, strong screenshots, active cadence. A live template for the growth formula above.
- **Hamza learns:** Shipping a polished self-hosted alternative to a beloved paid product, and marketing it like one.
- **Credit:** coollabsio — https://github.com/coollabsio/coolify

### 4.22 Ghost ➕
- **Hamzaish learns:** Open-source publishing with a sustainable nonprofit/commercial model (managed hosting funds the OSS). Study the README, docs, and the membership/newsletter features that became its moat — relevant to our own content engine.
- **Hamza learns:** Pairing a clean open-source product with a managed offering that funds it — sustainable OSS economics.
- **Credit:** TryGhost — https://github.com/TryGhost/Ghost

## 5. Developer CLI / DX tools

Hamzaish *is* a CLI-shaped experience. These set the bar for terminal UX, speed, and zero-friction install — exactly the polish our setup script and slash commands should aspire to.

### 5.1 vhs 📚
- **Hamzaish learns:** Records terminal demos as GIFs from a simple script (`bun run credits` uses it for our credits roll). The fix for our research's #1 conversion gap: *zero images in the repo*. Script our demo GIFs with VHS so they're reproducible.
- **Hamza learns:** Treating demos as code (versioned, reproducible) instead of one-off screen recordings.
- **Credit:** charmbracelet — https://github.com/charmbracelet/vhs

### 5.2 bun 📚
- **Hamzaish learns:** One tool = runtime + package manager + test runner, no build step for TS (`stack/tech-stack.md` — the factory runs on Bun). Study how consolidating the toolchain removes config and onboarding friction.
- **Hamza learns:** The value of collapsing many tools into one fast binary — and the performance engineering behind it.
- **Credit:** oven-sh — https://github.com/oven-sh/bun

### 5.3 supabase/cli 📚
- **Hamzaish learns:** One-shot project bootstrap, local dev stack, and migrations (`stack/repos.md`). Study its `init`/`start`/`db push` ergonomics — the model for resumable, idempotent project setup like our `/go-live`.
- **Hamza learns:** Local-first dev parity with prod via a single CLI; migration discipline.
- **Credit:** supabase — https://github.com/supabase/cli

### 5.4 stripe-cli 📚
- **Hamzaish learns:** Webhook tunneling + resource creation from the terminal (`stack/repos.md`). Study `stripe listen` for the local-webhook DX our payment-wired products need.
- **Hamza learns:** Making a hard-to-test integration (webhooks) trivially testable locally — empathy for the developer's inner loop.
- **Credit:** stripe — https://github.com/stripe/stripe-cli

### 5.5 cli (gh) ➕
- **Hamzaish learns:** The canonical example of a great CLI: discoverable subcommands, helpful errors, scriptable output (`--json`). Our slash-command UX should aim for this clarity. (We already lean on `gh` for PR/issue ops.)
- **Hamza learns:** CLI design grammar — nouns, verbs, flags — that users can guess correctly.
- **Credit:** GitHub (cli) — https://github.com/cli/cli

### 5.6 bubbletea ➕
- **Hamzaish learns:** The Elm-architecture TUI framework behind beautiful terminal apps. Study its model/update/view loop if we ever build an interactive factory TUI.
- **Hamza learns:** State management done right (unidirectional data flow) — a pattern that transfers to frontend work.
- **Credit:** charmbracelet — https://github.com/charmbracelet/bubbletea

### 5.7 gum ➕
- **Hamzaish learns:** Glamorous interactive prompts for shell scripts (choose, input, confirm, spin). Could make our `install.sh`/setup flows feel polished without a full TUI.
- **Hamza learns:** Small touches (a spinner, a styled prompt) disproportionately raise perceived quality.
- **Credit:** charmbracelet — https://github.com/charmbracelet/gum

### 5.8 fzf ➕
- **Hamzaish learns:** Fuzzy-finding as a composable Unix filter — pipe anything in, pick interactively. A model for fast selection UX over our products/skills.
- **Hamza learns:** Composability — a tool that does one thing and pipes cleanly into everything.
- **Credit:** junegunn — https://github.com/junegunn/fzf

### 5.9 ripgrep ➕
- **Hamzaish learns:** The speed standard for code search (what our own search tooling sits on). Study its respect for `.gitignore` and sensible defaults.
- **Hamza learns:** Performance + great defaults = a tool people never configure and never leave.
- **Credit:** BurntSushi — https://github.com/BurntSushi/ripgrep

### 5.10 bat ➕
- **Hamzaish learns:** `cat` with syntax highlighting and git integration — a "drop-in but better" upgrade. Study the philosophy of enhancing a familiar tool rather than replacing it.
- **Hamza learns:** Respecting muscle memory while improving the experience underneath.
- **Credit:** sharkdp — https://github.com/sharkdp/bat

### 5.11 fd ➕
- **Hamzaish learns:** A friendlier, faster `find` with sane defaults. The recurring lesson: good defaults beat configurability.
- **Hamza learns:** Ergonomic redesign of a notoriously awkward classic tool.
- **Credit:** sharkdp — https://github.com/sharkdp/fd

### 5.12 eza ➕
- **Hamzaish learns:** A modern `ls` (icons, git status, tree). Study how a community fork (of exa) kept a beloved tool alive — relevant to OSS stewardship.
- **Hamza learns:** Picking up maintenance of an abandoned tool the community depends on.
- **Credit:** eza-community — https://github.com/eza-community/eza

### 5.13 starship ➕
- **Hamzaish learns:** A fast, cross-shell prompt configured by one TOML file. Study its config schema and instant-install story.
- **Hamza learns:** Cross-platform consistency and config that's powerful yet copy-pasteable.
- **Credit:** starship — https://github.com/starship/starship

### 5.14 lazygit ➕
- **Hamzaish learns:** A TUI that makes git approachable — directly relevant to surfacing our `wip(auto)` snapshot history to users who fear the CLI.
- **Hamza learns:** Wrapping a powerful-but-scary tool in an interface that builds confidence.
- **Credit:** jesseduffield — https://github.com/jesseduffield/lazygit

### 5.15 delta ➕
- **Hamzaish learns:** Beautiful, readable git diffs in the terminal. Better diffs = better review, which ties to our `/code-review` and checkpoint flows.
- **Hamza learns:** Readability as a feature — how presentation changes whether people actually review.
- **Credit:** dandavison — https://github.com/dandavison/delta

### 5.16 just ➕
- **Hamzaish learns:** A command runner (`justfile`) — a cleaner Make for project tasks. Study it as a model for discoverable, self-documenting project commands alongside our `bun run` scripts.
- **Hamza learns:** Making project automation discoverable (`just --list`) so commands aren't tribal knowledge.
- **Credit:** casey — https://github.com/casey/just

### 5.17 uv ➕
- **Hamzaish learns:** An extremely fast Python package/project manager consolidating the toolchain (the Bun energy, for Python). Relevant for any Python references we run (hermes-agent study).
- **Hamza learns:** How much DX improves when install times drop from minutes to seconds.
- **Credit:** astral-sh — https://github.com/astral-sh/uv

### 5.18 zellij ➕
- **Hamzaish learns:** A terminal workspace/multiplexer with discoverable keybindings and layouts. Study its onboarding (it teaches itself) — a model for making powerful tools approachable.
- **Hamza learns:** In-product discoverability — surfacing capabilities instead of hiding them in docs.
- **Credit:** zellij-org — https://github.com/zellij-org/zellij

### 5.19 zoxide ➕
- **Hamzaish learns:** A "smarter cd" that learns your habits — a tiny example of frecency-ranked UX. Conceptually relevant to our momentum-router surfacing the next likely action.
- **Hamza learns:** Quietly learning from usage to remove repetitive friction.
- **Credit:** ajeetdsouza — https://github.com/ajeetdsouza/zoxide

### 5.20 tldr ➕
- **Hamzaish learns:** Community-maintained, example-first command help. A model for our own docs: lead with the copy-paste example, not the prose.
- **Hamza learns:** Example-first documentation — people want the command, then the explanation.
- **Credit:** tldr-pages — https://github.com/tldr-pages/tldr

## 6. Web & app boilerplates / starters

These define the "what's in a production SaaS starter" bar that our `/scaffold` templates must meet or beat. `stack/tech-stack.md` is the spec; these are the reference implementations.

### 6.1 next.js 📚
- **Hamzaish learns:** Our default framework (`stack/tech-stack.md`). Study the official `examples/` (`with-supabase`, `with-stripe-typescript`) and the App Router/RSC + `metadata`/`sitemap.ts`/`robots.ts` conventions our templates already mirror.
- **Hamza learns:** Reading a framework's own examples to learn idiomatic usage straight from the source.
- **Credit:** vercel — https://github.com/vercel/next.js

### 6.2 taxonomy 📚
- **Hamzaish learns:** shadcn's reference Next.js 15 app — App Router patterns, auth, subscriptions, MDX docs in one coherent codebase (`stack/repos.md`). The closest single repo to our scaffold's intended shape.
- **Hamza learns:** Architecting a real app (not a toy) as a teaching artifact — every file is a lesson.
- **Credit:** shadcn-ui — https://github.com/shadcn-ui/taxonomy

### 6.3 SaaS-Boilerplate 📚
- **Hamzaish learns:** Next.js + Clerk + Stripe + Drizzle SaaS starter (`stack/repos.md`) — overlaps our exact scale-path stack (Clerk + Drizzle). Compare its structure to our templates and steal the wiring we're missing.
- **Hamza learns:** End-to-end SaaS plumbing (auth + billing + DB + i18n) assembled coherently.
- **Credit:** ixartz — https://github.com/ixartz/SaaS-Boilerplate

### 6.4 SaasRock 📚
- **Hamzaish learns:** A full, opinionated SaaS template (`stack/repos.md` flags it as "maybe too opinionated"). Study what it includes (admin, entities, blogging) to decide what our scaffold should *not* bake in.
- **Hamza learns:** The trade-off between batteries-included and flexible — and reading opinionation as a design choice.
- **Credit:** saasrock (Alexandro Martinez) — https://github.com/AlexandroMtzG/saasrock

### 6.5 create-t3-app ➕
- **Hamzaish learns:** The "typesafe-everything" scaffolder (Next + tRPC + Tailwind + Prisma/Drizzle). Study its interactive, modular generator — pick-your-pieces scaffolding our `/scaffold` could emulate.
- **Hamza learns:** Building a scaffolder that composes optional modules cleanly rather than one rigid template.
- **Credit:** t3-oss — https://github.com/t3-oss/create-t3-app

### 6.6 Next-js-Boilerplate ➕
- **Hamzaish learns:** A batteries-included Next.js starter with testing, linting, CI, and commit hooks pre-wired. A checklist of "what production-ready means" for our templates.
- **Hamza learns:** The unglamorous scaffolding (CI, hooks, tests) that separates a starter from a real foundation.
- **Credit:** ixartz — https://github.com/ixartz/Next-js-Boilerplate

### 6.7 precedent ➕
- **Hamzaish learns:** An opinionated collection of Next.js components/hooks/utils for fast shipping. Study its curated defaults — the "good taste, pre-decided" approach our scaffold shares.
- **Hamza learns:** Curation as a product — pre-making the small decisions so builders keep momentum.
- **Credit:** Steven Tey — https://github.com/steven-tey/precedent

### 6.8 commerce ➕
- **Hamzaish learns:** A high-performance headless-commerce starter — reference for App Router + RSC data fetching at production quality.
- **Hamza learns:** Performance-first frontend architecture from a team that obsesses over it.
- **Credit:** vercel — https://github.com/vercel/commerce

### 6.9 nextjs-subscription-payments ➕
- **Hamzaish learns:** The canonical Stripe-subscriptions + Supabase reference — webhook handling, customer portal, RLS-gated access. Exactly our payments wiring; compare line-by-line.
- **Hamza learns:** Getting subscription billing edge cases right (webhooks, proration, portal) from a reference that does.
- **Credit:** vercel — https://github.com/vercel/nextjs-subscription-payments

### 6.10 cal.com ➕
- **Hamzaish learns:** A large, real open-source SaaS (scheduling) — study its monorepo layout, app-store/plugin model, and AGPL+commercial dual licensing (our exact license posture).
- **Hamza learns:** Navigating a large production codebase and an open-core business at scale.
- **Credit:** Cal.com — https://github.com/calcom/cal.com

### 6.11 midday ➕
- **Hamzaish learns:** A modern, beautifully engineered open SaaS (finance for freelancers) — Turborepo monorepo, type-safe end-to-end, great DX. A current-best-practice reference for a polished indie SaaS.
- **Hamza learns:** What "2026-modern" full-stack craft looks like in a real shipping product.
- **Credit:** Midday — https://github.com/midday-ai/midday

### 6.12 saas-starter-kit ➕
- **Hamzaish learns:** Enterprise-leaning SaaS starter (teams, SSO/SAML, audit logs, webhooks) — the B2B features our scale-path (Clerk + multi-tenant) will need. Study its tenancy model.
- **Hamza learns:** Enterprise-readiness features (SAML, audit logs) and why B2B buyers require them.
- **Credit:** BoxyHQ — https://github.com/boxyhq/saas-starter-kit

### 6.13 next-enterprise ➕
- **Hamzaish learns:** An "enterprise-grade" Next.js boilerplate emphasizing testing, observability, and bundle analysis. A checklist for hardening our scaffold beyond the happy path.
- **Hamza learns:** The operational rigor (testing, perf budgets, observability) expected at enterprise scale.
- **Credit:** Blazity — https://github.com/Blazity/next-enterprise

### 6.14 open-saas ➕
- **Hamzaish learns:** A free, full-featured SaaS template (auth, payments, admin, AI examples) with excellent accompanying docs. Study the docs-as-onboarding — a starter people can actually start.
- **Hamza learns:** Pairing a starter with a guided tutorial so the boilerplate is teachable, not just clonable.
- **Credit:** wasp-lang — https://github.com/wasp-lang/open-saas

## 7. UI components & design systems

Tailwind + shadcn/ui is `stack/tech-stack.md`'s one true invariant. These define the component-craft bar for every product's UI.

### 7.1 ui (shadcn/ui) 📚
- **Hamzaish learns:** The copy-paste, own-the-code component model (no runtime dep) — unanimous across our stack. Study how "components as source you paste in" beats a black-box library for AI-assisted editing.
- **Hamza learns:** The radical idea that the best component library gives you the code, not a dependency.
- **Credit:** shadcn-ui — https://github.com/shadcn-ui/ui

### 7.2 charts (shadcn) 📚
- **Hamzaish learns:** Recharts wrappers in the shadcn idiom (`stack/repos.md`) — themed, composable, copy-paste charts for our dashboard cards.
- **Hamza learns:** Wrapping a powerful-but-verbose library (Recharts) into ergonomic, themed components.
- **Credit:** shadcn-ui — https://github.com/shadcn-ui/ui (charts)

### 7.3 tailwindcss 📚
- **Hamzaish learns:** Utility-first CSS — our styling foundation (v4 in the stack). Study the v4 engine and how design tokens map to utilities.
- **Hamza learns:** A constraint-based design system that makes consistent UI the path of least resistance.
- **Credit:** tailwindlabs — https://github.com/tailwindlabs/tailwindcss

### 7.4 primitives (Radix) ➕
- **Hamzaish learns:** Unstyled, accessible component primitives (the foundation shadcn builds on). Study its accessibility model — a11y our products inherit.
- **Hamza learns:** Accessibility done properly (focus management, ARIA, keyboard) as a baseline, not a retrofit.
- **Credit:** Radix UI (WorkOS) — https://github.com/radix-ui/primitives

### 7.5 headlessui ➕
- **Hamzaish learns:** Accessible unstyled components paired with Tailwind from the same team. A comparison point to Radix for our primitives layer.
- **Hamza learns:** The "logic without styles" separation that lets design and behavior evolve independently.
- **Credit:** tailwindlabs — https://github.com/tailwindlabs/headlessui

### 7.6 motion (Framer Motion) ➕
- **Hamzaish learns:** The animation library in our stack (`ACKNOWLEDGMENTS.md` thanks Motion). Study its declarative animation API for the demo polish our README needs.
- **Hamza learns:** Animation as communication — motion that guides attention rather than decorates.
- **Credit:** Motion (formerly Framer Motion) — https://github.com/motiondivision/motion

### 7.7 material-ui ➕
- **Hamzaish learns:** A comprehensive, mature design-system library — study its theming architecture and component API breadth as a contrast to shadcn's copy-paste model.
- **Hamza learns:** Large-scale component API design and theming systems that scale to thousands of consumers.
- **Credit:** MUI — https://github.com/mui/material-ui

### 7.8 chakra-ui ➕
- **Hamzaish learns:** Style-props ergonomics and strong a11y defaults. Study its developer experience for composing UI quickly.
- **Hamza learns:** DX-first component API design — making the common case delightfully terse.
- **Credit:** Chakra UI — https://github.com/chakra-ui/chakra-ui

### 7.9 mantine ➕
- **Hamzaish learns:** A huge, well-documented component + hooks library. Study the hooks collection — many are copy-worthy utilities for our products.
- **Hamza learns:** Exhaustive documentation with live examples as a competitive moat.
- **Credit:** Mantine — https://github.com/mantinedev/mantine

### 7.10 magicui ➕
- **Hamzaish learns:** Animated, marketing-grade components in the shadcn idiom — directly useful for the landing-page hero/demo polish our research demands.
- **Hamza learns:** The line between tasteful motion and gimmick on a landing page.
- **Credit:** Magic UI — https://github.com/magicuidesign/magicui

### 7.11 tremor ➕
- **Hamzaish learns:** React components for dashboards/charts (KPI cards, charts, deltas) — a strong reference for our telemetry dashboard's card layout.
- **Hamza learns:** Information design for dashboards — showing a metric and its trend at a glance.
- **Credit:** Tremor — https://github.com/tremorlabs/tremor

### 7.12 lucide ➕
- **Hamzaish learns:** The open icon set shadcn/ui uses — consistent, tree-shakeable icons. Study how a community fork (of Feather) sustained and expanded an icon system.
- **Hamza learns:** Visual consistency at scale and stewarding a community design asset.
- **Credit:** Lucide — https://github.com/lucide-icons/lucide

## 8. Backend / database / infra

Our default backend is Supabase (Postgres + RLS), scaling to Neon + Clerk for multi-tenant B2B (`stack/tech-stack.md`). These are the data/auth/infra repos worth studying.

### 8.1 supabase 📚
- **Hamzaish learns:** Our default backend — Postgres + Auth + Storage + RLS + pgvector in one project. Study RLS policies (security baked into the DB) and generated types — the model our `/security-check` RLS reminder assumes.
- **Hamza learns:** "Firebase, but Postgres and open" — building an integrated platform on boring, durable tech (SQL).
- **Credit:** supabase — https://github.com/supabase/supabase

### 8.2 drizzle-orm 📚
- **Hamzaish learns:** A type-safe, SQL-first TypeScript ORM (our scale-path ORM). Study its schema-as-code and zero-runtime-overhead philosophy vs. heavier ORMs.
- **Hamza learns:** Type safety without the abstraction tax — staying close to SQL while gaining inference.
- **Credit:** Drizzle Team — https://github.com/drizzle-team/drizzle-orm

### 8.3 zod 📚
- **Hamzaish learns:** Schema validation + type inference — our `lib/env.ts` and form/output validation backbone. Study how one schema drives both runtime checks and static types (the contract our agents validate against).
- **Hamza learns:** "Parse, don't validate" — making invalid states unrepresentable at the boundary.
- **Credit:** Colin McDonnell — https://github.com/colinhacks/zod

### 8.4 neon 📚
- **Hamzaish learns:** Serverless Postgres that branches like git (a DB per preview deploy), scales to zero, pgvector built in — our documented scale-path DB (shipped by IP Radar / Scope Intelligence). Study branch-per-PR ergonomics.
- **Hamza learns:** Rethinking a stateful resource (the DB) with git-like branching — a genuinely fresh primitive.
- **Credit:** Neon — https://github.com/neondatabase/neon

### 8.5 prisma ➕
- **Hamzaish learns:** Schema-first ORM with great migrations and a polished client. Compare its DX to Drizzle to justify our ORM choice in a product's `decisions/`.
- **Hamza learns:** Developer-experience investment (intuitive schema, generated client) as a product strategy.
- **Credit:** Prisma — https://github.com/prisma/prisma

### 8.6 pocketbase ➕
- **Hamzaish learns:** An entire backend (DB + auth + admin + realtime) in a single Go binary. The extreme of "zero-friction backend" — a useful contrast to Supabase's hosted model.
- **Hamza learns:** Radical simplicity in distribution — one file you run, no infra.
- **Credit:** PocketBase — https://github.com/pocketbase/pocketbase

### 8.7 trpc ➕
- **Hamzaish learns:** End-to-end type safety between client and server with no codegen. Study how it removes the API-contract drift class of bugs for full-stack products.
- **Hamza learns:** Type safety across the network boundary — the frontend knows the backend's shape for free.
- **Credit:** tRPC — https://github.com/trpc/trpc

### 8.8 hono ➕
- **Hamzaish learns:** A tiny, fast, edge-ready web framework that runs everywhere (Workers, Bun, Node). Relevant to our Cloudflare Workers deviation path.
- **Hamza learns:** Writing portable server code that runs across runtimes without rewrites.
- **Credit:** Hono — https://github.com/honojs/hono

### 8.9 nest ➕
- **Hamzaish learns:** Opinionated, modular backend architecture (DI, modules, decorators) for larger services. Study its structure if a product outgrows route handlers.
- **Hamza learns:** Enterprise backend architecture patterns (dependency injection, modularity) and when they earn their complexity.
- **Credit:** NestJS — https://github.com/nestjs/nest

### 8.10 appwrite ➕
- **Hamzaish learns:** An open-source backend platform (auth, DB, functions, storage). A Supabase alternative worth knowing for the comparison and its function/runtime model.
- **Hamza learns:** Platform breadth vs. depth trade-offs across competing BaaS designs.
- **Credit:** Appwrite — https://github.com/appwrite/appwrite

### 8.11 payload ➕
- **Hamzaish learns:** A code-first, TypeScript headless CMS that's also an app framework. Study its config-as-code and auto-generated admin — useful for content-heavy products.
- **Hamza learns:** Generating an admin UI from a typed config — define once, get tooling free.
- **Credit:** Payload — https://github.com/payloadcms/payload

### 8.12 medusa ➕
- **Hamzaish learns:** A modular open-source commerce backend. Study its plugin/module architecture for extensibility patterns applicable to our factory's pluggable design.
- **Hamza learns:** Designing a domain (commerce) as composable modules others extend.
- **Credit:** Medusa — https://github.com/medusajs/medusa

### 8.13 clerk (javascript) ➕
- **Hamzaish learns:** Our scale-path auth (multi-tenant orgs, SSO/SAML, prebuilt UI). Study its organization/role model and prebuilt components — what we adopt at B2B scale.
- **Hamza learns:** Auth as a polished product surface — how much UX lives in a "boring" auth flow.
- **Credit:** Clerk — https://github.com/clerk/javascript

### 8.14 redis ➕
- **Hamzaish learns:** The canonical in-memory data store; relevant to caching/queues at scale, and (per our AGPL research) a license case study — it **added AGPLv3 in Redis 8 (May 2025)** after SSPL hurt community relations.
- **Hamza learns:** Data-structure-server design and how license missteps damage trust (then get corrected).
- **Credit:** Redis — https://github.com/redis/redis

## 9. Testing & quality

Our `/test` skill enforces TDD and the Prove-It pattern. These are the tools and the bar for test/quality craft.

### 9.1 vitest ➕
- **Hamzaish learns:** Fast, Vite-native test runner with great TS/ESM support — the modern default our scaffolded products should use. Study its watch mode and in-source testing.
- **Hamza learns:** A tight test feedback loop changes whether you actually practice TDD.
- **Credit:** Vitest — https://github.com/vitest-dev/vitest

### 9.2 playwright ➕
- **Hamzaish learns:** Reliable end-to-end browser testing with auto-wait, tracing, and codegen. The tool behind our preview-verification ethos (verify, don't ask the user to check).
- **Hamza learns:** Writing E2E tests that aren't flaky — auto-waiting and tracing as first-class.
- **Credit:** Microsoft — https://github.com/microsoft/playwright

### 9.3 jest ➕
- **Hamzaish learns:** The long-time default with snapshot testing and a vast ecosystem. Study its matchers/mocking API — much of the field's testing vocabulary comes from here.
- **Hamza learns:** API design that became an industry standard; the power of great defaults + docs.
- **Credit:** Jest (Meta/OpenJS) — https://github.com/jestjs/jest

### 9.4 react-testing-library ➕
- **Hamzaish learns:** Testing components the way users use them (by role/text, not internals). Study its philosophy — tests that survive refactors.
- **Hamza learns:** "Test behavior, not implementation" — a principle that makes tests durable assets.
- **Credit:** Testing Library — https://github.com/testing-library/react-testing-library

### 9.5 cypress ➕
- **Hamzaish learns:** Developer-friendly E2E with time-travel debugging. A comparison point to Playwright for product test strategy.
- **Hamza learns:** Debuggability as a testing feature — seeing exactly what the test saw.
- **Credit:** Cypress — https://github.com/cypress-io/cypress

### 9.6 msw ➕
- **Hamzaish learns:** API mocking at the network layer (Service Worker) — test against realistic network behavior without a backend. Useful for testing our products' API integrations.
- **Hamza learns:** Mocking at the right layer (network, not function) so tests reflect reality.
- **Credit:** Mock Service Worker — https://github.com/mswjs/msw

### 9.7 biome ➕
- **Hamzaish learns:** A single fast Rust toolchain for lint + format (the ESLint+Prettier consolidation, Bun-style). Worth evaluating to cut config from our scaffold.
- **Hamza learns:** Toolchain consolidation and performance as DX wins.
- **Credit:** Biome — https://github.com/biomejs/biome

### 9.8 eslint ➕
- **Hamzaish learns:** The extensible linting standard — study its plugin/rule architecture and how custom rules can enforce house conventions (e.g. "never import from `references/`").
- **Hamza learns:** Encoding team conventions as automated, enforceable rules.
- **Credit:** ESLint (OpenJS) — https://github.com/eslint/eslint

### 9.9 prettier ➕
- **Hamzaish learns:** Opinionated formatting that ends style debates. Study the "one true format, minimal config" philosophy — it pairs with our momentum-over-bikeshedding ethos.
- **Hamza learns:** Removing whole categories of decisions (and arguments) by being opinionated.
- **Credit:** Prettier — https://github.com/prettier/prettier

### 9.10 storybook ➕
- **Hamzaish learns:** Component workbench + interaction/visual testing in isolation. Useful for building and regression-testing our UI components and the dashboard.
- **Hamza learns:** Developing UI in isolation as both a design tool and a test surface.
- **Credit:** Storybook — https://github.com/storybookjs/storybook

## 10. Docs & DX writing

Our research's conversion diagnosis was largely a *docs* problem (fails the 10-second test, value buried at line ~106). These set the bar for docs that convert and teach.

### 10.1 docusaurus ➕
- **Hamzaish learns:** Batteries-included docs site (versioning, search, MDX, blog). Study its information architecture and "docs + blog in one" model — relevant to pairing our content engine with docs.
- **Hamza learns:** Structuring docs so newcomers and experts both find their path quickly.
- **Credit:** Meta (Docusaurus) — https://github.com/facebook/docusaurus

### 10.2 vitepress ➕
- **Hamzaish learns:** Fast, minimal Vue-powered docs — study its speed and the clean default theme. A model for low-friction docs that load instantly.
- **Hamza learns:** Performance and simplicity in docs tooling; less chrome, more content.
- **Credit:** Vue.js (VitePress) — https://github.com/vuejs/vitepress

### 10.3 starlight ➕
- **Hamzaish learns:** Astro-based docs with excellent defaults and accessibility — aligns with our Astro content-first deviation path. Study its component slots and i18n.
- **Hamza learns:** Accessible, fast docs as a default rather than an upgrade.
- **Credit:** Astro (Starlight) — https://github.com/withastro/starlight

### 10.4 nextra ➕
- **Hamzaish learns:** Next.js + MDX docs/blog framework — closest to our stack for shipping docs alongside a Next app. Study its file-based docs structure.
- **Hamza learns:** Co-locating docs with the product framework you already use.
- **Credit:** Shu Ding (Nextra) — https://github.com/shuding/nextra

### 10.5 mkdocs-material ➕
- **Hamzaish learns:** The gold standard for polished technical docs — study its navigation, search, and content features that make docs feel premium.
- **Hamza learns:** How thoughtful theming and navigation dramatically raise perceived doc quality.
- **Credit:** Martin Donath — https://github.com/squidfunk/mkdocs-material

### 10.6 mkdocs ➕
- **Hamzaish learns:** Simple Markdown-to-site generation — study the minimal core that mkdocs-material extends, to understand the base/theme split.
- **Hamza learns:** A small, stable core with a thriving theme ecosystem on top.
- **Credit:** MkDocs — https://github.com/mkdocs/mkdocs

### 10.7 mdBook ➕
- **Hamzaish learns:** The tool behind The Rust Book — study how it makes book-length, navigable learning content from Markdown. A model for our playbooks-as-a-book.
- **Hamza learns:** Long-form teaching structure — chapters that build understanding progressively.
- **Credit:** Rust (mdBook) — https://github.com/rust-lang/mdBook

### 10.8 slate ➕
- **Hamzaish learns:** Beautiful three-panel API docs (description + code side-by-side). Study the layout for any API-reference docs our products ship.
- **Hamza learns:** Example-adjacent reference docs — code and explanation in the same eyeline.
- **Credit:** Slatedocs — https://github.com/slatedocs/slate

### 10.9 readthedocs.org ➕
- **Hamzaish learns:** Docs hosting/build infrastructure with versioning and previews. Study its versioned-docs model for keeping playbook history navigable.
- **Hamza learns:** Treating docs as a versioned, continuously-built artifact, not a static dump.
- **Credit:** Read the Docs — https://github.com/readthedocs/readthedocs.org

### 10.10 Prompt-Engineering-Guide ➕
- **Hamzaish learns:** Docs *as the product* — a content repo that grew huge by being the canonical reference. The "borrowed-distribution / be-the-reference" growth path our research describes.
- **Hamza learns:** Becoming the definitive written resource for a topic as a distribution strategy.
- **Credit:** DAIR.AI — https://github.com/dair-ai/Prompt-Engineering-Guide

## 11. Release & versioning tooling

Hamzaish tracks its own versions in `meta/changelog.md` and uses scoped auto-commits (`wip(auto):`, `learnings(...)`). Our research also found **release cadence is a content engine** — these tools make cadence cheap and credible.

### 11.1 changesets ➕
- **Hamzaish learns:** Contributor-friendly versioning for monorepos — each change ships an intent file; releases aggregate them into a changelog. Ideal model for versioning the factory and per-product changelogs.
- **Hamza learns:** Capturing release intent at PR time, not scrambling to write a changelog later.
- **Credit:** Changesets — https://github.com/changesets/changesets

### 11.2 semantic-release ➕
- **Hamzaish learns:** Fully automated versioning + changelog + publish driven by commit messages. Study it to automate our release notes from conventional commits.
- **Hamza learns:** Removing humans from the error-prone parts of releasing (version bumps, tags, notes).
- **Credit:** semantic-release — https://github.com/semantic-release/semantic-release

### 11.3 release-please ➕
- **Hamzaish learns:** Generates release PRs from conventional commits — a gentler, review-gated alternative to full automation. Fits our "gate at each step" philosophy.
- **Hamza learns:** Keeping a human approval in the release loop while automating everything around it.
- **Credit:** Google APIs — https://github.com/googleapis/release-please

### 11.4 commitlint ➕
- **Hamzaish learns:** Enforces conventional-commit format — the structured-commit discipline our scoped commit prefixes already gesture at. Wire it to make our commit grammar enforceable.
- **Hamza learns:** Structured commits as machine-readable history that powers changelogs and automation.
- **Credit:** conventional-changelog — https://github.com/conventional-changelog/commitlint

### 11.5 goreleaser ➕
- **Hamzaish learns:** One-command release automation for Go (binaries, checksums, Homebrew, Docker, release notes). The model for "release as a single reproducible command."
- **Hamza learns:** Treating a release as a deterministic build artifact, not a manual ritual.
- **Credit:** GoReleaser — https://github.com/goreleaser/goreleaser

### 11.6 release-it ➕
- **Hamzaish learns:** Flexible, interactive release automation (version, tag, changelog, GitHub release, publish) with plugins. A lighter alternative for single-package products.
- **Hamza learns:** Composable release steps you can adopt incrementally.
- **Credit:** release-it — https://github.com/release-it/release-it

### 11.7 git-cliff ➕
- **Hamzaish learns:** A highly configurable changelog generator from git history (Rust). Study its templating to auto-build human-readable changelogs from our commit stream.
- **Hamza learns:** Turning raw git history into a narrative changelog via templates.
- **Credit:** Orhun Parmaksız — https://github.com/orhun/git-cliff

### 11.8 lerna ➕
- **Hamzaish learns:** The original monorepo versioning/publishing tool — study its versioning modes (fixed vs. independent) for multi-package release strategy.
- **Hamza learns:** Monorepo release strategy trade-offs (lockstep vs. independent versions).
- **Credit:** Lerna (Nx) — https://github.com/lerna/lerna

### 11.9 np ➕
- **Hamzaish learns:** A better `npm publish` with safety checks (tests, clean tree, 2FA prompts). Study its pre-publish checklist — the same gate-before-ship instinct as our `/ship`.
- **Hamza learns:** Guardrails on the irreversible action (publish) so mistakes can't slip through.
- **Credit:** Sindre Sorhus — https://github.com/sindresorhus/np

### 11.10 all-contributors ➕
- **Hamzaish learns:** Automates crediting *every* contributor (code, docs, design, bug reports) in the README. This is our **"when in doubt, credit" house rule as tooling** — a bot that ensures no contribution goes unnamed.
- **Hamza learns:** Systematizing generosity — making credit automatic so it never gets skipped.
- **Credit:** All Contributors — https://github.com/all-contributors/all-contributors

## 12. Security & secrets

Hamzaish ships a 50+-check security gate, a secret-scan-before-push, and a `/security-check` skill (incl. pinning `claude-code-action`). These are the tools and references behind that posture (`docs/security.md`).

### 12.1 gitleaks ➕
- **Hamzaish learns:** The exact tool our `auto-commit.sh` shells out to (with a built-in grep fallback) to scan to-be-pushed commits for secrets. Study its rules/config to tune our pre-push scan.
- **Hamza learns:** Defense-in-depth — assume a secret will be committed someday and catch it before it leaves the machine.
- **Credit:** Gitleaks — https://github.com/gitleaks/gitleaks

### 12.2 trufflehog ➕
- **Hamzaish learns:** Secret scanning with *live credential verification* (it tries the key to see if it's active). Study verified-vs-unverified findings to cut false-positive noise in our gate.
- **Hamza learns:** Reducing alert fatigue by verifying findings, not just pattern-matching.
- **Credit:** Truffle Security — https://github.com/trufflesecurity/trufflehog

### 12.3 trivy ➕
- **Hamzaish learns:** All-in-one scanner (deps, containers, IaC, secrets, misconfig). A model for a single pre-launch scan covering many surfaces — extend our security gate toward this breadth.
- **Hamza learns:** Comprehensive, fast vulnerability scanning as a routine CI step, not a special event.
- **Credit:** Aqua Security — https://github.com/aquasecurity/trivy

### 12.4 semgrep ➕
- **Hamzaish learns:** Pattern-based static analysis with readable, custom rules — encode our own security anti-patterns (e.g. service-role key in client code) as Semgrep rules.
- **Hamza learns:** Writing static-analysis rules that catch your specific recurring mistakes.
- **Credit:** Semgrep — https://github.com/semgrep/semgrep

### 12.5 nuclei ➕
- **Hamzaish learns:** Template-based vulnerability scanning of running endpoints. Useful for post-deploy checks of our products' live surfaces.
- **Hamza learns:** Community-templated scanning — leverage thousands of shared detections instead of writing your own.
- **Credit:** ProjectDiscovery — https://github.com/projectdiscovery/nuclei

### 12.6 sops ➕
- **Hamzaish learns:** Encrypts secrets *in the repo* (values, keeping keys readable) so config can be version-controlled safely. A pattern beyond our env-name-only rule for shareable infra config.
- **Hamza learns:** Making secrets management compatible with GitOps without leaking values.
- **Credit:** SOPS (CNCF) — https://github.com/getsops/sops

### 12.7 infisical 📚
- **Hamzaish learns:** Open-source secrets management — *and* a growth case from our road-to-stars research (90 → 3,000 stars in 2 months via the Reddit → newsletter → Trending loop). Study both the product and that distribution loop.
- **Hamza learns:** A concrete, replicable distribution sequence that moved a real repo 33× in two months.
- **Credit:** Infisical — https://github.com/Infisical/infisical

### 12.8 CheatSheetSeries (OWASP) ➕
- **Hamzaish learns:** Concise, authoritative security guidance per topic (authn, RLS-adjacent authz, input validation). Source material to keep our 50+-check gate aligned with consensus best practice.
- **Hamza learns:** Knowing where the canonical security references live, and citing them instead of guessing.
- **Credit:** OWASP — https://github.com/OWASP/CheatSheetSeries

### 12.9 grype ➕
- **Hamzaish learns:** Fast dependency vulnerability scanning (pairs with the syft SBOM tool). Study SBOM-based scanning for our supply-chain awareness.
- **Hamza learns:** Knowing exactly what's in your dependency tree (SBOM) as the basis for trusting it.
- **Credit:** Anchore — https://github.com/anchore/grype

### 12.10 harden-runner ➕
- **Hamzaish learns:** Locks down GitHub Actions runners (egress filtering, tamper detection) — directly relevant to our `/security-check`'s focus on unpinned/over-permissioned Actions and `claude-code-action` hardening.
- **Hamza learns:** Treating CI as a privileged, attackable environment that needs hardening like prod.
- **Credit:** StepSecurity — https://github.com/step-security/harden-runner

## 13. Architecture, learning & "awesome" repos

The "borrowed-distribution" category our research highlighted (karpathy: 68% of nanoGPT-era stars arrived *after* pushes stopped). These compound as references and earn stars by being the canonical learning resource.

### 13.1 nanoGPT 📚
- **Hamzaish learns:** Andrej Karpathy's minimal, readable GPT implementation — credited in `ACKNOWLEDGMENTS.md` for the eval-driven, learning-flywheel conviction behind our Selection layer. Study how a teaching-sized codebase compounds attention while frozen.
- **Hamza learns:** Clarity as the highest form of expertise — the ability to strip an idea to its teachable core.
- **Credit:** Andrej Karpathy — https://github.com/karpathy/nanoGPT

### 13.2 llm.c 📚
- **Hamzaish learns:** GPT training in raw C/CUDA — Karpathy's reference for understanding the full stack with no framework magic. The "understand it by rebuilding it minimally" method we apply to studied repos.
- **Hamza learns:** Going one layer deeper than comfortable to truly understand a system.
- **Credit:** Andrej Karpathy — https://github.com/karpathy/llm.c

### 13.3 system-design-primer ➕
- **Hamzaish learns:** The canonical system-design reference — useful when a product's architecture decisions (`decisions/`) need grounding in scalability fundamentals.
- **Hamza learns:** A structured mental model for scaling systems — vocabulary for reasoning about trade-offs.
- **Credit:** Donne Martin — https://github.com/donnemartin/system-design-primer

### 13.4 developer-roadmap ➕
- **Hamzaish learns:** Visual learning paths across the field — a model for how our playbooks could map a builder's journey. Also a top "borrowed-distribution" growth example.
- **Hamza learns:** Mapping a domain so others can navigate it — and spotting your own knowledge gaps.
- **Credit:** Kamran Ahmed — https://github.com/kamranahmedse/developer-roadmap

### 13.5 awesome ➕
- **Hamzaish learns:** The template for every curated "awesome-X" list — and a reminder that curation surfaces (like awesome-claude-code) are distribution channels. Study the list-quality bar.
- **Hamza learns:** The compounding value of a well-maintained curated resource.
- **Credit:** Sindre Sorhus — https://github.com/sindresorhus/awesome

### 13.6 clean-code-javascript ➕
- **Hamzaish learns:** Clean Code principles adapted to JS — a concise reference our `/code-review` and `/simplify` skills can cite for readability findings.
- **Hamza learns:** Internalizing naming/function/structure principles that make code reviewable.
- **Credit:** Ryan McDermott — https://github.com/ryanmcdermott/clean-code-javascript

### 13.7 nodebestpractices ➕
- **Hamzaish learns:** A curated, citation-backed list of Node.js best practices — directly applicable to hardening our products' backends.
- **Hamza learns:** Building a deeply-researched reference where every claim links to evidence (our own research standard).
- **Credit:** Yoni Goldberg — https://github.com/goldbergyoni/nodebestpractices

### 13.8 javascript-algorithms ➕
- **Hamzaish learns:** Algorithms/data-structures with explanations — a teaching repo whose structure (concept + code + complexity) models how to document a pattern well.
- **Hamza learns:** Strengthening CS fundamentals and the craft of explaining them.
- **Credit:** Oleksii Trekhleb — https://github.com/trekhleb/javascript-algorithms

### 13.9 public-apis ➕
- **Hamzaish learns:** A massive directory of free APIs — a fast source of integrations/data for new products, and a study in how a simple useful list became a top-starred repo.
- **Hamza learns:** Utility + maintenance discipline can out-compound flashier projects.
- **Credit:** public-apis — https://github.com/public-apis/public-apis

### 13.10 You-Dont-Know-JS ➕
- **Hamzaish learns:** Deep, free book series on JS internals — the "be the definitive resource" content strategy applied to a language.
- **Hamza learns:** Depth as authority — mastering fundamentals deeply enough to teach them.
- **Credit:** Kyle Simpson — https://github.com/getify/You-Dont-Know-JS

### 13.11 project-based-learning ➕
- **Hamzaish learns:** A curated list of build-something tutorials — aligns with our "the ship is the test / learn by building" ethos. A model for structuring our own learn-by-doing playbooks.
- **Hamza learns:** Learning by building real projects beats passive study — and curating that path for others.
- **Credit:** practical-tutorials — https://github.com/practical-tutorials/project-based-learning

## 14. Build tools, bundlers & monorepo

The speed layer under everything. Several products (midday, cal.com) show the monorepo patterns worth knowing as the factory's product count grows.

### 14.1 vite ➕
- **Hamzaish learns:** The dev-server/build standard (instant HMR, esbuild dev + Rollup prod). Underlies Vitest and much of our tooling — study its plugin API.
- **Hamza learns:** Why fast feedback loops (instant HMR) change how you build.
- **Credit:** Vite (VoidZero) — https://github.com/vitejs/vite

### 14.2 esbuild ➕
- **Hamzaish learns:** The Go bundler that reset expectations for build speed. Study its architecture for why it's 10–100× faster — performance via language + design choices.
- **Hamza learns:** Order-of-magnitude wins come from rethinking the approach, not micro-optimizing.
- **Credit:** Evan Wallace — https://github.com/evanw/esbuild

### 14.3 swc ➕
- **Hamzaish learns:** Rust-based TS/JS compiler powering Next.js's fast builds. Study where it replaces Babel and the plugin model.
- **Hamza learns:** The systematic migration of JS tooling to faster native languages.
- **Credit:** SWC — https://github.com/swc-project/swc

### 14.4 rspack ➕
- **Hamzaish learns:** A Rust, webpack-compatible bundler — study how it offers a drop-in upgrade path (compatibility as a migration strategy).
- **Hamza learns:** Easing adoption by being compatible with what people already use.
- **Credit:** Rspack (ByteDance) — https://github.com/web-infra-dev/rspack

### 14.5 rollup ➕
- **Hamzaish learns:** The library-bundler standard (tree-shaking, ESM output) under Vite's prod build. Study its plugin ecosystem and output formats for any package we publish.
- **Hamza learns:** Bundling for libraries vs. apps — different goals, different tools.
- **Credit:** Rollup — https://github.com/rollup/rollup

### 14.6 turborepo ➕
- **Hamzaish learns:** High-performance monorepo builds with caching and task pipelines. The model for managing the factory's growing set of products/packages efficiently.
- **Hamza learns:** Build caching and task orchestration — never rebuild what hasn't changed.
- **Credit:** Vercel (Turborepo) — https://github.com/vercel/turborepo

### 14.7 nx ➕
- **Hamzaish learns:** A powerful monorepo system with generators, dependency graphs, and affected-only commands. Study its code generators as a parallel to our `/scaffold`.
- **Hamza learns:** Scaling a monorepo with tooling that understands the dependency graph.
- **Credit:** Nx — https://github.com/nrwl/nx

### 14.8 pnpm ➕
- **Hamzaish learns:** Fast, disk-efficient package manager with strict, content-addressed `node_modules` and first-class workspaces. The non-Bun monorepo default (our existing pnpm products are fine per the stack ADR).
- **Hamza learns:** Solving a real resource problem (disk/duplication) with a smarter data model.
- **Credit:** pnpm — https://github.com/pnpm/pnpm

### 14.9 oxc ➕
- **Hamzaish learns:** A Rust toolchain (parser, linter, resolver) aiming to unify and accelerate JS tooling — the frontier of the "consolidate + go native" trend Biome/SWC started.
- **Hamza learns:** Watching where a fast-moving tooling space is heading before it arrives.
- **Credit:** Oxc — https://github.com/oxc-project/oxc

## 15. Observability, analytics & transactional infra

Our analytics stack runs ~$0/mo across 10 products (`stack/analytics-stack.md`). These are the open-source repos behind it.

### 15.1 posthog-js 📚
- **Hamzaish learns:** Product analytics (funnels, retention, replays, flags) — our dashboard's data source. Study the App-Router init and the `track()` event model our `lib/analytics.ts` wraps.
- **Hamza learns:** Instrumenting for retention/funnels from day one so you can later prove (or disprove) PMF honestly.
- **Credit:** PostHog — https://github.com/PostHog/posthog-js

### 15.2 sentry-javascript 📚
- **Hamzaish learns:** Error monitoring + performance (in our env list and per-product MCP). Study the Next.js setup and breadcrumb model feeding our dashboard's 24h error-rate card.
- **Hamza learns:** Making production errors observable and actionable instead of invisible.
- **Credit:** Sentry — https://github.com/getsentry/sentry-javascript

### 15.3 analytics (Plausible) 📚
- **Hamzaish learns:** Clean, cookie-free, GDPR-friendly web analytics (self-host or cheap) — our privacy-first web-analytics choice. Study the self-host story and lightweight script.
- **Hamza learns:** Privacy-respecting analytics as a positioning choice users increasingly reward.
- **Credit:** Plausible — https://github.com/plausible/analytics

### 15.4 inngest-js 📚
- **Hamzaish learns:** Type-safe background jobs (crons, retries, fan-out) — our jobs layer (`stack/tech-stack.md`). Study the durable-function/step model for reliable async work in products.
- **Hamza learns:** Durable execution — writing async workflows that survive failures and retries cleanly.
- **Credit:** Inngest — https://github.com/inngest/inngest-js

### 15.5 react-email 📚
- **Hamzaish learns:** Build transactional emails as React components (pairs with Resend in our stack). Study the components + preview server — our products' `emails/` directory follows this.
- **Hamza learns:** Bringing component-model ergonomics to a historically painful medium (HTML email).
- **Credit:** Resend — https://github.com/resend/react-email

---

## CREDITS — every repo, with its link

> Honoring the house rule: *when in doubt, credit.* Every repo studied above, listed once with owner + link. 📚 = surfaced by our prior research; ➕ = added exemplar; ⚠ = handle/figure to re-verify before public citation.

**1. Agent frameworks & autonomous agents**
1. AutoGPT 📚 — Significant-Gravitas — https://github.com/Significant-Gravitas/AutoGPT
2. dify 📚 — langgenius — https://github.com/langgenius/dify
3. OpenHands 📚 — All-Hands-AI — https://github.com/All-Hands-AI/OpenHands
4. MetaGPT 📚 — FoundationAgents — https://github.com/FoundationAgents/MetaGPT
5. crewAI 📚 — crewAIInc — https://github.com/crewAIInc/crewAI
6. gpt-engineer 📚 — AntonOsika — https://github.com/AntonOsika/gpt-engineer
7. gpt-pilot 📚 — Pythagora-io — https://github.com/Pythagora-io/gpt-pilot
8. developer 📚 — smol-ai — https://github.com/smol-ai/developer
9. langchain ➕ — langchain-ai — https://github.com/langchain-ai/langchain
10. langgraph ➕ — langchain-ai — https://github.com/langchain-ai/langgraph
11. autogen ➕ — microsoft — https://github.com/microsoft/autogen
12. AgentGPT ➕ — reworkd — https://github.com/reworkd/AgentGPT
13. SuperAGI ➕ — TransformerOptimus — https://github.com/TransformerOptimus/SuperAGI
14. babyagi ➕ — yoheinakajima — https://github.com/yoheinakajima/babyagi
15. pydantic-ai ➕ — Pydantic — https://github.com/pydantic/pydantic-ai
16. letta ➕ — Letta — https://github.com/letta-ai/letta
17. agno ➕ — agno-agi — https://github.com/agno-agi/agno
18. swarm ➕ — openai — https://github.com/openai/swarm
19. aider ➕ — Aider-AI — https://github.com/Aider-AI/aider
20. cline ➕ — Cline — https://github.com/cline/cline

**2. Claude-Code-native tooling & agent harnesses**
21. claude-code 📚 — anthropics — https://github.com/anthropics/claude-code
22. gstack 📚 ⚠ — garrytan — https://github.com/garrytan/gstack
23. claude-flow 📚 — ruvnet — https://github.com/ruvnet/claude-flow
24. BMAD-METHOD 📚 — bmad-code-org — https://github.com/bmad-code-org/BMAD-METHOD
25. awesome-claude-code 📚 — hesreallyhim — https://github.com/hesreallyhim/awesome-claude-code
26. claude-code-templates 📚 — davila7 — https://github.com/davila7/claude-code-templates
27. SuperClaude_Framework 📚 — SuperClaude-Org — https://github.com/SuperClaude-Org/SuperClaude_Framework
28. ECC 📚 ⚠ — affaan-m — https://github.com/affaan-m/ECC
29. agency-agents 📚 ⚠ — msitarzewski — https://github.com/msitarzewski/agency-agents
30. agent-skills 📚 — addyosmani — https://github.com/addyosmani/agent-skills
31. gbrain 📚 — garrytan — https://github.com/garrytan/gbrain
32. hermes-agent 📚 — nousresearch — https://github.com/nousresearch/hermes-agent
33. openclaw 📚 — openclaw — https://github.com/openclaw/openclaw
34. ponytail 📚 — DietrichGebert — https://github.com/DietrichGebert/ponytail
35. servers 📚 — modelcontextprotocol — https://github.com/modelcontextprotocol/servers
36. anthropic-sdk-typescript 📚 — anthropics — https://github.com/anthropics/anthropic-sdk-typescript
37. cabinet 📚 ⚠ — hilash — https://github.com/hilash/cabinet
38. HustleGPT-Challenge 📚 ⚠ — owner unconfirmed — search GitHub for "HustleGPT-Challenge"

**3. AI SDKs & LLM app frameworks**
39. ai 📚 — vercel — https://github.com/vercel/ai
40. anthropic-cookbook ➕ — anthropics — https://github.com/anthropics/anthropic-cookbook
41. openai-python ➕ — openai — https://github.com/openai/openai-python
42. openai-node ➕ — openai — https://github.com/openai/openai-node
43. llama_index ➕ — run-llama — https://github.com/run-llama/llama_index
44. ollama ➕ — ollama — https://github.com/ollama/ollama
45. llama.cpp ➕ — ggml-org — https://github.com/ggml-org/llama.cpp
46. transformers ➕ — huggingface — https://github.com/huggingface/transformers
47. mem0 ➕ — mem0ai — https://github.com/mem0ai/mem0
48. chroma ➕ — chroma-core — https://github.com/chroma-core/chroma
49. qdrant ➕ — qdrant — https://github.com/qdrant/qdrant
50. weaviate ➕ — weaviate — https://github.com/weaviate/weaviate
51. litellm ➕ — BerriAI — https://github.com/BerriAI/litellm
52. instructor ➕ — jxnl — https://github.com/jxnl/instructor
53. guidance ➕ — guidance-ai — https://github.com/guidance-ai/guidance

**4. Self-hosted apps (the growth winners)**
54. immich 📚 — immich-app — https://github.com/immich-app/immich
55. AppFlowy 📚 — AppFlowy-IO — https://github.com/AppFlowy-IO/AppFlowy
56. vaultwarden 📚 — dani-garcia — https://github.com/dani-garcia/vaultwarden
57. plane 📚 — makeplane — https://github.com/makeplane/plane
58. mastodon 📚 — mastodon — https://github.com/mastodon/mastodon
59. server (Nextcloud) 📚 — nextcloud — https://github.com/nextcloud/server
60. grafana 📚 — grafana — https://github.com/grafana/grafana
61. minio 📚 — minio — https://github.com/minio/minio
62. logseq 📚 — logseq — https://github.com/logseq/logseq
63. siyuan 📚 — siyuan-note — https://github.com/siyuan-note/siyuan
64. alist 📚 — AlistGo — https://github.com/AlistGo/alist
65. RSSHub 📚 — DIYgod — https://github.com/DIYgod/RSSHub
66. khoj 📚 — khoj-ai — https://github.com/khoj-ai/khoj
67. glance 📚 — glanceapp — https://github.com/glanceapp/glance
68. maybe 📚 — maybe-finance — https://github.com/maybe-finance/maybe
69. rustdesk 📚 — rustdesk — https://github.com/rustdesk/rustdesk
70. stable-diffusion-webui 📚 — AUTOMATIC1111 — https://github.com/AUTOMATIC1111/stable-diffusion-webui
71. firecrawl 📚 — mendableai — https://github.com/mendableai/firecrawl
72. Deep-Live-Cam 📚 — hacksider — https://github.com/hacksider/Deep-Live-Cam
73. n8n ➕ — n8n-io — https://github.com/n8n-io/n8n
74. coolify ➕ — coollabsio — https://github.com/coollabsio/coolify
75. Ghost ➕ — TryGhost — https://github.com/TryGhost/Ghost

**5. Developer CLI / DX tools**
76. vhs 📚 — charmbracelet — https://github.com/charmbracelet/vhs
77. bun 📚 — oven-sh — https://github.com/oven-sh/bun
78. cli (supabase) 📚 — supabase — https://github.com/supabase/cli
79. stripe-cli 📚 — stripe — https://github.com/stripe/stripe-cli
80. cli (gh) ➕ — cli — https://github.com/cli/cli
81. bubbletea ➕ — charmbracelet — https://github.com/charmbracelet/bubbletea
82. gum ➕ — charmbracelet — https://github.com/charmbracelet/gum
83. fzf ➕ — junegunn — https://github.com/junegunn/fzf
84. ripgrep ➕ — BurntSushi — https://github.com/BurntSushi/ripgrep
85. bat ➕ — sharkdp — https://github.com/sharkdp/bat
86. fd ➕ — sharkdp — https://github.com/sharkdp/fd
87. eza ➕ — eza-community — https://github.com/eza-community/eza
88. starship ➕ — starship — https://github.com/starship/starship
89. lazygit ➕ — jesseduffield — https://github.com/jesseduffield/lazygit
90. delta ➕ — dandavison — https://github.com/dandavison/delta
91. just ➕ — casey — https://github.com/casey/just
92. uv ➕ — astral-sh — https://github.com/astral-sh/uv
93. zellij ➕ — zellij-org — https://github.com/zellij-org/zellij
94. zoxide ➕ — ajeetdsouza — https://github.com/ajeetdsouza/zoxide
95. tldr ➕ — tldr-pages — https://github.com/tldr-pages/tldr

**6. Web & app boilerplates / starters**
96. next.js 📚 — vercel — https://github.com/vercel/next.js
97. taxonomy 📚 — shadcn-ui — https://github.com/shadcn-ui/taxonomy
98. SaaS-Boilerplate 📚 — ixartz — https://github.com/ixartz/SaaS-Boilerplate
99. saasrock 📚 — AlexandroMtzG — https://github.com/AlexandroMtzG/saasrock
100. create-t3-app ➕ — t3-oss — https://github.com/t3-oss/create-t3-app
101. Next-js-Boilerplate ➕ — ixartz — https://github.com/ixartz/Next-js-Boilerplate
102. precedent ➕ — steven-tey — https://github.com/steven-tey/precedent
103. commerce ➕ — vercel — https://github.com/vercel/commerce
104. nextjs-subscription-payments ➕ — vercel — https://github.com/vercel/nextjs-subscription-payments
105. cal.com ➕ — calcom — https://github.com/calcom/cal.com
106. midday ➕ — midday-ai — https://github.com/midday-ai/midday
107. saas-starter-kit ➕ — boxyhq — https://github.com/boxyhq/saas-starter-kit
108. next-enterprise ➕ — Blazity — https://github.com/Blazity/next-enterprise
109. open-saas ➕ — wasp-lang — https://github.com/wasp-lang/open-saas

**7. UI components & design systems**
110. ui (shadcn) 📚 — shadcn-ui — https://github.com/shadcn-ui/ui
111. charts (shadcn) 📚 — shadcn-ui — https://github.com/shadcn-ui/ui
112. tailwindcss 📚 — tailwindlabs — https://github.com/tailwindlabs/tailwindcss
113. primitives (Radix) ➕ — radix-ui — https://github.com/radix-ui/primitives
114. headlessui ➕ — tailwindlabs — https://github.com/tailwindlabs/headlessui
115. motion ➕ — motiondivision — https://github.com/motiondivision/motion
116. material-ui ➕ — mui — https://github.com/mui/material-ui
117. chakra-ui ➕ — chakra-ui — https://github.com/chakra-ui/chakra-ui
118. mantine ➕ — mantinedev — https://github.com/mantinedev/mantine
119. magicui ➕ — magicuidesign — https://github.com/magicuidesign/magicui
120. tremor ➕ — tremorlabs — https://github.com/tremorlabs/tremor
121. lucide ➕ — lucide-icons — https://github.com/lucide-icons/lucide

**8. Backend / database / infra**
122. supabase 📚 — supabase — https://github.com/supabase/supabase
123. drizzle-orm 📚 — drizzle-team — https://github.com/drizzle-team/drizzle-orm
124. zod 📚 — colinhacks — https://github.com/colinhacks/zod
125. neon 📚 — neondatabase — https://github.com/neondatabase/neon
126. prisma ➕ — prisma — https://github.com/prisma/prisma
127. pocketbase ➕ — pocketbase — https://github.com/pocketbase/pocketbase
128. trpc ➕ — trpc — https://github.com/trpc/trpc
129. hono ➕ — honojs — https://github.com/honojs/hono
130. nest ➕ — nestjs — https://github.com/nestjs/nest
131. appwrite ➕ — appwrite — https://github.com/appwrite/appwrite
132. payload ➕ — payloadcms — https://github.com/payloadcms/payload
133. medusa ➕ — medusajs — https://github.com/medusajs/medusa
134. javascript (Clerk) ➕ — clerk — https://github.com/clerk/javascript
135. redis ➕ — redis — https://github.com/redis/redis

**9. Testing & quality**
136. vitest ➕ — vitest-dev — https://github.com/vitest-dev/vitest
137. playwright ➕ — microsoft — https://github.com/microsoft/playwright
138. jest ➕ — jestjs — https://github.com/jestjs/jest
139. react-testing-library ➕ — testing-library — https://github.com/testing-library/react-testing-library
140. cypress ➕ — cypress-io — https://github.com/cypress-io/cypress
141. msw ➕ — mswjs — https://github.com/mswjs/msw
142. biome ➕ — biomejs — https://github.com/biomejs/biome
143. eslint ➕ — eslint — https://github.com/eslint/eslint
144. prettier ➕ — prettier — https://github.com/prettier/prettier
145. storybook ➕ — storybookjs — https://github.com/storybookjs/storybook

**10. Docs & DX writing**
146. docusaurus ➕ — facebook — https://github.com/facebook/docusaurus
147. vitepress ➕ — vuejs — https://github.com/vuejs/vitepress
148. starlight ➕ — withastro — https://github.com/withastro/starlight
149. nextra ➕ — shuding — https://github.com/shuding/nextra
150. mkdocs-material ➕ — squidfunk — https://github.com/squidfunk/mkdocs-material
151. mkdocs ➕ — mkdocs — https://github.com/mkdocs/mkdocs
152. mdBook ➕ — rust-lang — https://github.com/rust-lang/mdBook
153. slate ➕ — slatedocs — https://github.com/slatedocs/slate
154. readthedocs.org ➕ — readthedocs — https://github.com/readthedocs/readthedocs.org
155. Prompt-Engineering-Guide ➕ — dair-ai — https://github.com/dair-ai/Prompt-Engineering-Guide

**11. Release & versioning tooling**
156. changesets ➕ — changesets — https://github.com/changesets/changesets
157. semantic-release ➕ — semantic-release — https://github.com/semantic-release/semantic-release
158. release-please ➕ — googleapis — https://github.com/googleapis/release-please
159. commitlint ➕ — conventional-changelog — https://github.com/conventional-changelog/commitlint
160. goreleaser ➕ — goreleaser — https://github.com/goreleaser/goreleaser
161. release-it ➕ — release-it — https://github.com/release-it/release-it
162. git-cliff ➕ — orhun — https://github.com/orhun/git-cliff
163. lerna ➕ — lerna — https://github.com/lerna/lerna
164. np ➕ — sindresorhus — https://github.com/sindresorhus/np
165. all-contributors ➕ — all-contributors — https://github.com/all-contributors/all-contributors

**12. Security & secrets**
166. gitleaks ➕ — gitleaks — https://github.com/gitleaks/gitleaks
167. trufflehog ➕ — trufflesecurity — https://github.com/trufflesecurity/trufflehog
168. trivy ➕ — aquasecurity — https://github.com/aquasecurity/trivy
169. semgrep ➕ — semgrep — https://github.com/semgrep/semgrep
170. nuclei ➕ — projectdiscovery — https://github.com/projectdiscovery/nuclei
171. sops ➕ — getsops — https://github.com/getsops/sops
172. infisical 📚 — Infisical — https://github.com/Infisical/infisical
173. CheatSheetSeries ➕ — OWASP — https://github.com/OWASP/CheatSheetSeries
174. grype ➕ — anchore — https://github.com/anchore/grype
175. harden-runner ➕ — step-security — https://github.com/step-security/harden-runner

**13. Architecture, learning & "awesome" repos**
176. nanoGPT 📚 — karpathy — https://github.com/karpathy/nanoGPT
177. llm.c 📚 — karpathy — https://github.com/karpathy/llm.c
178. system-design-primer ➕ — donnemartin — https://github.com/donnemartin/system-design-primer
179. developer-roadmap ➕ — kamranahmedse — https://github.com/kamranahmedse/developer-roadmap
180. awesome ➕ — sindresorhus — https://github.com/sindresorhus/awesome
181. clean-code-javascript ➕ — ryanmcdermott — https://github.com/ryanmcdermott/clean-code-javascript
182. nodebestpractices ➕ — goldbergyoni — https://github.com/goldbergyoni/nodebestpractices
183. javascript-algorithms ➕ — trekhleb — https://github.com/trekhleb/javascript-algorithms
184. public-apis ➕ — public-apis — https://github.com/public-apis/public-apis
185. You-Dont-Know-JS ➕ — getify — https://github.com/getify/You-Dont-Know-JS
186. project-based-learning ➕ — practical-tutorials — https://github.com/practical-tutorials/project-based-learning

**14. Build tools, bundlers & monorepo**
187. vite ➕ — vitejs — https://github.com/vitejs/vite
188. esbuild ➕ — evanw — https://github.com/evanw/esbuild
189. swc ➕ — swc-project — https://github.com/swc-project/swc
190. rspack ➕ — web-infra-dev — https://github.com/web-infra-dev/rspack
191. rollup ➕ — rollup — https://github.com/rollup/rollup
192. turborepo ➕ — vercel — https://github.com/vercel/turborepo
193. nx ➕ — nrwl — https://github.com/nrwl/nx
194. pnpm ➕ — pnpm — https://github.com/pnpm/pnpm
195. oxc ➕ — oxc-project — https://github.com/oxc-project/oxc

**15. Observability, analytics & transactional infra**
196. posthog-js 📚 — PostHog — https://github.com/PostHog/posthog-js
197. sentry-javascript 📚 — getsentry — https://github.com/getsentry/sentry-javascript
198. analytics (Plausible) 📚 — plausible — https://github.com/plausible/analytics
199. inngest-js 📚 — inngest — https://github.com/inngest/inngest-js
200. react-email 📚 — resend — https://github.com/resend/react-email

---

## Coverage notes (integrity)

- **Stack-research items not re-listed as standalone top-200 entries** but documented in `stack/repos.md` / `stack/tech-stack.md` and worth studying in context: `kinde-oss/kinde-auth-nextjs` (alt auth), `garmeeh/next-seo` (SEO metadata), `resend/email-templates`, Contentlayer/MDX (content), `react-hook-form` + Zod (forms — Zod *is* listed at #124), Convex (reactive backend deviation), and Astro (content-first deviation; represented here via `withastro/starlight` at #148). They're covered in the stack ADRs rather than duplicated.
- **⚠-tagged repos** (#22 gstack, #28 ECC, #29 agency-agents, #37 cabinet, #38 HustleGPT-Challenge): owner handles and/or star figures come from the dated 2026-06-11 star-cohort research and were **not** independently re-confirmed here. Verify the exact owner/URL with `gh repo view <owner>/<repo>` before any public citation (CLAUDE.md hard rule #5).
- **Star counts** quoted in prose are historical (2026-06-11 pull) — re-verify before publishing.
- Three repos (#31 gbrain, #32 hermes-agent, #33 openclaw) are **cloned locally** in `references/` for study; the rest are studied remotely. We port ideas, never import code.

*Compiled 2026-06-18. Provenance: 📚 entries trace to `ACKNOWLEDGMENTS.md`, `references/README.md`, `stack/repos.md`, and the `stack/` ADRs. ➕ entries are widely-known exemplars added to complete the syllabus.*

