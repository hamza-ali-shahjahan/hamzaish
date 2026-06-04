---
name: self-evolving-upgrade-brief
description: Ingested external brief on moving an agentic orchestrator from Closed → Self-cranking → Self-evolving → Self-coordinating. Source material for Hamzaish's self-evolution arc. Captured + translated to Hamzaish's actual shape.
type: knowledge
source: operator (hamzaish-upgrade-brief.md, generated from a ChatGPT session, 2026-06-02)
status: absorbed — not implemented verbatim; see meta/SELF-EVOLUTION.md for the Hamzaish translation
---

# Self-Evolving Upgrade Brief — ingested + translated

The operator brought a sharp external brief on making an agentic system self-evolving. This file captures its **best ideas** and **how they map to Hamzaish** (which is broader than the codegen loop the brief assumes). We do **not** implement the brief verbatim — see `meta/SELF-EVOLUTION.md` for the translated arc.

## The brief's core thesis (worth keeping verbatim)

> **The product is the spec, not the code.** The asset that compounds is a corpus of goals/knowledge/specs/scenarios. Code is a regenerable byproduct. The orchestrator's job is to improve that corpus under a fitness function the human owns.

> Self-evolving in the real sense = **variation + selection + heredity**:
> - **Variation** = loops that propose changes (build, research, challenge, gap-routing)
> - **Selection** = the verdict from an **agent-blind** eval harness, gated by the goals
> - **Heredity** = surviving changes written back into specs/ and scenarios/, inherited by the next run

> This is the **opposite of vibe coding.** Standards become *more* deliberate because they're written as rules the system must obey. Humans move up to owning the goals, ratifying the gaps, deciding what good looks like.

## The maturity ladder

| Rung | Definition |
|---|---|
| **Open** | Agent generates, human reads every diff. No gate. |
| **Closed** | A verify gate exists; pass keeps, fail reverts. Hands-off per slice. |
| **Self-cranking** | Loop generates its own next slices from a brief, runs the checklist down. Build-only; spec doesn't change. |
| **Self-evolving** | Verdict gains a **GAP** outcome. A slice that fails *because the spec was silent* routes a proposal **up** against goals/specs/scenarios instead of reverting. Corpus improves week over week. (~80% of the value.) |
| **Self-coordinating** | N loops (one per product), partitioned corpus, control plane, ledger-mediated shared tier. |

**Rule: do not skip rungs.** Parallelizing an unreliable loop just multiplies mess.

## The five ideas Hamzaish is stealing

### 1. GAP vs UNCERTAIN — the keystone distinction
A self-cranking loop falls back to a human for two different reasons, and only one is waste:
- **UNCERTAIN** — the verdict couldn't certify the outcome (confidence/coverage problem). **Waste. Kill it with better evals.**
- **GAP** — the spec genuinely didn't say what to do. **Signal. Route it, batch it, never guess it.**

Target: `HITL rate = GAP rate + UNCERTAIN rate`. Drive `UNCERTAIN → 0`; leave `GAP` intact and informative. Making the loop guess on gaps = vibe coding through the back door.

### 2. Agent-blind selection
"Trust comes from separation, not from re-checking." A green light is only trustworthy if the builder had **zero write access** to the verify scripts, fixtures, and acceptance criteria — and those criteria were frozen *before* the build. The path to fewer humans is *more* rigor and *more* separation.

### 3. Executable criteria frozen at decomposition
Every slice ships with a machine-checkable criterion, frozen at planning time, agent-blind to the builder. **If the planner can't produce an executable criterion → that slice is a GAP at planning time**, not a build-time surprise. Moves a whole class of HITL from "human reviews ambiguous output after the fact" to "planner flags ambiguity before any tokens are spent."

### 4. The four-outcome verdict (replaces pass/fail boolean)
```
PASS            → all must-pass green AND composite ≥ T_high → keep. No human.
FAIL_BUILDABLE  → a gate failed AND spec was clear → revert + re-decompose. No human.
GAP             → spec under-determines → write proposal, halt branch. BATCHED human ratification.
UNCERTAIN       → must-pass green but composite in middle band → the ONLY real-time HITL.
```
Even before new gates: *just classifying instead of booleaning* tells you WHY the loop stopped.

### 5. The frozen tier — selection pressure the system can't game
Goals + verified knowledge are **write-protected from every agent loop** — only the human edits them. Specs and scenarios evolve underneath. **This is the line between a self-evolving system and a self-deceiving one:** if goals can mutate, the system redefines success to make itself look fit.

## Where the brief and Hamzaish diverge (why we don't apply verbatim)

1. **The brief is codegen-loop-centric.** Hamzaish also does strategy, validation, GTM, content — lanes where the "gate" is a human reading numbers, not an automated PASS/FAIL. We mark which lanes auto-gate and which stay human.
2. **The brief proposes a full directory religion** (`goals/ knowledge/ specs/ scenarios/ proposals/ evals/`). Hamzaish already restructured once (`brain/ factory/ products/ meta/`). We **layer** these concepts on, not rename everything.
3. **"Run Formpad unattended for a week"** — wrong dogfood target. The first self-evolving product needs a *rich existing scenario corpus* to select against. Muakkil (after ship) or Scope Intelligence (15 vertical slices already spec'd) are the real candidates.
4. **"Code is a regenerable byproduct"** — true for functional/codegen products, weaker where the UX/design IS the moat (Muakkil's ritual UX). Default for some products, not a universal claim.
5. **`vkf` naming** — unmemorable. Hamzaish uses `frozen/` or `axioms/` and documents it prominently.

## Out of scope (the brief agrees)

Multi-VM fleet, control plane, cross-loop conflict resolution, the shared-tier ledger — all premature until ONE loop reliably self-evolves. When we hit that bar, the conflict-resolution policy + ledger schema is the one piece to build carefully.

## How this maps to Hamzaish's existing primitives

| Brief concept | Already in Hamzaish | Gap |
|---|---|---|
| Variation | building products, `brain/learnings/`, retros | — |
| Heredity | `brain/learnings/` → `factory/playbooks/` → guardrails (manual) | automate via `proposals/` queue |
| Selection | — | **the missing keystone — Phase D eval harness** |
| Spec-as-product | `/spec` skill + per-product `scope.md` | fuse spec + scenarios (executable acceptance) |
| Frozen tier | `brain/operating-principles.md` (de facto) | make it explicitly write-protected from loops |
| Self-coordination | `products/_community/` + verification flow (v1.7) | the shared verified-guardrail library |
