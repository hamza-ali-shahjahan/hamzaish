---
description: Search the Hamzaish brain — learnings, decisions, playbooks, product docs. Returns ranked citations.
argument-hint: "<query>" [--product slug] [--source path] [--limit N]
---

Run the brain-ask skill against the user's query.

The user invoked: `/brain-ask $ARGUMENTS`

1. If the query is empty, ask the user what they want to find.
2. Shell out (via `Bash`):
   ```
   bun /Users/hamza/Claude/Hamzaish/brain/ask.ts $ARGUMENTS
   ```
3. Show the markdown output as-is — it's already formatted with citations.
4. If the top hits look relevant, offer to `Read` the most promising one and answer the user's question with citations.
5. If results look stale or empty, suggest `bun /Users/hamza/Claude/Hamzaish/brain/ingest.ts` and retry.

Refer to `factory/skills/brain-ask/SKILL.md` for the full protocol.
