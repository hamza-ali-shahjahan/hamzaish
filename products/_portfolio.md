# Portfolio Snapshot

**Last refreshed**: 2026-08-29 · Live state of all products in the factory.

Refresh by running `/portfolio-pulse` — regenerates this file from each product's `product.config.json` + `status.md`. Gate status on demand: `bun run check-gates`. Status-freshness on demand: `bun run check-status-staleness`.

---

## Telemetry is blind (still, 2026-08-20 → 2026-08-29)

Every connector — Stripe · PostHog · Sentry — still reads `not_connected` across all 23 products it can see (bids-town isn't visible to telemetry at all — see the note below the table). No keys are set, so every metric is `—`. Nothing has changed here since the last refresh; this is a structural constant, not new news.

## Status pages are going quiet too (new, 2026-08-29)

First run of `bun run check-status-staleness` (git-log based, 21-day threshold, AUTOPILOT-verdict products excluded since the portfolio already decided not to touch those). Three **registered** products are flagged — worth a look, not yet a verdict:

- **ai-native-cms** — 91 days since `status.md` moved (last touched 2026-05-30), *and* its validation gate has been OVERDUE since 2026-08-16. Two independent signals agreeing is the strongest kind of stale.
- **dnsdoctor** — 45 days quiet; its launch gate has been OVERDUE since 2026-08-18. Code-complete since 2026-07-09 and hasn't moved since.
- **ventbox** — 39 days quiet, and its own status.md still says "Gate being chased: launch (by 2026-08-18)" while `check-gates` shows the launch gate has already resolved and the next gate is validation, due 2026-08-30. The doc is describing a target that's moved on.

(claudex, formpad, local-llm-setup, rotscan also flagged stale, but they're maintainer's showcase — not the operator's queue — so they're informational only, not prioritized below. repolish is stale by the numbers too but excluded as AUTOPILOT, same as the registered set.)

## One sentence (2026-08-29)

Rotate Patently's credentials today — it's still the single named blocker on all beta outreach, open since June, and the only item nobody but the operator can close.

## Top 3 priorities

1. **copyright — verify the credential rotation** (~1h). Still open. `status.md`'s own mandate: *no beta outreach until this rotation is verified, not just done.* Everything else on this product is downstream of it. (Unchanged from the last refresh — this has now sat open long enough that it's worth asking whether "today" needs a hard deadline attached.)
2. **ai-native-cms — a verdict conversation, not a build task** (~15m to decide, more if it proceeds). Validation gate OVERDUE 13 days, status page untouched 91 days. Nobody has said this is paused, but nothing says it's active either. Decide: kill, pause explicitly (so the gate stops reading as broken), or restart the 5-WP-site validation sprint that's currently `## Definition of done` with zero boxes checked.
3. **dnsdoctor — ship the launch gate that's been code-complete for 7 weeks** (~2–4h, mostly naming + deploy per the product's own one-liner). Launch gate OVERDUE 11 days. 185 unit/integration tests + 48 e2e already passing; the work is prep, not build.

## On fire

**Nothing visible** — same as last refresh, phrased deliberately: with zero connectors wired, an empty fire list is what a blind portfolio looks like, not what a healthy one looks like.

## Don't touch today

- **Hamzaish itself.** Two brain-upgrade checks shipped today (`v2.29.0`); the conductor's rule is factory work on Sundays unless it's broken. It isn't.
- **mini-minecraft.** Its status reads "Ship the playable world locally... hand over the localhost link." Respect it; no gates block means no gate is broken, either.
- **new-one, valuable, foundernees.** All three are REGISTERED products with **no gates block at all** (`check-gates` fails on this) — that's a documentation gap, not today's fire. Worth a `/factory-launch` pass when there's room, not urgent enough to bump the Top 3.
- **repolish, ship-guard, rotscan, tasfort, scope-intelligence, ai-growth-engine, hamza-health, hamzaos, linkedup, one-dollar-factory.** All `AUTOPILOT` verdict — the portfolio already decided not to touch these. Several show `validation DUE 2026-08-30` (tomorrow) on `check-gates`, but that date looks batch-set across the AUTOPILOT group rather than a real per-product signal — worth confirming once, not chasing individually.
- **muakkil.** Validation gate OVERDUE since 2026-08-16, but its status page is fresh (9 days) — this is being actively worked, just hasn't cleared the gate yet. Different shape from ai-native-cms's silence; give it more runway before forcing a verdict.

---

## All products (24 folders; 23 in telemetry — bids-town has no config to read)

