# Metered Spend Belongs to a Customer — not to a code path

Any product that calls a metered third-party service — an LLM, a search API, a scan-billed warehouse, a geocoder, an email sender — has a bill that runs whether or not anyone shows up. This playbook is about the gap between *bounding how much a call costs* and *deciding whether the call is allowed to happen at all*.

> **Status: scar tissue.** Earned on Patently (`products/copyright`), 2026-08-20. The factory already had [`abuse-and-cost-controls.md`](../scale-stage/abuse-and-cost-controls.md); it was followed; the product was billed **$93.91 in 17 days with zero users**. Everything below is what that playbook was missing.

## Why this lives in mvp-stage, not scale-stage

Cost controls get filed under "scale" because the mental model is *more users → bigger bill*. That model is wrong for metered services. The bill that hurt here arrived at **zero users**, from machinery running on a timer, and it would have arrived identically on day one. **Your first bill can precede your first customer.** Treat this as a launch-blocking concern, not a growth-stage one.

## The principle

> **Spending money is a privilege that belongs to a paying customer, not to a code path.**

Attach the right to spend to a *person*, carried at runtime and checked at the leaf where the money is actually spent. A scheduled job can name itself, but it has no payer behind it, so it is refused before anything is even priced.

This is the difference between discipline and structure. "Remember to switch the cron off" is discipline — it decays. "The cron cannot switch spending on" is structure — it holds while you sleep.

## The failure this replaces

Patently had, in production, before the incident:

| Guard in place | Why it missed |
|---|---|
| A per-query byte ceiling (`maximumBytesBilled`) | Set to 300 GB from an **unmeasured guess**. Real cost per call: 231 GiB. The ceiling was above the problem, so it never fired. |
| A local-first cache to avoid per-call cost | The cache key embedded **today's date** under a 7-day TTL. The key rotated faster than the TTL, so it missed by construction — every day, forever. |
| Per-user daily rate limits | Rate limits are per user. **A cron has no user.** |
| Per-run cost tracking, surfaced in `/admin` | Tracked cost **inside user sessions only**. Machine spend had nowhere to land, so the dashboard read $21 lifetime against a real $94/month. |

Note what these have in common. **Every one of them bounds how big a single call can be. None of them bounds whether the call should happen at all.** A robot on a timer will happily spend right up to every ceiling you set, forever, on behalf of nobody.

## The rules

### 1. No customer, no variable cost

Decide, explicitly, which callers are allowed to spend. For most products the honest answer is exactly one: **a signed-in user on an active paid plan, in the moment they are using the product.** Everything else spends nothing — scheduled jobs, health checks, cache warmers, migration scripts, and (deliberately) your own admin and test accounts, because testing should not cost money.

Implement it as an entitlement carried at runtime, not a flag on a function. Entry points resolve *who this is for* and open a scope; the leaf that spends money reads that scope. A caller that cannot name a payer is refused before the provider is contacted.

**Fringe benefit:** this makes cost attribution free. Every charge already knows whose it was.

### 2. Never trust a cost comment you did not measure

Cost assumptions are written once, never tested, and rot silently. Patently's source comments asserted partition pruning, ~1 MB lookups, and free-tier coverage. All three were false and none had ever been checked.

Every major provider gives you a free way to measure before you spend:

| Provider | Free measurement |
|---|---|
| BigQuery / Athena / Snowflake | dry run (`dryRun: true`) — returns exact bytes, bills $0 |
| Anthropic / OpenAI | token-counting endpoint before the call |
| Most REST APIs | `HEAD`, a `?dry_run=1` parameter, or a sandbox key |
| Anything else | one call, then read the provider's own usage page the next day |

**Measure, then write the number AND the date into the comment.** A cost claim without a date is a rumour.

### 3. A ceiling calibrated by guess is not a ceiling

Set caps from a measurement, and set them **below** what you believe normal is, so an unexpected call fails loudly instead of billing quietly. A cap above the real cost is decoration.

### 4. Gate before you meter, and price before you run

Order the checks cheapest-first, so the expensive ones rarely execute:

1. **Entitlement** — is there a payer? (free, local)
2. **Kill switch** — is this feature even on? (free, local)
3. **Budget** — has this month's ceiling been reached? (one local read)
4. **Price it** — dry run the call. (free, one round trip)
5. **Only now**, run it.

