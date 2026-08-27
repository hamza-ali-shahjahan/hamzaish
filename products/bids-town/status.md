# bids.town — Live Status

**Stage**: LIVE — https://bids.town on real database + shared Stripe, 2026-08-22
**Status**: active — awaiting first paid claim
**Code**: private repo https://github.com/hamza-ali-shahjahan/bids-town (created + pushed 2026-08-22 evening; deploys via `vercel --prod` from the folder)

## North star this sprint
> **Goal (pinned 2026-08-22):** every milestone in SPEC.md §9 built and verified locally in
> demo mode — a visitor can explore a themed, living town, watch a launch, and every ad
> surface shows its holder — with only the operator-owned steps left: database keys,
> Stripe test, the productbids webhook guard, and the deploy itself.

## Spec
Locked 2026-08-22 → `SPEC.md` in the code repo (`/Users/hamza/Claude/Bid Town`).
Six milestones, M1 next: make the town read as a place (banners, signs, ambient
buildings, game chrome). The factory contract is planted in the repo's CLAUDE.md.

## What it is
$1 claims a plot and puts a hot dog cart with your logo and link on the outskirts. Every
dollar after that is ad spend, and one lifetime total drives three rewards at once: your
building grows up a seven-rung ladder, your street address moves toward the town square, and
your brand takes over advertising surfaces across the town. Separately, $5/hour (up to 12
hours) flies your flag on the Moon and on the launch pad.

## Done
- Forked from productbids with no secrets carried across; own identity, storage namespace,
  analytics id, Vercel and Supabase projects.
- Consolidated five clean migrations, replayed against Postgres 17 in Docker — all apply.
- **Function grant lockdown verified**: zero functions left on Postgres' default
  EXECUTE-TO-PUBLIC. See `learnings.md` — this was a live free-money hole in the parent.
- Tier ladder validated across a young board and a mature board; found and fixed a fairness
  bug where late arrivals got a smaller building for the same money.

## SHIPPED 2026-08-23 — mobile pass + three things that were never deployed

> Live on https://bids.town. Pushed to GitHub (4ee890f) and deployed.

Asked for DataFast bot tracking; found it already written and **not running**,
plus two more files that existed only on one machine:

1. `src/proxy.ts` — the whole bot-tracking file was **untracked by git**. It ran
   in local dev so it looked done; production never had it.
2. `@datafast/ai-crawl` — **imported but absent from package.json**. It resolved
   only because the folder sat in local node_modules; a clean install (every
   Vercel build) would not have it.
3. `/ooh` — the map page and its lib were untracked while the COMMITTED
   `Header.tsx` linked to it. `bids.town/ooh` returned **404 in production**,
   behind a link in the site's own navigation. Now 200.

### Learning — "runs locally" is not "shipped", and analytics fail silently
An analytics feature that isn't running reports *no bot traffic*, which is
indistinguishable from *no bots came*. Nothing alerts. Two independent breakages
(untracked file AND missing dependency) each would have disabled it alone.
Worth a check: `git status --porcelain | grep '^??'` before calling anything done,
and for any imported package, confirm it is in the COMMITTED package.json.

Mobile pass also shipped: touch thumbstick + drag-look + tap-interact writing
into a shared `touchInput` channel that ADDS into the same movement vector as
WASD (one `step()`, one set of collision solids); `useViewport()` replacing four
components' private innerWidth reads; sights panel auto-collapsing; dismissible
rotate hint; claim bar and hint stepping aside while walking. Two bugs fixed en
route: a Rules-of-Hooks violation, and that guard landing in the wrong component.

## (superseded) PART-DONE 2026-08-23 — mobile is a real device (commit 1696075, local only)

> Shipped: part A complete, part B built and rendering. Blocked on a
> **pre-existing** bug: walk mode renders empty sky — reproduced at DESKTOP width
> too, so it predates this work and is not a touch regression.

Done: touch thumbstick + drag-look + tap-interact writing into a shared
`touchInput` channel that ADDS into the same movement vector as WASD (one
`step()`, one set of collision solids); `useViewport()` replacing four
components' private innerWidth reads; sights panel auto-collapsing below md;
dismissible rotate hint; claim bar and hint stepping aside while walking;
input-appropriate on-screen hints; walk button shown on coarse-pointer devices.

