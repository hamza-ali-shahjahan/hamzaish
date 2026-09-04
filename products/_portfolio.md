# Portfolio Snapshot

**Last refreshed**: 2026-09-04 · Live state of all products in the factory.

Refresh by running `/portfolio-pulse` — regenerates this file from each product's `product.config.json` + `status.md`. Gate status on demand: `bun run check-gates`. Status-freshness on demand: `bun run check-status-staleness`.

---

## The number that reframes this refresh (new, 2026-09-04)

**Patently has had 0 chat messages in the last 14 days.** Queried directly from its own
database, not inferred from a missing connector.

That single fact reorders everything below. Patently's infrastructure is now in excellent
shape — $0 Google spend, the architecture enforced by the build rather than by discipline,
a feedback layer live in production as of today. And nobody is using it. Cost was never
the real problem; it was the visible symptom of a product with no traffic. From here,
every hour of infrastructure work has a worse return than an hour spent getting one
person to run a clearance memo.

## The rotation has been #1 for three consecutive refreshes

2026-08-20, 2026-08-29, and today. An item that stays at the top and never moves is not a
priority — it is a blocked decision wearing a priority's clothes. It has now gated all
beta outreach since **June**, which is the direct cause of the zero above.

So the useful move is no longer "do the rotation." It is to pick one of three and record
it:

- **Commit a date.** Put it in the calendar this week; the task is ~1h of dashboard work.
- **Narrow the mandate.** Rotate only the keys that were genuinely exposed, verify those,
  and lift the hold. The blanket "all six, verified" phrasing may be doing more damage
  than the risk it guards.
- **Lift the hold deliberately**, with the risk written down. Outreach to 5 people is a
  small blast radius; three months of silence is not.

Any of the three beats a fourth refresh saying the same thing.

## Telemetry is blind (unchanged, 2026-08-20 → 2026-09-04)

Every connector — Stripe · PostHog · Sentry — still reads `not_connected` across all 23
products it can see. Structural constant, not news. Patently is now the one exception in
practice: its own database answers usage questions directly, which is how the zero above
was measured.

## Status pages still going quiet

`bun run check-status-staleness` now flags **seven** (was three): ai-native-cms (96d),
claudex (54d), dnsdoctor (51d), formpad (63d), local-llm-setup (75d), rotscan (75d),
ventbox (45d). The registered ones — ai-native-cms, dnsdoctor, ventbox — carry the same
overdue gates called out on 2026-08-29 and have not moved since.

## One sentence (2026-09-04)

Decide what happens to Patently's credential-rotation hold today — not because rotating
is urgent, but because three months of it blocking outreach has produced a finished
product with zero users.

## Top 3 priorities

1. **copyright — resolve the rotation hold** (~1h, operator-only). Commit a date, narrow
   the mandate, or lift it with the risk recorded. Pick one; do not carry it to a fourth
   refresh. Everything else on this product is downstream, and the product is otherwise
   finished and free to run.
2. **foundernees — draft the P1 partner list, 20 named institutional targets** (~2h).
   **Due 14 Sep — 10 days.** Decision `0001` calls it the load-bearing assumption of the
   whole year: *the product is not the risk — the signature is*. The only dated external
   commitment in the portfolio, and the window has gone from comfortable to short.
3. **copyright — merge PR #16** (~15m + a rebase). Pricing copy and the public-beta label
   have been green and unmerged for **19 days**; `main` has moved twice under it (PRs #17,
   #18). Cheap, finishes something already done, and it is the copy a first visitor reads.

ai-native-cms and dnsdoctor from the last refresh are deliberately displaced, not
resolved — both are still overdue and still need a verdict conversation. They lose to
foundernees only because foundernees has a real external date.

## On fire

**Nothing burning, but one thing rotting.** Patently is fully built, costs nothing to run,
and has no users — a state that looks calm on every dashboard and is the most expensive
one to stay in.

## Don't touch today

- **Patently's infrastructure.** It shipped twice today (PRs #17, #18) and is verified in
  production. Its three agreed backlog items — dynamic import-boundary roots, splitting
  the pure scope helpers out of the acquisition module, an immutable `approvedScope`
  snapshot — are all real and none of them produce a user.
- **The BigQuery acquisition runner.** Deliberately unbuilt, by instruction.
- **Hamzaish itself.** `v2.31.0` shipped today. Factory work on Sundays unless broken.
- **mini-minecraft.** Its status reads "Ship the playable world locally." Respect it.
- **new-one, valuable.** Blocked on questions that are not build tasks.
- **The AUTOPILOT set.** repolish, ship-guard, rotscan, tasfort, scope-intelligence,
  ai-growth-engine, hamza-health, hamzaos, linkedup, one-dollar-factory — the portfolio
  already decided not to touch these.
- **muakkil.** Gate overdue but the status page is fresh; being worked, just not cleared.

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
