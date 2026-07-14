# Skill Authoring — the standard

> Ported (idea, not text) from mattpocock/skills' `writing-great-skills` — see `references/mattpocock-skills/`. Wired into Hamzaish's existing routing-hygiene rule in `meta/factory-improving-factory.md`.

**A skill exists to wrangle predictability out of a stochastic system.** The goal is the same *process* every run — not the same output. Every rule below serves that.

## The two loads

Every skill spends one of two budgets, and choosing which is the first authoring decision:

- **Context load** — a model-invoked skill's description sits in the window every turn of every session. Measured 2026-07-14: our 42 skills + 24 commands cost ~3.8k tokens/session before any work happens.
- **Cognitive load** — a **user-invoked** skill (`disable-model-invocation: true` in frontmatter) costs zero context; the operator's memory pays instead.

**The split:** stay model-invoked only if the agent should reach for the skill autonomously mid-work, or another skill composes it. Deliberate rituals and one-command doors — provisioning walks, scaffolding, quarterly reviews — go user-invoked. Our `CLAUDE.md` command table is the **router** that keeps them discoverable, so the memory cost is already paid.

## Descriptions

The description is the router; the agent picks skills from descriptions alone.

1. **Front-load the leading word** — the description is where it does its invocation work.
2. **One trigger per branch.** Synonyms restating one branch are duplication — collapse them; keep only genuinely distinct triggers.
3. **Negative routing** (existing rule): name the nearest-neighbor skill and when to use *that* instead.
4. **No identity restatement.** What the skill *is* lives in the body; the description buys invocation and nothing else.

## Leading words

A **leading word** is a compact concept already in the model's pretraining that the agent thinks with while running the skill — *tight* loop, *fog of war*, *tracer bullet*, *red/green*, *relentless*. One word anchors a whole region of behavior in one token, and when the same word appears in prompts and docs, invocation fires more reliably. Hunt every skill for a spelled-out triad ("fast, deterministic, low-overhead") that collapses into one word (*tight*).

## Completion criteria

Every step ends on a done-condition that is **checkable** (the agent can tell done from not-done) and, where it matters, **exhaustive** ("every modified skill accounted for", not "produce a list"). This is the eval-gated-slice discipline applied to the skill itself. A vague criterion invites **premature completion**.

## The no-op test

Run it sentence by sentence: *does this line change behavior versus the model's default?* "Be thorough" fails — the model is already thorough-ish; *relentless* passes. Delete failing sentences whole; don't trim words from them.

## Progressive disclosure

`SKILL.md` holds only what every run needs. Reference that only some branches reach moves to a linked sibling file, loaded when its pointer fires. The pointer's *wording* decides whether the agent actually reaches it.

## When to split

Each new skill costs one of the two loads, so split only when the cut earns it: a distinct leading word that should trigger on its own, another skill that must compose it, or later steps tempting the agent to rush the current one.

## Failure modes — diagnose by name

| Mode | Smell | Fix |
|---|---|---|
| **Premature completion** | step ended before genuinely done | sharpen the completion criterion first; split the sequence only if the rush persists |
| **Duplication** | same meaning in two places | single source of truth; one-place edits |
| **Sediment** | stale layers no one dares remove | scheduled pruning pass |
| **Sprawl** | every line live, still too long | disclose reference; split by branch |
| **No-op** | a line the model obeys by default | delete it |
| **Negation** | "don't X" makes X *more* available | state the positive; keep a prohibition only as a hard guardrail, paired with what to do instead |

## When editing any skill

Before saving: run the no-op test on changed prose, check the description for one-trigger-per-branch + negative routing, confirm each step's completion criterion is checkable, and ask whether the skill's invocation mode still matches who actually fires it.
