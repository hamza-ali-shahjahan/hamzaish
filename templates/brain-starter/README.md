# brain-starter

A copyable, minimal memory system for a product repo — markdown files in,
full-text search out, with no infrastructure beyond SQLite (bundled in Bun).
This is the same core Hamzaish's own `brain/` runs on
(`brain/ingest.ts` / `ask.ts` / `freshness.ts` / `schema.sql`), stripped of
everything specific to Hamzaish's own folder layout so it can stand up a
**separate, independent instance** for any other product — first candidate:
Muakkil's founder-brain (each venture's idea, decisions, and build state
needs its own searchable memory, on the same pattern, never sharing a
database with Hamzaish's own).

See Hamzaish's `brain/knowledge/2026-06-20-phase-c-brain-design.md` and
`brain/decision-log/2026-08-29-company-brain-phase-1.md` for where this
pattern came from and what it's scored against (Slite's "Company Brain"
research — 9 real memory systems decomposed into 4 shared components:
getting signals, remembering, dreaming & pruning, speaking & searching).
This starter covers **remembering** and **speaking & searching** — plain
markdown files, FTS5 search, freshness-checked on every query, answers that
say what they didn't cover. It does not do getting-signals (event capture
from other tools) or dreaming-and-pruning (drift detection, time decay) —
add those once you actually need them, the same way Hamzaish did.

## Install

1. Copy this whole folder into your repo as `brain/`:
   ```
   cp -r templates/brain-starter <your-repo>/brain
   ```
2. Write at least one `.md` file somewhere in your repo (a decision log, a
   status page, notes — anything).
3. From your repo root:
   ```
   bun brain/ingest.ts
   bun brain/ask.ts "your first question"
   ```

That's it — no config file, no API keys, no dependencies beyond Bun
(`bun:sqlite` is built in). Everything under your repo root gets indexed
except `node_modules`, `.git`, `dist`, `build`, `.next`, `.turbo`,
`.wrangler`, and any folder starting with `.` or `_`.

Optional — wire it into `package.json` so the commands read like Hamzaish's:
```json
"scripts": {
  "ingest": "bun brain/ingest.ts",
  "ask": "bun brain/ask.ts",
  "brain-freshness": "bun brain/freshness.ts"
}
```

## What you get out of the box

- **`bun brain/ingest.ts`** — indexes every `.md` file, idempotent (hash-based
  change detection), prunes deleted files automatically. `--rebuild` for a
  full reset, `--verbose` to see every file touched.
- **`bun brain/ask.ts "<query>"`** — FTS5 keyword search with BM25 ranking,
  refreshes the index itself if anything moved since the last ingest (so
  answers can't silently lag the files — see `freshness.ts`'s header for
  why this matters). `--source <folder>` scopes to one top-level folder,
  `--json` for machine-readable output, `--no-refresh` to skip the check.
- **Every answer states what it didn't cover** — excluded folders, plus
  whatever a `--source` scope excluded from that specific search. This is
  mechanical disclosure (no LLM step in this script), not a synthesized
  guess — it can't invent a gap that isn't real.

## Customizing the source tags

By default every file is tagged by its top-level folder (`decisions/foo.md`
→ source `decisions`). If you want per-folder rules instead — recursive vs.
not, specific extensions, a special case like Hamzaish's own product-scoped
walk — replace `corpusFiles()` in `corpus.ts`. Hamzaish's own
`brain/corpus.ts` is a worked example of a repo that grew past the simple
default; read it before reinventing the shape.

## What this deliberately doesn't do (yet)

- **No vector search / knowledge graph** — FTS5 keyword + BM25 only. Add a
  vector index only after real usage shows keyword search is the bottleneck
  — Hamzaish's own Phase C is gated the same way (see
  `brain/knowledge/2026-06-20-phase-c-brain-design.md`).
- **No drift / staleness detection** — nothing here notices a doc going
  quiet while still claiming to be current. Hamzaish's own
  `scripts/check-status-staleness.ts` is a worked example if you need one;
  it's product-specific enough (git-log based, reads a `stage`/`status`
  shape) that it wasn't worth genericizing into this starter.
- **No review queue** — this indexes whatever's on disk; who's allowed to
  write those files is your repo's own git workflow, same as it already is.

## The one rule

**This is a new, separate index — never point `BRAIN_ROOT` at Hamzaish's own
repo, and never copy Hamzaish's actual `brain.db`.** Copy the *code* only.
Each product's brain is its own instance, its own database, its own
markdown — that separation is deliberate, not an oversight (see the
decision log entry linked above for why a shared brain-core doesn't mean a
shared brain).
