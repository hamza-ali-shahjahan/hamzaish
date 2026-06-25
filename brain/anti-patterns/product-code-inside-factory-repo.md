---
name: product-code-inside-factory-repo
description: Putting a product's actual code under products/<slug>/code/ (inside the always-public Hamzaish repo) instead of in its own sibling repo registered in code-paths.local.json
type: anti-pattern
---

# Product code inside the factory repo

## The pattern

You scaffold a new product and put its **code** at `products/<slug>/code/` — inside
the Hamzaish repo. It feels natural: `/scaffold`'s file-tree even drew a `code/`
node, and the product's metadata already lives at `products/<slug>/`. But Hamzaish
is **always public**, and there is **no `.gitignore` rule** excluding
`products/*/code` — so that code is on track to be committed straight into the public
factory repo, with the wrong history, wrong license, and wrong visibility.

## Why we don't do it

**Incident 2026-06-23**: ship-guard (a security tool) was scaffolded with its scanner
at `products/ship-guard/code/` — *inside* the public Hamzaish tree. Sibling product
repolish, birthed the same day, did it right: its own repo at `~/Claude/Repolish`,
path in the gitignored `code-paths.local.json`, nothing under `products/repolish/`
except metadata. The only reason ship-guard's code didn't leak is that the Hamzaish
root carries `.no-auto-commit` and no `.auto-push`; on any normal auto-push repo the
nested code would have gone public on the next turn. Root cause: **`/scaffold`'s
`products/<slug>/code/` layout contradicted the standing rule** in `CLAUDE.md` /
`factory/commands/hamzaish.md` — *"a new product is its OWN repo; never paste product
code into this repo."* Two instructions disagreed, and the tool's drawing won.

The split that's actually correct (and that repolish follows):
- **Metadata → Hamzaish**, committed as showcase: `products/<slug>/` holds
  `product.config.json`, `scope.md`, `goal.md`, `status.md`, `decisions/`,
  `validation/`, `learnings.md`, `README.md`, `CLAUDE.md`. Markdown + JSON only.
- **Code → its own repo**, *outside* Hamzaish: e.g. `~/Claude/<Name>`, its own
  `.git`, registered in gitignored `code-paths.local.json` under the slug.
  `product.config.json` keeps `code_path: null` (path-portability rule).

## What to do instead

**When scaffolding a product that will become its own (eventually public) repo:**

1. Create the metadata folder in Hamzaish: `cp -r products/_template products/<slug>`.
2. Create the **code in a sibling repo** outside Hamzaish (`~/Claude/<Name>`), `git init`
   it there. Held local until publish → add `.no-auto-push` (no remote yet).
3. Register the absolute path in `code-paths.local.json` under the slug; leave
   `code_path: null` in `product.config.json`.
4. **Never** create `products/<slug>/code/` (or `src/`, `bin/`, `app/`, `dist/`) with
   real source in it. `bun run check-product-layout` enforces this.

## When this might not apply

- A tiny inert *example* snippet inside a doc (fenced code in a `.md`) is fine — that's
  documentation, not the product's code tree.
- The `dashboard/` and `templates/` trees are Hamzaish's *own* code and belong in this
  repo; this rule is about a *product's* code, under `products/`.

## Related

- `factory/skills/scaffold/SKILL.md` — fixed to scaffold code as a sibling repo.
- `scripts/check-product-layout.ts` — the mechanical guard (CI + `bun run`).
- `brain/anti-patterns/accidental-public-repo.md` — the adjacent "wrong repo went public" failure.
- `code-paths.example.json` / `code-paths.local.json` — the slug→path map.
