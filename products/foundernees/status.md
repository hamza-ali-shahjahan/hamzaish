# Foundernees — Live Status

**Stage**: build
**Status**: active — day 3 of Year One (14 Aug 2026 → 14 Aug 2027), nothing live yet

> **STANDING CONSTRAINT — do not deploy, and do not propose deploying.** Operator
> instruction 2026-08-16: *"first we have to make it work."* No Vercel project, no DNS,
> no launch offers at the end of a task. Lifted only by the operator, unprompted.
> See `decisions/0003-no-launch-until-said.md`.

## North star this sprint
> **Make it work, completely** — the v1 site passing every check that does not require a
> deployment (E2–E7 in [`goal.md`](goal.md)). E1 and the 5,000-signups target are parked
> behind the operator's no-launch instruction, not behind any work.

## The Year One scoreboard (see `goal.md` for the arithmetic)

| # | Number | Target | Now |
|---|---|---|---|
| 1 | People reached | 10,000,000 | 0 |
| 2 | Builders who ship a first thing | 100,000 | 0 |
| 3 | Foundernees who complete the programme | 10,000 | 0 |
| 4 | Founderships granted | 1,000 | 0 |
| 5 | Companies alive at 14 Aug 2027 | 200 | 0 |
| — | *Operating input:* builders onboarded | 1,000,000 | 0 |

**Confirmed by the operator 2026-08-16 — 100K is the shipping number, as written.**
Required pace: ~2,760 signups/day. Distribution is the critical path, not the product —
partner gates P1 (20 named targets, 14 Sep) · P2 (first signature, 14 Nov) ·
P3 (2.5M reached, 14 Feb) live in `goal.md`.

## Active sessions (lock — update when you start/stop work)
_Avoid two sessions on the same files. See [`meta/parallel-sessions-protocol.md`](../../meta/parallel-sessions-protocol.md)._

| Session / branch | Scope (files/area owned) | Status | As of |
|---|---|---|---|
| main — site build | `~/Claude/Foundernees` (whole repo) | S2/S6–S10 shipped · S3 needs keys · S1 frozen by no-launch rule | 2026-08-17 |

## Slices

