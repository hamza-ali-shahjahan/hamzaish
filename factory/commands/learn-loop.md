---
description: Run the impact-scored learning loop at a major-cycle boundary — gather the cycle's candidate learnings, score them with the rubric, promote the top few into guardrails, and append a changelog line.
argument-hint: "[cycle label, e.g. 'muakkil → Launch' or 'web-launch shipped'] (optional)"
---

The user invoked: `/learn-loop $ARGUMENTS`

This is the **periodic scoring + promotion pass** over the raw learnings the factory has been accumulating. It does NOT replace the always-on capture habit (`brain/learnings/YYYY-MM-DD.md` after every session) or the narrative retro (`meta/retros/`) — it sits on top of them and decides *what to promote into a guardrail*. Read `meta/learning-loop-rubric.md` first; it defines the triggers, axes, threshold, and entry format this command applies.

## When to run

Only at a **major-cycle boundary** (see the rubric §1): a product crosses a stage gate, ships, or is killed; a sprint/session had notable friction or a notable win; or the factory itself changed. If none of those happened, say so and stop — running every session defeats the quality-over-volume point.

## Steps

1. **Confirm the boundary.** State which trigger fired (use `$ARGUMENTS` as the cycle label if given). If it isn't actually a boundary, stop and tell the user.
2. **Gather candidates.** Collect the raw learnings accumulated since the last `/learn-loop` run:
   - New/changed `brain/learnings/*.md` entries since the last scored cycle.
   - The latest `meta/retros/` entry if a sprint just closed (its **What worked** = promotion candidates for playbooks; **What didn't / structural friction** = anti-pattern candidates; **Surprises** = highest signal). Reference it — don't duplicate it.
   - Use `/brain-ask` if you need to pull related prior context.
3. **Score each candidate** on the five axes (Speed ×2, Build-quality ×2, Recurrence, Generalizability, Confidence) → composite /35. Apply the rubric honestly; don't inflate to force a promotion.
4. **Write a `[SCORED]` block** for each candidate in `brain/learnings/` using the rubric §5 format (append to today's dated file, or a `YYYY-MM-DD-<slug>.md` for a standalone). Every candidate gets an entry — even below-threshold ones, marked `LOGGED (history only)`.
5. **Promote the top ~3 that clear ≥24/35** (respect the cap and the Confidence soft-gate). For each promotion, make the lesson load-bearing in the right home (rubric §3): a guardrail in a skill/agent, a playbook step, an anti-pattern entry, or a routing rule in `CLAUDE.md`/`AGENTS.md`. Record the **predicted gain** and a **feedback-check date** in the `[SCORED]` block, and set `Status: PROMOTED → <target>`.
6. **Append a one-line changelog entry** to `meta/changelog.md` (newest first, under a dated heading) summarizing the cycle: e.g. `/learn-loop <label>: scored N candidates, promoted M (→ <targets>).` Bump the Hamzaish version if the promotions changed the factory's behavior.
7. **Re-index:** `bun brain/ingest.ts` so the new scored entries are searchable.
8. **Report** in chat: the candidates with their composites, which were promoted and where, and each promotion's feedback-check date.

## Feedback (closing the loop)

You don't re-verify promotions here — `/kill-or-keep` does that quarterly (rubric §4): it re-checks each promoted learning whose feedback-check date has passed, marks it `VALIDATED` if it delivered the predicted gain, or `SUNSET`s the guardrail if it didn't. `/learn-loop` promotes; `/kill-or-keep` prunes.

## Notes

- If `$ARGUMENTS` is empty, infer the cycle label from the most recent boundary (last retro, last stage change, or this session's factory changes) and state your inference.
- Don't soften scores to hit three promotions — promoting zero is a valid outcome of a quiet cycle.
- This command lives at `factory/commands/learn-loop.md` (canonical home); `.claude/commands/` symlinks there so Claude Code auto-discovers it as `/learn-loop`.
