---
description: Pursue a measurable objective autonomously — score against a rubric, fix the biggest gap, verify, log every run, and stop only when a fresh-eyes agent confirms the goal is met (or the run budget is spent).
---

You are running a **goal loop**: an autonomous, self-verifying improvement loop that drives an artifact toward a stated objective and **does not stop until the goal is achieved and independently verified** (or the run budget is exhausted).

The objective is in `$ARGUMENTS`. If empty, ask the user for it once, then proceed.

> Sibling of `/hamzaish`. `/hamzaish` walks an engineering cycle with human gates; `/goal` replaces the human gate with a **rubric + fresh-eyes verification** gate so it can iterate unattended toward a target.

## The non-negotiable: the run log IS the loop

The loop's memory and state live in a **run log**, and writing it is not optional bookkeeping — it is a *step of the loop the loop cannot skip*. The rule:

> **No run advances until its log entry is written.** If you implemented a change but have not appended the run entry, the run is not finished. The log is written *before* the next fresh-eyes assessment begins.

This makes the loop **resumable** (re-invoking `/goal` reads the log and continues), **auditable** (every change traces to a gap and a score delta), and **honest** (regressions are recorded, not hidden).

### Where the log lives
In the **target project**, not the skill dir:
- `.goal/<goal-slug>/log.md` — human-readable: header block + scoreboard + one section per run.
- `.goal/<goal-slug>/runs.jsonl` — one JSON object per run (machine-readable, for resume and trend).

`<goal-slug>` is a short kebab-case slug of the objective.

### Header block (write once, at loop start)
```
# Goal: <objective>
Started: <date>  ·  Target: <artifact/project>  ·  Category: <category + named comparables>
Bar: <e.g. weighted ≥ 9.0/10, sustained 2 consecutive runs, no criterion < 8>
Max runs: <N, default 20>

## Rubric (weighted)
| # | Criterion | Weight | What a 10 looks like |
...

## Scoreboard
| Run | Weighted | <crit1> | <crit2> | ... | Gap targeted | Decision |
```

### Per-run entry (append every run, before the next assessment)
```
### Run K — <date>
- **Score before:** <weighted> (<per-criterion>)
- **Top gap (fresh-eyes):** <the single highest-impact intuitiveness/quality gap>
- **Change made:** <one focused change — what & why>
- **Files touched:** <paths>
- **Verification:** <build/test/preview result — evidence>
- **Score after:** <weighted> (<per-criterion>)  ·  Δ <+/->
- **Decision:** continue | achieved | blocked | budget-exhausted
```
Also append the matching JSONL line to `runs.jsonl`.

## The loop

**Step 0 — Frame (once).**
1. Restate the objective and make it *measurable*. If it's comparative ("most intuitive in its category"), name the category and 2–4 real comparables to benchmark against.
2. Derive a **weighted rubric** (4–7 criteria, weights sum to 100%, each with a concrete "what a 10 looks like" anchor).
3. Set the **achieved-bar** (default: weighted ≥ 9.0/10 sustained across **2 consecutive** fresh-eyes runs, no single criterion < 8) and **max runs** (default 20).
4. Write the log header + rubric + empty scoreboard. **If a log already exists, read it and resume** from the next run.

**Each run K (1..max):**
1. **Fresh-eyes assessment.** Spawn a *subagent that has not seen the prior runs* (Explore/general-purpose). Give it only the rubric and access to the artifact (running app, files). It returns: per-criterion scores, weighted total, and the **single highest-impact gap** with a concrete suggestion. Using a fresh agent each time prevents grading on a curve / self-justification.
2. **Check the bar.** If weighted ≥ bar AND this is the 2nd consecutive run at-bar AND no criterion < floor → **achieved**: log it and exit the loop to the final report. (One at-bar run is not enough — require sustained.)
3. **Fix the top gap.** Make **one focused change** that targets that gap. Resist scope creep — a run does one thing well. Reuse existing patterns/components in the codebase.
4. **Verify.** Prove the change works and broke nothing: typecheck/build, relevant tests, and for UI, load it in the preview and check console + snapshot/screenshot. Record the evidence.
5. **Re-score** (quick self-estimate is fine here; the *authoritative* score is the fresh-eyes one at the top of the next run).
6. **Log the run** (the non-negotiable). Update the scoreboard row. Only now may run K+1 begin.

**Stop conditions:** achieved (bar sustained) · budget exhausted (max runs) · blocked (a gap needs a decision/credential/asset you can't supply — stop and report, don't thrash).

## Final report
- Verdict: achieved / not-yet (with how close) / blocked.
- Scoreboard trend (run 1 → final) and the verification evidence behind the final score.
- What changed across the loop (grouped, with file pointers) and what you'd do next if continuing.
- Point to the full log at `.goal/<slug>/log.md`.

## Rules
- **The fresh-eyes scorer must be a separate agent**, not you. You implement; an independent reader grades. No self-certification of "achieved."
- **One change per run.** Many small verified steps beat a big unverifiable rewrite.
- **Log regressions honestly.** If a change drops the score, the entry says so and the next run can revert.
- **Never fake verification.** If the build/tests fail, the run's verification field says failed and you fix it before claiming progress.
- **Stay in scope.** Only touch the artifact named in the objective. Don't wander into unrelated cleanup.
- **Respect the budget but honor early exit.** Stop the moment the goal is genuinely achieved-and-verified, even if runs remain.
