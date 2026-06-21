---
description: One-command repo ship — branch → commit → PR → wait for CI → squash-merge → sync local. The safe GitHub flow, hidden behind one step, narrated in plain English. For shipping a change to a repo's main; NOT a product production deploy (that's /ship).
argument-hint: [short description of the change]
---

The user invoked: `/pr $ARGUMENTS`

Ship the current working-tree change to `main` the safe way — through a branch, a
PR, and CI — without making the user learn the 7 git concepts. Design + rationale:
[`docs/repo-ship-flow.md`](../../docs/repo-ship-flow.md). This is the repo-contribution
flow; product production deploys stay on `/ship`.

## Teaching mode (default)
The user may not know git. **Narrate one plain-English line before each step**, in
their vocabulary ("proposal" not "PR", "checks" not "CI", "publish" not "merge").
On the first run in a session, print a 2-line "here's what's about to happen and why."
Never dump raw git unless asked.

## The flow (run in order; stop on any failure)

1. **Pre-flight.**
   - Confirm there are uncommitted changes (`git status --porcelain`). If none → say so, stop.
   - Show the user the list of files about to ship; **confirm scope** if it's ambiguous
     or includes files you didn't create (e.g. a parallel session's). Stage only the
     intended files — never `git add -A`.
   - **Secret scan the staged diff** (gitleaks if present, else grep for key patterns).
     If anything looks like a secret → **abort before pushing**, tell the user.

2. **Branch.** `git switch -c change/<kebab-slug-from-$ARGUMENTS>` off latest `main`.

3. **Commit.** Real, specific message (Conventional-Commits style: `type(scope): summary`).

4. **Push.** `git push -u origin <branch>`.

5. **Open the PR.** `gh pr create --fill` (or a written title/body from the diff).
   Show the user the PR URL.

6. **Wait for CI.** `gh pr checks <branch> --watch`.
   - **Green → continue.**
   - **Red → STOP.** Show which check failed (`gh run view`), explain it plainly,
     offer to fix. Never merge a red PR.

7. **Squash-merge.** `gh pr merge <branch> --squash --delete-branch`. One tidy
   commit on `main`; branch removed. If GitHub reports the branch is behind
   (a parallel session pushed) → `gh pr update-branch` (or rebase) then merge.

8. **Sync local.** `git switch main && git pull --ff-only`.

9. **(Optional) Release.** If the user says this is a release point, `git tag vX.Y.Z`
   + `gh release create` with notes — the moment the
   [release-cadence playbook](../playbooks/launch-stage/release-cadence-as-content.md)
   turns into a content atom. Offer it, don't force it.

## Gotcha — `.claude/commands` is a symlink to `factory/commands`
Never create a per-file symlink into `.claude/commands/` — the whole directory is
already symlinked, so `ln -s … .claude/commands/x` writes *through* it and clobbers
the real `factory/commands/x`. Just write the real file in `factory/commands/`.

## Safety / edge cases
- **CI red** → never merges; surfaces the failing job.
- **Behind main / conflict** → update-branch or rebase; if unresolvable, stop and explain.
- **Secret detected** → abort before anything leaves the machine.
- **Nothing to commit** → clean no-op.
- **Parallel session active** → the branch isolates your work; rebase before merge.
- This repo carries `.no-auto-commit`, so the auto-commit hook won't fight this flow.

## Non-goals
- Not a product production deploy — that's `/ship`.
- Not a multi-reviewer team flow — 0 approvals, self-merge by design.
- Doesn't replace `wip(auto)` local snapshots — those never reach `main`.

**Credit (port the idea, never the code):** GitHub Flow (branch → PR → CI → squash-merge)
— the industry-standard lightweight flow; squash-merge for clean history. See
[`docs/repo-ship-flow.md`](../../docs/repo-ship-flow.md).