**bids-town** is registered in `code-paths.local.json` but its `products/bids-town/` folder has only a `decisions/` subfolder — no `product.config.json`, no `status.md`. Invisible to telemetry, the new staleness check, and this snapshot alike, because every one of those tools skips a product it can't read a config for. Not fixed here — flagging it, since a registered product nobody can see is the same blind spot this whole refresh is about.

Maintainer's showcase products (not in the operator's registered work queue) are marked §.

| Product | Stage | Verdict | Status | One-liner |
|---|---|---|---|---|
| **copyright** (Patently) | mvp | DOUBLE-DOWN | active | AI IP-clearance research — chat + clearance memos + watchlist digests. [patently.legal](https://patently.legal) |
| **ventbox** | launch | MAINTAIN | active · live | Architecturally-anonymous employee feedback — HR sees AI-categorized sentiment, never who said what. [ventbox.co](https://ventbox.co) |
| **muakkil** | mvp | MAINTAIN | active · venture-agent MVP | Venture agent for non-technical founders — speak an idea, get a built + distributed product. [muakkil.com](https://muakkil.com) |
| **dnsdoctor** | mvp | MAINTAIN | active · code-complete, launch gate overdue | DNS toolkit — 20+ resolver propagation + AI diagnosis + setup wizard. Needs name + deploy. |
| **ai-native-cms** | mvp | MAINTAIN | active on paper, 91d quiet | OSS CLI migrating WordPress → Astro + MDX; wedge for an AI-native CMS. npm: `wp-to-astro` |
| **tasfort** | launch | AUTOPILOT | active · live | "There's a System for That" — routines of 100+ remarkable people, matched by personality type. [theresasystemforthat.xyz](https://theresasystemforthat.xyz) |
| **repolish** | launch | AUTOPILOT | active · public repo | One-command CLI that makes a repo's first impression premium AND honest. [repo](https://github.com/hamza-ali-shahjahan/repolish) |
| **ship-guard** | launch | AUTOPILOT | active · public repo | One-command "about to get ransacked?" safety check + pre-push hook. [repo](https://github.com/hamza-ali-shahjahan/ship-guard) |
| **scope-intelligence** | mvp | AUTOPILOT | active | Scope enforcement for small agencies — ClickUp/Asana/Monday layer that prices creep. |
| **linkedup** | mvp | AUTOPILOT | active | LinkedIn-native outreach + content tooling for B2B founders. |
| **hamza-health** | mvp | AUTOPILOT | active · internal | Personal health intelligence — blood reports + wearables + habits into coaching. |
| **hamzaos** | mvp | AUTOPILOT | active · internal | The operator's personal OS — persona, strategy, calendar, research, content. |
| **ai-growth-engine** | idea | AUTOPILOT | active | Systems-agent-driven growth engine for SMB founders. |
| **one-dollar-factory** | idea | AUTOPILOT | active · meta | Experimental playbook for $1-decision micro-products. |
| **foundernees** | build | — (no gates) | active | Build-in-progress; needs a `/factory-launch` gates pass. |
| **mini-minecraft** | build | — (no gates) | active | "Ship the playable world locally, tested end to end." Nothing else needed today. |
| **new-one** | idea | — (no gates) | active | Blocked on a naming and an ownership-law question; not a build task. |
| **valuable** | build | — (no gates) | active | Valuation app for UK/London/companies/startups from real data. |
| § **formpad** | launch | — | active, 57d quiet | Form builder for indie SaaS founders — auto-generated forms backed by Supabase. [formpad.app](https://formpad.app) |
| § **rotscan** | launch | — | active, 69d quiet | OSS CLI that finds & clears repo rot across one repo or 100. Explicitly waiting on user feedback. [npm](https://www.npmjs.com/package/@hamzaish/rotscan) |
| § **claudex** | mvp | — | active · pre-launch, 48d quiet | Not yet registered in the work queue. |
| § **local-llm-setup** | launch | — | live, 69d quiet | Not yet registered in the work queue. |
| § **calculatrs** | idea | — | slot_reserved | Reserved slot, no build started. |

---

## What changed since the last refresh (2026-08-20 → 2026-08-29)

- `check-status-staleness` is new this refresh — first time this signal exists. See "Status pages are going quiet too" above.
- copyright's PR #17 merged (spending-requires-a-customer change, `dab5e72`) — the old "merge PR #16" priority is resolved and dropped.
- Three new showcase-tier products appeared in `products/`: **claudex**, **local-llm-setup**, **calculatrs** — none registered in `code-paths.local.json` yet, so they render as showcase, not queue.
- `check-gates` now shows 4 OVERDUE (ai-native-cms, copyright, dnsdoctor, muakkil) and 4 registered products with **no gates block at all** (foundernees, mini-minecraft, new-one, valuable) — that structural gap didn't show up in the last refresh's text.
