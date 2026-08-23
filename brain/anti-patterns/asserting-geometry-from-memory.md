---
name: asserting-geometry-from-memory
description: Placing something in a world/layout by recalling "that area is empty" instead of measuring the occupied coordinates — and then fixing the distance twice without rechecking the bearing
type: anti-pattern
---

# Asserting Geometry From Memory

## The pattern

A new object needs a spot in a scene, a map, a layout, a dashboard grid. The
agent has read the codebase and *remembers* roughly where things are, so it
picks a direction from recall — "north-north-west is the only empty quadrant" —
writes a confident comment justifying the choice, and ships.

The recalled map is wrong. The object lands on top of something.

Worse is what follows: the user reports the overlap, and the agent fixes the
**distance** (push it further out) without re-deriving the **bearing** — which
moves the object further along the same collision line. Repeat twice and the
user concludes, correctly, that you cannot fix it.

## Why we don't do it

**Incident 2026-08-23 (bids.town, The Spire):** a landmark tower with its own
island, jetty and five boats was placed on a bearing of **245.2°** with the
comment *"NNW: the flight school owns NNE, the fair east, the drive-in west,
the concert and launch pad south. This quadrant is the only empty water."*

The concert stage sits at **243.8°**. Everything formed a line straight through
it. Two follow-up "fixes" pushed the island further out along the same 245°
line and were reported as resolved. Only on the third report did anyone
actually *compute* the venue bearings:

```
90° launch pad · 173° drive-in · 218° dock · 244° concert · 307° airfield · 351° fair
```

40° was the middle of the widest gap. One measurement would have prevented the
original bug and all three failed fixes.

## What to do instead

1. **Enumerate the occupied coordinates by running the code**, not by reading
   it. A ten-line probe that imports the real position functions and prints
   bearings/distances is cheaper than one wrong guess.
2. **Derive the new position from that output** — pick the largest gap
   programmatically where you can.
3. **When a placement bug is reported, re-derive from scratch.** Do not adjust
   one axis of a wrong answer. Ask "is the *direction* right?" before "is the
   *distance* right?"
4. **Lock it with a test** that asserts minimum separation from every known
   neighbour, so the next edit can't silently re-collide:
   ```ts
   for (const t of OCCUPIED_BEARINGS) expect(gapDegrees(bearing, t)).toBeGreaterThan(25);
   ```
5. **Never write a justifying comment you have not verified.** "This quadrant
   is empty" in a code comment made the wrong answer look considered, and made
   every later reader (including the agent) trust it.

## The generalisation

This is not about 3D. The same failure appears in CSS grid placement, dashboard
layout, port allocation, ID ranges, cron schedules, and pixel coordinates in
generated images: **any time an agent claims a region is free without listing
what occupies it.** If the claim can be computed, compute it.
