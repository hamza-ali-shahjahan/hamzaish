# Ideation Gate — Muakkil (موكّل)

The gate an idea passes before it earns a validation attempt. Six items, all required.
Checked by `bun run check-idea-gate muakkil`. Full guidance: `/idea-gate`.

**Applied retroactively, 2026-09-06.** Muakkil was built through slice 6 before this gate
existed. Every answer below is transcribed from what is already on disk — the validation
ledger (`validation/README.md`), the pivot decision (`decisions/2026-07-02-venture-agent-pivot.md`),
and `status.md`. **Nothing here is inferred to make an item pass.** Where the disk is
silent, the item is left open, because an invented watering hole or a guessed conversion
rate would pass the check and then waste the attempt it authorized.

## Status
- **Status**: `draft`  <!-- draft | locked -->
- **Locked**: TODO — cannot lock while items 1, 2, 3, 4 and 6 are open

---

## 1. ICP + watering hole

**Who**: Non-technical or lightly-technical founders who shipped (or nearly shipped) something on an AI builder — Lovable, Bolt, v0, Base44 — in the last ~12 months, and it did not reach meaningful users. Explicitly NOT target profile: engineers who could run the distribution themselves and chose not to.

**Where** (name at least one place you can reach ~100 of them):
- TODO — **the open blocker.** The ledger records a recruiting *hook* ("you built something on Lovable, what happened after?", opened with Lovable's $400M raise) but names no *place*. A hook is a message; this item needs a venue. Candidate venues differ enormously in reach and conversion, so they are the operator's call, not a guess: the builders' own communities (Lovable/Bolt Discords, r/lovable), the operator's LinkedIn audience (where the original signal came from), showcase/launch directories where these projects are already listed publicly, or warm network. Naming which one is prerequisite to every number below.

## 2. The pain, in their words

**0 of 3 quotes on disk.** The evidence section of `validation/README.md` is empty (`Evidence count: 0 / 5`) and no verbatim quote exists in any Muakkil document. The LinkedIn reaction that prompted the pivot was never captured as quoted words with a source, so it cannot be transcribed here without inventing it.

Note that public artifacts would satisfy this item without scheduling anyone — a "built it, nobody came" thread in a builder community, quoted with its URL, counts.

### TODO — source
> TODO

### TODO — source
> TODO

### TODO — source
> TODO

## 3. Current workaround + its cost

**What they do today**: TODO — not recorded anywhere on disk. The pivot decision documents a *market* gap ("AI builders stop at deploy; marketing tools start after brand exists; no product runs the launch half end-to-end"), which is a statement about the supply side. It does not say what a stalled founder actually does instead — abandon it, hire a freelancer, post once and stop, or keep rebuilding the product. Those imply different products and different prices.

**What it costs them**: TODO — not recorded. Needed as the pricing anchor for the concierge offer the traction gate already assumes.

## 4. Demand hypothesis

<!-- Numbers below are the ones already committed on disk (ledger "Gate — due 2026-08-16",
     clauses 1 and 2). The channel is the blank, and it is the same blank as item 1. -->

> At least 60% (≥3 of 5) of target-profile founders reached via TODO will raise the post-build stall unprompted before Muakkil is described to them, and ≥1 will name a figure they would pay to have the launch half handled.

**Honesty control (already on disk, keep it):** "unprompted" is only claimable if the question asked immediately before the mention is logged. If Muakkil was described first, the mention does not count.

**Why this still fails the gate:** the rate and the action are real and pre-committed, but a hypothesis with no channel cannot be run, and 5 conversations is a conversation gate rather than a reach-based demand test. Both halves are needed — the interviews test whether the pain is real, the reach test whether strangers act on the promise.

## 5. Kill condition

Stop, and do not build import-and-launch (slice 7), if the interview gate fails — fewer than 3 of 5 target-profile founders raise the post-build stall unprompted, or none names a figure they would pay. Also stop if 10 beta ventures go through the loop and fewer than 5 reach ≥10 non-founder users within 30 days, or if the ICP refuses agent-executed outward actions even behind approval gates.

**On fail the wedge is wrong** — re-open `decisions/2026-07-02-venture-agent-pivot.md` rather than iterating the build.

<!-- Transcribed from validation/README.md "On fail" + the debt block's stop conditions,
     and the pivot decision's "What would prove it wrong". This item was already done
     properly before the gate existed. -->

## 6. Cheapest test

**The artifact**: 5 Mom-Test interviews plus a paid concierge pilot — run the launch half by hand for one founder, no product required. Defined and approved 2026-07-02, never run. Muakkil's slices 1–6 shipped instead, which is the recorded, still-unpaid validation debt.

**Qualified reach needed**: TODO — **no denominator has ever been set.** 5 interviews is a numerator. To know whether the pain is common or rare, the attempt has to record how many target-profile founders were *approached* to get those 5 conversations. Approaching 8 to get 5 and approaching 200 to get 5 mean opposite things about this market.

**Window**: TODO — the previous window (2026-08-16 catch-up trigger) closed 3 weeks ago with zero evidence recorded. A new window has to be set, not inherited.

---

## Preconditions before shot one

- [ ] Keepalive on every auto-pausing free-tier service — **Muakkil runs its own Supabase** (`decisions/2026-07-02-own-supabase-not-lovable-cloud.md`), and the waitlist at `muakkil.com/v/<slug>` is the signup path the whole demand measurement depends on. A paused project here does not just lose signups; it counts reach that hit a broken form and makes the rate fiction.
- [ ] Liveness probe on the signup path specifically
- [ ] Signups recorded with their source channel, so the rate is per-shot rather than one aggregate

---

## What this gate found

Muakkil's honest state is **untested, not rejected** — and the gate names why in specifics rather than as a feeling:

- **Item 5 was already done well.** The kill condition is falsifiable, numeric, and pre-committed. It is the strongest artifact on disk.
- **Item 1's watering hole is the load-bearing gap.** The ICP is unusually well specified — including who is explicitly *out* — but no venue was ever named, so no attempt was ever runnable. This is the single blocker to unblock first; every other number depends on it.
- **Item 2 is empty**, which is the recorded debt showing up as data: six weeks of building, zero conversations.
- **Item 6 has no denominator**, which is precisely why "we got LinkedIn validation" and "Muakkil is validated" could sit in the same sentence without contradiction. One shot, one channel, one message, one ICP, reach unrecorded.

The next action is not a build and not a kill. It is naming the venue in item 1, then quoting three artifacts from it into item 2 — both of which are hours of work, not weeks, and neither of which requires touching the product.
