---
name: brain-ask
description: Query Hamzaish's brain — search across learnings, decisions, playbooks, product docs, and configs. Returns ranked citations with snippets.
---

# brain-ask

## When you activate

- User asks a cross-cutting question: "what did we decide about X", "what's the muakkil status", "have we seen this anti-pattern before"
- You (Hamzaish) need to recall something from a past session, learning, decision, or playbook
- Before re-deriving something — check whether the answer already exists
- At the start of a fresh session on an unfamiliar product

## What you produce

Ranked markdown citations from the brain, each with:
- file path (so the user can click through or you can `Read` it next)
- source tag (brain/learnings, products/<slug>/decisions, factory/playbooks, etc.)
- BM25 relevance score
- snippet showing matched terms in context

## Protocol

1. **Refresh the index if needed.** If files have changed since the last ingest (recent writes, new product registered, fresh learning), run:
   ```
   bun /Users/hamza/Claude/Hamzaish/brain/ingest.ts
   ```
   It's idempotent and fast (~50ms).

2. **Query.** Shell out to:
   ```
   bun /Users/hamza/Claude/Hamzaish/brain/ask.ts "<query>"
   ```
   Or scoped:
   ```
   bun /Users/hamza/Claude/Hamzaish/brain/ask.ts --product <slug> "<query>"
   bun /Users/hamza/Claude/Hamzaish/brain/ask.ts --source brain/learnings "<query>"
   bun /Users/hamza/Claude/Hamzaish/brain/ask.ts --limit 4 --json "<query>"
   ```

3. **Read the top hits.** The output gives you paths — use `Read` on the top 2–3 most relevant before answering.

4. **Cite back to the user.** When you answer, include the source file paths so they can verify.

## Query tips

- **Phrase queries** for exact wording: `"Sean Ellis target"`
- **Multi-word** — automatically OR'd: `muakkil scribe buildathon` finds files with any of the three, ranked by BM25
- **Scope down** when results are noisy: `--product muakkil`, `--source brain/anti-patterns/`
- **Refresh first** if you just wrote a new file — otherwise it won't appear in results

## What you don't do

- Don't trust empty results without verifying ingest is current. Re-run ingest; try broader terms.
- Don't paraphrase from the snippets alone — `Read` the top hits before stating facts. Snippets are 18 tokens of context, not the full picture.
- Don't substitute brain-ask for reading the file directly when the user named a specific path. brain-ask is for discovery, not retrieval-by-path.

## Sources

- `brain/README.md` — what's indexed, how it works
- `brain/schema.sql` — the database shape

## Example session

User: "what surprised me during the v1.0 restructure?"

You:
```
bun /Users/hamza/Claude/Hamzaish/brain/ask.ts --source brain/learnings "what surprised"
```
→ Returns `brain/learnings/2026-05-26.md` as top hit.

You then `Read` that file and answer with citations.
