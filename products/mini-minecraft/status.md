# Mini Minecraft — Live Status

**Stage**: live (local-play-only by design; code backed up to a PRIVATE GitHub repo)

## S26 pinned slice (2026-08-05, operator: "new worlds can be CREATIVE — fly as much as you want") — ✅ SHIPPED (def9af2, pushed, released v2.7)
> **Evidence:** tests 144/144 + typecheck; live e2e with the REAL save snapshotted →
> creative world created through the picker via real clicks → real F/Space/Shift flight
> (rose +18.2 on held Space, hover drift 0.81, sank 5.9 on Shift) → flight state survived
> a real reload (still creative, still aloft) → snapshot RESTORED and verified intact
> (adventure mode, spawn bookmark, 💎1 🍎1, rainbow tower standing) — the S19
> touched-guards prevented the test page's unload from clobbering the restored save,
> exactly as designed. Conflict resolved: F was an undocumented place-alternate → F now
> flies, X remains place. Zero console errors. Released v2.7.
> **Done when:** the New-world button opens a kid-friendly picker (🥾 Explorer World ·
> 🕊️ Creative World · Keep my world!) instead of a browser confirm; worlds carry a MODE
> in items v4 ('adventure' default, existing saves untouched); in Creative worlds F (or
> double-tap Space) toggles FLYING — no gravity, Space rises, Shift sinks, double walk
> speed, walls still solid, water irrelevant — and flying state survives reloads via the
> pos bookmark; in Explorer worlds F just explains kindly. Proven by unit tests (mode +
> fly persistence & garbage rejection; flight physics: hover/rise/sink/gravity-return/
> wall-collision/speed) + live e2e (real F/Space/Shift keys in a REAL creative world
> created through the picker — with the current save snapshotted and RESTORED after),
> zero console errors — committed, PUSHED, released v2.7.

## S25 pinned slice (2026-08-05, operator-approved "Full resume": rejoin where you left off) — ✅ SHIPPED (74da8b8, pushed, released v2.6)
> **Evidence:** tests 138/138 + typecheck; e2e proved the REAL path — no manual save:
> walked to (866,−462.8) facing 2.345, real reload → resumed at the exact spot+gaze via
> the pagehide flush alone; Nether variant resumed IN the Nether at the exact spot with
> compass hidden (bounded-boot path exercised); bookmark correctly absent from storage
> before the flush (posTouched guard working); courtesy final bookmark left at spawn-side
> (8,6) overworld. One test-expectation fix (airborne-over-void is KEPT by design —
> rescue systems own falls; hopeless = solid-to-sky). Released v2.6.
> **Done when:** leaving the game bookmarks your exact position, facing AND dimension
> (items v4 gains `pos`; written on unload + every ~10s once you've actually moved, so
> the boot-clobber guard still holds); rejoining restores it — with a safe-landing check
> (buried → lifted to surface; unusable column → spawn fallback), R still rescues to
> spawn, "New world" clears the bookmark. Proven by unit tests (pos save round-trip +
> garbage rejection; findSafeLanding clear/buried/void cases) + live e2e (walk far →
> real reload → same spot & facing; Nether variant resumes in the Nether), zero console
> errors — committed, PUSHED, released v2.6 with changelog.

