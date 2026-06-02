---
description: Manual save-point commit with a real message. Use when you want a named milestone in the log between auto-commits.
argument-hint: "<commit message>"
---

The user invoked: `/checkpoint $ARGUMENTS`

Run a Bash command to stage everything and create a clean commit with the user's message:

```
cd ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish} && git add -A && git commit -m "checkpoint: $ARGUMENTS"
```

Then report:
- The commit SHA (short)
- The files included (`git show --stat HEAD | head -20`)
- Whether to push (ask the user; do NOT auto-push)

If the working tree is clean (nothing to commit), say so and ask whether the user wanted to make a tag or annotated checkpoint instead.

If `$ARGUMENTS` is empty, ask for a message first — checkpoints without messages defeat the purpose.

This command is for **named milestones** — auto-commits handle the in-between work via the Stop hook in `.claude/settings.json`. Use `/checkpoint "shipped v0.7 punch list"` not `/checkpoint "wip"`.
