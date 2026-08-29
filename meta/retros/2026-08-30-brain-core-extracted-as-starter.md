# 2026-08-30 — Brain-core extracted to a starter · Phase 2 of the Company Brain plan

> Ported `brain/`'s core (ingest/ask/freshness/schema) into `templates/brain-starter/` — deliberately thinner than the original, verified end-to-end in a scratch fake repo before landing.

## Context

- Goal: make Hamzaish's brain pattern reusable by another product (Muakkil) without sharing data.
- Time budget: single session, continuing directly from Phase 1.
- Starting state: the pattern only existed as Hamzaish-specific code with hardcoded folder assumptions.

## What worked

- **Testing in an actual scratch repo, not just reading the code.** Copied the starter into a throwaway folder, wrote real markdown, ran ingest/ask/freshness/rebuild against it. Caught nothing broken, but also confirmed a real design question (does indexing the starter's own README count as noise?) against actual output instead of speculation.
- **Deciding what to cut, not just what to copy.** The Phase-C stub tables, the products-aware corpus walk, and `--context` mode were all Hamzaish-specific weight that a starter shouldn't carry by default — cutting them was itself a call worth logging, not an oversight.

## What didn't

- Nothing broke. The one open question (is indexing the tool's own README noise?) was resolved by checking what Hamzaish's own `corpus.ts` already does — consistency won over a "cleaner" but divergent choice.

## Decisions made

→ `brain/decision-log/2026-08-30-brain-core-extracted-as-starter.md`

## Updates to Hamzaish itself

- **New**: `templates/brain-starter/` (corpus.ts, ingest.ts, ask.ts, freshness.ts, schema.sql, README.md, .gitignore).
- **Bumped Hamzaish version** → `meta/changelog.md`, `2.30.0`.

## Surprises

- None structural — the port was more mechanical than Phase 1's work, since the hard design thinking (freshness-refresh, gap-line) was already done and just needed generalizing.

## Open questions / things to revisit

- **Does Muakkil actually adopt this?** Revisit when it does — that's the real test of whether the cuts (products-aware walk, `--context` mode) were correctly scoped or premature.

## Next

→ **Wait for a real adopter (Muakkil) before building anything further on top of this — Phase 3 (vector/RRF) stays gated on real query data, same as Hamzaish's own roadmap already required.**

---

- [x] Wrote `brain/learnings/2026-08-30.md`
- [x] Logged decision in `brain/decision-log/2026-08-30-brain-core-extracted-as-starter.md`
- [x] Updated `meta/changelog.md`
- [ ] Re-ran `bun brain/ingest.ts` (do after this session's files are final)
- [x] No product stage changed
