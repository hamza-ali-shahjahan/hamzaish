---
description: Review the auto-captured learning queue and hand survivors to the brain (distilled, never pasted). The human gate between automatic capture and /learn-loop.
argument-hint: "[--limit N] [--min-confidence 0.6]"
---

Drain and review the automatic capture queue produced by the
`factory/hooks/capture-learning.ts` `UserPromptSubmit` hook.

The user invoked: `/reflect $ARGUMENTS`

This command is the **human gate**: capture is automatic, but nothing reaches a
committed file without your review here. Promotion authority still belongs to
`/learn-loop` — `/reflect` only moves reviewed candidates into
`brain/learnings/YYYY-MM-DD.md` as distilled learnings.

## Steps

1. **Locate the queue** for the current project:
   ```
   ~/.claude/projects/<encoded-cwd>/hamzaish-learnings-queue.json
   ```
   where `<encoded-cwd>` is the cwd with every non-alphanumeric char replaced by
   `-` (e.g. `/Users/hamza/Claude/Hamzaish` → `-Users-hamza-Claude-Hamzaish`).
   If it is missing or empty, tell the user there's nothing to review and stop.

2. **Show a review table**, highest confidence first (respect `--min-confidence`,
   default `0.6`; `--limit`, default all). Columns: `#`, confidence (✓ ≥0.8 /
   ⚠ 0.6–0.79), staleness (`(now − timestamp) / decay_days`: ✓ fresh / ⚠ near-decay
   / ✗ drop-suggested if >1), type, a one-line **distilled** paraphrase (NOT
   the raw message).

3. **Per item, offer Apply / Edit / Skip** (use `AskUserQuestion`; lead with the
   recommended action and why, per the operator's standing rule):
   - **Apply** — append a distilled one-line learning to today's
     `brain/learnings/YYYY-MM-DD.md`, tagged with `candidate_guardrail:` if it
     reads like a rule, so `/learn-loop` can score it mechanically.
   - **Edit** — let the user reword before appending.
   - **Skip** — drop it (praise/noise/stale).

   **Never paste the raw queued `message` into any committed file — distill the
   lesson.** If the item names a skill/command that was active when the correction
   was given, note `skill_context:` so `/learn-loop` can route the eventual
   guardrail into that `factory/skills/<slug>/SKILL.md`.

4. **Rewrite the queue** with the processed items removed (keep un-reviewed ones).
   Back up the old queue to `~/.claude/learnings-backups/` first.

5. **Point to the next step**: `/learn-loop` scores the newly written learnings at
   the normal boundary — this command does not promote anything to a guardrail.

## Guardrails

- Report-first: propose, never silently write. The Apply step is explicit per item.
- Distill, don't paste (conversations-never-in-a-repo).
- Do not read or echo any queued item flagged secret — the hook drops those before
  they reach the queue, but if one slips through, skip and delete it.