## S24 pinned slice (2026-08-04, operator: map not movable, kingdom not visible, want click-to-route with opt-out) — ✅ SHIPPED (08089bc, pushed, released v2.5)
> **Done when:** the World Map PANS by dragging, ZOOMS through 3 spans (480/960/1920 via
> wheel and ➕/➖ buttons; kingdom visible from spawn after one zoom-out), and a 🎯 Me
> button recenters; CLICKING a marker (👑🏙️🌀🏘️⚓ — or empty ground for a 🚩 flag) sets a
> ROUTE: dotted gold path on the map, live distance chip in the HUD with ✖ to stop, and
> a ⭐ compass marker; clicking the same target again also clears it; arriving within 12
> blocks celebrates and auto-clears; the route persists across reloads (items v4 gains
> `route`). Proven by unit tests (projection with span, marker picking, route save
> round-trip) + live e2e (real drag/click/zoom events, route chip + compass star, arrival
> celebration, reload persistence), zero console errors — committed, PUSHED, released
> v2.5 with changelog entry.
>
> **Evidence (2026-08-04):** tests 132/132 + typecheck; e2e on REAL dispatched events:
> zoom-out button → 👑 visible & clicked → route set ("👑 311 blocks that way"), compass
> ⭐ live, second click cleared, 80px drag panned center >30 blocks, empty-ground click
> planted 🚩, ✖ cleared, g.save() + real reload restored the 👑 route, setPos arrival
> fired "You made it to 👑! 🎉" and self-cleared; screenshot shows the golden dotted
> path + ringed flag. Zero console errors. One test fix was the TEST's geometry
> (markers 10px apart at zoom — nearest-marker pick was correct). Released v2.5.

## S23 pinned slice (2026-08-04, operator: "push release notes as well") — ✅ SHIPPED
> **Done when:** the repo carries a CHANGELOG.md covering every shipped update (v1.0 →
> v2.4, no personal references), package.json version matches, and the GitHub Releases
> tab shows one release per version with notes — committed and pushed.
>
> **Evidence:** CHANGELOG.md (8 versions, kid-friendly, zero personal references) +
> package.json → 2.4.0 committed as 9ae5bfc and pushed; annotated tags v1.0–v2.4 laid
> on the exact historical commits and pushed; `gh release list` shows all 8 releases
> with v2.4 marked Latest. Tests still 129/129 before the push.

## S22 pinned slice (2026-08-03, operator: "compass full screen — see the map of the world; build & push") — ✅ SHIPPED (e0f5e21, pushed to private origin)
> **Done when:** pressing M (or clicking the compass dial) opens a FULL-SCREEN world map:
> top-down terrain painted from the pure biome/height functions (oceans by depth, beaches,
> all six biome colours, relief shading — no chunk generation needed), centered on the
> player with a facing arrow, plus markers for 👑 kingdom, 🏙️ city, 🌀 portal, 🏘️ villages
> and ⚓ shipwrecks in range, a legend, and Done/M/Esc to close (pointer lock handled).
> Proven by unit tests on the pure colour/projection/marker helpers + live e2e (real M
> keypress, map canvas painted with real variety, markers present, screenshot), zero
> console errors — then committed AND pushed to the private repo.

### S22 verification evidence (2026-08-03)
- Tests **129/129** + typecheck clean (water/beach/isle colour classes; projection
  centre/scale/off-edge; marker assembly incl. a wreck ⚓ found and marked).
- Live e2e (:5173, zero console errors): real **M** keypress opened the map; canvas
  readback showed **118 distinct sampled colours** (real terrain, not a fill); actions
  blocked while open; Done button closed it; **compass-dial click** opened it again;
  screenshot shows the isle+kingdom, player arrow, villages, biome patches, lakes.
- Committed e0f5e21 and pushed to the private repo same turn (new standing step).
**Status**: shipped 2026-08-02 — S21 "Oceans & Treasure" SHIPPED; S18–S20 shipped; repo
pushed to PRIVATE github.com/hamza-ali-shahjahan/mini-minecraft (operator-approved
2026-08-02, born private — public would require the full /publish-repo flow; tendril
rule updated in commit 146190a). Pre-push hygiene: full-history secrets scan clean,
zero family references or emails in tree, history, or commit messages.

