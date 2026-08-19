# 2026-08-16 — first run of the verification ledger

**The claim being tested:** that a receipt's "Checked:" line can be rendered
from recorded exit codes instead of composed by the session that did the work.

**What was run:** `bun run verify --all` — seven gates, each spawned as a real
process, each exit code appended to a hash-chained ledger.

## What came back

Six passed. **One failed.** The rendered line reported the failure:

```
Checked: check-decisions, check-evals, check-limitations, check-model-independence,
check-product-layout, check-skill-command-collision were run and passed;
check-counts was run and FAILED
```

Full ledger in [`ledger.jsonl`](ledger.jsonl) and [`verify-show.txt`](verify-show.txt);
the failing gate's own output in [`check-counts-failure.txt`](check-counts-failure.txt).

## Why the failure is the point

`check-counts` failed on two genuinely separate things, and neither would have
appeared in a hand-written receipt:

1. **A pre-existing rule violation.** `products/valuable/product.config.json`
   carried an absolute machine path where CLAUDE.md rule #12 requires `null` —
   in a repo that is permanently public. Nothing in this build touched that
   file; the gate surfaced it.
2. **Drift this build caused.** Adding one skill moved the counts from 42→43 and
   65→66, and five README numbers went stale the moment the file landed.

A session narrating its own work would plausibly have written "Checked: gates
pass." Both of these would have survived it.

## What this does NOT prove

- **Not unforgeability.** The ledger is tamper-*evident*: the hash chain makes a
  retroactive edit detectable, and an empty ledger renders "nothing was
  verified" rather than reading as success. A session with shell access can
  still append a false record. That is the honest ceiling of a single-agent
  design, and the code says so where it lives.
- **Not that the gates are the right gates.** This shows the recording mechanism
  works. Whether these seven checks catch what matters is a separate question
  with no evidence here.
- **One run, one machine.** No repeat trials, no cross-platform check. Single
  runs are anecdote-grade — the failure mode both studied repos share, named
  here so this artifact does not repeat it.

## Reproduce

```bash
bun run verify --all
```

Then `bun run verify --show` for the ledger, or `bun run verify --checked` for
the line alone (exit 1 when anything failed or nothing ran).
