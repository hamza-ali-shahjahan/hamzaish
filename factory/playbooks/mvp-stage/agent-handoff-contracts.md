# Agent handoff contracts — make the seams between agents explicit

Source-of-truth playbook for multi-agent work in the factory. Ports MetaGPT's core discipline: encode the **SOP (standard operating procedure) between roles** so a handoff is a typed contract, not an implicit hope. Our [road-to-stars / repo study](../../../docs/LEARN-FROM-REPOS.md) flagged MetaGPT (entry C2) as the closest *structural* analog to Hamzaish's stage agents.

> **Principle:** A multi-agent system is only as reliable as its seams. The bug is almost never inside one agent — it's in the undocumented assumption about what the previous agent was supposed to hand over.

---

## The contract shape

Every agent-to-agent handoff in `factory/agents/` declares, in one short block:

- **Produces** — the artifact this agent hands forward (file, structured object, or named section). Name it; don't say "context."
- **Shape** — the schema/fields the next agent can rely on. If it's prose, say which headings are guaranteed.
- **Preconditions** — what must be true before this agent runs (e.g. "scope.md exists and is approved").
- **Postconditions / Definition of Done** — the checkable state after it runs (e.g. "PRD has acceptance criteria for every P0").
- **On gap** — what to do if a precondition is missing: stop and ask, or degrade gracefully. Never silently guess (mirrors the eval harness's `GAP` rule).

## Example — architect → builder

```
architect →
  Produces:  products/<slug>/architecture.md + a task list in plan.md
  Shape:     each task has {id, intent, files-touched, acceptance-criteria}
  Pre:       scope.md approved; stack chosen (stack/ or a decisions/ override)
  Post:      every P0 task has an executable acceptance criterion
  On gap:    if scope is ambiguous, STOP → problem-sharpener, don't invent scope
```

The builder can now rely on that shape instead of re-deriving intent from chat.

## Where this applies

- The stage chains in `CLAUDE.md`'s routing table (idea → mvp → launch → scale): each arrow is a handoff that should carry a contract.
- `/full-cycle` gates: each gate is a postcondition check. State the Definition of Done at the gate, not just "done."
- New agents: add the contract block to the agent's own `.md` so it travels with the agent.

## Why typed handoffs over "shared context"

"Just pass the context" scales badly: every new agent multiplies the implicit assumptions. A named contract makes a regression *locatable* ("Produces clause violated") and lets agents be swapped without breaking the chain — the same restraint OpenAI Swarm (entry C11) reaches for with minimal handoffs.

> **Anti-pattern:** an agent that reads the previous agent's *reasoning* instead of its *declared output*. Reasoning is private; the contract is the API. If you need the reasoning, the contract is missing a field.

---

**Credit (port the idea, never the code):** MetaGPT — https://github.com/FoundationAgents/MetaGPT (SOP-encoded role handoffs); OpenAI Swarm — https://github.com/openai/swarm (minimal-handoff discipline). See [`docs/LEARN-FROM-REPOS.md`](../../../docs/LEARN-FROM-REPOS.md) entries C2/C11.
