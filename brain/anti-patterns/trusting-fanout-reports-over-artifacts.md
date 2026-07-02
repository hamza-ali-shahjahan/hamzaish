# Anti-pattern: acting on a fan-out report's per-file claim without reading the file

**Date:** 2026-07-02 · **Incidents:** two, same day, same audit

## What happened

A five-subagent fan-out audit of the factory produced per-file claims. Two were confirmed false on direct read:

1. It reported the three engineering agents as **"no frontmatter — format outliers."** All three had correct frontmatter. A planned fix was cancelled only because the files were read before editing.
2. It reported `factory/runtime/loop.ts` as **unfinished ("// TODO: wire orchestrator")**. The file had zero TODOs — complete, tested, with its remaining scope deliberately documented in its own README. The "finish the runtime" phase of the roadmap was re-scoped on contact with the file.

Both claims were plausible, specific, and wrong.

## The trap's shape

- Fan-out inventories are optimized for **coverage**, not per-file precision — a subagent skimming 40 files under a token budget paraphrases, pattern-matches, and occasionally confabulates a detail that *sounds* like what such a file would contain (a TODO comment, a missing header).
- The report's precision *format* (exact paths, line references, counts) borrows credibility the underlying read didn't earn.
- The failure compounds silently: an edit "fixing" a healthy file damages it, and a roadmap built on a phantom gap spends real effort on the wrong brick.

## The rule

**A fan-out report's per-file claim is a lead, never an edit instruction.** Before editing, fixing, or planning against any specific claim from a multi-agent report (audit, inventory, review sweep): `Read` the artifact itself. Check the claim against the file, not the report about the file. Same family as [`assuming-provenance-of-a-resolving-command.md`](assuming-provenance-of-a-resolving-command.md) — verify the artifact, not the story.

Aggregate-level findings (counts, structural patterns, "this layer lacks X") degrade gracefully; **per-file specifics are where confabulation concentrates.** Trust the shape, verify the pixels.

## Where it's enforced

Promoted by `/learn-loop` 2026-07-02 (composite 30/35 + fresh-eyes 27/35). Ledger line in `BEST-PRACTICES.md` → "Never do this" (✅ proven). The `[SCORED]` block with predicted gain + feedback date: `brain/learnings/2026-07-02.md`.
