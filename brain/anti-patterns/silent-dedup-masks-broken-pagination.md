---
name: silent-dedup-masks-broken-pagination
description: A dedup/upsert insert sink hides a totally broken paginated producer as "running fine" — counting attempted rows as progress while net-new rows stay zero
type: anti-pattern
---

# Silent Dedup Masks Broken Pagination

## The pattern

You build a bulk ingest: page through an API, embed/transform, insert into a table with `onConflictDoNothing` / upsert for resumability. The loop logs `page N: 20 rows → inserted` for every page and looks healthy. But the destination table's row count never grows — the producer is broken (pagination doesn't advance, the filter returns the same set, the cursor isn't followed) and **every "new" row is a duplicate the dedup sink silently drops**.

Because the insert doesn't error and the loop counter increments on rows *attempted*, the failure is invisible. You can run thousands of pages, burn embedding/API spend, and add nothing.

## Why we don't do it

**Incident 2026-06-16 (Patently Legal / IP Radar)**: seeding `case_law_index` from CourtListener toward 30k. The seed incremented `page=1,2,…120`, but CourtListener v4's `/search/` endpoint under `order_by=score desc` is **cursor-paginated** and *ignores* `page=N` — every page returned the same first 20 results. With `onConflictDoNothing`, pages 2–120 were 100% duplicates, dropped without error. The table sat frozen at **1,054** while logs scrolled "healthy" and Voyage embeddings were billed for re-embedding the same 20 cases over and over.

Worse, real 429s were happening *at the same time*, so the failure masqueraded as a **rate-limit problem** for hours. Throttle tuning, backoff, lower request rates — all irrelevant. The real bug took 30 seconds to prove once the right question was asked: *do page 1 and page 2 return different IDs?* They didn't.

Cost: hours of misdiagnosis, wasted embedding spend, and — had it not been caught — a public launch claiming a case-law corpus that was 3% of its intended size.

## What to do instead

1. **Count net-new rows, never rows attempted.** After a dedup/upsert insert, `ingested += chunk.length` is a lie. Use `INSERT … RETURNING` and count returned rows, or sample `select count(*)` before/after each query and log the delta. **A flat total under a climbing "pages processed" counter is the alarm.**
2. **Smoke-test pagination returns DISTINCT keys before trusting any loop.** Two-call test: fetch page 1 and page 2, diff the primary keys. Full overlap ⇒ the page param is ignored ⇒ you're on a cursor API. Follow the response's `next`/`cursor` URL verbatim; never assume `page=N` works just because the endpoint accepts the param without error.
3. **Pair every idempotent write with a freshness signal.** `onConflictDoNothing`/upsert is correct for resumability but it *hides* total upstream failure. Always emit a net-new metric (or a periodic row-count) alongside it so "the producer died" can't read as "the sink is idempotent, all good."
4. **When two failures co-occur, isolate before tuning.** A stuck count + visible 429s is not proof the 429s are the cause. Cheapest discriminating experiment first (here: compare two pages' IDs), not the most familiar fix (throttle tuning).

The cost of the two-page distinctness check: 30 seconds. The cost of skipping it: a frozen corpus that ships.

## Resolution (2026-06-17)

The cursor-following fix held: the corpus unfroze and grew off the 1,054 ceiling. But scaling it surfaced the *next* wall — CourtListener's API is capped at 125 requests/day (token-global), so even correct pagination couldn't bulk-seed in reasonable time. We pivoted to CourtListener's **S3 bulk-data dumps** (no rate limit) via a dockets→clusters join and reached **25,000+ opinions overnight** (50,000+ patents + 25,000+ court opinions now live on patently.legal). Full arc in [`learnings/2026-06-17.md`](../learnings/2026-06-17.md). Takeaway pairing: this anti-pattern (verify pages are distinct) + "for bulk corpus, use the bulk dump, not the rate-limited API."
