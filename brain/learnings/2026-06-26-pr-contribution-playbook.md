# 2026-06-26 — Learnings

## How to do open-source PRs right (from contributing to ponytail)

**Setting**: A week contributing to `DietrichGebert/ponytail` (30k★ AI-agent skill, ~53 open PRs, hyperactive maintainer). Outcome so far: 6 PRs — **1 merged (#315)**, 3 open (#205/#206/#326), 1 closed-but-praised (#212). Full reusable playbook lives at `/Users/hamza/Claude/Repo Contirbution/PR-CONTRIBUTION-PLAYBOOK.md`. This entry is the distilled learning.

### What worked

- **Small + single-purpose is the whole game.** Pattern-mining 116 merged PRs: **~74% merge rate, median merged PR ≈ 22 lines / 2 files, ~half add ≤15 lines.** Every PR we landed fit that shape (#315 was +2). Don't bundle unrelated changes.
- **Self-audit beats filed issues.** In a fast repo, filed issues get claimed within hours — *every* tractable one we checked already had an open PR. Our best finds came from auditing: a contradictory Node version (#205), a hardcoded dev path (#206), a missing host-check (#315). Audit tools: link/anchor checkers, "does this referenced file/script exist", doc↔code consistency, hardcoded `C:\`/`/Users/` paths.
- **Match the maintainer's voice & conventions.** Biggest review-friction reducer. #206 reused their `PONYTAIL_PLUGIN_DIR` env-override convention; #315 reused their exact error-message format. It reads as "one of us," not "a drive-by."
- **Verify-then-build (the doublecheck gate).** Before writing a word, verify factual claims against **primary sources**. This caught **Roo Code being archived (2026-05-15)** before we wasted a PR documenting a dead agent. Same gate: cite official docs in the PR body (JetBrains/Amp/Jules) — accuracy = merge.
- **PR body that reviews itself**: Problem → Fix → **verification table** → `Closes #X` + primary-source links. Note what you considered and excluded (shows diligence).
- **Bundle to avoid spam + conflicts.** Folded Junie+Amp+Jules into one PR (#326) instead of three back-to-back — three near-identical agent PRs read as badge-padding, *and* separate PRs would have collided on the agent-count badge line.

### What surprised me

- **Features and agent adapters merge readily** (15 + 14 of 116), not just bug fixes — I'd over-cautioned against them. The most reliable "bigger" win is a docs adapter for a popular **AGENTS.md-native** agent (CodeWhale's +7-line PR merged clean). The play: gap-analyze "supported agents" vs the ecosystem's AGENTS.md adopters.
- **A duplicate beat us by 4 minutes** (#212 → superseded by #274). The maintainer closed ours *with praise* ("the earlier and slightly tighter version — you also rejected URLs with no host"). We turned that praise into #315 — which became the **first merge**. A lost race is not a loss.
- **The maintainer is opinionated**: closed a `[SECURITY]` path-traversal report as `NOT_PLANNED` (it's a local dev tool you point at your own dirs). Wontfix = a *class* signal: don't re-submit the same pattern elsewhere.

### What didn't work / friction

- Burned ~2 days on an **hourly** PR-status watch via `ScheduleWakeup` (capped at 1h) before switching to a **6-hour cron** (`CronCreate`, in-session so it keeps `gh` auth). Lesson: for multi-day polling, use cron, not a tight self-wake loop.
- The agent-adapter space is **nearly saturated** (~16 supported + 4 in-flight); the remaining gaps required proactive ecosystem research (AGENTS.md adopter list) rather than waiting for requests.

### The repeatable process (the gates)

1. **Discover** — read README + CI workflow; self-audit; pattern-mine merged PRs; gap-analyze.
2. **Doublecheck** — verify claims vs primary sources; confirm it's unclaimed (cross-ref every open PR); check close-reasons (wontfix); watch for parallel-PR line conflicts.
3. **Build** — branch off *fresh* main; smallest scoped diff; match their voice; additive > rewrite.
4. **Gates** — run the repo's CI locally (e.g. `npm test` + any drift/rule-copy check); isolate pre-existing/env failures; confirm the diff is exactly intended.
5. **PR** — conventional title; self-reviewing body; cite sources.
6. **Steward** — respond fast to feedback; don't spam; when clean wins are exhausted, let PRs land.

### Decisions captured elsewhere

- Full playbook: `/Users/hamza/Claude/Repo Contirbution/PR-CONTRIBUTION-PLAYBOOK.md`
- Worked examples: ponytail PRs #205, #206, #212, #315, #326

### Open questions

- Promote this to a permanent `factory/playbooks/oss-pr-contribution.md` guardrail? (Currently a learning, not yet promoted.)
- Remaining AGENTS.md-native gaps after #326 (Junie/Amp/Jules): **Goose** (needs verification — uses `.goosehints`).
