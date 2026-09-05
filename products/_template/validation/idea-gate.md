# Ideation Gate — TODO Name

The gate an idea passes before it earns a validation attempt. Six items, all required.
Checked by `bun run check-idea-gate <slug>`. Full guidance: `/idea-gate`.

**What this decides: is the idea TESTABLE** — will a null result mean anything? Not whether
it's good. That's what the validation attempt is for.

## Status
- **Status**: `draft`  <!-- draft | locked -->
- **Locked**: TODO

---

## 1. ICP + watering hole

<!-- A segment you can NAME, plus where 100 of them congregate. If you can't name the
     place, you can't run an attempt, so the idea isn't testable yet — regardless of
     how good it is. "Small businesses" and "founders" are not ICPs. -->

**Who**: TODO

**Where** (name at least one place you can reach ~100 of them):
- TODO

## 2. The pain, in their words

<!-- THREE verbatim quotes from real humans or real public artifacts — support threads,
     reviews, forum posts, call notes. Verbatim with a source. Paraphrase is banned:
     it's where your own hypothesis substitutes itself for the evidence and makes the
     whole gate circular. Can't find three? That's the finding. -->

### TODO — source
> TODO

### TODO — source
> TODO

### TODO — source
> TODO

## 3. Current workaround + its cost

<!-- Every real problem is already being solved, badly. No workaround usually means a
     feature idea, not a problem. The cost is also your pricing anchor. -->

**What they do today**: TODO

**What it costs them**: TODO

## 4. Demand hypothesis

<!-- Locked BEFORE any data exists. A threshold picked after seeing the data isn't a
     threshold. The action must cost the stranger something — an email, a booked call,
     a reply, a completed onboarding step. "Visits the page" is not an action. -->

> At least TODO% of TODO reached via TODO will TODO when told TODO.

## 5. Kill condition

<!-- What result makes you stop, written before you look at anything. Must be
     falsifiable — a number or a comparison, never a mood. Always a RATE at a minimum
     denominator, never an absolute count. -->

TODO

## 6. Cheapest test

<!-- The smallest artifact that could produce the item-4 signal. If the honest answer is
     "a working product", you haven't found the test yet — go back.
     Reach is the DENOMINATOR: 12 signups from 60 is a great product with a traffic
     problem; 12 from 6,000 is a wrong message or wrong ICP. Same numerator, opposite
     actions. -->

**The artifact**: TODO

**Qualified reach needed**: TODO

**Window**: TODO

---

## Preconditions before shot one

<!-- A paused free tier doesn't just break the product — it corrupts the denominator.
     You'll count reach that hit a broken form, and every verdict from it is fiction. -->

- [ ] Keepalive on every auto-pausing free-tier service
- [ ] Liveness probe on the signup path specifically
- [ ] Signups recorded with their source channel (so the rate is per-shot, not just total)
