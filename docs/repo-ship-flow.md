# Spec — one-command repo-ship (`/pr`) + branch protection

> **Status:** spec (recommend-only). Nothing built, no GitHub settings changed. Build is gated on operator approval.
> **Problem it solves:** the "correct" git flow has ~7 concepts (branch, PR, CI, merge, squash, tag, release). A new user — most Hamzaish users, and the maintainer himself — bounces off all of them. This makes the *safe* flow feel like the *simple* one: pro-grade safety, one step to learn.

## The promise

- You type **one thing**. Your change lands on public `main` with **CI green** and **clean history**, and the 7 concepts stay hidden.
- Breaking `main` by accident becomes **impossible** — a guardrail enforces it, so you don't have to remember anything.
- This is the same principle Hamzaish already uses for [`/ship`](../CLAUDE.md) and [`/go-live`](../factory/skills/go-live/SKILL.md): *encode the discipline, hide the ceremony.*

## Two parts

### Part 1 — The guardrail (one-time): branch protection on `main`
The safety net that thinks for you, so direct-to-main mistakes can't happen. Solo-tuned settings:

| Setting | Value | Why |
|---|---|---|
| Require a pull request before merging | on, **0 required approvals** | Forces the PR (so CI runs first) but lets you self-merge — no second human needed. |
| Require status checks to pass | the `ci.yml` job(s) | `main` can never go red; CI gates every change. |
| Require branch up to date before merge | on | No silently-stale merges. |
| Block force-push + deletion on `main` | on | `main` can't be rewritten or wiped by accident. |
| Enforce on admins | **off (for now)** | Keeps an escape hatch — you can fix `main` by hand in a real emergency. Flip on once comfortable. |

One-time setup (exact CI context name read from `ci.yml` at build):
```
gh api -X PUT repos/hamza-ali-shahjahan/hamzaish/branches/main/protection \
  -F 'required_status_checks[strict]=true' \
  -F 'required_status_checks[contexts][]=<ci-job-name>' \
  -F 'enforce_admins=false' \
  -F 'required_pull_request_reviews[required_approving_review_count]=0' \
  -F 'restrictions=null'
```
Fully reversible (`-X DELETE …/protection` removes it).

### Part 2 — The command: `/pr` (every change)
**Name recommendation: `/pr`** — shortest, = "make the PR happen." (Alt: `/repo-ship`. Distinct from `/ship`, which deploys a *product* to production — a different axis.)

What it does, end to end, from a dirty working tree:
1. **Pre-flight** — confirm there are changes; secret-scan staged diff (gitleaks/grep) and **abort if a secret appears**; confirm which files are in scope.
2. **Branch** — create `change/<slug>-<date>` off `main`.
3. **Commit** — real message auto-drafted from the diff.
4. **Push** the branch.
5. **Open the PR** — title + body auto-written from the commit/diff.
6. **Wait for CI** — poll until green. **Red → stop**, show the failing check, offer to fix. Never merges a red PR.
7. **Squash-merge** into `main` (one tidy commit), delete the branch.
8. **Sync** local `main`.
9. **(Optional) Release** — if this is a release point, `git tag` + GitHub Release with notes. *This is where the [release-cadence-as-content](../factory/playbooks/launch-stage/release-cadence-as-content.md) lesson plugs in: each release = one content atom.*

**Teaching mode (default for new users):** each step prints one plain-English line in the user's vocabulary — *"Opening a proposal (PR) so the checks can run before this touches main…"* — so they learn by watching, not by reading docs. Links to the one-screen explainer (the table + diagram).

## Safety / edge cases
- **CI red** → never merges; surfaces the failing job.
- **Behind `main` / conflict** → auto-rebase; if it can't resolve, stop and explain.
- **Secret detected** → abort before anything leaves the machine.
- **Nothing to commit** → clean no-op with a message.
- **Parallel session active** (we have one — cowork) → rebase before merge; `/pr` is conflict-aware.

## Non-goals
- Not a product production deploy — that's `/ship`.
- Not a multi-reviewer team flow — 0 approvals, self-merge by design.
- Doesn't replace `wip(auto)` local snapshots — those stay as restore points and never reach `main`.

## Build plan (when you say go)
1. Apply Part 1 branch protection (one `gh` call, reversible) — pulling the real CI job name from `ci.yml`.
2. Write `factory/commands/pr.md` (+ symlink into `.claude/commands/`), with teaching-mode output.
3. Add a `brain/learnings/` entry + credit (ports the branch→PR→squash discipline; credit: GitHub Flow + the squash-merge convention).
4. Dogfood it on a trivial change (this spec could be the first `/pr`).

---
**Credit (port the idea, never the code):** GitHub Flow (branch → PR → CI → squash-merge) — the industry-standard lightweight flow; squash-merge for clean history. Pairs with the release-cadence lesson ported from immich/AppFlowy/Plane.
