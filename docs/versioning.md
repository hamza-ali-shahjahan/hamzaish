# Versioning

Hamzaish uses **[Semantic Versioning](https://semver.org)** — `MAJOR.MINOR.PATCH` — with **one source of truth** and a CI guard, so the number can't drift across the repo. (It did once: `package.json` said `1.10.0`, this kind of note said `v1.4`, the changelog said `v1.31`, and the last released tag was `v1.2.0` — four different numbers, nothing reconciling them. Never again — that's what the guard is for.)

**Current version: `2.9.0`** — *MetaHarness ingestion: `/security-check` gains an MCP-config surface dimension backed by a deterministic scanner (`scripts/check-mcp-config.ts` — inline credentials, wildcard allowlists, bypassPermissions, plaintext/unpinned servers) with true-positive + false-positive eval cases on the regression floor; MetaHarness cloned into `references/` with a mining guide; three candidate patterns (score-before-scaffold, Darwin measured-retention, cost-per-dollar) captured in `brain/knowledge/`. Goal contract: `meta/goals/metaharness-ingestion.md`.*

## One source of truth

The version lives in the root [`package.json`](../package.json). Everything else points to it; this file restates it for humans, and [`scripts/check-counts.ts`](../scripts/check-counts.ts) **fails CI** if `package.json` and this file ever disagree, or if `package.json` falls behind the latest released git tag.

> Sub-projects — [`dashboard/`](../dashboard) and [`templates/product-starter-nextjs/`](../templates/product-starter-nextjs) — carry their **own** independent versions. They are *not* the Hamzaish version and aren't governed by this file.

## When to bump

| Bump | Meaning | Bump when… | Examples |
|---|---|---|---|
| **MAJOR** `X.0.0` | A milestone, or a break in how it's used | An identity-level leap, or anything that changes how a user clones / runs / relies on Hamzaish | `1.0.0` first public release · `2.0.0` engine consolidated in-repo (self-contained) |
| **MINOR** `x.Y.0` | A new capability, backward-compatible | You add a skill, command, agent, playbook, guard, or workflow | a new launch playbook; the `check-counts` guard |
| **PATCH** `x.y.Z` | A fix or correction, no new capability | Bug fix, doc correction, a drifted count reconciled, a path-leak closed | fixing a wrong README number |

**Rule of thumb:** if a user has to *do* something different → MAJOR. If they *can* do something new → MINOR. If something they already do just works better → PATCH.

**MAJOR is deliberate** — earned by a milestone, not reached by counting. Decide it; don't let the number creep.

## Changelog entries vs releases

[`meta/changelog.md`](../meta/changelog.md) holds **dated entries** — one per meaningful change, frequent, each with a short `vX.Y` *iteration label*. **Those labels are notes, not releases** — historically they ran ahead of the real releases. Don't renumber the history.

A **release** is a semver git tag, cut at a milestone, bundling every entry since the previous tag. Cut one with [`/release`](../factory/commands/release.md): it picks the next semver, assembles notes from the changelog, bumps `package.json` + this file, tags, and publishes the GitHub Release. That tag is the public "go" moment — separate from day-to-day entries.

## The milestone ladder

| Version | Milestone |
|---|---|
| `1.0.0` | First public release |
| **`2.0.0`** | **Self-contained build OS** — the engineering engine ships in-repo (current) |
| `3.0.0` | *(reserved)* the next deliberate leap — e.g. the brain's self-evolution (Phase C: vector + graph), an activated dashboard, or multi-user |

## For forks and the products you build

The same rules apply to anything you scaffold with Hamzaish: keep the version in **one** `package.json`, bump MAJOR only for milestones/breaks, and let frequent changelog entries roll up into tagged releases. Want the same protection? Copy the version block from [`scripts/check-counts.ts`](../scripts/check-counts.ts) — it keeps your version honest the same way it keeps Hamzaish's.