Two bugs found and fixed en route: a Rules-of-Hooks violation (early return
placed above hooks → "Rendered fewer hooks than expected"), and the same guard
landing in the wrong component.

### NEXT SLICE — walk mode renders nothing but sky
> **Done =** entering walk mode shows the town from street level, on desktop and
> on a phone.
Camera init looks right (`pos (0,10)`, `pitch -0.05`, `yaw PI`, eye height from
WALK). Reproduces at 1280px, so start there — it is not a mobile problem.

## NEXT SLICE (superseded) — mobile is a real device, not a shrunken desktop (pinned 2026-08-23)

> **Done =** on a 390px portrait phone: the town is visible on load, the claim bar is not
> covered, and a visitor can enter walk mode and actually move — verified on the live site.

Why now: the operator opened bids.town on a phone and could neither see the town (two
overlays covering it) nor find walking. Walking IS live — `WalkMode` is mounted and
reachable — but the entry button is `hidden … md:flex`, so it does not exist below 768px.
That is correct today, because movement is keyboard-only (`keydown`/`keyup`, WASD) and a
visible button would hand phone users a character they cannot move.

Two parts, both needed for the slice to be true:

**A — the town is usable in portrait**
- Mayor + "See the sights" auto-collapse below the `md` breakpoint instead of opening over
  the canvas; they stay one tap away.
- A dismissible rotate hint on portrait phones (hint, never a block — some people will
  scroll one-handed and that must still work).
- Claim bar never covered by an overlay.

**B — you can actually walk on a phone**
- A thumbstick driving the EXISTING pure `step()` in `src/lib/city/walk.ts` — no fork of the
  movement maths, so desktop and touch stay one code path.
- Drag-to-look on the right half of the screen.
- The `E` interact prompt becomes a tap target.
- Only then does the walk button lose its `hidden md:flex`.

Not doing: a separate mobile layout, or a "download the app" interstitial.

## DONE 2026-08-22 evening — air chaos (was: NEXT SLICE, fully specced, operator-approved)
> Shipped and LIVE: c4fa9b2 (choreography, pure `src/lib/city/airchaos.ts` + 10 headless
> tests) + 20da172 (declutter/news follow-ups). Implementation matched the spec below with
> one deliberate upgrade: the two craft COUNTER-ROTATE, so the ~8s near-miss and ~15s crash
> fall out of one mechanism at constant speeds — no scripted dash.

