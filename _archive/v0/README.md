# Hamzaish — The AI Cofounder & Startup Factory OS

> A personal startup factory for shipping 10 products in parallel, $100K ARR each, with a single brain and a single telemetry pane.

## What this is

A monorepo that operates like Lovable for *me* — except instead of one product, it runs **a portfolio**. Every new idea spins up with auth, DB, payments, email, analytics, error monitoring, and SEO already wired. Every existing product I've started is onboarded so the brain can run it through the playbook stages and surface what needs attention today.

Built on the four stages from Anthropic's *Founder's Playbook: Building an AI-Native Startup* (Idea → MVP → Launch → Scale).

## How to start a new session

If you're a fresh Claude session opening this folder, do this **in order**:

1. **Read `CLAUDE.md`** — the brain's operating instructions
2. **Read `MEMORY.md`** — index of cross-product learnings
3. **Read `brain/operating-principles.md`** — the rules you don't violate
4. **Skim `knowledge-base/ai-native-2026/founders-playbook-distilled.md`** — the playbook this whole system is built on
5. **Then** ask the user what they want to do, or invoke `/portfolio-pulse` to see where everything stands

Don't start building anything before reading those four files.

## The 10 products

See `products/*/product.config.json` for the full manifest of each. Quick legend:

| Product | Stage | Source folder |
|---|---|---|
| ventbox | varies — see config | `~/Claude/Ventbox App Clone/` |
| linkedup | varies — see config | `~/Claude/linkedup/` |
| copyright | varies — see config | `~/Claude/CopyRight/` |
| tasfort | varies — see config | `~/Claude/TASFORT/` |
| one-dollar-factory | varies — see config | `~/Claude/$1F&S/` |
| hamza-health | varies — see config | `~/Claude/Hamza Health Tracker/` |
| hamzaos | varies — see config | `~/Claude/HamzaOS/` |
| ai-growth-engine | varies — see config | `~/Claude/Systems Agent/` |
| formpad | new slot | scaffolded here |
| calculatrs | new slot | scaffolded here |

## Folder map

```
brain/             — persona, principles, decision log (the "Hamzaish" voice)
agents/            — stage-specific agents (idea, mvp, launch, scale, portfolio)
skills/            — slash commands (/scaffold, /portfolio-pulse, /validate, etc.)
knowledge-base/    — curated playbooks (Mom Test, JTBD, Sean Ellis, growth loops, etc.)
stack/             — the Gary Tan / 2026 default stack (tech, analytics, agent, repos)
templates/         — the Lovable-like one-shot Next.js starter + doc templates
products/          — one folder per product (symlinks to existing code where applicable)
dashboard/         — minimal Next.js app aggregating telemetry from all products
workflows/         — cross-product automations & cron jobs
```

## Key slash commands

| Command | What it does |
|---|---|
| `/ideate` | Generates fresh ideas grounded in your existing patterns |
| `/validate <idea>` | Runs an idea through customer discovery, market sizing, devil's advocate |
| `/scaffold "<name>" "<one-liner>"` | One-shot a new product (folders + Next.js starter + product.config + CLAUDE.md) |
| `/keyword-research <topic-or-domain>` | Clustered brief from GSC + Ahrefs Webmaster + DataForSEO |
| `/launch-plan <product>` | Builds a launch playbook (PH/HN/X assets + cold outreach + content calendar) |
| `/product-pulse <product>` | Snapshot of one product's metrics + recommended action today |
| `/portfolio-pulse` | All 10 products, current stage, today's action each |
| `/kill-or-keep` | Quarterly portfolio review — what to double-down on, what to sunset |

## The discipline (don't violate)

From the playbook itself:

1. **Don't build before you validate.** Talk to 5 people from the target profile before writing a line of production code.
2. **Scope discipline is the moat.** Every product has a `scope.md` that says what it does AND what it deliberately doesn't.
3. **Persistent context > clever sessions.** Every product gets a `CLAUDE.md`; every decision goes in `decisions/`.
4. **Measurement before launch.** Define the metrics, false-positive shape, and Sean Ellis target before the first user.
5. **The factory itself is a product.** Eat our own dog food. If this can't ship product #1 through, it doesn't work.

## Bootstrap budget posture

Everything in `stack/` is chosen to keep monthly cost near $0 until revenue. See `stack/analytics-stack.md` for the bootstrapped SEO/keyword stack (GSC + Ahrefs Webmaster free tier + DataForSEO pay-per-query instead of $130/mo Ahrefs/Semrush subscriptions).

## Owner

Hamza Ali — `mail.hamza.ali@gmail.com`
