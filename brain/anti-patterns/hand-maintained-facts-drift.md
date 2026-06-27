---
name: hand-maintained-facts-drift
description: Stating the same fact (a count, a config value, a path, a caveat) by hand in more than one place, with nothing deriving or checking it — the copies drift apart and the doc becomes a lie
type: anti-pattern
---

# Hand-maintained facts drift

## The pattern

A fact lives in several places — a headline number in the README *and* in a ledger *and* hardcoded in a script; a hyperparameter in code *and* in prose *and* in a serialized artifact; a caveat written as prose next to the value it qualifies. Each copy is correct the day it's written. Nothing derives one from another and nothing checks they agree. Over weeks, someone updates one copy and not the others, and the document quietly starts asserting something false — worst of all in a repo whose whole pitch is "the facts are real."

## Why we don't do it

Seen **three times in a single session** (2026-06-28), independently:

- **Hamzaish review (verified).** "Every count real" had drifted everywhere: practices said 128 / 130 / 133 across `README.md`, `BEST-PRACTICES.md`, and `scripts/hero.ts`; playbooks 39 vs 38 vs 41; skills "17" silently omitted two real skills; security checks "59" vs "80+" vs 65 on disk. Separately, the path-portability hard rule was *breached and green in CI* — `products/copyright/product.config.json:9` shipped a real `/Users/...` `code_path` because `check-product-layout.ts` never reads config values. The believability that's the repo's actual moat was being eroded by facts nothing checked.
- **ThousandWorlds contribution.** `n_folds` was `3` in the code default (`_run_model_config.py`) and in every prose doc, but `5` in all three committed `config.json` artifacts — three hand-kept copies, two of them wrong.
- **The emulator (the counter-example done right).** Per-planet caveats are stored as **queryable data** — `observed[]` / `assumed[]` / `note` arrays in `src/lib/planets.ts`, clamps flagged inline — so a caveat physically travels with the value it qualifies and can't fall out of sync.

The cost is reputational and compounding: a single drifted count reads as "they don't actually check their own claims," and the manual recount to fix it is a recurring chore that drifts again the next week.

## What to do instead

- **Single source of truth → derive the rest.** Compute counts/labels/tables from the filesystem at build time (or a `check-*` script) instead of typing them in N docs. The repo's own ethos: *every rule that bit us earns a guard.*
- **If you must duplicate, assert equality.** A test or CI step that fails when two copies disagree (e.g. `code n_folds === artifact n_folds`; `README count === filesystem count`). The guard is cheaper than the recurring recount.
- **Structure caveats/metadata as data, not prose.** Arrays/JSON fields that sit *on* the value (`observed`/`assumed`/`note`, a `code_path` asserted `=== null`) move with it; a sentence in a paragraph does not.
- **For Hamzaish specifically (the deferred fix):** one `scripts/check-counts.ts` deriving agents/skills/commands/playbooks/practices/security-checks from disk + a tracked-file `/Users/` grep + a `code_path === null` assertion, wired into `ci.yml` — closes count-drift, the path-leak, and doc-link rot in one guard.

## When this might not apply

- **One-off, never-referenced-again facts** (a date in a changelog entry, a number in a finished retro) don't need a deriving mechanism — the cost of the guard exceeds the risk.
- **Deliberately pinned snapshots** (a benchmark number frozen "as of commit X," a quoted historical figure) are *supposed* to diverge from the live value — but say so explicitly at the copy, so the divergence reads as intentional, not as drift.
- Don't over-engineer: a guard is warranted once a fact is duplicated **and** load-bearing **and** likely to change. Below that bar, a single clearly-canonical copy is enough.
