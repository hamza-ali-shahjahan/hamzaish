<div align="center">

# 🏭 Hamzaish

**Your AI co-builder & startup OS — ship products first, strategize later.**

[![Open source](https://img.shields.io/badge/Open-source-brightgreen.svg)](#license)
[![Secure by default](https://img.shields.io/badge/Secure-by%20default-success.svg)](#is-this-safe-to-run)

</div>

> A personal, AI-native factory for builders — especially first-timers. It isn't a strategy funnel with a build step bolted on the end; it's a build accelerator that happens to have strategy rails you pull in when you want them. Type `/hamzaish` and the default is to **build** — strategy is an opt-in side door, never a toll.

### Quickstart (≈2 min)

You need [Bun](https://bun.sh) and [Claude Code](https://claude.ai/code) (or any agent that reads `AGENTS.md`).

```bash
git clone https://github.com/hamza-ali-shahjahan/hamzaish.git
cd hamzaish
bun run setup
```

`bun run setup` is idempotent and **never touches your data** — it creates `code-paths.local.json` + `brain/identity/operator.local.md` from templates (yours to edit; git-ignored), wires the global slash commands into `~/.claude/commands/`, and builds the brain's search index. Zero runtime dependencies — no `bun install` needed.

**→ Then follow [Your first product in 10 minutes](docs/your-first-product.md)** — zero to a tracked, self-remembering product, hand-held. The boring, scary setup is done; you start where it gets fun.

## What you get

- **🚀 Momentum by default** — `/hamzaish` builds first. Strategy (scoring, niche, pricing, GTM) is an opt-in side door, never a toll — because building when it's cheap, fast, and reversible *is* the validation.
- **🧠 A brain that compounds** — every ship's learnings get promoted from `brain/learnings/` into load-bearing guardrails in the agents, so the next build doesn't repeat the last one's mistakes.
- **🔒 Secure by default** — products scaffold with a devcontainer, auto-push is opt-in and secret-scanned before it leaves your machine, and every new repo ships a gitleaks scan + least-privilege, pinned-action CI.
- **🏛️ One playbook, many products** — every product runs the same stages (Ideate → MVP → Launch → Sell → Scale → Kill-or-double-down) with auth, DB, payments, email, analytics, and error monitoring wired from commit zero.
- **🔁 A self-evolving learning loop** — `/learn-loop` impact-scores candidate learnings on five axes and promotes only the top few that clear the bar into real guardrails, then re-checks quarterly whether each one actually paid off.

## Start here — pick your path

- **🌱 First time / just want to build** → the **[Quickstart](#quickstart-2-min)** above, then **[your first product in 10 minutes](docs/your-first-product.md)**.
- **🛠️ Want the internals** → **[Architecture](docs/architecture.md)** · **[Philosophy](docs/philosophy.md)** · **[Where it's heading](meta/SELF-EVOLUTION.md)**. Markdown-first, Claude-Code-native, with **[AGENTS.md](AGENTS.md)** for any other agent.
- **🤝 Want to contribute / add your own product** → **[Contributing](docs/contributing.md)**: fork, add yours to `products/_community/`, open a PR.

---

## What this is

A monorepo that operates like a 24/7 AI cofounder. It runs **multiple products in parallel**, each in its own folder, each onboarded into the same playbook stages (Ideate → MVP → Launch → Sell → Scale → Kill-or-double-down). Every new product spins up with auth, DB, payments, email, analytics, error monitoring, and SEO defaults already wired. Every existing product gets surfaced through the same telemetry pane.

Being built by Hamza + his 4 muakkals × Claude × Codex × Lovable. **Hamzaish isn't a strategy funnel with a build step at the end — it's a build accelerator that happens to have strategy rails you pull in when you want them. The default is momentum.** And skipping strategy isn't laziness — it's often the right call: **build when it's cheap, fast, and reversible** (the thing you ship *is* the validation); **reach for the strategy rails when it's expensive, slow, or hard to undo**, or right before you spend real money on ads or sales. → [the philosophy](docs/philosophy.md)

## What you inherit on day one (the hard-won part)

Most AI tools get you a *demo* fast — impressive in hours, then a long flat slog through the unglamorous last mile (design decisions, auth, payments, infra, testing, edge cases) before anything is actually shippable. Hamzaish front-loads that slog. The four things below aren't theory — they're **scar tissue from real ships and real mistakes**, distilled into guardrails so you start where they've already been paid for:

- **🚫 A pre-launch security gate that BLOCKS.** 50+ concrete checks across auth, authz, data exposure, and secrets — each with a severity tier and a forced **BLOCK / CLEAR** verdict. Most prototype tools ship you straight to production with nothing here. ([`mvp-stage/security-checklist.md`](factory/playbooks/mvp-stage/security-checklist.md))
- **🏛️ An architecture agent that forces the boring decisions** *before* you write code — written to ADR files so the "why" survives. The decisions that quietly sink prototypes (data model, auth model, the one must-be-true thing) get made on purpose. ([`mvp/architect`](factory/agents/mvp/architect/SKILL.md) + [`architecture-decisions.md`](factory/playbooks/mvp-stage/architecture-decisions.md))
- **🔁 A self-improving loop that's real.** When a product ships and something breaks, the failure becomes a permanent playbook. The npm bin-path gotcha, GitHub email-privacy blocking the first push, codegen output that lints clean but fails downstream — all caught once, never again. The factory gets smarter every time it crosses the gap. ([`brain/learnings/`](brain/learnings/) → [`factory/playbooks/`](factory/playbooks/))
- **⚙️ Sane tech defaults that handle the $0→$1K-MRR infra pain** so you don't reinvent it. Next.js + Supabase (auth, DB, RLS) + Stripe + Resend + Inngest + PostHog + Sentry, all wired and free-tier-first, with documented escape hatches. ([`stack/tech-stack.md`](stack/tech-stack.md))

The honest boundary: the four guardrails above are **proven scar tissue.** The last-mile layer that used to be missing — **test scaffolding, CI/CD, production-ops runbooks, and a validation gate** — is now baked in too, but as **research-baked defaults** (established best practice) that haven't yet been battle-tested inside the factory. We track exactly which is which in [the honest ledger](meta/RESEARCH-BAKED-PRACTICES.md), so you always know what's proven vs. what's promising. → [where it's heading](meta/SELF-EVOLUTION.md)

## Built on, and informed by

Built on Anthropic's *Founder's Playbook: Building an AI-Native Startup* and informed by the patterns of:
- **gbrain** (Garry Tan) — knowledge graph + hybrid retrieval
- **hermes-agent** (Nous Research) — self-improving skills + memory loops
- **openclaw** — multi-channel gateway
- **Andrej Karpathy** — eval-driven development & the data/learning flywheel; the discipline behind the self-improving loop (`brain/learnings/` → guardrails, and [`factory/playbooks/ai-native-2026/eval-driven-development.md`](factory/playbooks/ai-native-2026/eval-driven-development.md))
- **Addy Osmani** — agent skills; the spec → plan → build → test → review → simplify → ship discipline that shapes `/full-cycle` and the factory's skill set (process-over-prose, verification non-negotiable, scope discipline)

The three repos above live in `references/` as study material; Karpathy's influence is a *thinking* pattern, not a codebase — it shows up in how the factory learns from every ship. Hamzaish itself is markdown-first and **primarily tuned for Claude Code** — slash commands, hooks, and the `/hamzaish` momentum router are wired for it. It also ships [`AGENTS.md`](AGENTS.md) at the root, so any coding agent that follows that convention (Codex, Cursor, Aider, Goose, Continue, …) inherits the same architecture, discipline, and brain context out-of-the-box. Tool-specific bindings (slash commands + hooks) for other agents aren't ported yet — PRs welcome when you fork.

## Why it's structured this way

The design in one breath — full rationale in [`docs/`](docs/):

- **Default is momentum.** `/hamzaish` builds first; strategy (scoring, niche, pricing, GTM) is an opt-in side door, never a toll. → [Philosophy](docs/philosophy.md)
- **Products hold metadata + learnings, never code.** Your code — the moat — stays in its own private repo; locations are wired via a git-ignored `code-paths.local.json`. So this repo is safe to back up and open to collaborators **without exposing anyone's secret sauce.** → [Architecture](docs/architecture.md#the-publicprivate-boundary--protecting-your-secret-sauce)
- **Every product has the same skeleton.** Consistency is a *contract* — predictable for collaborators, mappable to a hosted UI. → [Architecture](docs/architecture.md#the-per-product-skeleton)
- **The factory compounds.** Each product's `learnings.md` is promoted into guardrails in the agents, so the next build doesn't repeat the last one's mistakes. → [Architecture](docs/architecture.md#the-learnings--guardrails-loop)

📖 **Want the full "why"?** → [`docs/`](docs/) explains the reasoning, not just the folders.

## Architecture

```
brain/        — identity, persona, principles, learnings, anti-patterns, decision log, ingested knowledge
factory/      — agents (idea/, mvp/, launch/, scale/, portfolio/), skills, commands, workflows, playbooks
products/     — one folder per product: metadata + learnings only (config, scope, status, decisions, learnings). Code stays in its own private repo; locations wired via git-ignored code-paths.local.json
meta/         — changelog, retros, evals, self-improvement loop
references/   — gbrain, hermes-agent, openclaw — STUDY ONLY, never imported
stack/        — default tech stack ADRs
templates/    — Next.js starter + doc templates
dashboard/    — minimal telemetry pane (inert until Phase C)
_archive/     — preserved old versions, never edited
```

## How to start a fresh session here

Works in any coding-agent session (Claude Code is canonical; Codex, Cursor, Aider, Goose, Continue all read `AGENTS.md` and get the baseline). The discipline is the same — only the slash-command bindings differ across tools.

In order:

1. Read `AGENTS.md` — universal tool-agnostic context
2. Read your tool's specific routing file: `CLAUDE.md` (Claude Code) — others to be added as forks land
3. Skim `brain/operating-principles.md` — the rules
4. Read `products/_portfolio.md` — what's active right now
5. Then either:
   - Ask the user what they want to do, or
   - Invoke `/portfolio-pulse` (Claude Code) or the equivalent in your tool to see today's recommended action across products

## Products built with Hamzaish

Curated proof list — products where Hamzaish's `/full-cycle` orchestration drove the build end-to-end, the brain captured cross-product learnings, and the factory's discipline either caught a violation (good) or got violated and we documented why (also good — the rules being escapable would be the failure mode).

| Product | What it is | Stage | Public artifact |
|---|---|---|---|
| **[wp-to-astro](https://github.com/hamza-ali-shahjahan/wp-to-astro-cli)** | OSS CLI that migrates WordPress sites to clean Astro + MDX — wedge for an AI-native CMS. | Alpha v0.6.1 on [npm](https://www.npmjs.com/package/wp-to-astro), validation sprint underway | Six gated passes, 138 tests, public GitHub repo + npm package. Empty dir → npm in two sessions. The validation discipline was violated (built six passes without 5 user conversations) — that's now the catch-up sprint. The slug-schema bug shipped in v0.6.0 and got patched in v0.6.1 within an hour of the real-world smoke test catching it. Cross-product learnings filed in `brain/learnings/2026-05-30.md`. |
| **Muakkil** | Mystical AI-agent platform — four spirit agents (Scribe, Seeker, Maker, Herald) collaborate on cross-agent charges via a ritual UX. | MVP, buildathon launch sprint | Lovable buildathon submission = beta launch; first 100 sign-ups become the beta cohort. The Scribe voice demo is the centerpiece. |
| **[Patently](https://patently.legal)** | AI IP-clearance research for founders & product teams — *"Ship without blindsiding yourself on IP."* Research chat + clearance memos + watchlist digests over 9M+ US court opinions (CourtListener), USPTO patents since 1976, and 22M copyright registrations. (Formerly IP Radar.) | Live in private beta at [patently.legal](https://patently.legal) ([GitHub](https://github.com/hamza-ali-shahjahan/ip-radar)) | Full-stack Next.js 16 + Neon/pgvector + Claude tool-calling. Nine-step clearance DAG with citation contract validator (no hallucinated cases). Hit an ID.me/SSN wall mid-build as a non-US user trying to get the USPTO API key — pivoted to Google Patents BigQuery in the same session, better architecture. Deployment learnings (Vercel CLI multi-line stdin truncation, dotenv/runtime JSON parity, BigQuery cost model) promoted to `commands/deployment-learnings.md` so future builds don't repeat them. ~6 weeks of sessions. |
| **[Ventbox](https://ventbox.co)** | Architecturally-anonymous employee feedback platform — employees initiate unfiltered workplace feedback; HR sees AI-categorized sentiment without ever knowing who said what. Flat-rate, not per-seat. | Live at [ventbox.co](https://ventbox.co) | Shipped, hosted product: 60-second setup with shareable links, anonymous admin invites, company-domain restriction, AI sentiment analysis, pricing free→$49/mo. The anonymous-vent idea sharpened into a B2B HR wedge through the factory's idea→MVP loop. |
| **[TASFORT](https://theresasystemforthat.xyz)** | "There's a System for That" — a searchable library of how 100+ remarkable people actually run their lives: 265+ methodologies across 11 life domains, matched to you by personality type. | Live at [theresasystemforthat.xyz](https://theresasystemforthat.xyz) | Shipped, hosted product: personality assessment (MBTI / Enneagram / chronotype), filterable people + systems database, "people who think like you" matching, and routine-builder. Consumer discovery product taken from idea to live site in the factory. |

_More as they ship. A product earns this list by shipping something users can touch (npm package, hosted app, deployable repo) — not by being in the portfolio._

## Products in the portfolio

The live index is generated — see [`products/_portfolio.md`](products/_portfolio.md), and each product's manifest at `products/<slug>/product.config.json`. Product **code is not in this repo** — only metadata + learnings (see the [public/private boundary](docs/architecture.md#the-publicprivate-boundary--protecting-your-secret-sauce)). Local code locations live in the git-ignored `code-paths.local.json`.

## Key slash commands (carried forward)

| Command | What it does |
|---|---|
| `/ideate` | Generates ideas grounded in your existing patterns |
| `/validate <idea>` | Opt-in validation rail — pull in before expensive or irreversible bets. Customer discovery + market sizing + devil's advocate. |
| `/scaffold "<name>" "<one-liner>"` | One-shot a new product (folders + Next.js starter + product.config + CLAUDE.md) |
| `/keyword-research <topic-or-domain>` | Clustered brief from GSC + Ahrefs Webmaster + DataForSEO |
| `/launch-plan <product>` | PH/HN/X assets + cold outreach + content calendar |
| `/product-pulse <product>` | One product's metrics + today's recommended action |
| `/portfolio-pulse` | All products, current stage, today's action each |
| `/kill-or-keep` | Quarterly portfolio review — double-down vs sunset |
| `/hamzaish` | **Momentum router** — default is *just build* (→ `/full-cycle` / `/auto`); strategy rails and stage-resume are opt-in, skip anytime. See [docs](docs/the-momentum-router.md). |

## The discipline (don't violate)

1. **Build is the default — validate before irreversible bets, not before every line of code.** Shipping something cheap, fast, and reversible *is* validation — the thing you ship is the test. Reach for real customer conversations (aim for ~5 with target-profile users) before the expensive, slow, or hard-to-undo moves: paid ads, a sales push, or a big build you can't walk back. Validation is a rail you pull in, not a toll you pay. The one hard rule: don't skip it *silently* — `bun run check-validation <slug>` makes you either validate or explicitly record the debt (the wp-to-astro lesson, encoded).
2. **Scope is the moat.** Every product has a `scope.md` saying what it does AND what it deliberately doesn't.
3. **Persistent context.** Every product gets a `CLAUDE.md`; every decision goes in `decisions/`.
4. **Measurement before launch.** Define north-star, activation, retention, false-positive shape before the first user.
5. **The factory is a product.** Eat the dog food. If Hamzaish can't ship product #1 (Muakkil) through, fix Hamzaish before adding more.
6. **Honest copy — we never claim what isn't true.** Every outward-facing word (landing pages, OG/social cards, ads, emails, in-app text) is true and verifiable the moment it ships: no invented stats, no "full/every" coverage we don't have, no implied capabilities that aren't live. Aspiration is fine when it's *labelled* ("coming soon", "in beta") — never in the present tense. Trust is the whole moat; one claim a user can disprove poisons every true thing you've said. ([principle #13](brain/operating-principles.md))

> We build ethically, to a high standard, with passion and energy — and we'd rather under-claim and over-deliver than the reverse. If you're reading this repo, that's the bar, and it isn't negotiable.

## Self-improvement loop

Every session that does real work appends to `brain/learnings/` and, where applicable, updates `factory/playbooks/` or `brain/anti-patterns/`. Sprint completions get a retro in `meta/retros/`.

On top of that always-on capture sits a **scored, self-evolving promotion pass.** At a **major-cycle boundary** — a product crosses a stage gate, ships, or is killed; a sprint had notable friction or a notable win; or the factory itself changed — `/learn-loop` scores the cycle's candidate learnings on five axes (Speed ×2, Build-quality ×2, Recurrence, Generalizability, Confidence → composite /35) and **promotes only the top few that clear the bar** into load-bearing guardrails (a skill/agent rule, a playbook step, or an anti-pattern). Below-threshold learnings stay as history. The rubric is `meta/learning-loop-rubric.md`.

Quarterly, `/kill-or-keep` runs on Hamzaish itself — which skills/agents earn their keep, which get sunset — and **closes the loop** by re-checking each promoted learning: did it deliver its predicted speed/quality gain? If yes, it's validated; if not, the guardrail is sunset so the factory doesn't ossify.

## Is this safe to run?

Short answer: **yes, with the normal caution you'd give any agent tool — and we've engineered the defaults to keep the blast radius small.** In plain language:

- **🧰 Products scaffold with a devcontainer.** Every product `/scaffold` creates ships a `.devcontainer/` (Node + Bun). When you "Reopen in Container," the agent and your build commands run inside an **isolated container with only the workspace mounted** — not your bare host, not your `~/.ssh`, not your other repos. ([the why](docs/security.md#3-run-agent-generated-code-in-a-disposable-sandbox--never-on-the-host))
- **🚫 Auto-push is opt-in.** The auto-commit safety net makes **local restore-point commits only** by default. Your work and your secrets **don't leave your machine** unless you explicitly opt a repo in (a `.auto-push` marker) — and even then, the to-be-pushed commits are **secret-scanned first** and the push aborts if anything looks like a key.
- **🔍 Scaffolded products are secure-by-default.** Secrets are gitignored (only `.env.example` placeholders are tracked), a gitleaks secret-scan + a least-privilege, pinned-action CI ship with every new product, and Supabase RLS is the documented habit from commit zero. ([baseline](docs/security.md))
- **🔐 Claude Code's permission prompts still apply.** Nothing here bypasses them — file writes, commands, and network actions still go through your agent's normal approval flow.
- **⚠️ Running outside the devcontainer is at your own risk.** The isolation only protects you when you actually open the product in its container. Run an agent directly on your host and the host is the blast radius — that's a choice you're making, not a default we ship.

The honest boundary: these defaults shrink the blast radius; they don't make any agent tool risk-free. Read [`docs/security.md`](docs/security.md) for the full threat model and what's enforced vs. advised.

## Bootstrap budget posture

Free tiers and pay-per-query by default. Every recurring subscription needs a written ROI justification in the relevant product's `decisions/`. See `stack/analytics-stack.md` for the bootstrapped SEO stack (GSC + Ahrefs Webmaster + DataForSEO pay-per-query instead of $130/mo subscriptions).

## License

**AGPL-3.0** — see [`LICENSE`](LICENSE). Copyright © 2026 Hamza Ali.

Plain-English version: you can use, study, modify, and self-host Hamzaish freely. **If you run a modified version as a network service, you must make your source available under AGPL too.** That keeps the factory open for solo builders while stopping anyone from quietly turning it into a closed commercial product.

**Commercial license available.** If you want to build on Hamzaish *without* the AGPL's copyleft obligations (e.g. a closed-source commercial product or hosted service), a separate commercial license is available — contact the owner below. The copyright holder reserves the right to offer Hamzaish under other terms.

## Owner

Hamza Ali — mail.hamza.ali@gmail.com

## Version

See [`meta/changelog.md`](meta/changelog.md) for the current version + full history (the factory tracks its own evolution there). It started at v1.0 — Brain/Factory/Products/Meta layered architecture.
