# The `/builder-mode` momentum router

> Invoke it as **`/builder-mode`** (the on-brand front door) or **`/hamzaish`** — same command, same engine (`builder-mode.md` is a symlink to `hamzaish.md`). Lead with `/builder-mode`; `/hamzaish` is the original alias and keeps working everywhere.

`/builder-mode` is the front door. Its whole job is to get you building fast while
keeping every strategy tool one keystroke away — never in the way. It's defined
in [`factory/commands/hamzaish.md`](../factory/commands/hamzaish.md); the
"default is momentum" philosophy is also wired into `CLAUDE.md` so it's the
session-wide default mindset, not just a command.

## The flow

```
/hamzaish  [optional: idea, or a product slug]
   │
   ▼  TRIAGE — one question, ① pre-selected
   │  (skipped entirely if you already said "go / just build")
   ① Just build it        → EXPRESS LANE   ← default / Enter
   ② Pressure-test first  → STRATEGY LANE
   ③ Resume a stage       → STAGE JUMP
```

### ① Express Lane — the default

1. **Optional 30-second red-flag check** (skippable). At most three *fatal-only*
   gut-checks, tuned to the domain: consent/legal · reversibility · showstopper
   dependency. Halts only on a true showstopper; "could be better" is noted and
   passed.
2. **Hand off to the build engine:** `/full-cycle` (gated spec→plan→test→build→
   review→ship), `/auto` (autonomous), or `/build` (tiny change).
3. **Standing guardrails** apply automatically (new product = its own repo; Next
   16 uses `proxy.ts`; noreply git email before first commit; build before deploy).

### ② Strategy Lane — opt-in, lite-by-default

Only if you choose it. It **reuses the existing `factory/agents`** (idea,
pricing-strategist, growth-loops, cross-product-learner, …) — it does **not**
invent parallel skills. Runs a quick one-pass version and offers "go deeper?". At
every gate: **continue · skip to build · done.** Then it flows back into the
Express Lane.

### ③ Stage Jump

You know exactly what you need: `/work-on <slug>` to enter a product workspace,
or a single agent. Run it, return — no forced sequence.

## Design principles

- **Express is the default, not an option you opt into.** Pressing Enter builds.
- **Skip is everywhere.** You never opt *out* of a process to start.
- **Reuse, don't duplicate.** The strategy lane points at agents that already
  exist in `factory/`, so there's one source of truth per capability.
- **Momentum is split from mechanics.** The *philosophy* lives in `CLAUDE.md`
  (the always-on personality); the *runnable steps* live in the command file (the
  reusable unit a future hosted product would invoke). No duplication to drift.
