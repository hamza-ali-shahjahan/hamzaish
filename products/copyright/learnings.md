# Learnings — CopyRight (Patently Legal)

_Capture the transferable lesson only — never keys, credentials, or proprietary internals._

## What worked

- **Grepping the string before editing caught a second surface.** The pricing badge existed
  in two files — `PricingTable.tsx` (`/pricing`) and a separate pricing section inside
  `HomeLanding.tsx` (homepage). Editing only the screenshot's file would have left the two
  surfaces contradicting each other. Now recorded in the repo's `CLAUDE.md` so the next
  session is warned up front.
- **Verifying against the really-running app, not the diff.** Started a real dev server,
  curled both routes for HTTP 200, asserted the new icon was present *and* the old string
  count was zero, then looked at it in a browser. Cheap, and it's the difference between
  "the edit applied" and "the page renders correctly."
- **Asserting the negative.** Checking `grep -c "most popular" == 0` caught more than
  checking the new text was present — the old string is the thing that proves the change
  is complete rather than merely additive.

## What we would do differently (pitfalls)

| Pitfall | The fix | Guardrail it became |
|---|---|---|
| A registered product's code repo had **no `CLAUDE.md`**, so sessions opened in that folder had no way to know it was factory-managed. Work happened outside the flow — no slice pinned, no decision logged, no learning fed back — until the operator noticed and asked why. | Plant the tendril at registration, not later. Seeded `CLAUDE.md` from `templates/claude-md-template.md`, adapted to this repo's real stack. | `check-product-layout` already has a tendril check — but see the next row for why it never fired here. |
| **`code-paths.local.json` held the scaffold placeholder** (`/absolute/path/to/your/copyright-code`) for a product that has been live in production for months. The factory had rich metadata for `copyright` and no link to the actual code. | Wired `copyright` → the code repo's real path (recorded in the gitignored `code-paths.local.json`, never in a committed file). | **Gap — not yet mechanized.** See below. |
| **The tendril guard is blind exactly where the wiring is broken.** `check-product-layout` skips any path that doesn't exist on disk (`// placeholder / not on this machine`). A placeholder path therefore *silences* the tendril check for that product. The failure chain: placeholder path → tendril check skips → missing `CLAUDE.md` never warned → session never re-enters the factory. The guard reported "clean" the whole time. | A placeholder is a *detectable state*, distinct from "not on this machine" — it literally begins with `/absolute/path/to/your/`. The guard should warn on placeholders rather than treat them as absent. **10 of 17 registered products currently sit on placeholder paths and are invisible to this check.** | **Proposed, not implemented** — the script change is factory code and this session wasn't rooted in the Hamzaish repo, so it's recorded here rather than made. |

## Open questions

- Does "Best value" hold up against "Most popular" on conversion, or does it read as
  entry-level? No data yet — private beta volume is too low to measure. Revisit at public
  launch (decision `0004`).
- The repo runs `src/middleware.ts` on Next 16, where the factory guardrail is `proxy.ts`.
  Works today. Migrate when auth routing is next touched — not in an unrelated change.

## 2026-08-18 — Never trust a cost comment you didn't measure

**What happened.** Google Cloud billed $93.91 for Aug 1–17 on a product with zero active
users. The cause was not traffic; it was two scheduled jobs querying the public Google
Patents table on BigQuery.

**The transferable lesson.** `patents-public-data.patents.publications` is not partitioned
on `publication_date`, so a `WHERE publication_date BETWEEN ...` filter prunes nothing.
Every query shape — a one-day window, a 90-day window, even `WHERE publication_number =
@id` — scanned a flat ~231 GiB and cost $1.41. The code's own comments asserted partition
pruning, ~1 MB lookups, and free-tier coverage. All three were wrong and none had ever
been tested. **A BigQuery dry run is free and returns exact bytes. Price a query before
you ship it; never reason about what a WHERE clause "should" prune.**

**Three compounding blind spots worth checking in any product:**
1. *Cost tracking followed the user, not the money.* Per-run cost was recorded inside
   clearance runs, so `/admin` showed $21 lifetime while the real bill was $94/month.
   Anything that can spend money needs a ledger, including things no user triggered.
2. *A cache key that can never hit.* The patent-search cache key embedded today's date,
   so the daily digest generated a fresh key every day and missed by construction. A
   7-day TTL is worthless if the key rotates faster than the TTL.
3. *Zero-value work is invisible until you count it.* The daily digest ran 77 times,
   returned 0 items every time, and sent 0 emails — for one watchlist owned by a free
   test account. Count outputs, not just executions.

**The structural fix (not just the patch).** Spending money now requires an entitlement,
carried ambiently and checked at the leaf: a live lookup runs only for a signed-in user on
an active paid plan. A scheduled job can label itself but has no paying user to bill
against, so "cron spends money with no users" became impossible rather than merely
unlikely. Admin accounts are excluded on purpose — testing should not cost money.
Layered behind it: free dry-run pre-check, per-query byte cap, hard monthly budget, and
threshold emails.

**Guard-design note.** Limit checks elsewhere in this codebase fail OPEN so a flaky DB
cannot lock users out. This one fails CLOSED: wrongly allowing costs real money, wrongly
refusing just falls back to the local index and still returns results. Match the failure
direction to what the failure actually costs.
