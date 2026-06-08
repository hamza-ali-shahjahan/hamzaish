---
description: Promote reviewed commit(s) from the working branch to the product's `production` branch and push — the single deploy action. Auto-commit wip snapshots stay on the working branch and never reach production.
argument-hint: <product-slug> [reviewed-commit-sha]
---

The user invoked: `/ship $ARGUMENTS`

`/ship` is the **one deliberate deploy action**. Vercel's Production Branch is
`production`; a push to it is the deploy. Everything else (auto-commit `wip(auto):`
snapshots, local checkpoints) stays on the **working branch** and never reaches
production. See `docs/security.md` → "Production-branch deploy model".

Parse `$ARGUMENTS` as `<product-slug>` and an optional `[reviewed-commit-sha]`
(defaults to the working branch `HEAD`). If the slug is missing, ask which product
(or `Read ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/_portfolio.md`). Resolve the code repo from
`${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/<slug>/product.config.json` → `code_path`. **All git commands below run in that code repo** (`git -C <code_path> …`), never in the Hamzaish repo.

Constants: working branch = the repo's current branch (usually `main`);
production branch = **`production`**.

## Pre-flight gate — do not skip

1. **Clean tree.** `git -C <code_path> status --porcelain`. If dirty, stop and tell
   the user to commit, `/checkpoint`, or stash first. Never ship uncommitted work.
2. **Security baseline.** Run `/security-check <slug>`. If the verdict is **BLOCK**,
   stop and surface the findings — do not promote a repo with tracked secrets,
   unpinned/vulnerable actions, or over-broad workflow permissions.
3. **Show what will ship.** `git -C <code_path> log --oneline <production>..<reviewed-sha>`
   (for the first ship, show the full history that will become `production`).
   Print the commit list and a `--stat` summary so the user sees exactly what
   deploys.
4. **Keep wip snapshots out of production.** Scan the range for `wip(auto):`
   commits. If any exist, tell the user and offer to fold them into the preceding
   real commit before promoting (interactive cleanup:
   `git -C <code_path> rebase -i <production>` — mark `wip(auto):` commits as
   `fixup`). Production history stays clean and reviewed; wip snapshots remain
   recoverable on the working branch. Do not promote a range whose tip is itself a
   `wip(auto):` commit — ask the user to `/checkpoint "<message>"` a real commit first.
5. **Confirm.** Unless the user already said "go" / "ship it", show the plan and
   wait for the go-ahead. This is an outward-facing, money-/users-affecting action.

## Promote + push

First ship (no `production` branch yet):
```
git -C <code_path> branch production <reviewed-sha>
git -C <code_path> push -u origin production
```

Subsequent ships (fast-forward only — production never rewinds or force-pushes):
```
git -C <code_path> checkout production
git -C <code_path> merge --ff-only <reviewed-sha>
git -C <code_path> push origin production
git -C <code_path> checkout <working-branch>   # always return to where the user was
```

If `--ff-only` fails, `production` has diverged — **stop and report**, don't force.
The user resolves it deliberately (usually by rebasing the working branch onto
`production`), then re-runs `/ship`.

**If the push hangs**, report it and stop. Do not retry in a loop. A hung push is
usually auth/network — surface it so the user can fix credentials and re-run.

## Report

- Production SHA now live (short) + the commit message.
- The commit list that shipped (and confirmation no `wip(auto):` commits reached
  `production`).
- "Vercel will deploy from `production` — watch the dashboard for the build."
- Reminder: working branch keeps its granular history (including wip snapshots)
  for recovery; only reviewed commits are on `production`.
- Append a one-line entry to `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/<slug>/decisions/` noting what shipped (date + SHA + summary), per the per-product decision-log rule.

## Notes
- `/ship` does **not** run the build or deploy itself — Vercel does, off the
  `production` push. For the pre-launch checklist (env vars in Vercel, smoke test,
  RLS), see `SETUP.md` and `factory/playbooks/mvp-stage/security-checklist.md`.
- Hotfix model: commit the fix on the working branch, `/checkpoint` it, then
  `/ship <slug> <fix-sha>`. Same single action.
