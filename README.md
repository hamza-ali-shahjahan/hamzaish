# Hamzaish — The AI Cofounder & Startup Factory OS

> A personal AI-native startup factory for one person. Brain + orchestrator. Long-running, learning, self-improving. Built to run a portfolio of products from ideation through scale — and to kill the ones that don't earn it.

**Hamzaish isn't a strategy funnel with a build step at the end. It's a build accelerator that happens to have strategy rails you pull in when you want them. The default is momentum.** Type `/hamzaish`, and the default is to *build* — strategy is an opt-in side door, never a toll.

## What this is

A monorepo that operates like a 24/7 AI cofounder. It runs **multiple products in parallel**, each in its own folder, each onboarded into the same playbook stages (Ideate → MVP → Launch → Sell → Scale → Kill-or-double-down). Every new product spins up with auth, DB, payments, email, analytics, error monitoring, and SEO defaults already wired. Every existing product gets surfaced through the same telemetry pane.

Built on Anthropic's *Founder's Playbook: Building an AI-Native Startup* and informed by the patterns of:
- **gbrain** (Garry Tan) — knowledge graph + hybrid retrieval
- **hermes-agent** (Nous Research) — self-improving skills + memory loops
- **openclaw** — multi-channel gateway

All three live in `references/` as study material. Hamzaish itself stays Claude-Code-native and markdown-first.

## Why it's structured this way

The design in one breath — full rationale in [`docs/`](docs/):

- **Default is momentum.** `/hamzaish` builds first; strategy (scoring, niche, pricing, GTM) is an opt-in side door, never a toll. → [Philosophy](docs/philosophy.md)
- **Products hold metadata + learnings, never code.** Your code — the moat — stays in its own private repo; locations are wired via a git-ignored `code-paths.local.json`. So this repo is safe to back up and open to collaborators **without exposing anyone's secret sauce.** → [Architecture](docs/architecture.md#the-publicprivate-boundary--protecting-your-secret-sauce)
- **Every product has the same skeleton.** Consistency is a *contract* — predictable for collaborators, mappable to a hosted UI. → [Architecture](docs/architecture.md#the-per-product-skeleton)
- **The factory compounds.** Each product's `learnings.md` is promoted into guardrails in the agents, so the next build doesn't repeat the last one's mistakes. → [Architecture](docs/architecture.md#the-learnings--guardrails-loop)

📖 **New here? Start with [`docs/`](docs/)** — it explains the *why*, not just the folders.

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

## How to start a fresh Claude Code session here

In order:

1. Read `CLAUDE.md` — the brain's operating instructions
2. Read `MEMORY.md` — index of cross-product learnings
3. Skim `brain/operating-principles.md` — the rules
4. Read `products/_portfolio.md` — what's active right now
5. Then either:
   - Ask the user what they want to do, or
   - Invoke `/portfolio-pulse` to see today's recommended action across products

## Products in the portfolio

The live index is generated — see [`products/_portfolio.md`](products/_portfolio.md), and each product's manifest at `products/<slug>/product.config.json`. Product **code is not in this repo** — only metadata + learnings (see the [public/private boundary](docs/architecture.md#the-publicprivate-boundary--protecting-your-secret-sauce)). Local code locations live in the git-ignored `code-paths.local.json`.

## Key slash commands (carried forward)

| Command | What it does |
|---|---|
| `/ideate` | Generates ideas grounded in your existing patterns |
| `/validate <idea>` | Customer discovery + market sizing + devil's advocate |
| `/scaffold "<name>" "<one-liner>"` | One-shot a new product (folders + Next.js starter + product.config + CLAUDE.md) |
| `/keyword-research <topic-or-domain>` | Clustered brief from GSC + Ahrefs Webmaster + DataForSEO |
| `/launch-plan <product>` | PH/HN/X assets + cold outreach + content calendar |
| `/product-pulse <product>` | One product's metrics + today's recommended action |
| `/portfolio-pulse` | All products, current stage, today's action each |
| `/kill-or-keep` | Quarterly portfolio review — double-down vs sunset |
| `/hamzaish` | **Momentum router** — default is *just build* (→ `/full-cycle` / `/auto`); strategy rails and stage-resume are opt-in, skip anytime. See [docs](docs/the-momentum-router.md). |

## The discipline (don't violate)

1. **Don't build before you validate.** 5 conversations with target-profile users before production code.
2. **Scope is the moat.** Every product has a `scope.md` saying what it does AND what it deliberately doesn't.
3. **Persistent context.** Every product gets a `CLAUDE.md`; every decision goes in `decisions/`.
4. **Measurement before launch.** Define north-star, activation, retention, false-positive shape before the first user.
5. **The factory is a product.** Eat the dog food. If Hamzaish can't ship product #1 (Muakkil) through, fix Hamzaish before adding more.

## Self-improvement loop

Every session that does real work appends to `brain/learnings/` and, where applicable, updates `factory/playbooks/` or `brain/anti-patterns/`. Sprint completions get a retro in `meta/retros/`. Quarterly, `/kill-or-keep` runs on Hamzaish itself — which skills/agents earn their keep, which get sunset.

## Bootstrap budget posture

Free tiers and pay-per-query by default. Every recurring subscription needs a written ROI justification in the relevant product's `decisions/`. See `stack/analytics-stack.md` for the bootstrapped SEO stack (GSC + Ahrefs Webmaster + DataForSEO pay-per-query instead of $130/mo subscriptions).

## Owner

Hamza Ali — mail.hamza.ali@gmail.com

## Version

**v1.0** — Brain/Factory/Products/Meta layered architecture. Muakkil registered as the buildathon proof. References (gbrain/hermes-agent/openclaw) cloned. See `meta/changelog.md`.
