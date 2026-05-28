---
description: Refresh Hamzaish's brain index — re-scan all known folders and update SQLite FTS5 store.
argument-hint: "[--rebuild] [--verbose]"
---

Refresh the brain's derived index from the markdown source of truth.

Shell out (via `Bash`):

```
bun /Users/hamza/Claude/Hamzaish/brain/ingest.ts $ARGUMENTS
```

Then report the output to the user: how many docs added / updated / deleted / skipped, total in db, and time taken.

Use this:
- After writing new learnings, decisions, or playbook entries
- After registering a new product or completing a sprint
- At the start of a session if the brain has been edited externally
- With `--rebuild` if the schema has changed or the db looks corrupted

The script is idempotent — re-running when nothing changed is free (~10ms).
