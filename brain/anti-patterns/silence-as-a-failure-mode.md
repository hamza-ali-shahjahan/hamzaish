# Anti-pattern: silence as a failure mode

**Spotted:** 2026-08-20, three times in one build.

## What it looks like

Code that is wrong and says nothing. Not a crash, not a red test — a quiet, confident no-op that every signal you have reports as success.

Three instances, same day, same feature:

**1. A swallowed error.** `recordSearchEvent(...).catch(() => null)` — best-effort by design, because logging must never break a search. It also meant that when the insert failed for a completely different reason, nothing anywhere said so. The table simply stayed empty.

**2. A custom column type with a baked-in name.** A `halfvec(dim)` helper had one caller for months, so its column name was hardcoded inside it. Two new tables used the helper; drizzle generated inserts against a column that does not exist on either. Every write failed — into the swallowed catch above.

**3. A gitignore rule matching more than it meant.** `.gitignore` carried `coverage/` for test output. A bare directory pattern matches at **any depth**, so it silently excluded `src/lib/coverage/` — a real source module. `git add -A` reported nothing. `git status` was clean. The local build passed and all 140 tests passed, because the file was on disk. Only CI, which starts from a clean checkout, could see it.

## Why it happens

Each was individually reasonable. Best-effort logging *should* swallow errors. A single-caller helper *shouldn't* need a parameter. `coverage/` *is* the conventional ignore.

The common shape is that **the feedback channel was the thing that broke.** You cannot notice a missing row, an unwritten file, or an ignored path by looking at what you have — only by comparing against what you expected.

## The rule

**For anything you cannot see directly, assert its effect once.**

Not extensive coverage — one test that proves the write lands, the file is tracked, the row appears. On this build, every one of these was caught by a single regression test that read the row back after writing it. Two of the three had passed 140 other assertions.

Three cheap habits that would have caught all three:

- **Read back after write, at least once.** A test that inserts and then `SELECT`s the row catches the swallowed error, the wrong column, and the empty table together.
- **Trust CI's clean checkout over your working tree.** Your machine has files git does not. That difference is the entire class of bug in instance 3.
- **Anchor ignore patterns.** `/coverage/` means the repo root. `coverage/` means everywhere, forever, including directories that do not exist yet.

## The tell

If you find yourself saying *"it should be working"* while a table is empty, a folder is missing from a diff, or a feature does nothing — look for the channel that would have told you, and check whether it is muted.

## Related

- [`hand-maintained-facts-drift.md`](./hand-maintained-facts-drift.md) — the same decay in documentation
- [`silent-dedup-masks-broken-pagination.md`](./silent-dedup-masks-broken-pagination.md) — a near-identical shape in data fetching
- [`work-that-exists-only-on-one-machine.md`](./work-that-exists-only-on-one-machine.md) — the git half of instance 3
