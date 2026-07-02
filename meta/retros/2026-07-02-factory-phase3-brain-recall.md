# 2026-07-02 — Factory · Phase 3: recall becomes push, the learning loop gets a second scorer and a ratification gate

> Same-day third phase: the brain now injects itself into sessions (`--context` blocks in `/work-on`), product learnings joined the promotion pipeline, and `/learn-loop` promotes only what two independent scorers agree on and the operator ratifies.

## Context

- Goal: the audit's Phase 3 — "compound the brain": recall auto-injected instead of operator-remembered, product learnings merged into the factory stream, learn-loop upgraded to Movement-2 shape (propose → ratify → promote).
- Deliberately NOT attempted: vector embeddings. The zero-dependency principle plus no local embedder makes FTS5 the honest ceiling for now; `--context` extracts more value from the index that exists rather than faking semantics.

## What actually happened

- `brain/ask.ts --context`: a ready-to-inject briefing block — **anti-patterns lead** (defenses are worth more than context), then learnings/decisions, then the rest, with a verify-before-relying footer. Live-tested; new deterministic eval case `brain-ask/context-recall-block` verified PASS and baselined (brain-ask now has 4 cases).
- `/work-on` step 7 rewritten (command + workflow): two recall blocks injected at session start — open threads for the product, and stage-relevant anti-patterns. Recall used to require the operator to remember to ask; now forgetting is impossible.
- `brain/ingest.ts` now indexes `products/*/learnings/` and `products/*/validation/` — the cross-product synthesis gap: product-local lessons were invisible to the brain and to `/learn-loop`. (+5 documents on first re-ingest.)
- `/learn-loop` v2: gathers product learnings as candidates (same-problem-in-2+-products = automatic strong Recurrence); **dual independent scoring** (a fresh-context subagent scores blind to the first scorer; both must clear ≥24/35; disagreements ≥6 logged as signal); **propose → operator batch-ratification → promote** replaces score-and-write-in-one-pass.

## What worked

- The `--context` grouping decision (anti-patterns first) came straight from the audit's observation that anti-patterns are written reactively — surfacing them *before* the work is the cheapest proactive defense available.

## What didn't

- Nothing structural. One honest limitation: FTS recall misses conceptual matches (synonyms, paraphrase). Logged as the known ceiling, revisit if a zero-dep local embedding path appears.

## Open questions / things to revisit

- First real `/learn-loop` run under the new dual-scoring protocol will calibrate how often scorers disagree — revisit the ≥6-point disagreement threshold after 2-3 cycles.
- `--context` injection is wired into `/work-on`; `/builder-mode` and `/full-cycle` kickoffs could inherit the same two-block pattern — revisit in Phase 4 wiring.

## Next

→ **Phase 4: fleet patterns — fan-out blind → adversarially verify → judge synthesis, wired into /validate, /security-check, /review, devils-advocate.**
