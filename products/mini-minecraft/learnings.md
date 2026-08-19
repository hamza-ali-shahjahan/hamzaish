# Learnings — Mini Minecraft

_Capture the transferable lesson only — never keys, credentials, or proprietary internals._

## What worked
- **Vertex-color voxels = zero-asset game.** Baked per-face colors (sun-from-above shading) with `MeshBasicMaterial` needs no textures, no lights, no asset pipeline — instant kid-bright look, and the mesher stays a pure function that unit-tests in Node (face-culling counts asserted exactly).
- **Design for testability up front paid off in one pass.** Deterministic seeds (mulberry32 + value noise), injectable `StorageLike`, dims-parameterized `World`, and pure raycast/physics modules → 27 unit tests green on the FIRST run.
- **A `__game` debug handle made real e2e possible.** Exposing world/player/step on `window` let the browser test drive REAL input paths (dispatched `KeyboardEvent`s, real canvas clicks) and assert world-state diffs — not screenshot guesswork.
- **Kid-guards are product features, not polish.** Unbreakable floor, can't-place-inside-yourself, R-rescue, swimmable water, invisible world borders. The place-inside-self guard actually fired during e2e — proof it earns its place.
- **RLE-in-JSON save is enough.** 96×48×96 = 442k voxels → 37 KB in localStorage; corrupt/truncated/absurd-dims inputs all rejected to `null` → fresh world fallback, never a crash.

## What we would do differently (pitfalls)

| Pitfall | The fix | Guardrail it became |
|---|---|---|
| Embedded browser pane throttles `requestAnimationFrame` — game loop froze at tick 8, e2e stalled | Refactored loop into `advance(dt)` + exposed `__game.step(n)` so tests drive the exact same frame code deterministically | Pattern: any rAF game gets a step hook from day one |
| Pointer lock is unavailable/refused in embedded viewers (and hard for trackpad kids) | Built drag-to-look + tap-to-break fallback alongside pointer lock from the start | Pattern: never make pointer lock the only look control |
| `three` npm package ships no TS types | `@types/three` pinned to the same minor as `three` | Add both deps together at scaffold time |
| zsh eats `echo ===` (`=` expansion) in harness one-liners | Quote separators in shell probes | Habit: quote any literal starting with `=` |

## Expansion learnings (2026-08-01, same-day v2)
- **Fix the generator, not the test.** The Nether test failed because terrain at one seed
  barely dipped below lava level. Squaring the noise (`h = 4 + n²·22`) sank most terrain
  into proper lava seas — the *game* got better and the test passed honestly.
- **Render-group buckets scale translucency cleanly.** One mesher, N materials
  (water/lava/glass/portal each with own opacity) keyed by a `renderGroup` field on the
  block def — adding a translucent block type is now a one-line registry entry.
- **"Aim-through" is a per-block property, not a hack.** `isTargetable` (skip liquids +
  portals) made portals unbreakable and water/lava un-annoying with zero special cases in
  the action code.
- **Two worlds ≠ two scenes.** One scene, one mesh set, rebuild-on-teleport (masked by a
  380ms purple fade) kept the dimension system ~40 lines instead of a parallel-scene
  architecture. Rebuild of 100 chunks fits inside the fade.
- **Deterministic seeds made animal AI testable.** Each Animal owns a mulberry32 stream —
  900-step wander test asserts bounds + ground-follow with zero flakiness.

## Quest-update learnings (2026-08-01 evening, v3)
- **The user's kid IS the PM.** The voice-transcribed wishlist ("blazerolls", "higher
  engines" = blaze rods, ender eyes) mapped 1:1 onto Minecraft's real progression loop —
  implementing the *structure* (collect → craft → find → unlock → new world) mattered more
  than any single feature. Kid-safe reinterpretation: scary mobs became silly-scary
  (hug-only zombies, dizzy blazes, a dragon that wants head pats).
- **Pure-function day/night pays for itself.** darknessAt/skyColorAt/isNightAt as pure
  functions of seconds → trivially testable, and `__game.setTime()` made night e2e
  instant instead of waiting 3 real minutes.
- **Structure metadata belongs in the save.** Villages/fortress/stronghold coordinates
  ride inside serialize() (meta field) — mob spawners and the quest need them after a
  load, when generation never ran. Scanning blocks to rediscover structures is fragile;
  recording them at gen time is free.
- **Bounds-check structure builders on ANY world size.** The stronghold placed itself
  out of bounds on small test worlds and "activation" consumed eyes while filling
  nothing — caught by a 64³ unit test. Every structure builder now scales its distances
  to world size and validates before writing meta; the activation validates before
  consuming resources. Generic lesson: builders must be total functions of world size.
