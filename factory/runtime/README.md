# factory/runtime/ — the headless runtime (Movement 1, brick #3)

The loop that runs the factory **without a human in every turn**. A program calls
Claude as a subroutine, runs the harness's verdict on the output, and **routes on
that verdict** — keep, regenerate, escalate, or flag a gap. This is the runtime
[`meta/SELF-EVOLUTION.md`](../../meta/SELF-EVOLUTION.md) reaches for and
[`brain/knowledge/2026-06-04-interactive-vs-headless-self-evolving.md`](../../brain/knowledge/2026-06-04-interactive-vs-headless-self-evolving.md)
describes: *"the loop has to live in a script that calls Claude."* Interactive
Claude Code is one turn of you-ask-I-answer; it cannot self-crank by definition.
This can.

## Run it

```bash
bun factory/runtime/run-task.ts             # the ideate demo task (live claude -p)
bun factory/runtime/run-task.ts --no-judge  # deterministic floor only — faster
bun test factory/runtime/loop.test.ts       # force every route with fakes (no Claude calls)
```

## The routing table

| Verdict | Meaning | Route |
|---|---|---|
| `PASS` | deterministic floor green **and** judge green | keep the output, done |
| `FAIL_BUILDABLE` | a clear criterion failed | feed the failed criteria back → regenerate (≤ `maxAttempts`), then escalate |
| `GAP` | the generator hit a silent spec (emits a `GAP:` marker) | write a proposal to `proposals/`, stop — **never guess** |
| `UNCERTAIN` | can't classify (generation failed/timed out, judge unsure or unavailable) | escalate to a human now — the only real-time pull |

`GAP` is *signal* ("you never told me what to do here"); `UNCERTAIN` is *waste*
("I'm not sure I did this right" → sharpen the test). Telling them apart is the
whole game — see SELF-EVOLUTION.md.

## Bench vs loop — why this is NOT in `meta/evals/`

The **eval harness** (`meta/evals/`) judges *frozen fixtures* and is **agent-blind**:
the system under test must never see its own test, or a green light means nothing.
This **runtime** is the opposite surface — it runs a *real task*, and the acceptance
criteria **are the spec**, deliberately fed back to the generator to steer it. That
feedback is forbidden on the bench but is *legitimate iteration* here (the
`/spec`-with-executable-scenarios idea: the criteria are the contract and the test
at once). So the runtime is **not agent-blind** and lives in `factory/` (HOW YOU
ACT), importing the harness's primitives — `runInvocation`, `runChecks`
([`meta/evals/lib/checks.ts`](../../meta/evals/lib/checks.ts)) and `llmJudge`
([`meta/evals/lib/judge.ts`](../../meta/evals/lib/judge.ts)) — as a library. The
wall between bench and loop stays clean: the runtime is a *composer* of the judge,
not a second copy of it.

## Files

```
loop.ts        runTask(task, deps?) — the loop + four-way router + feedback-regeneration.
               Dependency seams (generate, judge) are injectable so every route is force-testable.
run-task.ts    Hand-runnable CLI; carries the ideate demo task; prints the trace.
loop.test.ts   Forces all four routes (+ sub-cases) with fakes — no Claude calls.
proposals/     The Movement 2 inbox. GAP proposals land here (gitignored; README tracked).
```

## What's deliberately OUT (named, not silent)

- **No Agent SDK** — `claude -p` is the transport for this slice (same as the judge).
  The knowledge note prefers the SDK eventually; not needed to prove the loop.
- **GAP → proposal is a stub** — it writes a proposal and stops; it does **not**
  auto-promote into a guardrail. That automation is **Movement 2**, which stays
  last by design (you don't coordinate loops until one loop self-evolves).
- **One skill, not the factory** — `/ideate` only, to prove the shape. Generalizing
  to arbitrary skills/specs comes after.
- **No budget loop, no multi-step decomposition** — single task, bounded attempts.

These aren't gaps in the build — they're the next bricks, sequenced. The rung
ladder (`Open → Closed → Self-cranking → Self-evolving → Self-coordinating`) is
walked one tested step at a time.
