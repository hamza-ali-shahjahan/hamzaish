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
2. **Ground in the instruments first.** Run `bun run trace-report` (session traces — `scripts/trace-report.ts`), `bun run friction report` (structured friction/delight — `scripts/friction.ts`), and `bun run defect report` (the guard-fire registry — which check caught what, `scripts/defect.ts`) and read all three before gathering prose candidates. A tool with a rising failure rate, or a source with repeated friction entries, is a candidate *even if no learning entry mentions it* — the instruments catch what sessions didn't remember to write down. Quote the relevant numbers in the `[SCORED]` block of any instrument-sourced candidate. (Blockers and delights are the highest-signal friction rows; a friction report with zero entries is itself worth one line — smooth week, or capture lapse?)
3. **Gather candidates — factory AND products.** Collect the raw learnings accumulated since the last `/learn-loop` run:
   - New/changed `brain/learnings/*.md` entries since the last scored cycle.
   - **New/changed `products/*/learnings/*.md` entries** (indexed in the brain since 2026-07-02) — the cross-product channel: a lesson learned inside one product that would help the next one is exactly what this loop exists to catch. Same-problem-in-2+-products is an automatic strong Recurrence score.
   - The latest `meta/retros/` entry if a sprint just closed (its **What worked** = promotion candidates for playbooks; **What didn't / structural friction** = anti-pattern candidates; **Surprises** = highest signal). Reference it — don't duplicate it.
   - Use `bun brain/ask.ts --context "<candidate theme>"` to pull related prior context per candidate.

   **Capture stance (active) + the do-NOT-capture list.** Gathering zero candidates from a working cycle is usually a capture lapse, not a quiet cycle — look again at the instruments before concluding nothing happened. (Promotion stays strict; capture is generous.) But NEVER capture these — they rot the brain (ported from hermes-agent's review doctrine):
   - environment-dependent failures (a flaky network, a machine-specific path) — they don't generalize;
   - negative tool claims ("X can't do Y") from a single failure — they harden into refusals the factory cites against itself for months;
   - transient errors a retry fixed — the retry IS the lesson, and it's already a mechanism;
   - one-off task narratives with no reusable shape.
4. **Score each candidate twice — independently.** First: score on the five axes (Speed ×2, Build-quality ×2, Recurrence, Generalizability, Confidence) → composite /35, honestly, no inflating to force a promotion. Then: spawn a **fresh-context subagent** (it gets the rubric + the candidate's raw text, NOT your scores) to score the same candidates. A candidate is promotable only if **both** composites clear ≥24/35. Disagreements ≥6 points are the interesting signal — log them in the `[SCORED]` block; they usually mean the candidate is context-dependent, not general.
5. **Write a `[SCORED]` block** for each candidate in `brain/learnings/` using the rubric §5 format (append to today's dated file, or a `YYYY-MM-DD-<slug>.md` for a standalone). Every candidate gets an entry — even below-threshold ones, marked `LOGGED (history only)`.
6. **Propose, then ratify, then promote** (Movement 2 discipline — the loop proposes; the operator ratifies; nothing auto-promotes):
   - **First present the proposal table** in chat: candidate · your composite · fresh-eyes composite · target home · predicted gain · feedback-check date. Lead with your recommendation.
   - **Wait for the operator's batch ratification** (approve all / approve some / reject). This is one batched decision, not a stream of interruptions.
   - **Then promote the ratified ones** — top ~3 max that cleared ≥24/35 on both scorings (respect the cap and the Confidence soft-gate). For each, make the lesson load-bearing in the right home (rubric §3), applying the **check ladder** (operating principle 15 — a lesson that can be a check becomes a check): prefer a hook → a CI guard → an eval case → only then prose (a guardrail in a skill/agent, a playbook step, an anti-pattern entry, or a routing rule in `CLAUDE.md`/`AGENTS.md`). Record the **predicted gain** and a **feedback-check date** in the `[SCORED]` block, and set `Status: PROMOTED → <target>`.
   **Also add the practice to the public ledger:** every promotion gets a one-liner in `BEST-PRACTICES.md` (right lifecycle section, ✅/🟡/⏳ badge per its evidence, dated source, link to the deep file) — and update the counts line at the top. The ledger is the surfaced view of this loop; a promotion that skips it is invisible to readers.

   **MECE gate — when a promotion's home would be a NEW skill (preference order, in order):**
   1. **Patch the skill/command that was in use when the lesson happened** — the load-bearing default;
   2. patch an existing umbrella skill whose triggers overlap;
   3. add a support file (playbook section, checklist line) under an existing home;
   4. **only then** create a new skill — and it must be class-level (an umbrella covering the *category* of situation, never a one-cycle artifact named after this session's task), with an explicit overlap check against existing skills' descriptions written into the proposal table. `bun run check-skill-command-collision` guards names; this gate guards *meaning*.
7. **Append a one-line changelog entry** to `meta/changelog.md` (newest first, under a dated heading) summarizing the cycle: e.g. `/learn-loop <label>: scored N candidates, promoted M (→ <targets>).` Bump the Hamzaish version if the promotions changed the factory's behavior.
8. **Re-index:** `bun brain/ingest.ts` so the new scored entries are searchable.
9. **Report** in chat: the candidates with their composites, which were promoted and where, and each promotion's feedback-check date.

## Feedback (closing the loop)

You don't re-verify promotions here — `/kill-or-keep` does that quarterly (rubric §4): it re-checks each promoted learning whose feedback-check date has passed, marks it `VALIDATED` if it delivered the predicted gain, or `SUNSET`s the guardrail if it didn't. `/learn-loop` promotes; `/kill-or-keep` prunes.

**The curator pass (quarterly, rides with `/kill-or-keep`):** sweep `factory/skills/` for library rot — near-duplicate skills to consolidate, one-session artifacts to fold into umbrellas, dead skills nothing routes to. Verbs available: **pin** (mark load-bearing, exempt from consolidation), **consolidate** (merge into the umbrella, leave a pointer), **archive** (move to `factory/skills/_archive/` — recoverable). **Never delete** — an archived skill can be resurrected the day it's needed; a deleted one is re-derived from scratch. (Ported from hermes-agent's curator: per-cycle review notes overlaps; the quarterly pass consolidates at scale.)

## Notes

- If `$ARGUMENTS` is empty, infer the cycle label from the most recent boundary (last retro, last stage change, or this session's factory changes) and state your inference.
- Don't soften scores to hit three promotions — promoting zero is a valid outcome of a quiet cycle.
- This command lives at `factory/commands/learn-loop.md` (canonical home); `.claude/commands/` symlinks there so Claude Code auto-discovers it as `/learn-loop`.
