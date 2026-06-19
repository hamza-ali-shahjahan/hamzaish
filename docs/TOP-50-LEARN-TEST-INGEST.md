# Top 50 Repos to Learn → Test → Ingest

> **What this is.** The operational sibling of [`LEARN-FROM-REPOS.md`](LEARN-FROM-REPOS.md) (the 200-repo syllabus). That doc says *what* to learn from each repo and *credits* it. **This doc picks the 50 that would most improve Hamzaish, and for each gives a concrete *test* and an exact *ingest target*** — so a lesson doesn't just get admired, it gets adopted, verified, and credited.
>
> **This is a plan, not a mutation.** Nothing in `brain/`, `factory/`, or `meta/` is edited by writing this file. Phase 2 (actually ingesting) is gated on operator approval — see [The ingest protocol](#the-ingest-protocol) at the end.
>
> **House rule, kept:** *when in doubt, credit.* Every entry names the specific debt. Links are canonical in [`LEARN-FROM-REPOS.md` → CREDITS](LEARN-FROM-REPOS.md#credits--every-repo-with-its-link); re-verify any star figure or ⚠-tagged handle before public citation (CLAUDE.md hard rule #5).

## How this was selected

From the 200 in `LEARN-FROM-REPOS.md`, ranked by **impact on the factory itself** — not on a product's tech stack. A repo scored high if its lesson upgrades one of Hamzaish's load-bearing surfaces: the **conversion funnel** (our research: 79 cloners → 1 star), the **brain/memory layer** (Phase C), **agent orchestration & skills**, the **self-improvement loop**, **commit/security safety**, **credits discipline**, or **docs/teaching craft**. Generic product-stack tools (UI kits, bundlers, ORMs) were mostly deprioritized — they live in the 200, not here.

## Legend

- **Priority:** `P0` do-first (the 15 below) · `P1` next · `P2` opportunistic.
- **Provenance:** 📚 surfaced by our prior research · ➕ added exemplar · ⚠ handle/figure to re-verify.
- **Each entry:** **Learn** (the specific pattern) → **Test** (a concrete check that proves it fits/works for us) → **Ingest →** (the exact Hamzaish file the learning lands in).

## ⭐ Do these first — the P0 fifteen (ranked)

These are where the leverage is highest and the risk lowest. Roughly in order:

| # | Repo | The one-line upgrade it buys Hamzaish |
|---|---|---|
| 1 | [immich](#a1-immich-) | Release-cadence-as-content — a visible weekly cadence is a distribution engine. |
| 2 | [AppFlowy](#a2-appflowy-) | Incumbent-anchored title ("open-source X alternative") as the literal headline. |
| 3 | [vhs](#a4-vhs-) | A demo GIF of an agent shipping — fixes "zero images in the repo." |
| 4 | [Plane](#a3-plane-) | README leads with a hero screenshot + zero-friction trial, above the fold. |
| 5 | [gbrain](#b1-gbrain-) | Hybrid retrieval (vector+BM25+RRF) + answers that state what the brain *doesn't* know. |
| 6 | [hermes-agent](#b2-hermes-agent-) | A real closed self-improvement loop: when to promote a one-off into a skill. |
| 7 | [BMAD-METHOD](#c1-bmad-method-) | Make the *method* installable + self-teaching inside the repo. |
| 8 | [claude-code-templates](#a6-claude-code-templates-) | A clone-and-go win in one sitting — the cold-start cure. |
| 9 | [shadcn/ui](#a5-shadcnui-) | Clone-and-own distribution (own the code, not a dependency). |
| 10 | [awesome-claude-code](#a7-awesome-claude-code-) | Get listed on the category's discovery surface. |
| 11 | [maybe-finance](#a8-maybe-finance-) | Stars ≠ PMF, made concrete (54k stars, dead product). |
| 12 | [all-contributors](#f1-all-contributors-) | Automate the legendary credits roll with typed contributions. |
| 13 | [gitleaks](#e1-gitleaks-) | Harden the secret-scan that already guards our auto-push. |
| 14 | [MetaGPT](#c2-metagpt-) | Explicit SOP-encoded handoffs between stage agents. |
| 15 | [nanoGPT](#d1-nanogpt-) | Eval-driven change gating for the factory itself. |

---

## A. Packaging & discoverability — fix the funnel

> Our [road-to-stars research](../meta/research/2026-06-11-road-to-stars.md) diagnosed the gap: distribution works (79 unique cloners/14 days), conversion doesn't (1 star, 0 forks). Every repo here attacks that gap.

### A1. immich 📚 — `P0`
- **Learn:** *Compounding-community* growth: a release roughly every 7 days became a content engine; it flopped on HN 7+ times yet hit 22k+ stars via cadence + Discord/Reddit. Cadence beats one-shot launches.
- **Test:** Does `meta/changelog.md` show a *visible, public-facing* release note at a predictable interval? Today it's an internal changelog, not a shipped cadence → **fails**.
- **Ingest →** new `factory/playbooks/launch-stage/release-cadence-as-content.md` + a learning in `brain/learnings/`.
- **Credit:** immich-app — https://github.com/immich-app/immich

### A2. AppFlowy 📚 — `P0`
- **Learn:** The literal title *"open-source Notion alternative"* drove a 304-pt HN front page 3 days after launch. Incumbent-anchored positioning *as the headline*, not buried in paragraph four.
- **Test:** Can we state Hamzaish as "the open-source ___ alternative / the ___ for one-person founders" in one line a stranger gets in 10s? Draft it; if we can't, the positioning is still abstract.
- **Ingest →** `meta/research/gtm-plan.md` (positioning line) + `README.md` hero sentence.
- **Credit:** AppFlowy-IO — https://github.com/AppFlowy-IO/AppFlowy

### A3. Plane 📚 — `P0`
- **Learn:** "Open-source alternative to Jira" + a hero screenshot + a Docker one-liner / live demo, all above the fold — the "ignition-by-front-page" shape (638-pt HN).
- **Test:** Does `README.md` show a hero image and a zero-friction trial within the first screen? Currently the repo has **zero images** → **fails**.
- **Ingest →** `README.md` (above-the-fold rework) + `docs/`.
- **Credit:** makeplane — https://github.com/makeplane/plane

### A4. vhs 📚 — `P0`
- **Learn:** Scriptable, reproducible terminal GIFs. We already use it for the credits roll (`bun run credits`); the same tool can record "watch an agent ship a product."
- **Test:** Is there a `demo.tape` that renders a GIF of the core promise, linked at the top of the README? A starter tape exists in `meta/research/packaging-preview/demo.tape` but isn't surfaced → **partial**.
- **Ingest →** promote/extend `meta/research/packaging-preview/demo.tape` → `README.md` hero GIF.
- **Credit:** charmbracelet — https://github.com/charmbracelet/vhs

### A5. shadcn/ui 📚 — `P0`
- **Learn:** Distribution by **clone-and-own** — you copy the component into your repo, you own it, zero lock-in. This is *exactly* Hamzaish's skill/`.local`+`.example` model; shadcn proves it's a stars magnet.
- **Test:** Can a stranger adopt a single Hamzaish skill/playbook without taking the whole factory or any runtime dependency? Audit `install.sh` + the plugin/symlink pattern.
- **Ingest →** `docs/architecture.md` (distribution model) + the `factory/plugins/` pattern notes in `CLAUDE.md`.
- **Credit:** shadcn — https://github.com/shadcn-ui/ui

### A6. claude-code-templates 📚 — `P0`
- **Learn:** Installable templates that each deliver a win in one sitting — the clone-and-go packaging our funnel diagnosis says we lack.
- **Test:** Time a cold `bun run setup`: does a stranger reach a *visible, satisfying* first result in < 5 minutes, or is the payoff homework (fill in identity, then someone else's portfolio)? Our research says the latter → **fails**.
- **Ingest →** `install.sh` + `docs/your-first-product.md` (first-run win).
- **Credit:** davila7 — https://github.com/davila7/claude-code-templates

### A7. awesome-claude-code 📚 — `P0`
- **Learn:** The category's **discovery surface** — curated lists are where evaluators browse. Being listed is a distribution channel (the GTM PR I flagged earlier).
- **Test:** Do we meet its inclusion bar and entry format? Read its CONTRIBUTING; draft the entry. (PR itself is Phase 3 — never opened without your go.)
- **Ingest →** `meta/research/gtm-plan.md` (the submission plan).
- **Credit:** hesreallyhim — https://github.com/hesreallyhim/awesome-claude-code

### A8. maybe-finance 📚 — `P0`
- **Learn:** 54k stars, product dead by mid-2025 — the cleanest proof that **stars ≠ PMF** (our hard rule #1, confirmed by data).
- **Test:** Are we tracking PMF (Sean Ellis ≥40% / retention) on a *separate* axis from stars, and never conflating them? Confirm the rule is loud in our success metrics.
- **Ingest →** new `brain/anti-patterns/stars-are-not-pmf.md` (reinforces hard rule #1) + `meta/research/gtm-plan.md`.
- **Credit:** maybe-finance — https://github.com/maybe-finance/maybe

### A9. AutoGPT 📚 — `P1`
- **Learn:** A *single mesmerizing demo* (not features) drove ~185k stars — and the project then struggled to convert the spike into a durable product. Lead with the demo; don't mistake the spike for PMF.
- **Test:** Does the README lead with the demo, and do we have a written guard against celebrating a launch spike as traction?
- **Ingest →** `README.md` + the stars-are-not-pmf anti-pattern (A8).
- **Credit:** Significant-Gravitas — https://github.com/Significant-Gravitas/AutoGPT

### A10. dify 📚 — `P1`
- **Learn:** Lowering *activation cost* via a visual/GUI layer — turning "build an agent" into something a stranger succeeds at fast.
- **Test:** What is Hamzaish's lowest-friction first-run path, and does it produce a result without reading four paragraphs of philosophy first?
- **Ingest →** `docs/your-first-product.md` + `dashboard/` first-run.
- **Credit:** langgenius — https://github.com/langgenius/dify

### A11. developer-roadmap ➕ — `P1`
- **Learn:** The README/visual *is* the product — one diagram teaches the whole mental model and earns the star on sight.
- **Test:** Does our README teach the factory's mental model in one diagram (four layers: brain/factory/products/meta)?
- **Ingest →** `README.md` + `docs/architecture.md`.
- **Credit:** kamranahmedse — https://github.com/kamranahmedse/developer-roadmap

### A12. cal.com ➕ — `P2`
- **Learn:** A mature OSS-SaaS exemplar: "open-source Calendly alternative," disciplined README, monorepo, contributor onboarding.
- **Test:** Do our README + `docs/contributing.md` reach that maturity bar for a first-time contributor?
- **Ingest →** `README.md` + `docs/contributing.md`.
- **Credit:** calcom — https://github.com/calcom/cal.com

### A13. open-saas ➕ — `P2`
- **Learn:** A free, well-documented open SaaS boilerplate engineered for cold adoption.
- **Test:** Can our `templates/` Next.js starter be adopted by a stranger with no tacit knowledge?
- **Ingest →** `templates/` + `docs/your-first-product.md`.
- **Credit:** wasp-lang — https://github.com/wasp-lang/open-saas

---

## B. The brain / memory / RAG layer (Phase C)

> Hamzaish's brain is markdown + a derived SQLite FTS5 index today. These repos are the blueprint for Phase C.

### B1. gbrain 📚 — `P0`
- **Learn:** Entity-extraction + typed edges on every write; **hybrid retrieval = vector + BM25 + reciprocal-rank fusion**; synthesis that always reports *"what the brain doesn't know yet."* (+31.4 P@5 over BM25+vector on its own bench.) Cloned in `references/gbrain`.
- **Test:** Does `/brain-ask` fuse signals beyond FTS5, and does its answer include an explicit gap line? Today it's FTS5-only with no gap analysis → **fails**.
- **Ingest →** `brain/README.md` (Phase-C design) + the `/brain-ask` skill.
- **Credit:** garrytan — https://github.com/garrytan/gbrain *(study-only; `references/README.md`)*

### B2. hermes-agent 📚 — `P0`
- **Learn:** A closed self-improvement loop — decide what to remember, when to *extract a new skill* from experience, FTS5 session search + LLM summarization for cross-session recall, trajectory compression. Cloned in `references/hermes-agent`.
- **Test:** Does `meta/` have an explicit rule for promoting a repeated one-off into a `factory/skills/` skill (vs. carrying it in our head)?
- **Ingest →** `meta/SELF-EVOLUTION.md` + `meta/factory-improving-factory.md`.
- **Credit:** Nous Research — https://github.com/nousresearch/hermes-agent *(study-only)*

### B3. Letta (MemGPT) ➕ — `P1`
- **Learn:** Memory paging — context window as RAM, external store as disk; page memory in/out instead of dumping everything.
- **Test:** Does our brain selectively page relevant context into a session, or load wholesale? Design the paging boundary.
- **Ingest →** `brain/README.md` (Phase-C memory model).
- **Credit:** Letta — https://github.com/letta-ai/letta

### B4. mem0 ➕ — `P1`
- **Learn:** An extractable memory layer that **scores what's worth remembering** before persisting.
- **Test:** Do we score learnings by signal (our rule: *surprise is highest-signal*) before they enter `brain/learnings/`, or append everything flat?
- **Ingest →** `meta/learning-loop-rubric.md` + the `brain/learnings/` convention.
- **Credit:** mem0ai — https://github.com/mem0ai/mem0

### B5. llama_index ➕ — `P2`
- **Learn:** A complete retrieval vocabulary (nodes / query engines / post-processors) — naming that clarifies design.
- **Test:** Is our Phase-C retrieval design named consistently with a known vocabulary, or ad-hoc?
- **Ingest →** `brain/README.md`.
- **Credit:** run-llama — https://github.com/run-llama/llama_index

### B6. anthropic-cookbook ➕ — `P1`
- **Learn:** Runnable recipes for prompt caching, tool-use loops, RAG, and evals — copy *correct* Claude patterns rather than reinvent.
- **Test:** Do our agents use prompt caching + structured tool loops per the cookbook, or hand-rolled plumbing?
- **Ingest →** `stack/agent-stack.md` + product `lib/agents/` pattern notes.
- **Credit:** anthropics — https://github.com/anthropics/anthropic-cookbook

---

## C. Orchestration, skills & control flow (the factory engine)

### C1. BMAD-METHOD 📚 — `P0`
- **Learn:** Our research's **closest structural analog** — a methodology expressed entirely as portable, installable markdown (roles, templates, repeatable process) that teaches the workflow inside the repo.
- **Test:** Can someone install Hamzaish's *method* (not just clone the files) and have the repo teach them the loop? Audit whether the playbooks are self-teaching or assume tacit context.
- **Ingest →** `factory/playbooks/` index + `README.md`.
- **Credit:** bmad-code-org — https://github.com/bmad-code-org/BMAD-METHOD

### C2. MetaGPT 📚 — `P0`
- **Learn:** SOP-encoded handoffs between role agents (PM → architect → engineer) — tacit process made explicit and inspectable.
- **Test:** Do our stage agents (`factory/agents/*`) have explicit handoff contracts (what each passes to the next), or implicit ones?
- **Ingest →** `factory/agents/` + a new handoff-contract note in the relevant stage playbook.
- **Credit:** FoundationAgents — https://github.com/FoundationAgents/MetaGPT

### C3. claude-flow 📚 — `P1`
- **Learn:** A Claude meta-harness that sequences multi-step work deterministically — direct analog to `factory/workflows/`.
- **Test:** Are our workflows deterministic + resumable, or model-driven and fragile mid-run?
- **Ingest →** `factory/workflows/`.
- **Credit:** ruvnet — https://github.com/ruvnet/claude-flow

### C4. crewAI 📚 — `P1`
- **Learn:** A clean object model — agents / tasks / processes as composable first-class objects. Good taste in abstraction boundaries.
- **Test:** Is our agent / skill / workflow split as clean and orthogonal? Re-read `docs/architecture.md` against it.
- **Ingest →** `docs/architecture.md`.
- **Credit:** crewAIInc — https://github.com/crewAIInc/crewAI

### C5. agent-skills 📚 — `P1`
- **Learn:** The spec → build → ship discipline and disciplined skill scoping/naming/chaining (credited in `ACKNOWLEDGMENTS.md`).
- **Test:** Do `factory/skills/` follow consistent scope + naming conventions? Audit for drift.
- **Ingest →** a `factory/skills/` conventions note + `AGENTS.md`.
- **Credit:** Addy Osmani — https://github.com/addyosmani/agent-skills

### C6. gpt-pilot 📚 — `P1`
- **Learn:** Step-gating with a human checkpoint at each step — trust without killing momentum (our momentum-router's exact tension).
- **Test:** Does `/full-cycle` gate at each stage with a clear approval + skip? Confirm against `factory/commands/full-cycle.md`.
- **Ingest →** `factory/commands/full-cycle.md` + `docs/the-momentum-router.md`.
- **Credit:** Pythagora-io — https://github.com/Pythagora-io/gpt-pilot

### C7. gpt-engineer 📚 — `P1`
- **Learn:** spec → clarify → build; a clarifying-questions loop materially improves generated output.
- **Test:** Does `/spec` run a clarifying loop before building, or jump straight to output?
- **Ingest →** `factory/skills/spec`.
- **Credit:** AntonOsika — https://github.com/AntonOsika/gpt-engineer

### C8. LangGraph ➕ — `P1`
- **Learn:** Agent control flow as an explicit graph with persisted state + checkpoints — durable, resumable runs.
- **Test:** Is `/go-live`'s resumable ledger modeled as explicit state with checkpoints, or implicit?
- **Ingest →** the `/go-live` skill + `factory/workflows/`.
- **Credit:** langchain-ai — https://github.com/langchain-ai/langgraph

### C9. Cline ➕ — `P2`
- **Learn:** Plan/act mode separation + per-edit human approval — trust through transparency.
- **Test:** Does builder mode visibly separate "plan" from "act" with approval before edits?
- **Ingest →** `factory/agents/mvp/builder` + `docs/builder-mode.md`.
- **Credit:** Cline — https://github.com/cline/cline

### C10. Aider ➕ — `P2`
- **Learn:** Git-as-feature — every change is a scoped commit with a good message. This is our auto-commit philosophy.
- **Test:** Do our `wip(auto)` commits scope diffs and carry meaningful messages, or dump `git add -A` blobs?
- **Ingest →** `scripts/auto-commit.sh` notes + `/checkpoint` guidance.
- **Credit:** Aider-AI — https://github.com/Aider-AI/aider

### C11. OpenAI Swarm ➕ — `P2`
- **Learn:** Minimal handoffs/routines — how *little* orchestration code you actually need (anti-bloat).
- **Test:** Are our workflows minimal, or ceremony-heavy relative to the work they do?
- **Ingest →** `factory/workflows/` discipline note.
- **Credit:** openai — https://github.com/openai/swarm

### C12. servers (MCP) 📚 — `P2`
- **Learn:** The official MCP server catalog — reference implementations to study before building any per-product server.
- **Test:** Do we wire official MCP servers where they exist, or reinvent? Check `stack/agent-stack.md`.
- **Ingest →** `stack/agent-stack.md`.
- **Credit:** modelcontextprotocol — https://github.com/modelcontextprotocol/servers

### C13. SuperClaude_Framework 📚 — `P2`
- **Learn:** A config schema layering personas/commands onto Claude Code without collapsing under its own options.
- **Test:** Is `CLAUDE.md` routing maintainable as it grows (it caps at 300 lines — are we near it)?
- **Ingest →** `CLAUDE.md` structure + routing tables.
- **Credit:** SuperClaude-Org — https://github.com/SuperClaude-Org/SuperClaude_Framework

---

## D. Self-improvement & evals (the meta layer)

### D1. nanoGPT 📚 — `P0`
- **Learn:** Eval-driven development + the minimal teaching artifact; Karpathy's "borrowed-distribution" lesson (68% of related stars arrived *after* pushes stopped — distribution compounds even while frozen).
- **Test:** Does `meta/evals/` gate factory changes with a measurable rubric, or are changes merged on vibes?
- **Ingest →** `meta/evals/PLAN.md` + `meta/learning-loop-rubric.md`.
- **Credit:** karpathy — https://github.com/karpathy/nanoGPT

### D2. transformers ➕ — `P2`
- **Learn:** Docs-as-onboarding — among the best in ML; a sprawling system stays approachable through relentless docs.
- **Test:** Is our onboarding doc-complete enough that a stranger needs no synchronous help?
- **Ingest →** `docs/your-first-product.md`.
- **Credit:** huggingface — https://github.com/huggingface/transformers

---

## E. Commit safety & the security gate

### E1. gitleaks ➕ — `P0`
- **Learn:** Secret scanning — already the engine behind our auto-push gate's secret check (with a built-in grep fallback).
- **Test:** Does `scripts/auto-commit.sh` actually invoke gitleaks when present, and is the fallback pattern set current? Verify the config path.
- **Ingest →** `scripts/auto-commit.sh` + `docs/security.md`.
- **Credit:** gitleaks — https://github.com/gitleaks/gitleaks

### E2. trufflehog ➕ — `P1`
- **Learn:** *Verified* secret detection (confirms a key is live) — cuts false positives vs. pure regex.
- **Test:** Does our secret gate verify findings or only pattern-match? Decide if verification belongs in `/security-check`.
- **Ingest →** `docs/security.md`.
- **Credit:** trufflesecurity — https://github.com/trufflesecurity/trufflehog

### E3. semgrep ➕ — `P1`
- **Learn:** Policy-as-code static analysis with shareable rule packs.
- **Test:** Could `/security-check` add a small semgrep rule set for our stack's common footguns?
- **Ingest →** `factory/skills/security-check` + `docs/security.md`.
- **Credit:** semgrep — https://github.com/semgrep/semgrep

### E4. harden-runner ➕ — `P1`
- **Learn:** Pin GitHub Actions to SHAs + egress control. Our gate already flags `claude-code-action < v1.0.94`; this generalizes it.
- **Test:** Are *all* actions in `.github/workflows/` SHA-pinned and least-privilege? Audit them.
- **Ingest →** `/security-check` + `docs/security.md`.
- **Credit:** step-security — https://github.com/step-security/harden-runner

### E5. infisical 📚 — `P1`
- **Learn:** *Dual lesson* — (1) a clean secrets-management model; (2) the documented growth loop (90 → 3,000 stars in 2 months via Reddit → newsletter → Trending).
- **Test:** (1) Do products reference secret *names* not values (hard rule #4)? (2) Is the Reddit→newsletter→Trending loop in our GTM plan?
- **Ingest →** `docs/security.md` (secrets) + `meta/research/gtm-plan.md` (growth loop).
- **Credit:** Infisical — https://github.com/Infisical/infisical

### E6. OWASP CheatSheetSeries ➕ — `P2`
- **Learn:** Canonical, maintained security checklists.
- **Test:** Does `/security-check` map its items to named OWASP cheat sheets (so the audit is defensible)?
- **Ingest →** `docs/security.md`.
- **Credit:** OWASP — https://github.com/OWASP/CheatSheetSeries

---

## F. Credits & community — making crediting legendary

> The differentiator you named: *we don't just list debts, we live them.* These shape the "thousands of generosities" credit style.

### F1. all-contributors 📚-adjacent ➕ — `P0`
- **Learn:** Automated, **typed** contribution credit (code, docs, design, ideas, bug reports — each with an emoji key) generated into the README. Crediting becomes a maintained system, not a one-off paragraph.
- **Test:** Can `bun run credits` (which already renders the roll) also *generate* the credit entries from a typed source-of-truth, so no contribution goes uncredited?
- **Ingest →** `ACKNOWLEDGMENTS.md` + the `scripts/` credits generator.
- **Credit:** all-contributors — https://github.com/all-contributors/all-contributors

### F2. awesome ➕ — `P1`
- **Learn:** The awesome-list *spec* (consistent, linkable, one-line-per-entry format) + curation-as-influence + Sindre's loud OSS-sustainability ethos.
- **Test:** Do `ACKNOWLEDGMENTS.md` and the CREDITS section follow one consistent, skimmable entry format?
- **Ingest →** `ACKNOWLEDGMENTS.md` + `LEARN-FROM-REPOS.md` CREDITS format.
- **Credit:** sindresorhus — https://github.com/sindresorhus/awesome

### F3. ponytail 📚 — `P1`
- **Learn:** "The best code is the code never written"; the one-skill-many-agents portable layout — restraint as craft (credited in `ACKNOWLEDGMENTS.md`).
- **Test:** Are skills portable across agents (Claude Code / Codex / Cursor) without duplication? Check the `AGENTS.md` / `CLAUDE.md` / `CODEX.md` parity.
- **Ingest →** `AGENTS.md` + skill conventions.
- **Credit:** DietrichGebert (MIT) — https://github.com/DietrichGebert/ponytail

### F4. nodebestpractices ➕ — `P2`
- **Learn:** The "curated best-practices ledger" format — exactly our `BEST-PRACTICES.md` shape: a skimmable, sourced, numbered ledger.
- **Test:** Is `BEST-PRACTICES.md` formatted for skim + every claim sourced (it's 49KB — does it stay scannable)?
- **Ingest →** `BEST-PRACTICES.md`.
- **Credit:** goldbergyoni — https://github.com/goldbergyoni/nodebestpractices

---

## G. Docs & teaching craft

### G1. starlight ➕ — `P1`
- **Learn:** A fast, search-friendly docs site (Astro) — a candidate home for `docs.hamzaish` to aid passive discovery (our research flagged "zero passive discovery").
- **Test:** Do we need a hosted docs site for discoverability, and would Starlight be the lowest-effort path from our existing markdown?
- **Ingest →** `docs/` (a docs-site decision note).
- **Credit:** withastro — https://github.com/withastro/starlight

### G2. mkdocs-material ➕ — `P2`
- **Learn:** Docs polish + instant search + content tabs — the alternative to G1.
- **Test:** Same as G1; compare effort/output vs. Starlight before choosing.
- **Ingest →** `docs/` (decision note).
- **Credit:** squidfunk — https://github.com/squidfunk/mkdocs-material

### G3. Prompt-Engineering-Guide ➕ — `P1`
- **Learn:** A teaching repo that compounds stars through usefulness; documented, named prompt patterns.
- **Test:** Do our agent prompts (`factory/agents/*`) use documented, named patterns, or one-off prose?
- **Ingest →** `factory/agents/` prompt-convention note.
- **Credit:** dair-ai — https://github.com/dair-ai/Prompt-Engineering-Guide

### G4. system-design-primer ➕ — `P2`
- **Learn:** A single long-form "definitive guide" artifact that earns stars and trust on its own.
- **Test:** Is there one Hamzaish artifact (e.g. a launch playbook) polished enough to be independently starrable?
- **Ingest →** `docs/` (identify + polish one standalone asset).
- **Credit:** donnemartin — https://github.com/donnemartin/system-design-primer

### G5. You-Dont-Know-JS ➕ — `P2`
- **Learn:** A book-in-a-repo — depth that compounds reputation; the long game of authority.
- **Test:** Is any Hamzaish doc deep enough to be cited as a reference by others?
- **Ingest →** `docs/`.
- **Credit:** getify — https://github.com/getify/You-Dont-Know-JS

---

## The ingest protocol

When you green-light **Phase 2**, each learning gets adopted the same disciplined way — this is how a lesson actually changes the factory:

1. **Test it.** Run the entry's *Test* against the current repo. Record pass/partial/fail (no fabrication — a "fail" is the finding).
2. **Write the learning.** Append to `brain/learnings/YYYY-MM-DD.md` — what the repo does, what we tested, what we're adopting, and the *surprise* if any (highest-signal per our loop).
3. **Distill if it's a keeper.** Promote to the *Ingest →* target: a `factory/playbooks/` amendment, a `brain/anti-patterns/` entry, or a routing change in `CLAUDE.md`.
4. **Credit at the point of use.** Leave a one-line comment/footnote at the ingest site pointing home (port the idea, never import the code — `references/` discipline), and add/confirm the entry in `ACKNOWLEDGMENTS.md`.
5. **Gate it.** Run the `meta/evals/` rubric (D1) so a change earns its place. Log it in `meta/changelog.md`.

**Suggested first batch (P0, lowest-risk, highest-leverage):** A1, A2, A3, A4, A8, B1, B2, C1, C2, D1, E1, F1 — funnel + brain blueprint + handoffs + eval gate + credit automation. The rest follow in priority order.

**Phase 3 (external, never auto):** the [awesome-claude-code](#a7-awesome-claude-code-) submission and the "legendary credits" upgrade — drafted only on your word, opened/pushed only with explicit approval.

---

## Integrity & coverage notes

- **Provenance:** ~22 of the 50 are 📚 (from our prior research); the rest are ➕ widely-known exemplars chosen for *fit to a specific Hamzaish surface*, not padding. Each ➕ is justified by its *Ingest →* target — if it didn't map to a real file to improve, it isn't here.
- **Star figures & ⚠ handles** (gstack/ECC/agency-agents/cabinet/HustleGPT) are not relied on in this doc's *tests*; where a number appears it's dated to our 2026-06-11 pull and must be re-verified before public citation (CLAUDE.md hard rule #5).
- **No invented capabilities.** Where a repo's exact behavior matters to a test, the claim is one I'm confident of from the existing syllabus or general knowledge; anything uncertain is framed as a question to verify during ingest, not asserted.
- **Owners/links** are canonical in [`LEARN-FROM-REPOS.md` → CREDITS](LEARN-FROM-REPOS.md#credits--every-repo-with-its-link). Treat that as the single source of truth for attribution.
- **This doc changed nothing** in `brain/`, `factory/`, or `meta/`. It is the map for the work, gated on your approval.
