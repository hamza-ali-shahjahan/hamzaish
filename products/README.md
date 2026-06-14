# Products

The portfolio. One folder per product — **metadata and learnings only**. Product
*code* never lives here; it stays in its own (often private) repo. This folder is
the shareable layer: safe to back up publicly and, later, safe for collaborators
to contribute to without exposing anyone's secret sauce.

## What's public vs private

| Lives here (shareable) | Stays private (never committed here) |
|---|---|
| `product.config.json` — manifest (no secrets; analytics IDs only) | Source code, algorithms, the actual build |
| `README.md`, `scope.md` | API keys, credentials, `.env` of any kind |
| `status.md`, `decisions/` | Customer data, proprietary internals |
| `learnings.md` — *transferable* lessons | The specific "how" that is your moat |

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
cp -r _template products/<slug>          # then fill in the files
# add the slug → local code path to ../code-paths.local.json (git-ignored)
```

Then run `/portfolio-pulse` to refresh [`_portfolio.md`](./_portfolio.md), the
generated index of all products.

## Working on a product (especially in parallel)

Before editing, sync and claim your slice — **`git pull --rebase`, then update the `status.md` "Active sessions" lock**. Running more than one session on the same product? Follow [`../meta/parallel-sessions-protocol.md`](../meta/parallel-sessions-protocol.md): one git worktree + branch per session, partitioned scope, integrate to `main` via PR + CI. The one rule: **pull-before-act, branch-per-session.**

## Learnings → guardrails

Per-product `learnings.md` is rolled up by
`factory/agents/portfolio/cross-product-learner`. When a mistake generalizes, it
gets promoted to a guardrail in the relevant `factory/` agent — so the next build
doesn't repeat it. That feedback loop is the point of this folder.
