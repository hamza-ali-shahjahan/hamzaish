# 2026-07-19 — factory · session traces + lesson-to-check ladder shipped (v2.18.0)

> The factory's self-improvement loop got its missing substrate — structured session traces replacing recollection — in one slice, proven live before docs were written.

## Context

- Goal: adopt the two gaps the code-as-agent-harness survey (arXiv:2605.18747 §3.5) exposed — deep telemetry and lesson→check promotion — leverageable from a new user's first session.
- Time budget: one session.
- Starting state: self-improvement loop ran on prose (`brain/learnings/`, retros); `meta/telemetry/` held only the spend ledger; no committed `.claude/settings.json` existed.

## What worked

- **Survey-as-checklist, not survey-as-rebuild.** Reading the paper against the existing factory produced a two-item diff (traces, ladder) instead of a re-architecture. The deliberate non-adoptions (§4 topology, auto-promotion) mattered as much as the adoptions.
- **Existing rails absorbed everything.** `**/*.local.jsonl` gitignore already covered the traces; `bun test ./scripts` already ran the new tests in CI; `meta/telemetry/` already existed as a concept (spend ledger). Zero new infrastructure categories.
- **Live verification for free.** Creating `.claude/settings.json` mid-session meant the hooks started firing on the build session itself — the report's first real output included the build's own tool calls, proving the pipeline against the real harness rather than only fixtures.
- **Our own slicing rule held.** Named eval (trace-capture-fidelity) + e2e pipeline test written alongside the code, not after.

## What didn't

- **Name collision risk discovered late:** `bun run telemetry` (product metrics) vs the new session traces — resolved by the distinct `trace-report` name, but the namespace check was manual. Structural fix if it recurs: a naming pass in `/spec` for new `package.json` scripts.

## Decisions made

- → `brain/decision-log/2026-07-19-code-as-harness-session-traces.md`

## Updates to Hamzaish itself

- **New**: `scripts/trace-log.ts`, `scripts/trace-report.ts`, `scripts/trace.test.ts`, `.claude/settings.json`
- **Updated**: `brain/operating-principles.md` (principle 15), `factory/commands/learn-loop.md` (steps 2/6), `CLAUDE.md`, `README.md`
- **Bumped Hamzaish version** → v2.18.0 (changelog entry same date)

## Surprises

- The hooks went live mid-session without a restart — project settings were picked up on write, which turned the build into its own end-to-end test. Captured in `brain/learnings/2026-07-19.md`.

## Open questions / things to revisit

- **Guard-fire telemetry (PreToolUse denials)** — revisit when: base layer cited by a learn-loop promotion.
- **Dead-telemetry removal clause** — revisit by: first `/learn-loop` after 2026-10-01.

## Next

→ **Let traces accumulate; first grounded `/learn-loop` at the next major-cycle boundary reads `bun run trace-report` as its step 2.**