- **Safety clamps need an owner.** The player's y<0 clamp (a lava-world safety net) was
  dead code in floored worlds but silently defeated the End's void-rescue. When a new
  dimension breaks an old invariant ("there is always a floor"), grep for every place
  that assumed it.
- **Interaction reach ≠ block reach.** Flying mobs (dragon at y≈25) need a longer click
  ray (12) than block-breaking (7) — separate the two constants; the friend-vs-block
  arbitration by distance keeps them from conflicting.

## Endless Worlds learnings (2026-08-01, night — S18)
- **Structures as pure write-lists make infinite worlds seam-free.** Every building emits
  `[x,y,z,id][]` from global coords; each chunk applies only the writes inside its bounds.
  Any chunk-generation ORDER yields identical blocks — unit-tested by generating a 3×3
  chunk area in two different orders and diffing samples. This one pattern removed the
  entire classic "structure crosses chunk border" bug class.
- **Save the edits, not the world.** Endless world persistence = seed + player-edit
  overlay. A whole infinite world with a tower, a bed and 13 edits = **208 bytes**.
  Eviction of far chunks becomes free (regenerate + reapply overlay), and the save format
  never grows with exploration — only with creativity.
- **Guard unload-time saves with "did this session change anything".** Rapid dev reloads
  produced a page that read default items (mid-reload storage hiccup) and CLOBBERED the
  good save on its way out via the pagehide flush. Worlds were already guarded by `dirty`;
  items were not — now they are (`itemsTouched`). Transferable rule: an unload handler
  may only persist state the session actually touched.
- **On an e2e failure, verify the DRIVER before touching game code.** Three "failures"
  were driver artifacts: (1) clicked a ghost 22 blocks away (reach is 12), (2) placed two
  feeding targets collinear with the camera so the ray fed the near one twice, (3) jumped
  time night→night so the nightfall edge never fired. Each was proven innocent by fixing
  the test setup and re-running. Only then did real bugs surface (royals-on-roof,
  view-model-under-hotbar, items-wipe) — all three fixed in source.
- **Column-scan spawning under overhangs puts creatures on roofs.** `topSolidAt` near a
  castle keep found the mushroom-cap roof, so the king & queen spawned ON it. Spawn
  points near structures need clearance from the structure's overhang footprint.
- **When a camera-attached 3D element "doesn't render", check the DOM overlay first.**
  The in-hand sword rendered perfectly — behind the 3-row hotbar. Position view-models
  against the HUD layout, not just the frustum.
- **Biome height shaping must reuse the same continuous noise fields** (e.g. cold-boost
  as a smooth function of the temperature field) so biome borders physically cannot
  cliff — enforced by a unit test asserting |Δh| ≤ 8 for every adjacent column on a
  1200-block transect.

## Find-It & See-It learnings (2026-08-02 — S19, from operator play feedback)
- **Content without wayfinding is content that doesn't exist.** The kingdom, ghosts and
  the whole S18 update were live and verified — and the family couldn't FIND them. A
  compass (bearing + distance to named places) turned "we never saw any ghosts" into a
  navigable game. Rule: every "go discover X" feature ships WITH its discovery affordance.
- **Design input for the actual input device.** A 3-row wrap of 32 hotbar tiles was fine
  for a mouse wheel, hostile to a MacBook trackpad. The fix wasn't smaller tiles — it was
  the real-Minecraft pattern: 9 quick slots + a click-to-pick panel. Test UI against the
  device the user actually holds.
- **When e2e says a feature failed, read the game's own feedback channel first.** The
  bed "didn't place" — but the success toast WAS showing, and the anti-frustration guard
  ("you're standing there") was correctly refusing one attempt. The game's toasts are a
  first-class debugging signal; assert on them.
- **DOM overlays are part of the render frustum.** Second time a correct 3D element was
  "invisible" because chrome covered it (sword under hotbar; hint bar over hotbar). A
  layout pass with getBoundingClientRect overlap checks belongs in e2e for HUD changes.
- **Voice-transcribed kid/parent feedback needs interpretation, then confirmation by
  demo:** "blogs"=blocks, "alchemist"=cursor, "voo/blue"=Boo-style ghosts. Restate the
  interpretation in the reply and prove it with the shipped behavior.

## Open questions
- Touch controls (iPad) — worth a slice if she wants to play on the tablet; needs on-screen joystick + tap-to-place mode toggle.
- Auto-jump (mobile-Minecraft style) — would remove the last small-hands frustration (getting stopped by 1-block steps); trade-off: less "real Minecraft" feel on desktop.
