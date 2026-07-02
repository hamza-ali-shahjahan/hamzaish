# Anti-pattern: committing with a placeholder git email (your commits become a stranger's)

**Date:** 2026-07-03 · **Incident:** the "noreply from China" scare

## What happened

The repo's front page showed a commit by **"noreply"** — an unfamiliar avatar, profile location China, "committed to this repository in the past day." It looked exactly like an intrusion and triggered an urgent investigation.

It was us. This repo carried a **repo-local git config override** (`user.email = noreply@users.noreply.github.com`) shadowing the correct global identity. One commit (v2.5.3) was pushed directly to main with that email — and GitHub attributes commits by email: `noreply@users.noreply.github.com` maps to the real, unrelated GitHub account named `noreply`. A stranger got credited on our public repo. PR squash-merges had masked the bad config for 153 commits because GitHub rewrites squash authorship; the first direct push exposed it.

## The trap's shape

- Placeholder emails (`noreply@github.com`, `noreply@users.noreply.github.com`, unset, `you@example.com`) don't fail anything locally — commits succeed, pushes succeed, and the damage is only visible on the GitHub UI, attributed to whoever owns that address.
- A repo-**local** override silently beats a healthy global config, so `git config --global user.email` looks fine while the repo commits wrong.
- The correct private address is `<id>+<username>@users.noreply.github.com` — the `<id>+<username>` prefix is what makes it *yours*. Dropping the prefix hands your commits to someone else.

## Diagnose before panicking (your own repo shows an unknown author)

1. `git log --format="%h %an <%ae>"` — is the *name* yours with a wrong *email*? That's attribution, not intrusion.
2. `git reflog | grep <sha>` — a plain `commit:` entry proves it was created on this machine.
3. `gh api repos/<owner>/<repo>/activity` — shows who actually *pushed*.
4. Only if all three point away from your machine do you have a real incident: rotate credentials, audit collaborators/deploy keys, contact GitHub.

## The rule

Never commit with a placeholder email; verify `git config user.email` (and check for repo-local overrides) before any flow that pushes. Fix: `git config --global user.email "$(gh api user --jq '"\(.id)+\(.login)@users.noreply.github.com"')"`.

## Where it's enforced

- `bun run setup` step 2 — detects placeholder/unset identity AND repo-local shadowing; prints the exact personalized fix (never edits your config silently).
- `scripts/auto-commit.sh` — warns on placeholder identity at commit time; **hard-refuses auto-push** under one.
- `/pr` pre-flight — identity check before anything is staged.
- Ledger line in `BEST-PRACTICES.md` (✅ proven, 2026-07-03). Repo hardening from the same incident: the require-PR ruleset's admin bypass was removed, so direct pushes to main are closed for everyone.
