<div align="center">

# 🏭 Hamzaish

**Type an idea into Claude Code. Get a scaffolded, security-gated, shipped product — and a factory that remembers every lesson for the next one.**

[![Open source](https://img.shields.io/badge/Open-source-brightgreen.svg)](#license)
[![Secure by default](https://img.shields.io/badge/Secure-by%20default-success.svg)](docs/security.md)
[![Works with Claude Code](https://img.shields.io/badge/works_with-Claude_Code-d97757.svg)](https://claude.ai/code)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-blue.svg)](docs/contributing.md)

</div>

<!-- HERO DEMO GIF lands here: 90s, idea → scaffold → security gate BLOCK→CLEAR → portfolio-pulse. docs/assets/demo.gif -->

**Shipped through this factory so far:** [Ventbox](https://ventbox.co) — live SaaS · [Patently](https://patently.legal) — live, private beta · [wp-to-astro](https://www.npmjs.com/package/wp-to-astro) — on npm · [TASFORT](https://theresasystemforthat.xyz) — live → [the full list, with honest status](#products-built-with-hamzaish)

---

## Why this exists

Claude Code setups like gstack and BMAD make you faster at **building**. Then you're on your own: the security review, the launch, pricing, first customers, knowing when to kill. Most solo projects don't die in the build — they die in everything after it.

Hamzaish is the Claude Code setup that **doesn't stop at code**. It runs the whole lifecycle — **Ideate → MVP → Launch → Sell → Scale → Kill-or-double-down** — with stage-specific agents, playbooks distilled from real ships, and a brain that carries every lesson into your next product. ([The full philosophy →](docs/philosophy.md))

## Quickstart — first win in 5 minutes

You need [Bun](https://bun.sh) and [Claude Code](https://claude.ai/code).

```bash
git clone https://github.com/hamza-ali-shahjahan/hamzaish.git
cd hamzaish
bun run setup        # idempotent — creates YOUR factory, never touches existing data
```

Then open Claude Code and type:

```
/hamzaish a tip calculator for freelancers
```

Watch it scaffold the product, propose the architecture, and start building — with the security gate and launch rails already waiting downstream. ([The 10-minute guided version →](docs/your-first-product.md))

Safety: scaffolded products run agent-generated code inside a devcontainer, secrets are gitignored from commit zero, and nothing auto-pushes off your machine. ([Full threat model →](docs/security.md))

## What you get

- **32 agents organized by lifecycle stage** — idea validation, architecture, scope-guarding, security review, landing copy, SEO, pricing, cold outreach, retention, kill-or-double-down. Not just builders: the *after-the-build* crew. ([factory/agents/](factory/agents/))
- **A pre-launch security gate that blocks.** 50+ concrete checks (auth, authz, data exposure, secrets) with a forced BLOCK/CLEAR verdict. ([the checklist](factory/playbooks/mvp-stage/security-checklist.md))
- **34 playbooks from real ships** — launch sequencing, first-100-customers, pricing, production ops. Short, sourced, battle-scarred. ([factory/playbooks/](factory/playbooks/))
- **A brain that remembers.** SQLite-indexed learnings, decisions, and anti-patterns, searchable from any session via `/brain-ask`. Your second product starts smarter than your first. ([brain/](brain/))
- **Sane infra defaults** — Next.js + Supabase + Stripe + Resend + PostHog + Sentry, free-tier-first, pre-wired in every scaffold. ([the stack, and the accounts you set up once →](stack/README.md))
- **Portfolio discipline** — `/portfolio-pulse` across everything you run; quarterly kill-or-double-down so zombie projects don't eat your year.

## Go deeper

[Your first product in 10 minutes](docs/your-first-product.md) · [Architecture](docs/architecture.md) · [Philosophy](docs/philosophy.md) · [Where it's heading](meta/SELF-EVOLUTION.md) · [Security model](docs/security.md) · [Contributing](docs/contributing.md) · [Changelog](meta/changelog.md)

## How it's different

| | gstack / BMAD / SuperClaude | AutoGPT / MetaGPT / crewAI | **Hamzaish** |
|---|---|---|---|
| Scope | build-stage setup | agent framework you build on | **full company lifecycle** |
| After "code is done" | you're on your own | you're on your own | **launch, sell, scale, kill rails** |
| Memory across projects | per-session | per-run | **persistent brain + learnings loop** |
| Form | config + tools | Python framework | **markdown-first method, forkable** |

## Architecture

```
brain/        — identity, principles, learnings, anti-patterns, decisions, ingested knowledge
factory/      — agents (idea/ mvp/ launch/ scale/ portfolio/), skills, commands, playbooks
products/     — one folder per product: metadata + learnings ONLY (code stays in private repos)
meta/         — changelog, retros, evals, the self-improvement loop
stack/        — tech defaults + the set-up-once accounts guide
templates/    — Next.js starter + doc templates
```

Product **code is never in this repo** — only metadata and learnings. Your code (the moat) stays private; locations are wired via a git-ignored `code-paths.local.json`. So the repo is safe to share without exposing anyone's secret sauce. ([the public/private boundary →](docs/architecture.md#the-publicprivate-boundary--protecting-your-secret-sauce))

## Key commands

| Command | What it does |
|---|---|
| `/hamzaish` | **Momentum router** — default is *just build*; strategy rails are opt-in, skip anytime ([docs](docs/the-momentum-router.md)) |
| `/scaffold "<name>" "<one-liner>"` | One-shot a new product (folders + starter + config + CLAUDE.md) |
| `/validate <idea>` | Opt-in validation rail — customer discovery + market sizing + devil's advocate |
| `/portfolio-pulse` | All products, current stage, today's action each |
| `/launch-plan <product>` | PH/HN/X assets + cold outreach + content calendar |
| `/keyword-research <topic>` | Clustered brief from GSC + Ahrefs + DataForSEO |
| `/kill-or-keep` | Quarterly review — double-down vs sunset |
| `/brain-ask "<query>"` | Search every learning, decision, and playbook |

Claude Code is first-class (commands auto-discover). Any agent that reads [`AGENTS.md`](AGENTS.md) — Codex, Cursor, Aider, Goose — inherits the same context and discipline; tool-specific bindings are PR-welcome.

## The discipline

1. **Build is the default — validate before irreversible bets.** Cheap, fast, reversible ships *are* validation. Before expensive moves: ~5 target-profile conversations. The hard rule: never skip it *silently* — `bun run check-validation <slug>` records the debt. (The [wp-to-astro lesson](brain/learnings/), encoded.)
2. **Scope is the moat.** Every product's `scope.md` says what it does AND deliberately doesn't.
3. **Persistent context.** Every product gets a `CLAUDE.md`; every decision is logged in `decisions/`.
4. **Measurement before launch.** North-star, activation, retention, false-positive shape — defined before the first user.
5. **The factory is a product.** If it can't ship product #1 through, fix the factory before adding slots.
6. **Honest copy.** Every outward-facing word is true and verifiable when it ships; aspiration is labelled, never present-tense. What's proven vs. promising is tracked in [the honest ledger](meta/RESEARCH-BAKED-PRACTICES.md).

## The self-improvement loop

Every working session appends learnings to [`brain/learnings/`](brain/learnings/). At major-cycle boundaries, `/learn-loop` scores candidates on five axes ([rubric](meta/learning-loop-rubric.md)) and promotes only the top few into load-bearing guardrails — a skill rule, a playbook step, an anti-pattern. Quarterly, `/kill-or-keep` runs on Hamzaish itself and re-checks each promoted guardrail: deliver the predicted gain, or get sunset. The factory compounds; it doesn't ossify.

Budget posture: free tiers and pay-per-query by default; every subscription needs written ROI in a product's `decisions/`. ([the bootstrapped stack →](stack/analytics-stack.md))

## Built on, and informed by

Anthropic's *Founder's Playbook*, with patterns studied from gbrain (knowledge graph), hermes-agent (self-improving skills), openclaw (multi-channel gateway), Karpathy's eval-driven flywheel, and Addy Osmani's spec→ship discipline. Study material lives in `references/`, never imported.

## Products built with Hamzaish

Curated proof list — products where the factory's `/full-cycle` orchestration drove the build, the brain captured cross-product learnings, and the discipline either caught a violation (good) or got violated and we documented why (also good — escapable rules would be the failure mode).

| Product | What it is | Stage | Public artifact |
|---|---|---|---|
| **[Ventbox](https://ventbox.co)** | Architecturally-anonymous employee feedback platform — employees give unfiltered feedback; HR sees AI-categorized sentiment without ever knowing who said what. Flat-rate, not per-seat. | Live at [ventbox.co](https://ventbox.co) | Shipped, hosted product: 60-second setup, anonymous admin invites, company-domain restriction, AI sentiment analysis, pricing free→$49/mo. |
| **[Patently](https://patently.legal)** | AI IP-clearance research for founders — *"Ship without blindsiding yourself on IP."* Research chat + clearance memos over 9M+ US court opinions, USPTO patents since 1976, and 22M copyright registrations. | Live in private beta ([GitHub](https://github.com/hamza-ali-shahjahan/ip-radar)) | Next.js 16 + Neon/pgvector + Claude tool-calling. Nine-step clearance DAG with a citation contract validator (no hallucinated cases). Hit an ID.me wall on the USPTO API mid-build → pivoted to Google Patents BigQuery in the same session. ~6 weeks of sessions. |
| **[wp-to-astro](https://github.com/hamza-ali-shahjahan/wp-to-astro-cli)** | OSS CLI migrating WordPress sites to clean Astro + MDX — wedge for an AI-native CMS. | Alpha v0.6.1 on [npm](https://www.npmjs.com/package/wp-to-astro) | Six gated passes, 138 tests, empty dir → npm in two sessions. The validation discipline was violated (built before 5 user conversations) — documented, now the catch-up sprint. A slug-schema bug shipped in v0.6.0, caught by a real-world smoke test, patched in v0.6.1 within the hour. |
| **[TASFORT](https://theresasystemforthat.xyz)** | "There's a System for That" — how 100+ remarkable people actually run their lives: 265+ methodologies across 11 domains, matched to you by personality type. | Live at [theresasystemforthat.xyz](https://theresasystemforthat.xyz) | Personality assessment, filterable people + systems database, "people who think like you" matching, routine-builder. |
| **Muakkil** | Mystical AI-agent platform — four spirit agents collaborate on cross-agent charges via a ritual UX. | MVP, buildathon sprint | Lovable buildathon submission = beta launch; the Scribe voice demo is the centerpiece. |

_More as they ship. A product earns this list by shipping something users can touch — not by being in the portfolio. Eleven more in earlier stages, tracked with the same honesty in [products/](products/)._

## License

**AGPL-3.0** — see [`LICENSE`](LICENSE). Copyright © 2026 Hamza Ali.

Plain English: use, study, modify, and self-host freely. If you run a *modified* version as a network service, your source must be AGPL too — the factory stays open for solo builders; nobody quietly turns it into a closed product. **Commercial license available** for closed-source use — contact below.

---

*Built in public by [Hamza Ali](https://github.com/hamza-ali-shahjahan) — mail.hamza.ali@gmail.com. The factory's repo runs on the factory's own discipline.*
