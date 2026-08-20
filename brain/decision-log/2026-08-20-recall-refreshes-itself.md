# 2026-08-20 — Recall refreshes itself, and the receipt has to make a call

**Decision.** Two changes to how the factory tells the truth, from one session.

1. **`/brain-ask` refreshes its own index before answering.** A stat-only probe
   (`brain/freshness.ts`) hashes every indexed file's path + size + mtime and compares
   it to a `corpus_fingerprint` stamped at the end of each ingest. Moved → rebuild via
   `brain/ingest.ts` (still the single writer), then answer. ~15ms across 475 files, so
   it is affordable on every query. Escape hatches: `--no-refresh`, `BRAIN_NO_REFRESH=1`,
   and `BRAIN_REFRESH=hash` for content comparison. The walk that decides *what* is
   indexed moved to `brain/corpus.ts` so the indexer and the probe read one list.
2. **The receipt carries a `Recommendation` line** — the single call to make, or the
   literal word `NA`. Added to `hamzaish.md` §5, the session hook (both modes), both
   product templates, and enforced by `bun run check-legibility` (missing line fails;
   so does a hedge that hands the decision back to the reader). Receipt cap ~50 → ~65
   words to pay for the line.

**Why.** Both are the same defect at different altitudes: the system knew something and
failed to put it where the reader would see it.

`ask.ts` answered from whatever the last manual ingest left behind, and mentioned
re-ingesting only in its *no-hits* footer — i.e. in the one case that wasn't dangerous.
A stale index does not return no hits; it returns confident, out-of-date ones. The
freshness design is the idea worth taking from Graft (studied 2026-07-30,
`references/README.md`) — taken as a port, not an adoption; nothing was installed.

The receipt line came from a live failure the same day: a proposal whose recommendation
was present but buried under its supporting analysis, and the operator had to ask for it
outright before it registered. The standing rule to always lead with a
recommendation already existed in prose. Prose decayed. Now it is shape + gate.

**Alternatives considered.**

- *Install Graft itself.* Rejected for now. The July trial spec (one TS repo, pinned,
  pull-mode MCP only, no hooks, no `--deep`) still stands and two of its watch triggers
  have fired — real external users (3.8k stars, 342 forks, 14 contributors vs "2
  effective maintainers"), and a publishing cadence that fell from ~18 npm versions in
  15 days to 4 in 21. But it is still 0.x with zero tagged releases, and its trigger was
  "when the build lane resumes and the operator names a repo." That hasn't happened.
  The port pays off whether or not the tool is ever installed.
- *Compare stored `documents.mtime` instead of a fingerprint.* Rejected: that column
  held wrapped int32 garbage (`st.mtimeMs | 0` overflows epoch-ms — sample values were
  negative), and the content-hash upsert would never have corrected it, so the probe
  would have read stale forever. Fixed the column to `Math.floor` while here, and based
  the probe on a single fingerprint row instead — one comparison, no per-row semantics.
- *Refresh on a timer, or at session start only.* Rejected: both reintroduce a window
  where recall lags the files, which is the whole defect. Refresh-on-read has no window.
- *Make `Recommendation` optional when there's nothing to recommend.* Rejected: optional
  lines get skipped under pressure, which is exactly when a call is worth most. `NA` is
  cheap to write and visibly distinct from having forgotten.

**What would prove it wrong.** If the ~15ms probe becomes a felt cost as the corpus
grows (it is linear in file count) — then cache the walk or scope the probe by source.
If `NA` shows up in receipts where a real call existed, the line has become ritual and
the gate is measuring compliance rather than usefulness. If the stat-mode blind spot
(a same-length edit with a restored mtime, asserted in `brain/freshness.test.ts`) ever
bites in practice, the default flips to hash mode.

**Revisit.** At the next `/learn-loop`: how often the refresh actually fires, and
whether any receipt's `Recommendation` read as filler. The Graft trial stays open on
its original trigger — the operator naming a TypeScript product repo.
