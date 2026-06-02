---
name: accidental-public-repo
description: Creating a public GitHub repo when a private one of the same (or near) name already exists for the project
type: anti-pattern
---

# Accidental Public Repo

## The pattern

User says something like "publish X as a public repo" / "create a repo for Y." Without checking, you (Hamzaish or Claude) create a NEW public repo. Turns out X / Y was already a private repo, OR the request was about a folder that's part of a bigger existing project, OR the name collides with something the user owns elsewhere.

Result: a repo with the wrong scope, wrong name, or wrong visibility ends up on GitHub under the user's account.

## Why we don't do it

**Incident 2026-05-30**: User asked "publish hamzaish as a public repo." A subagent misread this as "publish the `agent-skills` directory" (which lived inside the Hamzaish workspace) and created a brand new **public** repo at `github.com/<user>/agent-skills`. Hamzaish was the much bigger separate thing at `~/Claude/Hamzaish/`, already on GitHub as a **private** repo with the right name.

Reversible — agent-skills was flipped back to private within the hour — but embarrassing. Real-world cost: the public repo briefly indexed by search engines, the URL leaked into one Slack message, decision-thread cost to clean up.

## What to do instead

**Before creating any new repo, run this 3-step check:**

1. **Filesystem search**: `find ~ -maxdepth 4 -type d -iname '*<requested-name>*' 2>/dev/null` — see what already exists locally
2. **Existing remotes search**: `gh repo list --json name,visibility --limit 200 --jq '.[] | select(.name | test("<requested-name>"; "i"))'` — see what already exists on the user's account
3. **Ask the user to disambiguate IF EITHER search returned a hit**: "I see `<existing-name>` already at `<path>` / on GitHub as `<visibility>`. Are you asking me to (a) push to that existing repo, (b) create a separate new repo because the existing one is different, or (c) something else?"

The cost of asking: zero. The cost of getting it wrong: reversible-but-embarrassing.

**Defaults that reduce risk:**
- When in doubt, **create the new repo as private**. Flipping private→public is fast; the other direction has reputational cost.
- When the user says "publish X" without specifying public vs private, **ask** if the repo doesn't exist yet. If they've already created it, use what they made.
- When the user says "publish as public," still do the existence check — they may mean "publicize the EXISTING one I've been working on," not "create a new public one."

## When this might not apply

- If the user explicitly names the repo URL or full slug (`github.com/me/exact-name`) AND the existence checks come back clean, just create it.
- If the user has said "yes I want a brand new repo" explicitly to a clarifying question, proceed.

## Related

- See `factory/playbooks/launch-stage/oss-publishing-checklist.md` for the full publish flow (this rule is the very first step).
- See `meta/retros/2026-05-30-wp-to-astro-shipping.md` §Phase 1 for the original incident.
