# Portfolio Snapshot

**Last refreshed**: 2026-07-24 · Live state of all products in the factory.

Refresh by running `/portfolio-pulse` — regenerates this file from each product's `product.config.json` + `status.md`. Gate status on demand: `bun run check-gates`.

---

## Active spotlight: the GTM week (2026-07-19 mandate)

The factory's control plane is live (v2.16–v2.21): every registered product carries **lifecycle gates** (states-and-dates), and the weekly mandate concentrates effort instead of spreading it. This week: **Patently** (clear launch-checklist P0s → 5–10 private-beta users through a real clearance flow) and **ventbox** (instrument analytics so next week's push is measurable). Build lane resumes after: muakkil slice 7, dnsdoctor name + deploy.

---

## All products (19)

Maintainer's showcase products (not in the operator's registered work queue) are marked §.

| Product | Stage | Verdict | Status | One-liner |
|---|---|---|---|---|
| **copyright** (Patently) | mvp | DOUBLE-DOWN | active · private-beta · live | AI IP-clearance research — chat + clearance memos + watchlist digests. [patently.legal](https://patently.legal) |
| **ventbox** | launch | MAINTAIN | active · live | Architecturally-anonymous employee feedback — HR sees AI-categorized sentiment, never who said what. [ventbox.co](https://ventbox.co) |
| **muakkil** | mvp | MAINTAIN | active · venture-agent MVP | Venture agent for non-technical founders — speak an idea, get a built + distributed product. [muakkil.com](https://muakkil.com) |
| **dnsdoctor** | mvp | MAINTAIN | active · code-complete | DNS toolkit — 20+ resolver propagation + AI diagnosis + setup wizard. Needs name + deploy. |
| **ai-native-cms** | mvp | MAINTAIN | active · validation | OSS CLI migrating WordPress → Astro + MDX; wedge for an AI-native CMS. npm: `wp-to-astro` |
| **tasfort** | launch | AUTOPILOT | active · live | "There's a System for That" — routines of 100+ remarkable people, matched by personality type. [theresasystemforthat.xyz](https://theresasystemforthat.xyz) |
| **repolish** | launch | AUTOPILOT | active · public repo | One-command CLI that makes a repo's first impression premium AND honest. [repo](https://github.com/hamza-ali-shahjahan/repolish) |
| **ship-guard** | launch | AUTOPILOT | active · public repo | One-command "about to get ransacked?" safety check + pre-push hook. [repo](https://github.com/hamza-ali-shahjahan/ship-guard) |
| **scope-intelligence** | mvp | AUTOPILOT | active | Scope enforcement for small agencies — ClickUp/Asana/Monday layer that prices creep. |
| **linkedup** | mvp | AUTOPILOT | active | LinkedIn-native outreach + content tooling for B2B founders. |
| **hamza-health** | mvp | AUTOPILOT | active · internal | Personal health intelligence — blood reports + wearables + habits into coaching. |
| **hamzaos** | mvp | AUTOPILOT | active · internal | The operator's personal OS — persona, strategy, calendar, research, content. |
| **ai-growth-engine** | idea | AUTOPILOT | active | Systems-agent-driven growth engine for SMB founders. |
| **one-dollar-factory** | idea | AUTOPILOT | active · meta | Experimental playbook for $1-decision micro-products. |
| § **formpad** | launch | — | live | Form builder for indie SaaS founders — auto-generated forms backed by Supabase. [formpad.app](https://formpad.app) |
| § **rotscan** | launch | — | live · npm | OSS CLI that finds & clears repo rot across one repo or 100. [npm](https://www.npmjs.com/package/@hamzaish/rotscan) |
| § **local-llm-setup** | launch | — | live | Zero to a running local LLM on Mac/Linux/Windows — one command. |
| § **claudex** | mvp | — | active | Claude Code plugin: Claude writes, Codex reviews, ship on consensus. |
| § **calculatrs** | idea | — | slot_reserved | (slot reserved — needs validation before scaffolding) |

Stages: **idea** (validation) · **mvp** (building) · **launch** (first users) · **scale** (post-PMF) · **sunset**. Verdicts (registered products, from `gates.verdict`): **DOUBLE-DOWN** (the active bet) · **MAINTAIN** (gate being chased) · **AUTOPILOT** (live at ~$0 upkeep, no active effort) · CONCENTRATE (reserved for a PMF-gate pass — none yet).

---

## Stage distribution (registered products)

- **Launch**: 4 (ventbox, tasfort, repolish, ship-guard) — live/public; autopilot except ventbox
- **MVP**: 8 (copyright, muakkil, dnsdoctor, ai-native-cms, scope-intelligence, linkedup, hamza-health, hamzaos)
- **Idea**: 2 (ai-growth-engine, one-dollar-factory)
- **Scale**: 0 — the honest number; the gate ladder exists so this line changes on evidence, not vibes

**Discipline check (2026-07-24)**: WIP caps in force — 1 active build (paused for the GTM week) · 2 active GTM (Patently, ventbox) · everything else AUTOPILOT. First gate deadlines land 2026-08-16–18 (Patently beta cohort + P0s, ventbox measured signups, dnsdoctor deploy, muakkil interviews). Portfolio-wide measured traction is currently **zero** — the next verdict-worthy number is one measured signup, interview, or beta user.
