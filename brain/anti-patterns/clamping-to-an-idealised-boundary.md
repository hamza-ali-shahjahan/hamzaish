---
name: clamping-to-an-idealised-boundary
description: Enforcing a limit against a simplified stand-in (a circle, a fixed width, a round number) when the real boundary is irregular — so the guard passes while objects sit outside it
type: anti-pattern
---

# Clamping To An Idealised Boundary

## The pattern

Something must stay inside (or outside) a boundary: a coastline, a viewport, a
rate limit, a content box. The real boundary is irregular — a wavy shoreline, a
variable-width string, a per-plan quota — but the guard is written against a
convenient idealisation: a circle, a fixed pixel width, a single constant.

The clamp then reports success while the thing it guards is visibly wrong.

## Why we don't do it

**Incident 2026-08-23 (bids.town):** boat moorings were clamped to
`shoreRadius + margin` — a circle. The island's actual coastline is generated
by `shoreAt(angle, base)`, which bulges up to **19% past** that radius at some
bearings and recedes below it at others. Boats therefore sat on sand wherever
the coast bulged, and the player's own hull could sail onto the beach. The
clamp was "working" the whole time.

**Same day, same shape of bug:** a URL input was halved in width on request
without checking that its own placeholder still fit — the content was truncated
to `yourproduct.com or @ha`. The box was sized against a round number instead of
against what it had to hold.

## What to do instead

1. **Export the real boundary function and clamp against it.** If a module
   already computes the true shape, that function is the yardstick:
   ```ts
   const min = shoreAt(Math.atan2(z, x), shoreRadius) + margin; // not shoreRadius + margin
   ```
2. **Measure the content before sizing the container** — the longest label, the
   widest number, the placeholder itself.
3. **Test at multiple points around the boundary**, not one. The bug hides at
   the bulges: sweep bearings/sizes and assert at every one.
4. **When a test asserts the idealisation, fix the test too.** A test that says
   "never inside `SHORE + margin`" is asserting the same wrong model and will
   fail correct code once the guard is fixed.
