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

## Add YOUR product as a community example

Hamzaish is the maintainer's lived-in factory — the products at the top level of
`products/` are real (Muakkil, Scope Intelligence, DNSDoctor, etc., each
"built with Hamzaish"). The community-contributed examples live alongside them
in `products/_community/<your-slug>/`.

The point: someone evaluating Hamzaish should see **multiple real portfolios** —
the maintainer's plus verified community ones — not fake `todo-app` examples.

### How to submit

1. **Fork the repo.**
2. **Add `products/_community/<your-slug>/`** with the standard skeleton
   (`product.config.json`, `README.md`, `scope.md`, `status.md`, `learnings.md`,
   `decisions/`). Same shape as the maintainer's products — just one folder deeper.
3. **Prove the product exists and shipped.** Link to one of:
   - Live URL with the product running
   - GitHub repo of the product source
   - npm / PyPI / crates / RubyGems package
   - Screenshot or short screencast (1-2 min)
4. **Open a PR.** The maintainer reviews, verifies the product is real and shipped,
   then merges with a `verified_by: maintainer` + `verified_at: YYYY-MM-DD`
   field in your `product.config.json`.

### Submission format choices

You decide how much to share. Two patterns are common:

- **Full portfolio entry** — same depth as the maintainer's products. Real config,
  scope, status, decisions, learnings. Highest signal for other builders;
  authentic. Choose if you're comfortable being public.
- **Anonymized case study** — keep `product.config.json` minimal (slug, stage,
  one-liner, links). Put the substance in a single `case-study.md` with
  transferable lessons but no proprietary details. Choose if your product is
  pre-launch or competitive-sensitive.

Either works. PR description should say which you're submitting.

### What gets rejected

- "I'm planning to build X" — products in your head don't count. Ship first, then submit.
- Products that don't actually use Hamzaish — the contribution is the factory in action, not
  the factory as an unused badge.
- Anything with secrets, credentials, or proprietary internals (those don't belong here
  regardless — see the golden rule above).

### Why this works

The maintainer's verification is the trust signal. The community gets a real
gallery of "factory-built products"; the maintainer gets concrete evidence of
what builds well (and what doesn't). Both sides earn from the loop.

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

## Licensing of contributions

Hamzaish is **AGPL-3.0** (see [`LICENSE`](../LICENSE)). By submitting a contribution (a PR, a community product example, a learning, a playbook), you agree that:

1. Your contribution is licensed to the project under **AGPL-3.0**, and
2. You **also grant the maintainer the right to license your contribution under other terms**, including a commercial license.

Point 2 keeps the project's dual-licensing model intact: the community gets everything under AGPL, and the maintainer can offer a commercial license to organizations that don't want AGPL's copyleft obligations. Without this grant, accepting outside contributions would lock the project out of commercial licensing — so it's a requirement for any merged PR.

You retain copyright on your own contribution. This is an inbound license grant, not a copyright assignment — you're not signing your work away, just allowing it to be distributed under both AGPL and (potentially) commercial terms.

If you're contributing only a **community product example or a learning** (the most common case), this still applies but is low-stakes — those are descriptions and lessons, not core factory code.
