---
description: Search the Hamzaish brain — learnings, decisions, playbooks, product docs. Use for "what did we decide about X" / "have we seen this before" recall, or before re-deriving something. Returns ranked citations with snippets.
argument-hint: "<query>" [--product slug] [--source path] [--limit N]
---

The user invoked: `/brain-ask $ARGUMENTS` — or you reached for recall yourself (a cross-cutting question, a past decision, the start of a fresh session on an unfamiliar product).

1. If the query is empty, ask the user what they want to find.
2. Query (via `Bash`) — it refreshes the index itself before answering, so there is no reindex step to remember:
   ```
   bun ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/brain/ask.ts $ARGUMENTS
   ```
   A `⟳ index was behind the files — refreshed` note on stderr is normal and means it caught up before answering. Scoping when results are noisy: `--product <slug>`, `--source brain/learnings`, `--limit 4 --json`. Phrase-quote for exact wording (`"Sean Ellis target"`); multi-word terms are OR'd and BM25-ranked.
3. Show the markdown output as-is — it's already formatted with citations (path + source tag + score + snippet).
4. `Read` the top 2–3 hits before answering, and cite the source file paths so the user can verify.
5. If results are empty, they are empty against a just-refreshed index — treat it as genuinely uncharted and retry with broader terms, not as a missed reindex.

## What you don't do

- Don't run `brain/ingest.ts` first "to be safe" — ask refreshes itself, and the extra run is pure latency. Run it directly only to rebuild on demand.
- Don't paraphrase from snippets alone — snippets are 18 tokens of context, not the full picture. `Read` the hits.
- Don't substitute brain-ask for reading a file the user named directly. brain-ask is for discovery, not retrieval-by-path.

Sources: `brain/README.md` (what's indexed, how it works), `brain/schema.sql` (the database shape).