Step 4 is the one most teams skip, and it is the one that catches an assumption that was wrong from the start.

### 5. Fail closed on money; fail open on access

These pull in opposite directions and the difference matters:

- **Usage limits** should fail **open**. A flaky database should not lock paying users out of the product.
- **Spend guards** should fail **closed**. A flaky database must not become an open cheque.

Match the failure direction to what the failure actually costs. Wrongly allowing costs real money; wrongly refusing costs a fallback path. Patently shipped this backwards on the first pass — a failed ledger read reported "$0 spent" and let the query through — and a security review caught it before merge.

### 6. Track money where the money is, not where the users are

Per-user cost tracking is the natural thing to build and it **structurally cannot see machine spend**. Keep one ledger keyed on the *call*, carrying:

`service · operation · caller · units consumed · cost · outcome · timestamp`

Record **refusals as well as charges**. A blocked call is not a charge, but it is exactly what you need to see when a feature has silently degraded. Then surface month-to-date on a page you actually open.

### 7. Count outputs, not executions

"The job ran 77 times" reads healthy on a dashboard. The truth was: **77 runs, 0 items found, 0 emails sent** — for one watchlist owned by a free test account. Instrument the value produced, not the fact of running, and alert on a job whose output has been zero for N consecutive runs. Work that produces nothing is not neutral; it is pure cost.

### 8. The operator escape hatch must be un-acquirable by a server

You will sometimes want to spend on purpose — re-seed a corpus, backfill an index. Do **not** make that an environment variable. An env var set on the server hands every scheduled job the same right you just took away.

Make it something only a human-run process can obtain: a function called by the script itself, behind a flag that prints the price first and refuses without confirmation. A server has no terminal, so it can never acquire it.

### 9. Free tiers are a trap for reasoning

"1 TB scanned per month, free" sounds generous. At 231 GiB per call it is **four calls**. Always convert a free tier into *the number of operations you actually make*, then decide if it is generous.

### 10. A trial credit hides your steady state

The first half of the month billed $0 because credit absorbed it. When the credit ran out the invoice looked like a spike; it was the normal rate arriving late. **Treat any "$0 so far" as unmeasured, not free** — check the usage number, not the dollar number.

### 11. Three layers, and only one of them knows who asked

| Layer | Catches | Blind to |
|---|---|---|
| Provider-side hard quota (daily unit cap) | Everything, even a bug in your code | Who was asking; it just fails |
| Billing budget alert | Spend you did not predict | Anything, until after it happens |
| In-app guard (this playbook) | The specific call, with the caller named | Bugs outside your app |

Set all three. Do not let one excuse the others. **Only the in-app guard can tell a paying customer from a robot**, which is why it is the one that decides.

## Checklist

- [ ] Every metered call has a named list of callers allowed to trigger it — and scheduled jobs are not on it
- [ ] Entitlement is checked at the leaf that spends, not only at the entry point
- [ ] Every cost claim in a comment carries a measured number and the date it was measured
- [ ] Per-call cap is set from that measurement, **below** expected normal
- [ ] A free dry run prices every call before it runs
- [ ] Spend guards fail closed; usage limits fail open
- [ ] A ledger records every call — charged and refused — with the caller named
- [ ] Jobs alert when their output has been zero for N runs
- [ ] The deliberate-spend override cannot be obtained from an env var
- [ ] Provider-side hard quota + billing alert set, in addition to the in-app guard
- [ ] The cache actually hits (assert on hit-rate; a key that rotates faster than its TTL is not a cache)

## Provenance

Authored 2026-08-20 from the Patently BigQuery incident (`products/copyright`, decision `0005`, PR #17). The prior guidance in [`abuse-and-cost-controls.md`](../scale-stage/abuse-and-cost-controls.md) was followed and proved insufficient — it bounded call size, not call authority. That playbook now carries a pointer here; this one supersedes its cost-runaway section for anything metered.

Related: [`cost-to-outcome-and-model-independence.md`](../ai-native-2026/cost-to-outcome-and-model-independence.md) (unit economics framing), [`security-checklist.md`](./security-checklist.md) (ship-time gate).
