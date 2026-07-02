# Anti-pattern: cutting a PR branch from a local `main` that's ahead of `origin/main`

**Date:** 2026-07-02 · **Incident:** PR #21 (v2.1 trust-loop ship)

## What happened

The v2.1 ship branched with `git switch -c change/trust-loop-phase-1` off **local** `main`. Local `main` was one commit ahead of `origin/main` — an unpushed `decisions(muakkil)` commit left by a parallel session. The PR's diff is computed against `origin/main`, so that commit's content silently rode inside the PR and was published in the squash-merge. Nobody reviewed it for publication; it "left the machine" without an explicit decision.

It was benign this time (product metadata, designed to be public). The same mechanism would just as happily publish a half-finished experiment, a private note, or a file with a secret — whatever a parallel session happened to leave committed-but-unpushed.

## The trap's shape

- `git switch -c <branch>` (no start point) branches from **HEAD**, i.e. local `main` — which on a machine with auto-commit hooks and parallel sessions is routinely ahead of origin.
- The staged-files review (the careful, curated `git add`) creates false confidence: you reviewed what you *staged*, but the PR ships everything in `origin/main..HEAD` — staged changes **plus** every stowaway commit underneath.
- Squash-merge then erases the stowaway's identity: it arrives on `main` unattributed, inside your commit message.

## The rule

**Always branch PR work from `origin/main` explicitly:**

```
git fetch origin
git switch -c change/<slug> origin/main
```

And before pushing, read `git diff origin/main --stat` — that list, not the staged list, is what will be published. If local `main` is ahead of `origin/main`, say so out loud; those commits ship only by explicit decision.

## Where it's enforced

`factory/commands/pr.md` steps 2 and 4 (branch-from-origin + pre-push scope check), amended 2026-07-02. Ledger line in `BEST-PRACTICES.md` → "Never do this."