In `src/components/city/` (pattern: BannerPlane in LaunchPad.tsx — orbit refs + useFrame):
1. **Airship recolour + texture**: envelope warm cream #f2ead8, coral nose band
   #c94f3e, gold tail-fin stripes #e8ae2a, panel-seam bands in darker cream
   (#e3d9c2). Canvas-texture the envelope (like adTexture) or striped segment
   meshes. Banner unchanged.
2. **Helicopter**: new craft — cabin box + glass nose, tail boom, spinning main
   rotor (thin crossed boxes, rotation.y += dt*18) + tail rotor. Carries a small
   ad banner (current #2 holder). Altitude ~34m.
3. **Choreography** (one shared useFrame state machine, reduced-motion = static
   opposite ends, no crashes):
   - Plane and helicopter orbit OPPOSITE ends: phase offset ~π on similar radii.
   - Near-miss: every ~8s their phases converge to within ~6m then diverge.
   - CRASH once every ~15s: both spiral down (falling, rotation tumble).
   - While falling, each pops a PARACHUTE (canopy = half-sphere or cone mesh)
     carrying a big clearly-readable FLAG of the logo/name it was flying
     (flagTexture from LaunchPad.tsx — favicon via /api/icon + monogram).
     Parachutes drift to ground over ~4s.
   - Both respawn taxiing from a RUNWAY STRIP: add a strip of tarmac boxes
     (light grey + white dashes) on the meadow near the fair (east), aircraft
     accelerate along it, lift off, resume orbits. Full cycle ≈ 15s.
4. Tour stop optional: "The Airfield". Events: none needed (decorative).

## ALSO PINNED this session (operator-requested 2026-08-22 evening) — ALL DONE + LIVE
> Everything below shipped across c4fa9b2 → 438a7b3, deployed to https://bids.town and
> pushed to the private repo the same evening. Verified live in the operator's own browser
> (crash news firing on schedule, TO LET towers, cinema set, park riders, dancers).
> Extra polish landed from live feedback: news collapsed to ONE newspaper icon lower-left
> (rings on news, opens the Bugle on demand), building card moved top-centre (was cut by
> the stats bar), jumbotrons evicted to the launch-pad approach, ring boards + vendors
> moved onto the meadow grass (west row clear of the cinema frontage), kerbside TO LETs
> deleted, billboard-mile rows alternate #1/#2 with rows dropped until the town can hold
> them, gate arch widened so its legs stand on grass, day/sound buttons un-blocked (the
> sights-panel container was an invisible hitbox eating their clicks), and the fork-leftover
> "P" favicon replaced with the bids.town voxel-cube mark.
- **cinema-set**: Drive-in marquee says "BID TOWN CINEMATIC"; director on chair calling
  a CUT (synced to the on-screen explosion) with clapperboard + tripod camera; star
  trailer caravan; juice & snack stand with a queue of villagers. Done line: all visible
  at the drive-in, animated, reduced-motion still, checks green.
- **concert-clearance**: concert stage no longer overlaps the Main St billboard mile or
  the avenue on a young board — moved back + aside; street stays open. Done line: no
  surface intersects the stage at any board size.
- **skyline-landmarks**: bring back two tall downtown towers with boards front AND back
  (ambient landmarks — honest TO LET faces, not fake ranks) so a young board still reads
  as a city. Done line: two towers with double-faced boards visible on the live-seeded board.
- **park-sign+riders**: "BID TOWN AMUSEMENT PARK" entrance board + voxel riders on the
  ferris wheel and carousel. Done line: sign readable, riders move with the rides.
- **town-news**: bottom-right news panel logging crashes + moon landings, highlight pulse
  per crash; FIRST crash opens a newspaper modal with parachute picture + the brands
  involved (once per visitor, storageKeys-gated). Done line: panel updates live from town
  events, modal shows once, reduced-motion safe.

## LIVE 2026-08-23 — walk-the-town + sea-life (operator playtested on localhost, review-hardened, deployed)
> Walk mode is BUILT and green (76 headless tests incl. economy/collision/choreography;
> tsc/eslint/build clean; dev overlay clean). Player walks, rides the ferris/carousel/gold
> taxi, boards the rocket in a passenger seat, MOONWALKS the whole sphere (flag + rover +
> landing ring; ship holds docked until re-boarded), payday $100/10s from $2,000, rides
> free in dev for testing. Sea-life also in: 10 rank-ordered racing boats with parasailing
> logos, pirates boarding last place + pennant, submarine cycle, dock, swimmers (7 tests).
> SHIPPED: operator playtested locally (docking + HUD + physics feedback folded in), then a
> 3-lens adversarial review workflow confirmed 5 production blockers — moonwalk camera.up
> pollution (upside-down aerial view), scene raycasts hijacking pointer-lock clicks,
> CameraRig fighting the first-person camera, multi-tab wallet clobber, one-frame prompt
> overwrites — all fixed pre-ship. Live on bids.town; prod economy $2,000 + $100/10s,
> free-rides correctly dev-only. Walk button desktop-only (WASD needs a keyboard).
>
> Round 2 (same evening, from live playtest): rocket docking reworked — ship HOVERS at a
> floating berth ring off the Moon's south pole (never spears the rock), craters sunk
> flush, board/disembark measured against the surface point above the berth. Sea physics
> made real: pirate raids are AMBUSHES (deterministic closest-pass timing, polar pursuit,
> wrap-free — never crosses the island, never teleports, sane speeds); races pause 12s
> between 40s legs; NEW container ship on the outer lane that the pirates board and SINK
> (lists, goes under, refloats) on alternating cycles; pirate hulls 3x. 77 tests green.
>
> NEXT SLICE (pinned, not built): ride the racing boats (pick any), fight the pirates,
> $X buys weapons (machine gun etc.) — a combat/economy layer on the walk-mode wallet.
> First-person mode: the visitor becomes a PLAYER. Walk the streets (WASD + mouse,
> building collision, island bounds), meet the Mayor up close (E replays his speech),
> wander the fair/concert/cinema, and RIDE things: the rocket to the Moon ($1,000),
> the ferris wheel ($50), the carousel ($25), a gold taxi round the ring ($10).
> Wallet: start $2,000, payday +$100 every minute, balance persists per browser.
> Done line: enter/exit walk mode cleanly, every ride boards and returns, wallet
> gates fares correctly (headless-tested), checks green — then the operator walks
> it on localhost before anything ships.

## LIVE 2026-08-23 (day) — the visibility batch
> /ooh OOH map (live-wired to the allocator, nav link, 4 tests) · DataFast bot tracking
> (Next 16 proxy, server-side) · walkable pier + Space jump · billboard z-fight fix ·
> #2 billboard presence at every board size (young-board pair splits #1/#2, tested) ·
> honest rules with the tiers.ts-generated growth ladder (fine print removed at operator
> request — note: it carried the Stripe-descriptor disclosure; name remains on /terms) ·
> Moon package (4x flag, holder livery on rocket + station) · real visitors-since-launch
> in the nav. 83 headless tests. Deployed + verified: /, /ooh, /rules, GPTBot path all 200.
> STILL PINNED: boat riding + pirate combat + weapons shop; flight sim (helipad/airstrip,
> $500 heli / $700 plane, yaw-pitch-roll, crashable into everything).

## LIVE 2026-08-23 (evening) — playtest round three, all deployed
> From live play, shipped same-day: pirate boarding 6.5m abeam (3x galleon clipped its
> marks) · container ship BREAKS IN TWO on sinking, films-style · the far-end liner +
> iceberg loop with the bow-rail couple (pure linerState, tested) · arrow-key map panning
> (window-level key events) · plush stall at the fair ($5 teddies / $15 bunny / $40 big
> bear, stick price tags) + candy $2 / popcorn $3 at the drive-in, all E-buyable on the
> walk wallet with a HUD treat pocket · billboard #2 presence at every board size · nav
> visitors counter · rules ladder honest · /ooh · bot tracking · Moon 4x flag + livery.
> 84 headless tests. Tree clean, pushed, bids.town verified 200 on a cache-busted fetch.
> Live-look mismatch reports traced to per-origin browser zoom, not the site.

## Slices

| Slice | Done line | Status |
|---|---|---|
| M1 town-reads-as-a-place | Banners + signs render on facades; ambient buildings fill unclaimed lots; rankings panel, claims feed and sound control float over the map; checks pass | DONE 2026-08-22 — 24 checks green, committed fb8e2e2, pending operator eyes |
| districts | Four themed quarters (Downtown / Retro / 90s Strip / Old Town) decide default look + roof shape; owner colours override | DONE 2026-08-22 9c91fcc |
| M2 advertising-city | Airship, arch, 3 wraps, 2 jumbotrons, 6 Main St billboards, 12 ring boards, 4 standees — holders' names, clickable, live-reallocating, unsold = YOUR AD HERE | DONE 2026-08-22 0b47c3e |
| M3 alive | Cars + villagers on fixed-30Hz sim driven by /api/pulse; day/night from local clock; glow layer; smoke; reduced-motion still | DONE 2026-08-22 123d142 |
| M4 moon | Pad + Starship rocket + Moon; launch sequence with synthesised sound; flags from /api/moon; voxel TV broadcast modal with live advertiser flag | DONE 2026-08-22 c59e2d4 |
| M5 money+owners | \$1 claims, moon checkout (\$5/h, 12h rolling cap), metadata.product guard (our half), observable emails, /manage editor with moderation | DONE 2026-08-22 a2b868f (code-side; wiring needs keys) |
| design-pass | Sidebar rail + footer claim bar, drag-to-pan, night relit x2, textured facades, 3-piece cars, banner plane + space station, Starship round-trip flight, 3D synthwave Moon broadcast | DONE 2026-08-22 |
| M6 launch-gate | llms.txt, OG cards, rules, README, security grep — code-side pass | DONE 2026-08-22 (deploy + Lighthouse on live = operator) |

## Known copy debt (fix in M5 with checkout)
- Hero widget still says "$6,001 puts you at the top" — auction-era copy. The $1-claim
  hero lands with the checkout revamp.

## Open immediately
1. **Mobile walk mode — needs a real phone.** The entry button is now the
   primary gold action on touch; the thumbstick + look-half already worked.
   Unverified because the preview pane cannot render or measure WebGL.
2. **The $1 claim has never been made.** Everything else is proven; the
   payment round-trip is the one wire that has never carried current.
3. Stripe payee still reads the legal entity for both products (account-level
   setting; separate identities would need Connect or a second account).

## Done (was listed as open — corrected 2026-08-24)
Database installed in its own `bidstown` schema, keys set, domain live,
both webhooks guarded for the shared Stripe account, productbids' board
carries a bids.town listing, DataFast + public stats wired.

## Blocking decision
Stripe is to be shared with productbids. A single Stripe account delivers **every** event to
**every** webhook endpoint on it, so productbids' webhook will receive bids.town payments,
fail to find the bid, and 500 to force a Stripe retry — repeatedly, until Stripe disables the
endpoint. Needs `metadata.product` tagging on both sides plus a 200-ack for foreign sessions,
and the productbids half is a change to a live product.

## 2026-08-23 — spending-spree bundle shipped
- New tier prices live: $1 / $5 / $7 / $10 / $25 / $100 / $600; cap thresholds EQUAL rung prices (your own purchase always unlocks your own size); height uncapped past the top rung.
- Per-tier visible perks on every building (canopy logo, standees, roof logo cube, window poster, showcase, neon strip, crown+beacon) — pure perkBoxes() in voxel.ts, 101 headless tests.
- Pooler-safe guard migration written + Docker-PG17 verified (ALL CHECKS PASSED); AWAITING operator paste into Supabase SQL editor — until then presence/walker counts return null on prod.
- Walker counts (presence.walking), moon advert board + $5/HR hull price band, error boundaries around canvas + panels, DataFast visitors route (needs DATAFAST_API_KEY env).
- Fresh-tab prod console: zero errors. Board legitimately empty (0 paid claims yet — demo town is local-only).

## 2026-08-23 (later) — live traffic, first customer, scale pass

**First real customer recovered.** A $1 claim (FirstFan.Club) paid while the pooler-guard bug
was live; the webhook correctly refused to credit it and Stripe retried into the same wall.
Recovered via the new admin reconcile sweep. Root cause fixed earlier the same day.

**Shipped to production today:** spree pricing + per-tier visible perks; pooler-safe RPC guards;
walker counts; DataFast visitors number (real, 12); error boundaries around canvas + panels;
nav rework (Leaderboard link, scroll cue, Stats/Claim/pill removed); rank-labelled ad surfaces
everywhere; the logo pipeline (DB-owned icons, self-heal, owner logo field, claim-form logo +
category dropdown); rich Stripe checkout copy; admin payments-in-limbo banner, owners ledger,
two-step removal with backup, Moon-time grants with visual cues; the sponsored tram; the
celebration loop (fireworks/parade/Bugle on claims + overtakes); the flight school (heli $500 /
plane $700, crashable, respawning); the gunboat + armoury and pirate combat; walkable dock;
Moon queue visibility + 6h cap + surge pricing; engaged-time wallet + rocket fare ladder.

**Workflow that worked:** local gates (160 headless tests, tsc, eslint, prod build) → Vercel
**preview** deploy as staging (share-token link for protected previews) → operator approval →
`vercel --prod`. Adopted after the operator asked for a staging step; previews cost nothing and
share the prod DB, so a hostname guard keeps staging traffic out of the real visitor tables.

**Awaiting operator paste:** `supabase/migrations/20260823140000_scale_tier1.sql` (presence
split, cleanup sweep, SQL unique-clicks). App ships with fallbacks, so it is safe before and
after.

**Known ceiling (measured, not guessed):** ~500-1,000 concurrent visitors today, dominated by
presence writes + uncached Moon polling. Tier 1 (this migration + 90s heartbeat + Moon memo)
targets ~2,500-3,000. Beyond that needs presence moved off Postgres to Redis — deliberately
deferred, no new services yet.
