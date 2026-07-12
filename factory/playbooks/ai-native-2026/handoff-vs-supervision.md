# Handoff vs. supervision — the two modes of dispatching an agent

Every time work goes to a subagent — a background Agent call, a `/goal` run, a workflow stage, a dispatched builder — the dispatch is one of exactly two modes. Conflating them causes both classic failures: a coordinator babysitting work it gave away (wasted context, second-guessed workers) and a supervised task finishing *silently* (nobody consumes the result, the work evaporates).

## Mode 1 — Handoff: ownership transfers

"Hand this off," "give this to another agent," "spin off a session for this."

- Give the worker **everything it needs to stand alone**: goal, constraints, file paths, definition of done. A handoff prompt that requires the parent conversation isn't a handoff.
- Then **stop monitoring.** No peeking at progress, no lifecycle obligations on the worker, no waiting. The worker's owner is now the operator, not you.
- If you catch yourself checking on a handoff, either you didn't trust the prompt (fix the prompt) or it was never a handoff (reclassify as Mode 2).

## Mode 2 — Supervised dispatch: you keep the goal

"Have an agent review this and report back," "fan out and collect," any workflow stage whose output feeds a next step.

- The coordinator owns the outcome; the worker owes a **completion report**. Every supervised dispatch states, in the prompt, that the worker must return:
  1. **What changed** — files touched / artifacts produced (or "nothing," explicitly)
  2. **Status** — done / blocked / failed — never an implied success
  3. **What's left** — remaining known work, even if "none"
  4. **Where the evidence lives** — test output, report path, eval score
- In Claude Code, enforce this mechanically: a structured-output schema on the Agent/Workflow call beats prose instructions.
- **Blocked workers ask, they don't guess** — one question, options listed, recommended first (the ambiguity protocol applies inside dispatches too).
- **Circuit-break**: three consecutive failures on the same task → stop re-dispatching, escalate to the operator with the failure trail. Retrying a fourth time is how token budgets die.
- **Shallow DAGs**: dependency chains deeper than 3–4 dispatches are a smell — restructure into waves the coordinator can actually reason about.

## Classification rule

Default **handoff** when the operator says hand off / give away / another session — even if they name a model or effort level. Default **supervised** only when they say supervise, monitor, wait for, collect, coordinate — or when the result demonstrably feeds a next step you own. Ambiguous? Tier-2 the ambiguity protocol: pick one, *say which you picked*.

## Anti-patterns

- **Dispatch-and-peek** — monitoring a handoff. Trust it or don't send it.
- **Fire-and-forget supervision** — dispatching Mode 2 work with no completion contract, then discovering later that nothing came back.
- **Review-report ≠ fix-authority** — a worker reporting findings doesn't authorize the coordinator to silently apply fixes; route fixes to whoever owns the code.

---

**Credit (port the idea, never the code):** distilled from Orca's inter-agent orchestration protocol (`skills/orchestration/` in https://github.com/stablyai/orca — task DAGs, injected dispatch preambles, exactly-once `worker_done`, decision gates, 3-failure circuit breaker), translated into discipline for Claude-Code-native dispatch. Health check passed: 12k+ stars, daily commits.
