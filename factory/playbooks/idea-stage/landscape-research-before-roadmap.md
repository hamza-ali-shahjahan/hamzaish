# Landscape research before roadmap — fan out, audit, then judge hard

> **Principle:** Never set a product roadmap from instinct alone. Run a parallel research fan-out over the market, an audit over your own repo, and an adversarial critic over everything — and for any decision that hinges on a performance guess, measure it with a spike agent instead of estimating. The critic and the audit will reshape the plan more than the sweeps will.

**Verified case (2026-07-12, ThousandWorlds sprint):** this exact workflow — 4 web sweeps + 1 local audit + 1 completeness critic + 1 measurement spike — killed 9 plausible-sounding roadmap ideas with evidence, surfaced 2 cross-cutting risks no individual sweep saw, and produced a priority order that pure market research would have missed.

## Step 1 — Fan out 3–4 parallel web sweeps

Dispatch them concurrently (supervised — see `../ai-native-2026/handoff-vs-supervision.md`), one lane each:

- **Competitor landscape** — who serves this audience today, and how.
- **State of the art** — what the current technical/scientific frontier makes possible.
- **Audience needs** — what the target users actually ask for, in their own venues.
- **Traction patterns** — how comparable products actually grew (mechanisms, not vibes).

Each sweep returns cited findings, not opinions. Sweeps run in parallel because their lanes are independent; the synthesis is not their job.

## Step 2 — Audit your own repo alongside the market

Run a local product/repo audit agent **at the same time** as the web sweeps: what's actually built, what's broken, what's half-shipped, what the infra can and cannot survive. In the 2026-07-12 sprint, this audit — not any market sweep — produced the roadmap's actual priority order (*launch infrastructure before launches*). Market research tells you what to build eventually; the audit tells you what must come first. Skipping it yields a roadmap that assumes a product state you don't have.

## Step 3 — Adversarial completeness critic over everything

Feed all sweep + audit outputs to one critic agent with an explicit adversarial brief: **"judge hard, don't flatter."** Its two jobs:

1. **Kill list** — attack every proposed idea and reject any that doesn't survive on evidence. On 2026-07-12 it killed 9 plausible-sounding ideas (a single-number index, a public API "now," a community gallery, among others) — each with a stated reason, not a vibe.
2. **Missing angles** — name what nobody researched. The same run surfaced two invisible cross-cutting risks: a hosting hard-cap (Vercel Hobby) that a viral HN spike would blow through, and a mobile-experience-vs-share-strategy contradiction. It also flagged cost-at-scale, licensing, and analytics-before-launch as unresearched. These reshaped the plan more than any sweep did.

A flattering critic is worthless. If the critique comes back with zero kills and zero missing angles, re-dispatch with a harder brief — the fan-out plus your own enthusiasm guarantees there is something to kill.

## Step 4 — Measure, don't estimate, on performance-hinged decisions

Any roadmap decision resting on a performance *guess* gets a time-boxed spike agent before it's allowed into the plan. Brief template: **"measure, don't estimate; report exactly what blocked you rather than fabricating numbers."**

Receipt: the GP-LFR browser spike (2026-07-12) — one agent, ~10 minutes of compute, building a synthetic model at real dimensions and benchmarking it in an actual browser WASM runtime — killed two folk myths at once: the assumed 2–3× WASM penalty measured 1.0–1.5×, and "too heavy for browsers" measured a worst case of 0.78 ms. It turned a collaboration email from "should be feasible" into tables of measured numbers. Ten minutes of measurement beats weeks of architecture debate, and it converts external conversations from speculation to evidence.

## Anti-patterns

- **Sweeps without a critic** — parallel research that goes straight into a roadmap just launders enthusiasm through citations.
- **Market-only research** — a roadmap ordered by market opportunity but blind to the repo's actual state ships launches before launch infra.
- **Estimating benchmarkable things** — if a claim can be measured in under an hour of agent time, quoting a folk number for it is a choice, not a constraint.
