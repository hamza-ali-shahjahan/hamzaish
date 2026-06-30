# 2026-07-01 — Learnings from the first autonomous swarm run (synthux) + factory gaps it exposed

Context: built **synthux** (a function-replica of articos.com — synthetic-AI user-research
app, no auth) by hand-assembling `scripts/autonomy-loop.ts` + `/goal` + a parallel
build/verify Workflow + mock-first scaffolding, then launching an 8-session unattended
loop. The run doubled as a test of the factory itself. Repo: `/Users/hamza/Claude/synthux`.

## What worked
- **The autonomy-loop primitive holds up.** Fresh headless session per cycle, continuity on
  disk (`.goal/<slug>/` + `loop-state.json`), safety rails (`.autonomy-ok`, `STOP`,
  `--max-sessions`, branch-only) all functioned. Session 1 created branch
  `auto/phase0-scaffold`, installed deps, and never touched `main`.
- **`/goal` is reachable from a product repo** (not just inside Hamzaish) and, unprompted,
  built itself a weighted 5-criterion rubric + scoreboard in `.goal/synthux/log.md`. My
  earlier worry that factory commands wouldn't reach product repos was wrong in practice.
- **Mock-first was the unlock.** Deterministic mock-LLM + local SQLite made "functional"
  provable with **zero secrets** — so the loop never paused waiting on an API key or the
  operator. This is the single thing that makes overnight-unattended actually work.
- **Continuity-on-disk is the real orchestration.** The on-disk brief (START-HERE + PLAN
  rubric + loop-state contract) *is* the multi-day memory; context doesn't carry over.

## What surprised / broke (highest signal)
- **A session can burn its whole turn budget without writing `loop-state.json`.** Session 1
  hit `--max-turns 60` and exited with no handoff; the loop couldn't read progress and just
  relaunched, blind. Self-healing but wasteful — and on a fixed `--max-sessions` it could
  burn the entire budget making invisible progress. → **Fix shipped (v1.35):** the loop now
  tracks new commits + consecutive no-handoff sessions and **stops after 2 truly-stuck
  sessions**, instead of relaunching blindly.
- **`/hamzaish` assumes `cwd == factory root`.** Invoked from the workspace root, its
  factory-relative paths (`products/`, `factory/`) resolved to nothing and the front door's
  first visible act was a "that's not here" probe. Awful new-user first impression. → **Fix
  shipped:** `scripts/resolve-root.sh` + a "Step 0 — Anchor to the factory" preamble.
- **The swarm capability existed only in parts.** `autonomy-loop.ts` was undiscoverable
  (found by reading `scripts/`, never routed to by any command) and everything else
  (mock-first scaffold, the brief, the build/verify Workflow) was hand-assembled (~12 files).
  → **Fix shipped:** `/swarm` packages it as a one-command, new-user-reachable lane.
- **Factory convention vs. the public-repo invariant collide for replicas.** Registering a
  competitor-clone in committed `products/` would publish the strategy into forever-public
  Hamzaish. → Kept synthux entirely local (code-paths.local.json only); encoded as
  `brain/anti-patterns/sensitive-product-stays-local.md`.

## Standing takeaways
- The local shell is the #1 threat to an unattended build (install/build/test/dev-server).
  Mitigations now: preflight gate in the loop, fresh-session self-heal, the stuck-session
  stop; open follow-ups: per-session wall-clock watchdog, and a scheduled-cloud execution
  option so a flaky local machine isn't the single point of failure.
- "Eval first, then loop, then swarm" is the shape: a machine-checkable rubric is what lets
  an unattended run know it's done (vs. a hallucinated "done").
