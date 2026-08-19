# Portfolio Snapshot

**Last refreshed**: 2026-08-20 · Live state of all products in the factory.

Refresh by running `/portfolio-pulse` — regenerates this file from each product's `product.config.json` + `status.md`. Gate status on demand: `bun run check-gates`.

---

## Telemetry is blind (2026-08-20)

Every connector — Stripe · PostHog · Sentry — reads `not_connected` across all 23 products. No keys are set, so every metric is `—`, and **three products are LIVE with the factory unable to see a single signal from any of them.** Absence of alarms is not evidence of health. Wiring instructions: header of `scripts/telemetry.ts`.

---

## One sentence (2026-08-20)

Verify the Patently credential rotation today — open since June, it is the product's own stated gate on all beta outreach, and only the operator can close it.

## Top 3 priorities

1. **copyright — verify the credential rotation** (~1h). Open since June. The product's status makes it a hard gate: *no beta outreach until verified*. Anthropic, Resend, CourtListener, Voyage and Neon keys were exposed in past transcripts; only the operator can compare key creation dates in each dashboard. Everything else on this product is downstream of it.
2. **copyright — merge PR #16** (~15m). Pricing copy and the public-beta label have been green and unmerged since 16 Aug. `main` moved under it on 20 Aug (PR #17), so it likely needs a rebase first — cheap now, staler every day. Merging is the deploy.
3. **foundernees — draft the P1 partner list, 20 named institutional targets** (~2h). Due **14 Sep**, and decision `0001` names it the load-bearing assumption of the whole year: *the product is not the risk — the signature is*. Nothing else in the portfolio carries a dated external commitment.

## On fire

**Nothing visible** — phrased deliberately. With zero connectors wired, an empty fire list is what a blind portfolio looks like, not what a healthy one looks like. The nearest thing is copyright's unrotated credentials, which is priority #1 rather than an incident only because nothing has been observed exploiting them.

## Don't touch today

- **Hamzaish itself.** v2.26.0 shipped today; the conductor's rule is factory work on Sundays unless it's broken. It isn't. That includes the starter-template spend guard — real leverage, wrong day.
- **mini-minecraft.** Its status reads "Nothing. Play it together." Respect it.
- **new-one.** Blocked on a naming and an ownership-law question; neither is a build task.
- **muakkil · scope-intelligence.** Open-ended MVP work with no dated commitment — they expand to fill whatever time they are given.
- **repolish · ship-guard · rotscan.** Live and stable; rotscan is explicitly waiting on user feedback that hasn't arrived. Polish without demand is deferred work.

---

## All products (24 folders; 23 in telemetry)

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

**New since this table was last rebuilt (2026-08-20):** foundernees (build) · valuable (build) · new-one (idea) · mini-minecraft (build) — registered in `code-paths.local.json`, not yet folded into the table above.

**Discipline check (2026-07-24)**: WIP caps in force — 1 active build (paused for the GTM week) · 2 active GTM (Patently, ventbox) · everything else AUTOPILOT. First gate deadlines land 2026-08-16–18 (Patently beta cohort + P0s, ventbox measured signups, dnsdoctor deploy, muakkil interviews). Portfolio-wide measured traction is currently **zero** — the next verdict-worthy number is one measured signup, interview, or beta user.
