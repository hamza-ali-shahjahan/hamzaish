# Products

Your portfolio. One folder per product — **metadata and learnings only** — and it
stays **on your machine**. `products/*` is gitignored, and CI
(`bun run check-user-state`) fails if a product's state is ever committed: this repo
is permanently public, and your roadmap, pricing notes and validation data are yours,
not the factory's. Product *code* never lives here either; it stays in its own repo.

## What's tracked vs what's yours

| Tracked here (the factory's own files) | Yours — local only, never committed |
|---|---|
| `_template/` — the skeleton a new product copies | `products/<slug>/` — every product you register |
| `_smoke/`, `_community/` — CI fixtures, contributed examples | `_portfolio.md` — your snapshot, kept current by `/portfolio-pulse` |
| `README.md`, `SHOWCASE.md` | `_active.local.md` — your current sprint |
| `_portfolio.example.md`, `_active.example.md` — the starters `bun run setup` copies | |

Code locations are wired per-machine in the git-ignored `../code-paths.local.json`
(copy `../code-paths.example.json`). Nothing about where your code lives is published.

## Canonical product skeleton

Every product folder has the same shape (stubs where empty), so the portfolio is
consistent and a hosted UI can map each file to a section:

```
products/<slug>/
  product.config.json   # manifest (required)
  README.md             # overview / the wedge
  scope.md              # what it does AND deliberately doesn't
  status.md             # live status (refreshed by /portfolio-pulse, /work-on)
  learnings.md          # what worked / pitfalls + fix / open questions
  decisions/            # append-only ADRs (0000-template.md to copy)
```

## Add a product

> **Dogfood first.** A product earns a folder here only once we've **actually used it for its real job and it worked for us** — not when its repo merely ships. Until then, keep notes in `brain/learnings/`. See the [Admission Policy](../meta/admission-policy.md) (Gate 1). Community products follow Gate 2 in [`_community/`](./_community/README.md).

```bash
cp -r products/_template products/<slug>   # from the repo root; then fill in the files
# add the slug → local code path to code-paths.local.json (git-ignored)
```

Then run `/portfolio-pulse` to refresh `_portfolio.md`, your generated index of all
products (it starts as a copy of [`_portfolio.example.md`](./_portfolio.example.md)).

## Working on a product (especially in parallel)

Before editing, sync and claim your slice — **`git pull --rebase`, then update the `status.md` "Active sessions" lock**. Running more than one session on the same product? Follow [`../meta/parallel-sessions-protocol.md`](../meta/parallel-sessions-protocol.md): one git worktree + branch per session, partitioned scope, integrate to `main` via PR + CI. The one rule: **pull-before-act, branch-per-session.**

## Learnings → guardrails

Per-product `learnings.md` is rolled up by
`factory/agents/portfolio/cross-product-learner`. When a mistake generalizes, it
gets promoted to a guardrail in the relevant `factory/` agent — so the next build
doesn't repeat it. That feedback loop is the point of this folder.
