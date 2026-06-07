# Portfolio Snapshot

**Last refreshed**: 2026-05-30 · Live state of all products in the factory.

Refresh by running `/portfolio-pulse` — regenerates this file from each product's `product.config.json` + `status.md`.

---

## Active spotlight: **muakkil** (buildathon launch this weekend)

Muakkil is the factory's first proof-of-value. Lovable buildathon submission = beta launch. First 100 sign-ups become the beta cohort. **The Scribe demo (voice → orchestrator → Seeker → Herald → email in <60s) is the demo centerpiece.**

→ See `products/muakkil/status.md` for the 48h timeline and today's recommended action.

---

## All products (14)

| Product | Stage | Status | One-liner |
|---|---|---|---|
| **muakkil** | mvp | active · buildathon | Mystical AI-agent platform — four spirit agents collaborate on cross-agent charges. |
| **scope-intelligence** | mvp | active · vertical-slice-build | Scope enforcement SaaS for small agencies — integrates with ClickUp/Asana/Monday. |
| **dnsdoctor** | mvp | active | Differentiated DNS toolkit — global propagation across 20+ resolvers + AI diagnosis + setup wizard. |
| **ventbox** | launch | active · live | Architecturally-anonymous employee-feedback platform — HR sees AI-categorized sentiment, never who said what. [ventbox.co](https://ventbox.co) |
| linkedup | mvp | active | LinkedIn-native outreach + content tooling for B2B founders. |
| **copyright** (Patently) | mvp | active · private-beta · live | AI IP-clearance research — research chat + clearance memos + watchlist digests over US case law, patents, copyright. [patently.legal](https://patently.legal) |
| hamza-health | mvp | active | Personal health intelligence — blood reports + wearables + habits into coaching. |
| hamzaos | mvp | active | Hamza's personal operating system — persona, strategy, calendar, research, content. |
| one-dollar-factory | idea | active | Experimental playbook for generating $1-decision micro-products. |
| ai-growth-engine | idea | active | Systems-agent-driven growth engine for SMB founders. |
| **tasfort** | launch | active · live | "There's a System for That" — routines & systems of 100+ remarkable people, matched by personality type. [theresasystemforthat.xyz](https://theresasystemforthat.xyz) |
| **ai-native-cms** | mvp | active · validation | OSS CLI that migrates WordPress sites to clean Astro + MDX codebases — wedge for an AI-native CMS. Shipped to npm as `wp-to-astro@0.6.1`. |
| formpad | idea | slot_reserved | (slot reserved — needs validation before scaffolding) |
| calculatrs | idea | slot_reserved | (slot reserved — needs validation before scaffolding) |

Stages: **idea** (validation phase) · **mvp** (building) · **launch** (shipping to first users) · **scale** (post-PMF growth) · **sunset** (winding down).

---

## Stage distribution

- **Launch (live)**: 3 (ventbox → ventbox.co, copyright/Patently → patently.legal [private beta], tasfort → theresasystemforthat.xyz) — shipped, public
- **MVP**: 7 products (muakkil, scope-intelligence, dnsdoctor, linkedup, hamza-health, hamzaos, ai-native-cms) — building OR (for ai-native-cms) shipped + in validation sprint
- **Idea (active)**: 2 (one-dollar-factory, ai-growth-engine) — validating
- **Idea (slot_reserved)**: 2 (formpad, calculatrs) — awaiting validation/details

> _Counts hand-updated 2026-06-07 after Ventbox/TASFORT/Patently confirmed live; rerun `/portfolio-pulse` to fully regenerate._

**Discipline check**: 7 products in MVP + 3 live simultaneously is *a lot* for a solo operator. The factory was designed for **focused parallelism, not maximum parallelism**. Likely action at next `/portfolio-pulse`: confirm which 1-2 of the 9 MVPs are this quarter's bets (Muakkil this weekend is locked; Scope Intelligence has the most depth of work after that; ai-native-cms is in validation sprint — no further build until 5 WP-refugee conversations land); the others go to "background validation" mode (don't ship until they earn it).

---

## Today's recommended actions (per product)

Populated by `/portfolio-pulse` on each invocation.

- **muakkil** → Run Lovable Prompt 1 (auth). Drop API keys into `.env.local`. Then start Block 1. **(THIS WEEKEND)**
- **scope-intelligence** → `/work-on scope-intelligence` to load full context, then identify the current vertical slice and the 5 customers booked for paid validation.
- **dnsdoctor** → `/work-on dnsdoctor` to load full context, verify AI-diagnosis citation post-validator is active.
- **ventbox** → LIVE at ventbox.co (B2B employee-feedback). Backfill analytics IDs + validation/retention evidence; assess real traction before further build.
- **linkedup** → Read-through needed; status unknown to factory.
- **copyright (Patently)** → LIVE in private beta at patently.legal. Drive 5–10 target users through chat + clearance; rotate burned credentials; run `pnpm db:migrate` (migration 0001).
- **hamza-health** → Read-through needed; status unknown to factory.
- **hamzaos** → Read-through needed; status unknown to factory.
- **one-dollar-factory** → Validation conversations before any code.
- **ai-growth-engine** → Validation conversations before any code.
- **tasfort** → LIVE at theresasystemforthat.xyz. Reconcile the canonical source folder (~/Claude/TASFORT vs ~/Claude/$1F&S/TASFORT); backfill analytics; assess traction.
- **ai-native-cms** → Record the 90-second screencast (Docker WP → migration → Astro site rendering — env already up at localhost:8080 + localhost:4321). Then post in r/selfhosted offering 5 free migrations in exchange for feedback. NO further build until validation sprint lands real-user signal. See `products/ai-native-cms/status.md`.
- **formpad** → Validate or release slot.
- **calculatrs** → Validate or release slot.

---

## Inventory note

Hamzaish itself (the factory) is in active development. See `meta/changelog.md` — currently at **v1.1**. Next milestone: Muakkil's buildathon retro will drive Phase B (test coverage of the factory's load-bearing skills) and Phase C decisions (full memory layer evolution).

## How to refresh this file

```
/portfolio-pulse
```

Pulls each `product.config.json` + `status.md`, regenerates the table and the recommended-actions section. Should run automatically at the start of each working day; manual invocation otherwise.
