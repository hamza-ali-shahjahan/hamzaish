# 2026-08-20 — The guards ship, and the local sweep that claimed to mirror CI

> Moving four `PreToolUse` guards into the repo went cleanly. What it exposed was
> that `bun run verify --all` — the pre-ship sweep whose own comment calls it "the
> guards CI runs" — was missing five of them.

## Context

- **Goal:** make the factory's strongest safety mechanism available to anyone who clones it, without changing what the factory is.
- **Starting state:** four guards lived only in the maintainer's `~/.claude/`. The repo claimed enforcement it couldn't show.
- **Stakes:** low for the code, high for the claim — a public repo asserting honesty-is-enforced while the enforcement was unverifiable by its readers.

## Timeline

- Read the guards, concluded two of four needed name-neutralizing before they could ship.
- Wrote a generalized visibility guard — and the **live visibility guard blocked the write**, because a heredoc containing a guarded command string is indistinguishable, to a regex over the tool call, from running one.
- The block's error text didn't match the source just read. Followed that thread: two guards existed twice on disk, and the *registered* copies (one directory deeper) were already portable. The generalization work was scoped against superseded files and was never needed.
- Ported all four as-is, wrote 58 tests, wired a consent-gated installer, wrote the governance doc, ran the local sweep green, opened PR #87.
- **CI went red.** `check-retro` — a gate the local sweep never runs.

## What worked

- **Proving the tests could fail.** 58 green on the first run is weak evidence when the subject is a *refusal*: a broken guard and a working one both look like silence. Neutering one guard and confirming exactly its nine blocking cases failed turned "the tests pass" into "the tests discriminate."
- **The guard catching its own author.** The build produced its own best test case, and the false positive went into the folder's *Known limits* rather than being quietly routed around.
- **Restraint on someone else's machine.** The maintainer's live `~/.claude/` config was left untouched, and the redundant double-registration found there was recorded rather than fixed. A build is not a licence to tidy a person's safety setup.
- **Ported, not rewritten.** The correction cost one blocked call, not a day of unnecessary generalization.

## What didn't

- **Read the filesystem, believed it was the system.** Two files shared a name at different depths; the shallower one looked authoritative and wasn't. The registration — `settings.json` → `PreToolUse` — names which file actually fires, and reading it first would have cost seconds. Same shape as the provenance anti-pattern: *it exists at a plausible path* never meant *it is the thing that runs*.
- **The local sweep's comment was a claim nobody checked.** `STANDARD` in `scripts/verify.ts` is documented as "the guards CI runs." CI runs ten; `STANDARD` had seven, five of which CI runs and two of which it doesn't. The set had drifted from its own description, so a green local sweep meant less than it read.
- **This is the second time in one day.** The previous retro records, verbatim, *"CI caught this retro's absence when the local sweep missed it."* Two identical misses in one day is a defect in the instrument, not inattention in the operator.

## What changes

`STANDARD` now includes `check-changelog`, `check-retro`, `check-sensitive-docs`,
and `check-assets` — the four CI gates it was missing that run in under 40ms
each. `check-starter` stays out deliberately (it installs and builds the whole
template; putting a multi-minute job in the default sweep is how a pre-ship habit
dies of friction), and the comment now says so instead of overclaiming.

The lesson that can't be a check, stated for the next session: **to learn which
hook fires, read the registration, not the directory.**
