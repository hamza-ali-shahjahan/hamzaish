# Anti-pattern: work that exists only on one machine

**Spotted:** 2026-08-20, in this repo.

## What it looks like

A session finishes something real and moves on without committing. Then another
session does the same. Three weeks later the working tree holds **6,080 lines across
90 files** — an entire unreleased version, its changelog entry written, its version
number bumped — and none of it is in git. No stash, no branch, no backup. A single
`git checkout .` takes all of it.

It compounds quietly, because nothing is broken. Every session works fine. The tests
pass. The site builds. The only thing missing is the one property nobody checks:
**does this still exist tomorrow?**

Two failures ride along with it:

- **Silent divergence.** While the work sat uncommitted, `origin` moved on. The local
  branch had one commit `origin` didn't; `origin` had two the branch didn't — including
  changes to a file the uncommitted work had rewritten. Nobody knew until a push was
  attempted, at which point the merge is harder than it would have been on day one.
- **Deferred failures pile up.** Three weeks of unrun gates meant three weeks of
  accumulated violations, discovered all at once: absolute machine paths bound for a
  permanently public repo, decision records missing required fields, a stale count badge.
  Each was trivial alone. Together they were an afternoon.

## Why it happens

Committing feels like a *publishing* act, so it waits for the work to be "ready."
But a commit on a local branch publishes nothing. The instinct is right about pushing
and completely wrong about committing, and conflating the two is the whole bug.

Agent sessions make it worse: each one is scoped to a task, ends cleanly, and has no
reason to think about durability. Nobody owns the question.

## The rule

**Finishing a thing means committing it. Not pushing it — committing it.**

A local commit costs nothing, publishes nothing, and can be reshaped later
(`reset --soft`, `rebase -i`, `commit --amend`). An uncommitted working tree can only
be lost. When work genuinely isn't ready to be reviewed, that is what a WIP commit on
a scratch branch is for.

**When you find a backlog, protect it before you improve it.** The instinct is to
tidy first and commit once it's clean. That is backwards — the tidying is exactly when
a bad `checkout` happens. Snapshot to a throwaway branch first, then fix, on the
knowledge that every step is now reversible.

## The check

`bun run check-work-at-risk` reports uncommitted paths and the age of the oldest one,
unpushed commits, branch divergence, and missing upstreams. Warn-only by default
(a gate that blocks you for having edits open would be absurd); `--strict` exits
non-zero for hooks and CI; `--brief` gives the one-liner a session banner can carry.

The thresholds — 2 days, 20 files, 3 unpushed commits — are deliberately loose. This
is not trying to police a working session. It is trying to make sure three weeks can
never happen silently again.

## Related

- [`docs/repo-ship-flow.md`](../../docs/repo-ship-flow.md) — how work reaches `main`
- [`hand-maintained-facts-drift.md`](./hand-maintained-facts-drift.md) — the same
  shape of decay in documentation