### Build 1 — the marketing site
- [~] **S1 — Skeleton.** Next.js 16 app builds clean, 6 pages + share image + manifest + 404, all static except the signup endpoint. Countdown correct (363 days / day 3). *E6 passes. E1 (live over HTTPS) is deliberately parked — see the standing constraint above.*
- [x] **S2 — The pitch.** Home, manifesto, the four stages, Foundership, the public scoreboard, and a Questions page. *E3 passes: grade 1.84–3.57 against a bar of 8. 35 em dashes intact and asserted in CI.*
- [x] **S6 — Make it feel like a movement.** Rebuilt the visual language after the first pass read as a whitepaper: display type at 12vw, full-bleed inverted colour bands, the funnel drawn as a log-scale cascade, a cities marquee, the "No. That shall not pass." line given a whole screen, grain overlay, scroll-driven reveals. *All of it CSS/SVG — total cost 6 KB, weight went 186 → 192 KB against a 400 KB budget, still zero web fonts and one client component.*
- [x] **S8 — Urdu calligraphy + fold art.** *Har fan maula* set in the warm accent with **ہر فن مولا** beside it in real Nastaliq, filling what was dead space in the "Who this is for" fold. Three pieces of line art: a brick wall coming apart behind "The wall just fell", a chain snapped clear of the headline behind "No. That shall not pass.", and the crescent and star behind "Why 14 August" — chosen over a literal flag, which reads as clipart on a dark editorial page. *All art is stroked/filled SVG, ~16 KB total, aria-hidden and asserted decorative in tests. Both the chain and the font needed a second and third pass after operator review — see `learnings.md`. Font is a 25 KB subset of **Gulzar** (SIL OFL), chosen over Noto Nastaliq Urdu, Aref Ruqaa and Amiri by rendering all four side by side; it downloads only on the two pages showing the phrase. Weight now 186–228 KB against 400 KB; `check:weight` was fixed to charge pages for CSS-referenced fonts, which it had been silently missing.*
- [x] **S9 — Mobile, legal, and one page per idea.** New `check:mobile` at 320/360/393px — no sideways scroll, 44px tap targets, 15px body-copy floor (small print may go to 12px only if it opts in). Privacy and Terms written at grade 4.2 and 3.6, not boilerplate. `/manifesto` retired: it repeated the home page's mission text, which is duplicate content — the text now lives at `/#idea` and the old URL 308-redirects, so nothing 404s. Chain art moved to the floor of its fold so type never competes with it. *44 end-to-end tests; mobile clean at all three widths.*
- [x] **S10 — Motion, and a chain that hangs.** All three fold artworks now share one surface (`ArtSurface`): a scroll-linked drift on `animation-timeline: view()` and a travelling glaze masked to the shapes themselves — an SVG `<mask>`, not a clip path, because masks capture strokes and clip paths do not. The chain was rebuilt on a real **catenary** (`y = a·cosh(x/a)`), links spaced by arc length via `x = a·asinh(s/a)` and rotated to the tangent, with a tauter curve on the anchored half and a deeper sag on the freed one. Copy tense corrected — Year One *began*. *All motion stops under `prefers-reduced-motion`, asserted in tests.*
- [x] **S7 — Found by search, quoted right by assistants.** Per-page titles/descriptions/canonicals, Organization + WebSite + EducationalOccupationalProgram + Grant + FAQPage + BreadcrumbList structured data, generated share image, icon, web manifest, real 404, sitemap, and `public/llms.txt`. A 10-question answers page written to be quotable. *Gated by `bun run check:seo` in CI — 40 assertions across 6 pages, all passing.*
- [~] **S3 — Capture the builder.** Signup form → Supabase, confirmation email via Resend, source attribution on every row, and a **role** field (builder / volunteer / partner) so the partner pipeline fills from day one. *Code complete; the form contract is proven by 30 end-to-end tests on a Pixel 5 and a desktop profile. E4/E7 BLOCKED until the operator pastes Supabase + Resend keys into `.env.local` — `scripts/verify-live.ts` then runs the 20-submission proof and cleans up after itself.*
- [~] **S4 — Fast on a cheap phone.** Weight budget enforced in CI (`check:weight`): 187–230 KB gzip per page against a 400 KB budget, zero web fonts, one client component on the whole site. *Lighthouse LCP/score on a throttled profile still to be measured against the deployment — E2 partially proven.*
- [ ] **S5 — Measurable.** Plausible + a read-only signup counter; public scoreboard page wired to real numbers. *Done when the first 1,000 visitors carry source attribution.*

### Build 2 — the platform (SPEC WRITTEN 2026-08-16, awaiting approval — no code yet)
Spec lives in the code repo at `SPEC.md`. Stage One is a seven-screen guided first
session that ends with a person holding a live URL they made; Stage Two is the shipping
loop — a public Wall, builder profiles, and a weekly job that re-checks every link so the
headline number only ever counts things that are actually alive.

Four decisions settled by the operator: email magic-link sign-in (`decisions/0004` —
chosen over phone, with a measurable revisit trigger) · Urdu and English from day one ·
proof of shipping is an auto-checked live link · the first build happens in Lovable or
Replit because both end with a URL.

**Two gates before any code:**
- [ ] Operator approves `SPEC.md`
- [ ] **Confirm Lovable/Replit are usable free from Pakistan without a card.** If either
      gates free use behind payment, step 2 of the flow breaks for exactly the people
      this is for — this is the most likely thing to invalidate the whole design.

## Open immediately
- **P1 partner pipeline — due 14 Sep 2026.** 20 named institutional targets with a contact and a status. This is now the highest-leverage open item in the whole product; the site only feeds it.
- **Urdu: v1 or v2?** The "office boys of the world" promise argues for day-one Urdu. Recommendation is English-first with copy written for translation — recorded in `decisions/0002`.
- ~~Deploy + domain~~ — **frozen by operator instruction** (`decisions/0003`). Not an open item; do not raise it.
- **Keys for signups** — E4/E7 cannot run until Supabase + Resend keys exist in `.env.local` (operator pastes them; `supabase/schema.sql` creates the table).
- **Validation debt is open** — see `validation/README.md`. Catch-up trigger: 5 conversations with target-profile Pakistani first-time builders before the platform build starts.

## Tracking (trackable or it isn't shippable)
Every slice above emits at least one event: `page_view` (all), `signup_started`,
`signup_completed`, `signup_failed`, `stage_page_viewed`, `partner_signup`, `faq_viewed`. S4/S6/S7 are the exceptions —
performance, design and search health are measured in CI, not tracked as events, and that is deliberate.
