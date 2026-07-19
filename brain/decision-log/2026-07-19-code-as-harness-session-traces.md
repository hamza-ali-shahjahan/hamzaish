# 2026-07-19 — Session traces (deep telemetry) + the lesson-to-check ladder

**Decision:** Adopt two upgrades from the code-as-agent-harness survey (arXiv:2605.18747, UIUC + Meta + Stanford, §3.5 "Agentic Harness Engineering"), scoped to what the factory measurably lacked:

1. **Session traces** — project-scoped hooks (`.claude/settings.json` → PostToolUse + Stop) feed `scripts/trace-log.ts`, which appends one compact JSONL line per event to gitignored `meta/telemetry/traces/YYYY-MM-DD.local.jsonl`. `bun run trace-report` aggregates failure rates by tool and command. Fail-open (can never block a turn), privacy-capped (no outputs/file contents; commands truncated to 160 chars), local-only. Works from the first session on a fresh clone — the hooks ship committed; the data never does.
2. **The check ladder** — operating principle 15: a lesson worth keeping is promoted hook → CI guard → eval case → prose, in that order of preference. `/learn-loop` now reads `trace-report` before gathering prose candidates and applies the ladder when promoting.

**Why:** The survey's sharpest observation maps exactly onto this factory: its self-improvement loop (learnings → learn-loop → promotion) ran on *recollection* — what a session remembered to write down — while the paper's telemetry → diagnose → mutate → verify loop runs on *structured traces*. The factory's own history already proved the ladder empirically: the three worst incidents (repo visibility, secrets leak, recommendation lapse) each stopped recurring only when the prose rule became a hook. Deliberately NOT adopted: the paper's multi-agent topology material (§4) — the current router → skills → subagents shape is already the surveyed dominant pattern, and adding topology without a telemetry-diagnosed reason is the failure mode §3.5 warns about; and auto-promotion of harness mutations — learn-loop's operator-ratification gate stays (the paper itself prescribes governed promotion, §3.5.3).

**Wrong if:** traces accumulate for a quarter and no learn-loop promotion ever cites them (dead telemetry — remove the hooks rather than carry a costless-looking always-on process that informs nothing); or the hook measurably slows turns (violates fail-open's spirit even while exiting 0).

**Revisit:** first `/learn-loop` run after 2026-10-01, or immediately if a session reports hook-induced latency.
