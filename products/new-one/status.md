# New One — Live Status

**Stage**: idea (site built, argument written down)
**Status**: active — a proposal, not a company

> **STANDING CONSTRAINT — do not deploy, and do not propose deploying.** The operator's
> instruction on the sibling product applies here too: make it work first. No domain has
> been chosen; `site.url` is a placeholder. See foundernees `decisions/0003`.

## What this is

One billion builders and founders in a **single company** that holds a small share of an
**unlimited number of separate companies**. Members own the venture they build outright,
plus an equal share of the Commons at the centre — which holds shared money, reach, tools
and trust.

The argument is written out in full at `~/Claude/NewOne/lib/content.ts`, which
is the source of truth for the site's copy.

## Relationship to foundernees

Deliberately **separate products, separate repos, separate ports** (3210 / 3211).
Foundernees is the on-ramp — it takes someone who has never built anything to their first
real thing. New One is the motorway they drive onto. An on-ramp that leads to exactly one
place is not an on-ramp, and that reasoning is on both sites.

## Active sessions (lock — update when you start/stop work)

| Session / branch | Scope (files/area owned) | Status | As of |
|---|---|---|---|
| main — first build | `~/Claude/NewOne` (whole repo) | v1 site built and green | 2026-08-17 |

## Slices

- [x] **N1 — The argument, written down.** The structure (Commons / Ventures / Members),
      how value moves, the guards against capture, the five-rung ladder, and the honest
      list of what nobody has solved. Includes the strongest objection — that a billionth
      of anything is worthless — answered on the home page rather than buried.
- [x] **N2 — The site.** Five pages, a distinct visual language from its sister (near-black
      + ultramarine + grotesque, against green + serif), and the thesis as one drawing:
      460 points converging into a single ring on scroll.
- [x] **N3 — The same discipline.** Grade ≤ 8 on every page, under 400 KB, mobile checked
      at 320/360/393px, SEO + structured data, `llms.txt`. Zero images, zero web fonts.
- [ ] **N4 — Sign-ups.** The join endpoint deliberately returns 503 with a real
      explanation rather than silently dropping submissions. Needs storage before it opens.
- [ ] **N5 — Name and domain.** "New One" is the operator's working name. Not cleared, not
      bought. `/name-clearance` before any domain purchase.

## Open immediately

- **Is "New One" the real name?** It carries a useful double meaning — a new one, and the
  new *One*. But it is generic enough to be hard to search for and hard to trademark.
  Run `/name-clearance` before spending anything.
- **The legal question is the real blocker,** not the product. Ownership law does not
  cleanly permit this structure at scale anywhere. Rung two is where that gets tested.
- **Validation debt is open and larger than usual** — this argues for something nobody has
  done. The sceptic path on the join form exists to gather the disconfirming evidence.

## Tracking (trackable or it isn't shippable)

`page_view` (all pages, including the virtual sections), `join_started`,
`join_submitted`, `join_role_selected` (builder / architect / **sceptic** — the split
matters more than the total here), `structure_read`, `ladder_read`.
