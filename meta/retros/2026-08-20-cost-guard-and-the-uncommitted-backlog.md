# 2026-08-20 — Hamzaish + Patently · a cost incident that surfaced a bigger one

> Investigating a $93.91 cloud bill on a product with zero users led to the factory repo, where three weeks and 6,080 lines of finished work were sitting uncommitted on a silently diverged branch.

## Context

- **Goal:** explain an unexplained Google Cloud bill on Patently, fix it, and publish the lesson to the factory.
- **Stakes:** the product had no paying users and was burning ~$94/month. Separately — though nobody knew it yet — the factory's own release was unprotected.
- **Starting state:** Patently on `main` at `cb406eb`; Hamzaish last committed at `v2.24.4`.

## Timeline

- Traced the bill with BigQuery dry runs (free, exact). Found every query shape cost an identical **231 GiB ≈ $1.41** — a one-day search, a 90-day pull, and a single row by primary key alike. The public patents table is not partitioned on the column every query filtered by.
- Found the callers: a daily digest and a Monday top-up, both scheduled. Zero chat messages and zero tool calls in 60 days. The digest had run **77 times, returned 0 items every time, and sent 0 emails**, for one watchlist owned by a free test account.
- Shipped the guard on Patently (PR #17): entitlement at the leaf, free dry-run pre-check, monthly budget, spend ledger, admin panel, alert emails. Verified against real BigQuery at $0 billed.
- Opened Hamzaish to publish the lesson — and found the working tree holding all of v2.25.0, uncommitted, plus a branch diverged from `origin` in both directions.
- Snapshotted to a throwaway branch **before** touching anything, then reconciled, fixed three weeks of accumulated gate failures, and committed in three pieces.

## What worked

- **Dry runs before conclusions.** Every number in the incident write-up came from a free measurement, not an estimate. The whole diagnosis turned on one command.
- **Protect before improve.** The safety snapshot took seconds and made every subsequent step reversible. Without it, the README merge and the path rewrites would each have been a moment where three weeks could vanish.
- **The repo's own gates did their job.** `check-counts` caught four absolute machine paths bound for a permanently public repo. `check-decisions` caught six incomplete records — including the one written in this very session. CI caught this retro's absence when the local sweep missed it.
- **A security review on the fix caught two real defects** before merge: a budget read that failed *open* (a database blip would have become an open cheque) and an entitlement scope that depended on an AI SDK's eager evaluation.

## What didn't

- **The existing cost playbook was followed and still failed.** Every guard in it bounded how big a call could be; none bounded whether the call should happen at all. It has been corrected and demoted to second layer.
- **Cost comments were never tested.** Three separate claims in the source — partition pruning, ~1 MB lookups, free-tier coverage — were all false and none had ever been measured.
- **A cache that could never hit.** Its key embedded today's date under a 7-day TTL.
- **Local gate sweep was incomplete.** I ran ten gates and CI ran one more (`check-retro`). Running "the gates I know about" is not the same as running the suite.

## Promoted to the factory

- `factory/playbooks/mvp-stage/spend-belongs-to-a-customer.md` — the new first layer.
- `bun run check-work-at-risk` + AGENTS.md rule #17 + `brain/anti-patterns/work-that-exists-only-on-one-machine.md`.
- Corrections to `abuse-and-cost-controls.md` and `meta/RESEARCH-BAKED-PRACTICES.md`.

## Open

- The starter template does not yet ship the spend guard as code — the highest-leverage follow-up, deliberately not bundled here.
- Whether `check-work-at-risk` ever fires in anger. A month of silence means either the habit took or the thresholds are too loose.
