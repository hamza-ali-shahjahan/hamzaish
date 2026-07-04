# 2026-07-04 — Factory · The jdx/en.dev toolchain floor: fnox + pitchfork (safe unattended runs)

> Evaluated Jeff Dickey's (jdx) tool portfolio for factory fit, then adopted the two that matter: **fnox** (secrets backend that removes the plaintext `.env.local` at the root of the 2026-07-03 leak) and **pitchfork** (supervised, self-verifiable dev servers). Both piloted + red-teamed in scratchpad before wiring. Shipped as v2.6.0 + v2.7.0 in one PR (#35). hk/aube evaluated and deliberately not adopted.

## Context

- Prompt: deep-research the jdx toolchain (mise, fnox, hk, pitchfork, aube) and propose factory leverage; honest multiplier, no hype. A 106-agent verified research pass concluded ~1.5x on the engineering loop, **not** a 100x — tools compress the loop that's already fast (build); the binding constraints are distribution, decision bandwidth, and autonomy grade.
- The strategic frame that made these two worth adopting: fnox + pitchfork are the **"safe unattended runs" floor** — the exact prerequisite the same-night autonomy grading (`brain/knowledge/2026-07-04-autonomy-grade-osmani-scale.md`) named for the orchestration rung. Not a multiplier themselves; the floor a multiplier stands on.

## What shipped

- **fnox (v2.6.0):** recommended secrets backend for `/go-live`. `fnox.toml` = ciphertext/provider-refs (committable), so **no plaintext file for the harness to watch and echo** — root-cause fix for the 2026-07-03 incident that the guard hook only symptom-patched. Exec-only MCP server (`printenv` → `[REDACTED]`), whole-tool Bash deny-rule, `.env.local` retained as fallback, guard hook as defense-in-depth.
- **pitchfork (v2.7.0):** opt-in supervised dev servers. Start-once, survives sessions, MCP-drivable; `/go-live` verifies a server is up before sharing a localhost link. Proxy CA/`/etc/hosts` left escalation-gated.

## What surprised / what the review caught

The load-bearing lesson: **behavioral verification of the tool is not enough — the boring config plumbing is where the bugs were.** Three defects, all "parses fine / passes locally / silently wrong," each caught by validating against the primary source instead of assuming:

1. **`_comment` in `.claude/settings.json`/`.mcp.json`** → strict schema *rejects the whole file*, so the deny-rules would have silently not loaded. (Removed; doc moved out of the JSON.)
2. **Arg-constrained deny-rules** (`Bash(fnox get:*)`) are the fragile pattern the permissions docs warn against → broadened to whole-tool `Bash(fnox)`/`Bash(fnox:*)`, and reframed deny-rules as best-effort (real boundary = key out of reach).
3. **Starter `.gitignore` `.claude/*`** was ignoring `settings.json` itself → the confinement file **wouldn't ship**. Caught at the PR-scoping step. (Added `!.claude/settings.json`.)

Plus a pilot red-team finding documented as an honest limit: pitchfork's HTTP ready-check **false-positives** when another process answers the port (readiness ≠ liveness) → `ready_output` + distinct ports.

## Discipline that held

- Red-teamed both tools in scratchpad with throwaway keys/daemons; never touched real secrets or showcase repos (`code-paths.local.json` empty → all products showcase, so piloted synthetically).
- Escalation respected: did **not** run `pitchfork proxy` (system CA + `/etc/hosts` edit) — documented it as operator-gated.
- Deferred the one irreversible step (push) until explicit go-ahead; scoped the PR to 13 files, leaving another session's muakkil commit untouched.

## What's out (named, not silent)

hk (wrong layer — our guards are Claude Code hooks, not git hooks) and aube (Bun-first stack conflict + churn) evaluated and not adopted. No fleet rollout, no production supervision, no coupling to an autonomous manager. Decision logs: `brain/decision-log/2026-07-04-fnox-secrets-backend.md`, `brain/decision-log/2026-07-04-pitchfork-dev-server-supervision.md`.
