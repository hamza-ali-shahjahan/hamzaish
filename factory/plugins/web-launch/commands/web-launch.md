---
description: Kick off or resume a verification-gated website launch — scope the project, stamp a per-project tracking workbook, walk the phases, and enforce the pre-launch sign-off gate.
argument-hint: [project name or path]
---

The user invoked: `/web-launch $ARGUMENTS`

Run a website launch as a **process, not a to-do list.** Load the `web-launch` skill for the full method; this command is the entry point.

## Step 1 — Read the gotchas first
Load the `launch-gotchas` skill before anything else. The biggest launch risks are known failure modes — recognize them up front, not after they bite.

## Step 2 — Scope + stamp the workbook
1. Identify the launch target from `$ARGUMENTS` (project name, or a repo path). If unclear, ask: project name, domain, stack, hosting, CDN, CMS, launch date.
2. Check whether a `launch-checklist.md` already exists in the target repo.
   - **Exists** → this is a resume. Read it, summarize current Status counts by priority, and jump to Step 4.
   - **Absent** → copy the `launch-workbook.md` template into the target repo as `launch-checklist.md` and fill in the Project Info table. The template lives in the `web-launch` skill's `templates/` folder — resolve it as `${CLAUDE_PLUGIN_ROOT}/skills/web-launch/templates/launch-workbook.md` when this runs as a plugin, or as `templates/launch-workbook.md` adjacent to the `web-launch` SKILL.md when it runs as a plain skill (locate via `factory/skills/web-launch/templates/launch-workbook.md`). Load the `web-launch` skill — it points to the same template — if either path is unclear.
3. Mark stack-irrelevant items `N/A` up front so the gate math is honest.

## Step 3 — Walk the 14 phases
Go phase by phase. Assign an owner to every live item. **Delegate commodity work** rather than re-deriving it — route per the table in the `web-launch` skill (`searchfit-seo:*` for SEO/schema/links/AEO, `security-review` for the security baseline, `pseo-at-scale` for large templated page sets). Update Status in place. Remember: **Done ≠ Verified** — close an item only when its "How to verify" check passes independently.

## Step 4 — Sign-off gate verdict
Walk the 24-item Pre-Launch Sign-Off Gate. Produce a clear verdict:
- **LAUNCH** — every P0/P1 is `Verified` (or a P1 is consciously deferred with reason + owner + revisit date).
- **DO NOT LAUNCH** — list every failing item with its owner and the check it must pass.

This is a refuse-to-launch condition, not a suggestion. The operator decides whether to ship; you give the honest verdict.

## Step 5 — Hand off to launch day + monitoring
When the gate passes and the operator chooses to ship, walk Phase 13 (Launch Day) live, then set up the Day 1/3/7/14/30 monitoring cadence. At Day 7/30, feed any new failure mode back into `launch-gotchas`.

Always end a pass with: workbook updated, Verified/Done/Open counts by priority, the gate verdict, and the single most important next action.
