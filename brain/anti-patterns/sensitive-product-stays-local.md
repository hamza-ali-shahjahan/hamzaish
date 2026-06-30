---
name: sensitive-product-stays-local
description: Creating products/<slug>/ metadata in the always-public Hamzaish repo for a sensitive product (a competitor replica, a private/stealth build) — publishing the existence + plan of the build into a public repo
type: anti-pattern
---

# A sensitive product's metadata stays local too

## The pattern

The factory convention is: every product gets a `products/<slug>/` metadata folder in
Hamzaish (config, scope, decisions, status, learnings), committed as showcase, while only
the *code* lives in a sibling repo. That's right for an ordinary product. But for a
**sensitive** one — a **competitor function-replica**, a stealth/private build, anything
whose *existence or plan* you don't want public — committing `products/<slug>/` publishes
exactly that: "we are building a clone of X, here is the scope and the decision log." And
**Hamzaish is forever-public**, so it's published the moment it's pushed.

## Why we don't do it

This collides head-on with two standing invariants: *Hamzaish is always public*, and
*never commit our strategy/discussion into a repo*. A `products/articos-replica/` folder
with a decision log describing the clone is competitive strategy in a public repo.

**Case 2026-06-30 — synthux.** Asked to build a function-replica of articos.com, the
factory deliberately did **not** create `products/synthux/` in Hamzaish. The product +
all its metadata, decisions, and plan live entirely in its own local repo at
`/Users/hamza/Claude/synthux`, wired in **only** via the gitignored
`code-paths.local.json`. Nothing about the replica reached the public factory.

This *extends* `product-code-inside-factory-repo` (code stays out): for a sensitive
product, the **metadata stays out too**.

## What to do instead

1. Create the product as its own **local** repo (`~/Claude/<Name>`), `git init`, with
   `.no-auto-push` until/unless it's ever meant to go public.
2. Register it **only** in the gitignored `code-paths.local.json` (slug → absolute path).
   The factory still "knows" the product locally; the public repo does not.
3. Keep its decisions/scope/learnings **inside that local repo**, not in `products/`.
4. If it later becomes a public product, rename off any placeholder/competitor codename
   (`/name-product`), scrub history, confirm original copy/branding — *then* (optionally)
   add a public `products/<slug>/` showcase folder.

## When this might not apply

- An ordinary, non-sensitive product you're happy to show: the normal split applies —
  metadata in `products/<slug>/` (showcase), code in its sibling repo.
- A product already public under its own name: its showcase metadata is fine to commit.

## Related

- `brain/anti-patterns/product-code-inside-factory-repo.md` — code stays out of the factory.
- `brain/anti-patterns/accidental-public-repo.md` — the adjacent "wrong thing went public" failure.
- `code-paths.local.json` — the gitignored slug→path map that wires a product in without committing it.
- `factory/commands/swarm.md` — `/swarm` honors this for replica/sensitive builds.
