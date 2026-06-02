# Contributing

Hamzaish is built to be opened up to collaborators without anyone exposing their
secret sauce. The rule that makes that safe: **this repo holds metadata and
learnings, never product code.**

## The golden rule: keep code out

- Product source code lives in its **own (usually private) repo**.
- This repo only ever gets a product's *metadata* and *learnings*.
- Wire your local code location in **`code-paths.local.json`** (git-ignored —
  copy `code-paths.example.json`). It never gets committed, so your paths and the
  existence of your private repos stay yours.

If you ever find yourself pasting code, an API key, a `.env`, or a proprietary
internal into a product folder — stop. It doesn't belong here.

## Add a product

```bash
cp -r products/_template products/<slug>     # fill in the files
# then add  "<slug>": "/path/to/your/code"  to code-paths.local.json
/portfolio-pulse                              # refresh products/_portfolio.md
```

Fill in: `product.config.json` (manifest), `README.md` (the wedge), `scope.md`
(does / deliberately-doesn't), `status.md`, and start a `learnings.md`.

## Add a learning (the most valuable contribution)

In `products/<slug>/learnings.md`, capture the **transferable lesson**, not the
proprietary how:

- ✅ "Batching the outbound calls behind a queue cut failures ~40%."
- ❌ the exact proprietary algorithm / config that is your moat.

What worked · what bit us + the fix · open questions. If a pitfall generalizes
beyond one product, note it — it's a candidate to become a guardrail in a
`factory/` agent (see [the learnings loop](./architecture.md#the-learnings--guardrails-loop)).

## Workflow

- **Branch + PR.** Never push to `main` directly — this repo has an autonomous
  heartbeat GitHub Action that commits to `main`, so direct pushes race it.
- Keep PRs scoped; update `meta/changelog.md` when you change how the factory
  itself behaves.
- Use a **noreply git email** for commits (GitHub rejects pushes that expose a
  private email).

## What belongs where

| You want to… | Put it in |
|---|---|
| Explain *why* the system is designed this way | `docs/` |
| Record a product's status / decisions / lessons | `products/<slug>/` |
| Change how the factory acts (a skill/agent/command) | `factory/` |
| Capture a cross-product principle or anti-pattern | `brain/` |
| Note what changed in the factory itself | `meta/changelog.md` |
