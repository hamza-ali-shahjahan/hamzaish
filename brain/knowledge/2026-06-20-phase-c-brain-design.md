# Phase-C brain design — ported patterns from gbrain, Letta, mem0

Design brief for upgrading the brain from "markdown + FTS5 index" to a retrieval layer that actually reasons about what it knows. Ingested from the three best-in-class memory repos in our [study syllabus](../../docs/LEARN-FROM-REPOS.md) (entries B1/B3/B4). **Blueprint, not yet built** — this is the spec Phase C implements.

## Three patterns to adopt

### 1. Hybrid retrieval with reciprocal-rank fusion (from gbrain)
Today `/brain-ask` is FTS5 keyword-only. Phase C: run **vector + BM25 in parallel and fuse with RRF** (reciprocal rank fusion), optional rerank. gbrain reported **+31.4 P@5 over vector-or-BM25 alone** on its own bench — so this is measurable, not faith-based, and we prove it on our own eval bench before promoting (see [`meta/evals/factory-change-gate.md`](../../meta/evals/factory-change-gate.md)).
- RRF formula: `score(d) = Σ 1 / (k + rank_i(d))` across rankers, `k≈60`. Cheap, no training.

### 2. Answers that state their own gaps (from gbrain)
Every `/brain-ask` answer must end with **"what the brain doesn't know yet"** — the explicit gap line. This is the highest-trust feature: an answer that admits its blind spots is one you can act on. It also feeds the learning loop (a named gap is a to-do).

### 3. Memory paging + score-before-persist (from Letta + mem0)
- **Letta:** treat the context window as RAM and the markdown store as disk — **page** relevant brain slices in per query instead of loading wholesale.
- **mem0:** **score what's worth remembering before persisting** — don't append everything flat. Reuse our existing rule (*surprise is highest-signal*; see `meta/learning-loop-rubric.md`) as the scoring function.

## What stays the same
Markdown remains the source of truth; the index is derived and gitignored (regenerate any time). We never run gbrain's process inside Hamzaish — we **port the patterns**, write our own, and keep `references/` read-only.

## Implementation order (when Phase C starts)
1. Add a vector index alongside FTS5; wire RRF fusion into `/brain-ask`.
2. Add the mandatory gap line to the answer format.
3. Add scoring at write-time to `brain/learnings/` ingestion.
4. Add paging once the store is large enough to need it.
5. Gate each step on the eval bench (must beat FTS5-only, or it doesn't ship).

---

**Credit (port the idea, never the code):** gbrain — https://github.com/garrytan/gbrain (cloned in `references/gbrain`); Letta — https://github.com/letta-ai/letta; mem0 — https://github.com/mem0ai/mem0. See [`docs/LEARN-FROM-REPOS.md`](../../docs/LEARN-FROM-REPOS.md) entries B1/B3/B4 and `references/README.md`.
