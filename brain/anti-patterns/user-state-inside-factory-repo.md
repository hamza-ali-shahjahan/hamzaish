---
name: user-state-inside-factory-repo
description: Committing a user's product STATE (status, scope, learnings, decisions, validation notes) into the permanently-public Hamzaish repo, because the documented registration step creates those folders inside the repo itself
type: anti-pattern
---

# User state inside the factory repo

## The pattern

The factory and the portfolio share one git repo. `cp -r products/_template
products/<slug>` — the documented registration step — creates the new product's
folder **inside the Hamzaish repo**, and `products/` is tracked. So every
`status.md`, `scope.md`, `learnings.md`, `decisions/*.md` and `validation/*.md`
a user writes is committed and published, by default, with no one deciding it
should be.

It hides well because it looks like dogfooding: the maintainer's own products
in the maintainer's own repo reads as a showcase. It is not a showcase — it is
the tool's repo doubling as one user's private working directory.

## Why we don't do it

**Incident 2026-09-13**: a routine registration (a new product, `flybrain`)
surfaced that `products/` held **194 tracked files across 23 real products** in a
repo that is permanently public with 8 stars. No secrets and no personal data
were exposed — the one email address found was `onboarding@resend.dev`, a public
test sender — but roadmaps, pricing thinking, "paying customer" notes, churn
discussion and strategy ADRs were all public, and four more products
(`bids-town`, `claim-the-mug`, `gethired`, `samepageos`) were staged to follow.

The forward-facing defect is the serious one. **A stranger who installs Hamzaish
inherits this design.** They follow the documented step, their portfolio lands
inside a git repo they may push or fork, and the tool has silently made their
private work publishable. A tool must never put its user in that position.

The sibling guard `check-product-layout.ts` already existed and explicitly
*allowed* this: it forbids product **code** in the repo and permits product
**metadata**. That distinction was the blind spot. Metadata is user data.

## Instead

Treat the person running the factory as a **user of it, never its builder** —
on every machine, including the maintainer's. The tool ships; the portfolio stays.

- `products/*` is gitignored; only the factory's own fixtures (`_template/`,
  `_smoke/`, `_community/`, and the loose docs) are tracked.
- `bun run check-user-state` fails CI if any user product state is tracked, and
  prints the exact `git rm -r --cached` lines to fix it.
- Docs (`architecture.md`, `contributing.md`) and the registration guardrail in
  `factory/commands/hamzaish.md` all now say the folder is user-local.

## The deeper rule

**A tool's repo is not its user's workspace.** When the two share a directory,
the default must be that user data is invisible to git — not that the user
remembers to exclude it. `git` keeps config in `~/.gitconfig`, not in the repo
it operates on; the same separation belongs here.

## Known remaining gap

Products still physically live at `products/<slug>/` inside the repo folder —
ignored, but co-located, so a `git add -f` or a confused fork can still reach
them. The durable fix is a real workspace split (`$HAMZAISH_WORKSPACE`, default
`~/.hamzaish/`) resolved by the ~65 call sites that hardcode `products/`. Staged
deliberately: the ignore + guard stops all future exposure today at a fraction of
the cost, and the move is a mechanical refactor that can land on its own.
