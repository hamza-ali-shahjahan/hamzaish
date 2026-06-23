---
name: public-repo-without-branch-protection
description: Taking a repo public (or running parallel sessions on it) without branch protection on the default branch — plus the silent "Active but not applied" ruleset trap
type: anti-pattern
---

# Public repo without branch protection

## The pattern

We take a repo public — or start running multiple concurrent sessions/agents on it — and never put **branch protection** on the default branch. "Branch-first" stays a *convention* (Operating Principle #14) with nothing enforcing it: a force-push, a branch deletion, or an accidental direct-to-`main` push is still possible. Protection gets added **reactively**, only after the user notices and asks "why isn't `main` protected?"

It's a missing step in the go-public / repo-setup flow that we don't surface automatically.

## Why we don't do it

**Incident 2026-06-22 (local-llm-setup):** the repo was public, the link shared publicly, AND multiple Claude sessions were pushing to it — yet `main` had **zero** protection. Branch-first was only discipline; anyone (including an AI session pushing *as* the user) could force-push or hard-reset `main`. The user had to prompt for it; we added a ruleset after the fact.

Contrast — **Hamzaish was already protected** (`protect-main-production`: active, targets `main` + `production`, rules `deletion` + `non_fast_forward`, empty bypass). That's the right pattern; the failure was not propagating it to *every* public/multi-session repo by default.

## The silent trap: "Active" ≠ "applied"

A GitHub **ruleset** can be saved, show a green **Active** badge, and still protect **nothing** — if you never select a **target branch**, GitHub shows: *"This ruleset does not target any resources and will not be applied."* A no-op that looks done. **Always set the target (Include default branch) and confirm that warning is gone** before trusting it.

## What to do instead

**Make branch protection a first-class step of going public / setting up any multi-session repo** — surface it automatically, don't wait to be asked. Two tiers:

- **Floor (every repo you still touch — zero friction):** block force-pushes (`non_fast_forward`) + restrict deletions (`deletion`) on the default branch.
- **Full (active, multi-session repos with CI):** + require a pull request before merging + require status checks to pass.

Config that bites if you get it wrong:
- **Set the target branch** (`~DEFAULT_BRANCH`) or it's the no-op above.
- **Solo maintainer → required approvals = `0`.** GitHub won't let you approve your own PR; requiring 1 deadlocks you out of merging.
- **Bypass list empty.** Add yourself/admin (or an app) and your AI sessions pushing *as you* skip the rules — toothless. Leave it empty; flip the ruleset to `Disabled` for a genuine emergency.
- A ruleset protects **branches, not visibility** — repo visibility is a separate setting that no ruleset guards. (See [[accidental-public-repo]].)

This *enforces* Operating Principle #14 (branch-first) at the platform level instead of relying on memory.

## Apply it via API (no dashboard needed)

```
gh api repos/<owner>/<repo>/rulesets -X POST --input - <<'JSON'
{ "name": "protect-main", "target": "branch", "enforcement": "active",
  "bypass_actors": [],
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "rules": [ { "type": "non_fast_forward" }, { "type": "deletion" } ] }
JSON
```

Verify after: `gh api repos/<owner>/<repo>/rulesets --jq '.[].name'` and confirm there's no "does not target any resources" warning in the UI.

## When this might not apply

- A throwaway/scratch repo nobody else touches and you don't mind resetting — the floor is still cheap, but skip the full PR flow.
- A repo with genuinely one human, one session, and no public exposure — lower urgency (force-push/delete protection is still ~free).
