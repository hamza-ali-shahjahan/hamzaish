---
name: file-path-instead-of-paste-contents
description: Telling the user to "paste supabase/schema.sql" instead of pasting the file's contents into chat — the user can't one-click copy a path
type: anti-pattern
---

# A File Path Where Paste-Contents Belonged

## The pattern

A step requires the user to paste a file's contents into some external surface — a SQL
migration into the Supabase SQL editor, a config body into a hosting dashboard, a snippet
into a web form. The agent, having just written that file, "helpfully" points at it:

> paste the whole file below → Run:
> ```
> supabase/schema.sql
> ```

The code block contains the *path*. The user now has to find the file, open it, select
all, copy — on a machine where the whole point of the assistant is that they shouldn't
have to. The step stalls until they come back and ask for the actual contents.

## Why we don't do it

**Incident 2026-07-12 (ThousandWorlds Explorer v0.9.0 wrap-up):** the RLS migration that
activates anonymous analytics was delivered as a copyable *path* to `supabase/schema.sql`
instead of the SQL itself. The user had explicitly established (twice) that anything they
must copy goes in a copyable block. They had to come back and ask. One round-trip lost on
the highest-visibility step of a release.

The general failure: **for the agent, the file and its contents are the same object; for
the user, they are a path lookup apart.** Copy-paste rules exist for the user's hands,
not the agent's mental model.

## What to do instead

1. **Paste the full contents** of any file the user must relay, in a fenced code block in
   chat, at the exact step where they need it. Long is fine.
2. The path may accompany the block *as a reference*, never as a substitute.
3. **Exception — real-secrets files win:** never paste `.env.local`-class contents into
   chat (see [[claude-touched-secrets-file]]). Ship an `.example`, and have the user copy
   values themselves with non-printing verification.
4. If the file might drift between writing and pasting (e.g. the user runs the step days
   later), say which commit/version the block matches.
