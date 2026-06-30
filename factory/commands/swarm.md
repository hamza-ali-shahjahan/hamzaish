---
description: Eval-driven autonomous swarm build — relaunches fresh /goal sessions until a measurable rubric is met. Runs unattended (overnight / multi-day), survives context limits, with preflight + budget cap + kill switch. The packaged, one-command version of the autonomy loop.
argument-hint: "[product slug or repo path] [optional: the goal in one line]"
---

The user invoked: `/swarm $ARGUMENTS`

# /swarm — build it autonomously, until the eval passes

The world moved past one-shot spec-driven dev to **eval-driven loops + agentic swarms**.
`/swarm` is that pattern packaged so a *new* user gets it in one command. It wraps
`scripts/autonomy-loop.ts` (the endurance spine) + `/goal` (the eval) + a parallel
build/verify **swarm** + **mock-first** scaffolding so the whole thing runs unattended
with **zero secrets** and proves itself.

**When to use which:** `/build` tiny change · `/full-cycle` gated, human-in-loop · `/goal`
one autonomous self-verifying session · **`/swarm` many sessions, overnight/multi-day,
survives context limits** (each session is a fresh window; continuity lives on disk).

## How autonomy survives days (say this to the user once, briefly)
1. **Endurance = fresh sessions.** The loop relaunches a new headless `claude` per session — fresh context each time. Continuity is on disk (`.goal/<slug>/` log + `loop-state.json`), not in memory.
2. **Speed = the swarm inside each session.** Each session fans out `scripts/build-swarm.workflow.js` over independent slices on a `build → verify` pipeline.
3. **Brakes = `/goal` + markers.** A machine-checkable rubric defines "done"; `.autonomy-ok` opts in; a `STOP` file kills it; `--max-sessions` caps spend; branch-only + no push/deploy/money are enforced in every session prompt.

## Procedure (lead each choice with a recommendation, per house style)

**0. Anchor to the factory.** `ROOT="$(bash "$(dirname "$0")/../../scripts/resolve-root.sh" 2>/dev/null || bash scripts/resolve-root.sh)"`. Never assume `cwd` is the factory.

**1. Resolve the target product repo.**
- Arg is a known slug → read its path from `code-paths.local.json`.
- Arg is a path → use it. New product → scaffold a **sibling** repo (its own `git init`, registered in `code-paths.local.json`); **never** put product code in this repo. Sensitive/replica/private products: metadata stays **local only** too — see `brain/anti-patterns/sensitive-product-stays-local.md`.

**2. Pin the eval.** Turn the goal into a measurable, reachable rubric — escalate to `/write-a-goal`. Write `GOAL.md` (the one-line objective) and `docs/PLAN.md` (the phased, checkbox rubric `/goal` scores) into the product repo.

**3. Lay down the operating brief on disk** (this *is* the multi-day memory). In the product repo, ensure:
- `START-HERE.local.md` — per-session brief: rules (branch-only, no push/deploy/secrets/money, respect `STOP`), the plan/rubric pointer, the `loop-state.json` contract, definition of done.
- `CLAUDE.md` — standing product rules.
- `docs/MOCK-MODE.md` + adapters — **mock-first**: LLM + DB behind swappable adapters, deterministic mock + local store as the default so "functional" is provable with **zero secrets**; real providers swap in via env. This is what lets it run while the user sleeps.
- `scripts/build-swarm.workflow.js` — copy from `templates/build-swarm.workflow.js`.

**4. Safety rails.** `touch .autonomy-ok` (opt-in) and `.no-auto-push` (until publish). Confirm no `STOP` file. Confirm a `noreply` git email.

**5. Preflight + launch.** The loop self-preflights (`bun`, `claude` CLI, git repo) and fails fast. Recommended defaults: **Sonnet driver + Opus for review/synthesis, `--max-sessions 8`** (best quality-per-dollar; offer all-Opus for max quality or Sonnet-only for cheapest):
```bash
bun "$ROOT/scripts/autonomy-loop.ts" \
  --repo "<product-repo>" --slug "<slug>" --goal "<one-line objective>" \
  --model sonnet --max-sessions 8 --runs-per-session 4 --permission-mode bypassPermissions
```
Launching unattended **spends real tokens + runs bash without asking** — confirm before the first launch unless the user already said go.

**6. Hand off control (baby steps).** Tell the user: monitor with `tail -f <repo>/.goal/<slug>/loop.out`; stop anytime with `touch <repo>/STOP`; progress + scores live in `<repo>/.goal/<slug>/`. Share the localhost link once the app actually serves.

## Guardrails
- Replica builds: replicate **function & structure**, original copy/branding; rename via `/name-product` + scrub before any publish.
- The loop stops itself after 2 consecutive sessions that make no progress and write no handoff (avoids burning budget blindly — the v1.35 hardening).
- If the local shell is flaky, the fresh-session design self-heals transient failures; for a hard-stall, re-launch from the user's own terminal or move execution to scheduled cloud sessions.
