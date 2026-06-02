# Architecture

Hamzaish is a markdown-first, Claude-Code-native monorepo. It separates **what it
knows**, **how it acts**, **what it's working on**, and **how it improves**.

## The layers

| Layer | Role | What's inside |
|---|---|---|
| `brain/` | What you know | identity, persona, operating principles, learnings, anti-patterns, decision log, ingested knowledge |
| `factory/` | How you act | agents by stage (`idea/ mvp/ launch/ scale/ portfolio/`), commands, skills, workflows, playbooks |
| `products/` | What you're working on | one folder per product — **metadata + learnings only** |
| `meta/` | How you improve | changelog, retros, evals, factory-improving-factory rules |
| `templates/` | Scaffolding | starter app + doc templates for new products |
| `dashboard/` | Telemetry | a small Next.js pane that reads the product registry |
| `references/` | Study only | external repos cloned for inspiration — never imported |
| `stack/` | Tech defaults | ADRs for the bootstrapped stack |
| `_archive/` | Old versions | preserved verbatim, never edited |

## The per-product skeleton

**Every** `products/<slug>/` has the same shape — stubs where empty. Consistency
is deliberate: it turns the folder into a *contract* (you and collaborators always
know where things go) and lets a future hosted UI map each file to a screen.

```
products/<slug>/
  product.config.json   # the manifest (slug, stage, status, links, stack…)
  README.md             # overview / the wedge
  scope.md              # what it does AND deliberately doesn't (the anti-scope-creep guard)
  status.md             # live status — refreshed by /portfolio-pulse and /work-on
  learnings.md          # what worked / pitfalls + fix / open questions
  decisions/            # append-only ADRs (copy 0000-template.md)
```

New product = `cp -r products/_template products/<slug>`. The dashboard's
`registry.ts` loads every folder that has a `product.config.json` and isn't
prefixed with `_`, so `_template/` is ignored automatically.

> **Why a dedicated `scope.md` instead of folding it into the README?** For a
> system meant to grow into a community (and a hosted product), one-file-per-
> concern is the better trade: predictable structure beats a lean README when
> many people contribute and a UI renders each section.

## The public/private boundary — protecting your secret sauce

This is the most important design decision. **Product *code* never lives in this
repo.** This repo holds metadata and learnings — the *shareable* layer. The code
(your actual moat) stays in its own, usually private, repo.

| Lives here (shareable / backupable / open to collaborators) | Stays private (never committed here) |
|---|---|
| `product.config.json`, `README.md`, `scope.md` | source code, algorithms, the build |
| `status.md`, `decisions/` | API keys, credentials, any `.env` |
| `learnings.md` — *transferable* lessons | customer data, proprietary internals |

How code is wired without committing anything machine-specific:

- **`code-paths.local.json`** (git-ignored) maps `slug → where the code lives on
  *this* machine`. Each person has their own; it never leaves their laptop.
- **`code-paths.example.json`** (committed) is the template.

The result: the repo contains **zero code and zero machine paths**, so it's safe
to back up publicly and safe to open to collaborators — nobody's secret sauce is
exposed, and a contributor points their own local file at their own private code.

> **Why we dropped committed symlinks.** The old design committed `-code`
> symlinks pointing at absolute paths like `/Users/hamza/Claude/…`. Those broke
> on every machine but one and doubled the folder to 28 entries. Storing the
> mapping as git-ignored local data fixes portability *and* the leak risk.

## The learnings → guardrails loop

```
build a product ──▶ write products/<slug>/learnings.md (worked / pitfall + fix)
        ▲                              │
        │                              ▼
   next build is        factory/agents/portfolio/cross-product-learner
   safer ◀── promote generalizable pitfalls to a guardrail in a factory/ agent
                        + log it in meta/changelog.md
```

This is what makes the factory compound: lessons don't sit in a doc, they become
behavior the next build inherits.
