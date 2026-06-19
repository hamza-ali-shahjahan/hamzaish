# Factory-change gate — ingested lessons must earn promotion

Connects the **test→ingest loop** (`docs/TOP-50-LEARN-TEST-INGEST.md`) to the **eval harness** that already exists (see [`PLAN.md`](PLAN.md) / [`README.md`](README.md) — brick #1 + LLM judge, live since 2026-06-13). The harness was built to judge skills/agents; this note extends its remit to **factory changes** (new playbooks, anti-patterns, agent upgrades) produced by ingesting other repos.

> **Principle (ported from nanoGPT's eval-driven discipline, entry D1):** a change earns its place by a verdict, not by looking reasonable. An ingested lesson is a *candidate* until it (a) passes the bench and/or (b) is proven on a real product.

## The lifecycle of an ingested lesson

1. **Candidate** — written into `factory/`/`brain/` from a studied repo, with its test + credit. (This is most of Phase 2.)
2. **Bench-checked** — where the lesson changes agent/skill behavior (e.g. handoff contracts, Phase-C retrieval), it must clear the eval bench: `PASS` keeps it, `FAIL_BUILDABLE` sends it back, `GAP`/`UNCERTAIN` pull a human. A retrieval change must **beat the current baseline** (e.g. FTS5-only) or it does not ship.
3. **Product-proven** — where the lesson is a launch/positioning/process pattern (not agent behavior), it's proven by shipping in a real product and showing an effect; the product's retro promotes / corrects / kills it.
4. **Trusted** — promoted lessons are the ones other sessions should rely on. Until then, treat a candidate as provisional in recommendations.

## Hard rules inherited from the harness

- **Agent-blind separation:** the thing being evaluated never sees its own eval case/rubric. An ingested agent upgrade can't author or read its own test.
- **Executable-criterion-or-GAP:** if you can't write a machine-checkable criterion for what the ingested change should improve, that's a `GAP` now — flag it, don't guess.
- **The critic is a gate, not an oracle:** an LLM judge may push a change to `UNCERTAIN`; it may never auto-`PASS`.

## Why this matters for the ingest program
Without a gate, ingestion is just accretion — the repo gets bigger, not better, and bad lessons hide among good ones. The gate is what lets us honestly say the *before→after* strength gains are real, not assumed.

---

**Credit (port the idea, never the code):** nanoGPT / Andrej Karpathy — https://github.com/karpathy/nanoGPT (eval-driven development); the self-evolving brief in `brain/knowledge/2026-06-02-self-evolving-upgrade-brief.md`. See [`docs/LEARN-FROM-REPOS.md`](../../docs/LEARN-FROM-REPOS.md) entry D1.
