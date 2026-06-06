---
name: interactive-vs-headless-self-evolving-runtime
description: The mental model the operator was missing — why self-evolving systems need a headless runtime (claude -p / Agent SDK), not interactive Claude Code. Plus clean definitions of scaffolding vs evals vs harness vs goals.
type: knowledge
source: chat 2026-06-04 (operator asked "why can't I have self-evolving systems here")
---

# Interactive vs Headless — the runtime self-evolution actually needs

## The four words, cleanly

| Term | What it is | In Hamzaish |
|---|---|---|
| **Scaffolding** | *Generating the starting structure* — folders, boilerplate, config. One-shot. | `/scaffold` creates `products/<slug>/` |
| **Evals** | *The test cases + "what good looks like."* Just data/specs. The rulebook. | planned: `meta/evals/skills/*/cases/*.yaml` |
| **Harness** | *The program that RUNS the evals* against an output and returns a verdict. The referee. | planned: `meta/evals/run.ts` |
| **Goals** | *The frozen fitness function* — what the whole system optimizes toward. Set by the human, never by the loop. | `brain/operating-principles.md` (de-facto frozen tier) |

Evals = rulebook. Harness = referee. Goals = why you're playing. Scaffolding = the kickoff.

## The distinction the operator was missing: interactive vs headless

There are two completely different ways to use Claude:

### 1. Claude Code (interactive)
You + Claude, turn by turn. You type, Claude acts, you read, you type again. **A human is in every single loop.** Phenomenal for building *with* a partner. But it **cannot self-evolve by definition** — it stops and waits for you every turn. This is where `/work-on`, `/scaffold`, `/brain-ask` live.

### 2. Claude headless (`claude -p`, or the Claude Agent SDK)
A *program* calls Claude. A script says "build the next slice," captures the output, **runs the harness on it**, and based on the verdict decides the next move — then calls Claude again. **No human per turn.** The human is *on the goals*, not *in the loop*.

```
Self-evolving loop (headless — the missing runtime):

  while not done:
     output  = claude -p "build the next slice toward <goal>"   # headless call
     verdict = harness.run(evals, output)                       # selection
     if   verdict == PASS:  keep it
     elif verdict == GAP:   write a proposal, wait for human     # batched, never guess
     else:                  re-decompose, try again
```

**You cannot write that `while` loop inside Claude Code** — because Claude Code *is* one turn of "you ask, I answer." The loop has to live in a script that *calls* Claude. That script is the runtime for self-evolution.

## Why Hamzaish can't self-evolve today

Three pieces must run together. Status:

| Ingredient | Status |
|---|---|
| **Goals** (frozen fitness function) | ✅ exists (`operating-principles.md`) — needs to be made explicitly *frozen* / write-protected from loops |
| **Harness** (referee giving verdicts) | ❌ planned (Phase D / Movement 1), not built |
| **Headless loop** (`claude -p` / Agent SDK script that cranks generate→verify→route) | ❌ doesn't exist — everything today is interactive |

Self-evolution = **goals + harness + headless loop, running unattended.** We have the goals. The harness is the next build (born inside Muakkil). The headless loop is the runtime that ties them — a *script using the Claude Agent SDK or `claude -p`*, not anything done by typing in Claude Code.

## The key reframe

> "Self-evolving" is not a *better way to use Claude Code*. It's a *different surface entirely*: a program that uses Claude as a subroutine, judged by a harness, steered by frozen goals.

Claude Code (interactive) is how the human + Claude *build that program*. The program is how the factory eventually runs without a human in every loop.

This is why the self-evolution arc is sequenced: **goals (have) → harness (Phase D, born in Muakkil) → headless self-cranking loop → proposals / gap-routing.** The operator isn't missing a setting — they're missing a *runtime*, and it's the next real build after Muakkil ships.

## Concrete: what the headless runtime will be

A Bun (or Node) script under `meta/evals/` or a new `runtime/` folder that:
1. Reads the frozen goals + the product's spec/scenarios
2. Calls `claude -p` (or the Agent SDK) to produce the next change
3. Runs the harness to get a 4-outcome verdict (PASS / FAIL_BUILDABLE / GAP / UNCERTAIN)
4. Branches: keep / re-decompose / write a proposal / escalate
5. Loops until done or budget-exhausted

The Claude Agent SDK is the tool of choice for this (programmatic, tool-use, streaming). `claude -p "<prompt>"` is the lightweight version for simple one-shot headless calls.

See `meta/SELF-EVOLUTION.md` for the full arc and `meta/evals/PLAN.md` for the harness (Movement 1).