## S21 pinned slice (2026-08-02, daughter's wishlist #3) — ✅ SHIPPED (945b48e)
> **Done when:** (1) real OCEANS exist (continent-scale water with islands beyond; spawn,
> kingdom-isle, stronghold ring and city are guaranteed land) and you can swim OUT of
> water onto a 1-high shore automatically — no block placing/breaking needed; (2) broken
> SHIPWRECKS rest in oceans and golden-lantern-marked treasure lies buried on beaches —
> clicking a treasure chest collects 💎 (counted, persisted, sparkly); (3) a CITY stands
> very far away (towers, glass, streets, plaza fountain, citizens) with a 🏙️ compass
> marker; (4) the castle gets a mushroom-cottage hamlet around it so the kingdom looks
> like a proper kingdom; (5) new furniture: COUCH + TV (hand-click interacts, tools
> move them); (6) some villages get a two-story fancy house and a lookout tower;
> (7) natural blocks get a soft per-corner texture detail pass. All proven by green
> tests+typecheck, live e2e on :5173 (swim-out climb, treasure collect, wreck found,
> city reached via setPos, hamlet visible), zero console errors, kid-rules intact.

### S21 verification evidence (2026-08-02)
- Tests **126/126** + typecheck clean (new: ocean/land/far-island census; anchor-zone
  dry-land guarantee at 3 seeds; coast-gentleness transect; swim-out climbs the shore
  AND no-input floats stay put; wreck has exactly 2 chests + sunken WATER above; buried
  chest = lantern glow at surface + TREASURE two below; city census incl. 6+ lobby
  couches/TVs; hamlet SHROOMSTEM census; couch/tv/treasure mesh face counts; per-corner
  mottle produces >10 distinct colours on one stone cube).
- Live e2e (:5173, zero console errors): Block Box now 35 tiles; found a real wreck via
  region query, swam to it, clicked the chest → "TREASURE! 💎 ×1" + chip shows 💎 and
  chest poofed; **real held-W swim-out** at a real ocean shore: started swimming y=11.3,
  climbed out standing y=13, no blocks touched; city visited: 814 glass, 8 couches,
  8 TVs, 8 citizens + golem, compass 🏙️ live (fun seed quirk: the city grew inside a
  mushroom-mask patch → ghost nights in the city); couch flop + TV cartoon toasts fired
  and both survived hand-clicks; kingdom hamlet: 247 shroom-stem cottage blocks,
  screenshotted castle + cottage ring.
- Driver lessons repeated (game innocent both times): topSolidAt placed the test player
  on a building ROOF (indoor targets need explicit floor placement), and one silent
  "failure" was the ray breaking a wall block 12 up.
- Honest note logged: ocean-era terrain regen changes ground under pre-S21 outposts far
  from anchors (edits persist at their coordinates; the land around them may differ).
  Kid-impact minimal; anchors protect everything near spawn/isle/city.

## S20 pinned slice (2026-08-02, operator: "dragon more realistic, smaller/more blocks, smoother movement") — ✅ SHIPPED (c7d1c80)
> **Done when:** the dragon (End + sky) is box-built from 30+ SMALLER parts (segmented
> torso, 2-segment neck, detailed head with horns/snout/jaw, two-stage wings with
> membrane + fingers, 4-segment whip tail with spikes, tucked legs) and flies ALIVE:
> banks into its turns, pitches with climbs/dives, wings beat in two phases, the tail
> ripples in a traveling wave, the head sways. Proven by: part-count + living-animation
> unit tests green with all existing tests, live e2e screenshot of the new dragon in
> flight on :5173, zero console errors.

### S20 verification evidence (2026-08-02)
- **52 mesh parts** live-counted on the sky dragon (was 8). Tests 115/115 + typecheck
  clean: ≥35-part anatomy check; 10/10 sampled flight poses unique (never freezes);
  bank angle present and breathing.
- Live e2e on :5173: flew the camera to 9.9 blocks from the sky dragon — screenshot
  shows it banked 0.24 rad into its turn, two-stage lavender membrane wings mid-beat,
  segmented spiked body, whip tail, horns. Zero console errors. Both dragons (End +
  sky) share the upgrade.

