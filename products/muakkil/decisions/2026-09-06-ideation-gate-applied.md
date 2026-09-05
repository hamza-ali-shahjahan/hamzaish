# 2026-09-06 — The ideation gate applied: Muakkil is untested, not rejected

**Decision:** Muakkil is the first product scored against the new ideation gate
(`/idea-gate`, factory v2.32.0). Result: **1 of 6 — not testable yet.** The form lives at
`validation/idea-gate.md`. The verdict is recorded as **untested**, explicitly not as a
market rejection, and slice 7 (import-and-launch) stays unbuilt until items 1 and 2 are
filled. Nothing about the product changes; what changes is that the blockers are now
named in specifics rather than carried as a feeling.

**What passed and what didn't:**

- **Item 5 (kill condition) — pass.** Falsifiable, numeric, pre-committed: fewer than 3 of
  5 raising the stall unprompted, or 10 beta ventures with fewer than 5 reaching ≥10
  non-founder users in 30 days. Written before the data existed. The strongest artifact on
  disk, and it predates the gate.
- **Item 1 (watering hole) — fail, and this is the load-bearing one.** The ICP is unusually
  well specified, including who is explicitly *out* (engineers who could do distribution
  themselves). But no venue was ever named — the ledger records a recruiting *hook*, which
  is a message, not a place. **No attempt was ever runnable**, which reframes six weeks of
  "validation in parallel" as validation that had no channel to run on.
- **Item 2 (three verbatim quotes) — fail, 0 of 3.** The recorded debt showing up as data.
- **Item 3 (workaround + cost) — fail.** The pivot decision documents a *supply-side* gap
  ("AI builders stop at deploy"); it never records what a stalled founder actually does
  instead. Abandon, hire a freelancer, or keep rebuilding are different products at
  different prices.
- **Item 4 (demand hypothesis) — fail on channel.** The rate is real and pre-committed
  (≥3/5 unprompted, ≥1 naming a figure), but a hypothesis with no channel cannot be run.
- **Item 6 (denominator) — fail.** No qualified-reach number has ever been set. This is the
  precise reason "we got LinkedIn validation" and "Muakkil is not validated" could both be
  true without contradiction: one shot, one channel, one message, one ICP, reach
  unrecorded. Approaching 8 founders to get 5 conversations and approaching 200 to get 5
  mean opposite things, and nothing on disk distinguishes them.

**Why:** A product fully built, six weeks past its catch-up trigger, with zero recorded
evidence, needs a verdict — and the only honest verdict available is that no verdict is
available yet. Recording that explicitly is what stops the two failure modes on either
side: killing an idea the market never saw, and carrying it at half attention forever. The
gate's value here is not the score; it is that the score is 1/6 *for named reasons a
different person could check*, which converts an ambient feeling ("muakkil is sort of
validated?") into two specific hours of work.

**Alternatives considered:** Three options were on the table.

The first was to **treat the overdue gate as a kill signal** — the calendar said
2026-08-16, that date passed three weeks ago, so verdict the product. Rejected because a
date cannot tell "the market said no" from "we never did the work," and here it is
demonstrably the latter: the attempt had no venue, so there is no market result to read.
Killing on this evidence would discard an untested idea while producing no reusable
knowledge.

The second was to **fill the gaps with plausible answers** — name r/lovable or the
builders' Discords as the watering hole and move on. Rejected, and the gate's own
instructions forbid it: an invented venue *passes the check*, authorizes the attempt, and
then wastes it, because candidate venues differ enormously in reach and conversion. A blank
that blocks is strictly better than a guess that proceeds.

The third, taken, is to **record the honest 1/6 and name the two cheap unblocks.** Items 1
and 2 are hours of work — pick the venue, then quote three public artifacts from it — and
neither requires touching the product. Item 6's denominator follows from the venue.

**Wrong if:** the operator names a venue and three quoted artifacts cannot be found in it
within an hour of looking — that would say the churned-builder population is not publicly
legible, and the wedge's findability assumption (the thing `2026-08-13-serve-both-arrivals.md`
recorded as the *recommended* narrowing) is weaker than believed. Also wrong if the
interviews run and the pain is real but nobody names a figure: the pain would be confirmed
and the business still absent, which is a pricing/segment problem the gate does not test.

**Revisit:** when item 1 is filled — that unblocks 4 and 6 in the same sitting. Hard
trigger: if no venue is named by **2026-09-20**, the honest label becomes
**SHELVED — untested** rather than an active MVP-stage product, since a product nobody can
run an attempt on is not being worked on regardless of what `status.md` says (which was
last updated 2026-07-02).
