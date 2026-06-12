# 0003 — Stamped a public-launch checklist + first triage

**Date:** 2026-06-09
**Decision:** Created `products/copyright/launch/launch-checklist.md` from the `web-launch` workbook and ran a first triage pass toward Patently's public launch (it's currently live in private beta at patently.legal).

**Why:** North star is private beta → public launch. A verification-gated checklist makes "are we ready?" an objective question instead of a vibe. Also served as the first real-world dry-run of the new `web-launch` plugin.

**What it surfaced (initial — not a full walk):**
- **P0 blockers to public launch:** (1) rotate burned credentials [#128], (2) run pending prod DB migration 0001, (3) ship `/privacy-policy` + `/terms` + cookie consent [#58/59/60/122] — mandatory for a legal-research SaaS, (4) global cost-runaway/abuse caps for public scale [#125 + cost].
- **Already strong:** live HTTPS domain, Vercel CI/CD, error/cost tracking, per-user rate limits, citation validator, Clerk auth.
- **Verdict:** DO NOT public-launch yet. Single most important next action: rotate credentials.

**What would prove this wrong / revisit:** If public launch is reframed as a soft "open the beta wider" rather than a true public launch, some P0s (legal pages, global caps) may relax — but creds rotation never does. Revisit when creds are rotated and migration is applied.

**Note:** statuses in the checklist are initial; a real walk of the live site is needed to set SEO/analytics/security-header/a11y items (likely deferred during auth-gated beta, real for public).