## S19 pinned slice (2026-08-02, operator feedback after play session) — ✅ SHIPPED (99a946b)
> **Done when:** (1) the hotbar is ONE row of 9 slots and a Block Box panel (B key or 📦
> button) shows ALL blocks in a big clickable grid — click a tile → it fills the selected
> slot (trackpad-friendly, like real Minecraft's inventory; picks persist in the save);
> (2) a compass sits bottom-right showing live direction+distance to the 👑 kingdom, the
> nearest 🏘️ village, the 🌀 portal and N — rotates with the player, overworld only;
> (3) a friendly dragon soars high over the overworld near the player (always visible
> sky-life); (4) animals get a detail pass (sheep wool/ears, pig snout/ears, chick
> beak/wings, cat stripes, pup embers + per-animal deterministic shade variation);
> (5) ghosts are findable: every nightfall one wandering ghostie visits the player in ANY
> biome (mushroom land stays their true home). Proven by green tests+typecheck, live e2e
> on the real :5173 server (open box → click block → place it; compass bearing matches
> math; sky dragon present; ghost near player at night in a non-mushroom biome), zero
> console errors, peaceful-mode intact.

### S19 verification evidence (2026-08-02)
- Tests **113/113** + typecheck clean (new: inventory model incl. garbage-hotbar
  rejection; compass bearing identities at 4 yaws + spin direction; wandering ghost incl.
  no-double-up in mushroom; sky-dragon altitude+follow; per-individual tint deterministic;
  detail-part counts for sheep/pig/chick/cat/pup).
- Live e2e (real :5173, HTTP 200, zero console errors): real **B** keypress opened the
  Block Box (32 tiles), real click on the Bed tile closed it + put Bed in slot 1 +
  persisted `hotbar:[34,…]` to items-v4; facing the kingdom put 👑 at exactly dial-top
  (56px,12px); actions correctly blocked while the box is open; bed placed from the new
  hotbar (verified in-world at (4,14,-10)); night in a CHERRY biome spawned slimes + one
  wandering ghost; sky dragon circling at y≈46, 16 blocks from the posed camera,
  photographed; hint bar relocated top-left after a screenshot showed it covering the
  hotbar's right end.
- Driver-vs-game discipline held: two "failures" were the driver again (side-face aim;
  standing inside the target cell → the anti-frustration guard fired, which is the game
  being RIGHT), proven by the success toast + re-test.

## S18 pinned slice (2026-08-01, from the daughter's wishlist #2) — ✅ SHIPPED (commit f6ab00d)
> **Done when:** the overworld is ENDLESS (chunk-streamed, walk forever, new land keeps
> generating, edits persist under NEW v4 keys with v1–v3 keys untouched) with ≥6 biomes
> (meadow/forest/snowy/desert/cherry/mushroom) each with its own village style and its own
> silly night visitor; a mushroom land reachable from spawn holds a KINGDOM castle with
> king & queen and cute night ghosts; furniture blocks exist (table, chair, BED — clicking
> a bed at night skips to morning); tools (sword/pickaxe/axe/shovel, T to switch) render
> in-hand with a swing, sword POOFs night mobs with stars; food exists (apples from
> leaves, berries from bushes) — E eats it, or FEEDS an aimed animal; feeding two nearby
> same-kind animals spawns a BABY; bees buzz in flowery biomes; baby animals exist.
> All proven by: green `npm test` + `npm run typecheck` (existing 64 stay green, new
> systems get new tests), live e2e against real `npm run dev` on :5173 via `__game.step`
> (walk into 3+ biomes, night mob per biome, bed skip, feed→baby, sword poof, eat,
> reload→edits persist far from spawn), zero console errors. Peaceful-mode rules intact.

### S18 verification evidence (2026-08-01 night)
- Tests **102/102** green (was 64; +5 new files: biome, endless, structures, newmobs,
  gameplay) + `npm run typecheck` clean. Includes: chunk-order-independence (seamless
  borders), edits survive eviction AND save/load, mushroom isle pinned for any seed,
  no-cliff height continuity, breeding window/distance rules, furniture mesh shapes,
  hand-can't-break-furniture, nextMorning lands at darkness 0.
- Live e2e on real `npm run dev` (HTTP 200): real Play click + real W keydown moved
  player; teleport probes at (400,0)/(-800,600)/(2000,-1500)/**(5000,40)** all landed on
  solid streamed ground; all 6 biomes found in ±1500; kingdom at (312,48) with 2 royal
  beds/726 stonebrick/king/queen/golem/13 mooshrooms; mooshroom soup +1; berry bush picked
  AND survived; apple from 3rd leaf break; fed 2 sheep → "A baby sheep appeared!! 🎉👶";
  night-per-biome live-verified: ghost(mushroom) yeti(snowy) mummy(desert) skelly(forest)
  slime(cherry); hand-click ghost giggles, **sword POW-poofs** it; bed placed → clicked at
  night → woke at cycle-start 240.1 with visitors melting; portal round trip over↔nether;
  reload restored tower/bed/baby/food/sword from a **208-byte** endless save; v3 keys
  untouched (verified present); **zero console errors** across the whole session.
- Bugs found & fixed during e2e: (1) royals spawned on the keep roof (topSolidAt under
  the mushroom-cap overhang) → court repositioned; (2) in-hand tool hidden behind the
  3-row hotbar DOM → view-model repositioned+rescaled; (3) REAL save-wipe class found:
  a page booting during rapid reloads read default items and clobbered the good save on
  unload → items now write only after the session actually changed something.
- Three e2e "failures" were test-driver artifacts, not bugs (ghost out of 12-block reach;
  collinear sheep so one got fed twice; night-to-night time jump never firing nightfall) —
  each proven by re-test after correcting the driver.

## Resume here (context for a new session — updated 2026-08-01 evening)
- **Game**: 3 builds shipped same-day (v1 → Nether/villages/animals → quest update with
  day/night, zombies, iron golem, fortress/blazes, stronghold, The End). 64/64 tests green.
  Run `npm run dev` in the code repo → http://localhost:5173. The repo's `CLAUDE.md` tendril
  carries the workflow; `window.__game` + `__game.step(n)` is the e2e harness.
- **Enablement layers (from this product's decisions 0001/0002): ALL THREE LIVE.**
  L1 visible (Flight Plan/Receipt in hamzaish.md §5 + tendril templates) and L2 sticky
  (§4 continuation + tendril scaffold step + starter CLAUDE.md) are **committed** in the
  factory; L3 enforced: `factory/hooks/factory-session-context.sh` is **registered** in
  `~/.claude/settings.json` hooks.SessionStart (validated 2026-08-01) — every new session
  in a tendriled repo gets the protocol injected.
- **Both follow-ups CLOSED 2026-08-01 (operator-approved):** (1) all 5 legacy repos now
  carry tendrils — fresh CLAUDE.md for Repolish/ShipGuard, factory block prepended for
  DNSChecker/Scope Intelligence/synthux (existing content preserved; synthux got a
  stricter-rule-wins clause and its tendril is deliberately UNcommitted per its own
  branch-only standing rule — commit it via that repo's branch flow). `check-product-layout`
  now reports zero tendril warnings. (2) `bun run setup` step 9 registers the enablement
  hook for new users (consent prompt; `HAMZAISH_REGISTER_HOOK=yes|no` for automation;
  idempotent; fake-HOME tested). One residual oddity: `synthux` is in
  `code-paths.local.json` but has no `products/synthux/` metadata folder — register it
  properly whenever that product wakes up.
- **SETTLED (operator decision 2026-08-01): this `products/mini-minecraft/` folder is
  NEVER committed to the (always-public) factory repo.** It contains personal/family
  references and the product's own hard rule is kid privacy by design. It stays
  registered and fully functional as local-only metadata. Do not revisit, do not
  sanitize-and-commit — the decision is made.

## Goal (pinned 2026-08-01 via /hamzaish)
> **Daughter-playable today, on Papa's Mac, zero friction:** at `http://localhost:5173` — no login, no internet account, nothing to install for her — a child can look around, walk, jump and swim in a colorful voxel world, and **place and break 9 block types** from a hotbar, with her builds **still there after closing/reloading the page**. Proven done by (a) green unit tests on world/save/raycast/mesh/physics logic, (b) a real end-to-end browser run (move → break → place → reload → build persists) against a real dev server on this Mac, with **zero console errors**, and (c) HTTP 200 from `http://localhost:5173` at handover.

### Acceptance criteria
1. Real `npm run dev` server on this Mac answers 200 on `/` (harness sandbox does not count).
2. Unit tests green: deterministic terrain gen, block get/set bounds, save/load round-trip, voxel raycast, chunk-mesh face culling, player physics (rests on floor, blocked by walls).
3. End-to-end in a real browser: W moves the player; click breaks the aimed block; X/right-click places the selected block; reload restores the edited world from localStorage; zero console errors.
4. Kid-safe by design: no login, no third-party network calls, no analytics (explicit N/A — private toy for one child), no enemies/death/fall damage, friendly copy.
5. Anti-frustration: can't break the floor layer, can't place a block inside yourself, R rescues you back to spawn, water is swimmable not a trap.

### Trackability
**Not worth tracking — why:** single known user (operator's daughter), local-only, privacy-by-design for a child. There is no funnel to measure and deliberately no analytics wired. The "metric" is a play session together.

## North star this sprint
> Ship the playable world locally, tested end to end, and hand over the localhost link.

## Active sessions (lock — update when you start/stop work)
_Avoid two sessions on the same files. See [`meta/parallel-sessions-protocol.md`](../../meta/parallel-sessions-protocol.md)._

| Session / branch | Scope (files/area owned) | Status | As of |
|---|---|---|---|
| main (S18 endless worlds) | whole code repo | ✅ shipped f6ab00d, lock released | 2026-08-01 night |
| main (S19 find-it & see-it) | hud/index/main/animals/save + new compass/inventory | ✅ shipped 99a946b, lock released | 2026-08-02 |

## Open immediately
- Nothing. Play it together. 🎮 (Optional future polish: touch controls for iPad, auto-jump for small hands.)

## Quest update shipped 2026-08-01 (evening, from the daughter's own wishlist)
- ✅ S11 Bigger again: overworld 224×48×224; "texture" via per-cell shade jitter + grass
  side-fringe gradients (zero image assets, mesher-level, unit-tested).
- ✅ S12 Day/night: pure-function cycle (3 min day / 1 min night) — sky lerps through dusk,
  night tint overlay, deterministic and tested.
- ✅ S13 Night zombies + IRON GOLEM: zombies spawn at dusk near villages/player, shamble,
  hug harmlessly, melt at dawn; each village's golem chases and BONKS them (verified in
  unit test AND live e2e); clicking a zombie bonks it too. Zero danger to the player.
- ✅ S14 Villagers + cats staff every village; piglins (gold headbands), zombie-piglins and
  ember pups roam the Nether.
- ✅ S15 Nether fortress: netherbrick platform + hollow crenellated tower; 3 hovering
  blazes; clicking a blaze grants a blaze rod (1.2s cooldown).
- ✅ S16 The full progression: C crafts rods → Eyes of Ender; G launches a sparkle that
  flies toward the hidden stronghold (stone-brick room, glowstone corners, surface gazebo,
  staircase); clicking the End frame with 3 eyes opens the portal (consumes eyes, persists
  in the world save).
- ✅ S17 The End: floating endstone island, void sky, obsidian pillars with glowstone caps,
  friendly dragon circling (click → "RAWR! …head pats"), void fall = tickle-rescue,
  pre-opened return fountain → arrives back at the stronghold gazebo.
- New blocks (5): netherbrick, stonebrick, endstone, end-frame, end-portal → 22 placeable.
- Saves: v3 keys (3 worlds + items {rods, eyes, time}); v1/v2 saves left untouched.
- Tests: 64/64 green + typecheck. Live e2e of the ENTIRE quest loop via real input paths,
  zero console errors. Three bugs found by tests/e2e and fixed in the source (stronghold
  out-of-bounds on small worlds; eye-consumption without fill; player y-clamp swallowing
  the End void rescue).

## Expansion shipped 2026-08-01 (operator-requested, same day)
- ✅ S6 Bigger overworld: 160×48×160 (2.8× area), snowy peaks (snow line y24), wildflowers.
- ✅ S7 Villages: 2–3 per world on flat dry land — plank cabins with log corners, glass
  windows, brick pyramid roofs, porch + interior lanterns, flower rings; terrain flattened
  under each house. Verified by unit tests (planks/lantern/glass counts) + screenshot.
- ✅ S8 Animals: sheep/pigs/chicks (overworld) + ember pups (Nether), box-built, wander with
  ground-follow + liquid/cliff avoidance, hop + species cry when clicked (click priority
  over block-breaking verified e2e).
- ✅ S9 The Nether: second World instance (96×40×96), squared-noise lava seas (4,859 lava
  cells at default seed), glowstone pillars, mushrooms, obsidian patches, dark-red sky/fog,
  no clouds; lava is swimmable + orange tint (kid-safe, no damage).
- ✅ S10 Portals: obsidian frame + 2×3 portal cells in each dimension; walking in triggers
  purple-fade + whoosh teleport to the other side's portal exit; round trip verified e2e;
  portal cells are unbreakable/untargetable; per-dimension saves under v2 keys (old v1
  save intentionally preserved untouched).
- New blocks (11): planks, glass, snow, flower (crossed quads), lantern, netherrock, lava,
  glowstone, obsidian, portal, mushroom → 19 placeable in a two-row hotbar.
- Tests: 44/44 green + typecheck; browser e2e: dims/villages/animals verified, portal round
  trip, animal-click priority, both-dimension reload persistence (127 KB + 26 KB saves),
  village + Nether screenshots, zero console errors.

## Slices — ALL SHIPPED 2026-08-01, each verified end-to-end
- ✅ S1 World renders: deterministic terrain + trees + water, chunked meshes, zero console errors.
- ✅ S2 Movement: WASD/arrows + mouse look (pointer lock with drag fallback), jump, swim, borders.
- ✅ S3 Build/break: voxel raycast + highlight, click/Z break, right-click/X place, 9-block hotbar (keys 1–9, click, wheel).
- ✅ S4 Persistence: localStorage autosave (debounced + on-leave flush) + load on boot + reset button; survived a real page reload in e2e.
- ✅ S5 Kid polish: start/help overlay, synth sounds (place/break/jump), drifting clouds, block counter, R rescue, underwater tint.

## Verification evidence (2026-08-01)
- `npm test`: 27/27 unit tests green (world determinism, RLE save round-trips incl. run-cap and corrupt-input rejection, voxel raycast, mesher face-culling, player physics settle/wall/jump/borders). `npm run typecheck` clean.
- Real `npm run dev` on the operator's Mac, HTTP 200 on `http://localhost:5173`.
- Browser e2e via real input paths (dispatched key events + real canvas clicks): Play click starts game · W moved player 1.2 blocks (collision stopped at obstacle, correct) · click broke aimed grass block · Digit9 selected Rainbow · X placed it (counter updated) · stacked a 2-block rainbow tower · place-inside-player correctly rejected by guard · full page reload → tower persisted from a 37 KB RLE save · Space jump up >1 block and exact landing · R rescue back to spawn · H help toggles · swim: sank gently in pond, held Space, rose a full block · console: zero errors.
- Kid-privacy check: no login, no analytics, no third-party network calls (only localhost Vite).
