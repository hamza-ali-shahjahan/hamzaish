# brain/anti-patterns/

Things we've decided **not** to do, with the reason. Append-only. Filename: one anti-pattern per file, slug-cased (`feature-flags-without-removal-plan.md`).

## Why anti-patterns deserve their own folder

A `learning` says "next time, try X." An **anti-pattern** is stronger: "next time, don't even consider X — here's the wound it left." Anti-patterns get re-read **before** taking an action that pattern-matches them.

## Format

```markdown
---
name: <slug>
description: One-line summary of what not to do
type: anti-pattern
---

# <Title>

## The pattern
What it looks like to do this thing. Recognize it from the outside.

## Why we don't do it
Specific incident or evidence. Without a real story, this isn't an anti-pattern — it's just an opinion. Delete it.

## What to do instead
The replacement behavior. Concrete.

## When this might not apply
The edge case where the anti-pattern doesn't bite. Be honest about exceptions.
```

## Also surface it in the public ledger

Every new anti-pattern gets a one-liner in the root `BEST-PRACTICES.md` under "Never do this" — tip ("Never …"), the dated incident, and a link back to its file here. Update the counts line at the top of the ledger. The wound only protects other builders if they can see it.

## Entries

- `accidental-public-repo.md` — creating a public repo when a private one exists (2026-05-30)
- `inline-comments-in-piped-bash.md` — comments appended to piped bash one-liners (2026-06-04)
- `unbounded-git-in-global-hooks.md` — global git hooks without timeout/fail-open/scope (2026-06-09)
- `silent-dedup-masks-broken-pagination.md` — a dedup/upsert sink hides a broken paginated producer as "running fine" (2026-06-16)
- `stars-are-not-pmf.md` — treating GitHub stars / a vanity launch spike as evidence of product-market fit (2026-06-19)
- `product-code-inside-factory-repo.md` — product code under `products/<slug>/code/` instead of its own sibling repo (2026-06-23)
- `public-repo-without-branch-protection.md` — taking a repo public (or parallel-sessioning it) without branch protection on the default branch (2026-06-23)
- `vision-model-default-context-overflow.md` — two screenshots + a real prompt overflow a local vision model's default 4096-token context → misleading HTTP 400 (2026-06-23)
- `hand-maintained-facts-drift.md` — stating the same fact (count, config value, path, caveat) by hand in multiple places with nothing deriving or checking it (2026-06-28)
- `assuming-provenance-of-a-resolving-command.md` — concluding where a command/skill comes from because it resolves in your session, instead of finding the file that defines it (2026-06-28)
