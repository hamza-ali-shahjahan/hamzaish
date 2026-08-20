# Agent governance

How this repo constrains an agent, and where each constraint is actually
enforced. Everything below is runnable — every claim names the file it lives in
and the command that exercises it.

## The claim

Most agent "safety" is instruction quality: better rules, in a better file, read
more carefully. That approach shares one weakness — the agent is both the reader
and the enforcer. It weighs the rule against the task, under context pressure,
on turn forty. Sometimes it decides the rule doesn't apply this time.

The alternative is to move the decision somewhere the agent doesn't sit. Four
layers here do that, each for a different kind of claim:

| Layer | The question it answers | Enforced by |
|---|---|---|
| Guard hooks | *May this action run at all?* | A shell process, before the tool call |
| Verification ledger | *Did the check really pass?* | Recorded exit codes, hash-chained |
| Eval harness | *Does this skill do what it claims?* | A judge that can't see the thing it judges |
| The brain | *What do we already know?* | Markdown a human can read and diff |

## 1. Policy evaluated outside the agent

Four `PreToolUse` hooks in [`factory/hooks/guardhooks/`](../factory/hooks/guardhooks/)
run as shell processes before a matching tool call executes. They block
un-publishing a public repo, rewriting history on a protected branch, recursive
deletes aimed at a root, and any read or write of a real-secrets file.

The important property is not the list — it's that the model never evaluates it.
The hook receives the tool call on stdin and exits 2 to refuse. There is no
prompt to reason about, no context in which the rule can be weighed against the
goal, and no turn count at which it degrades.

Two design choices are worth naming:

**They fail open.** A guard exits non-zero only on a clear match. Malformed
input, missing config, anything unexpected — exit 0, get out of the way. A
safety hook that interrupts ordinary work gets uninstalled, and an uninstalled
guard protects nothing. Every guard's test suite asserts both halves.

**One tier has no override.** Three guards take a one-shot token
(`I-CONFIRM-FORCE-PUSH` and friends) for a single command a human approved out
loud. The never-private repo list in `guard-repo-visibility` deliberately has no
such escape: a listed repo can only be un-listed by a human editing the config
file. A tier with an override is just a speed bump with extra steps.

```bash
bun test ./factory/hooks/guardhooks
```

58 cases, each guard asserting both that it blocks the real thing and that it
lets ordinary work through.

## 2. Verification that's recorded, not narrated

Every task in this repo closes with a receipt whose *Checked* line says how the
work was verified. That line used to be narration — composed by the same session
that did the work, and therefore worth exactly nothing as evidence.

[`scripts/verify.ts`](../scripts/verify.ts) runs each gate as a real subprocess,
captures the true exit code, and appends it to a hash-chained ledger. The
*Checked* line is then rendered **from those records**, not written by the
session. An empty ledger renders "nothing was verified" rather than reading as
success; a broken chain renders "altered."

```bash
bun run verify --all        # run the gates, record real exit codes
bun run verify --checked    # render the Checked line from the ledger
bun run verify --show       # full ledger + chain status
```

The ceiling is stated in the code and in the README: **tamper-evident, not
unforgeable.** Anything with a shell can append a false record. What the chain
buys is that doing so becomes a deliberate, detectable act instead of an
ordinary one. Claiming a stronger guarantee would be the exact failure the
mechanism exists to prevent.

## 3. A judge that can't see the builder

The eval harness ([`meta/evals/`](../meta/evals/)) grades whether a skill does
what it claims. Its hard rule is **agent-blind separation**: the thing being
evaluated has zero read or write access to its own eval case, fixtures, and
rubric. A skill cannot read the test it will be graded on, and the judge prompt
is never shown to the builder.

Verdicts are four-outcome rather than pass/fail, so "the criterion was never
checked" can't quietly render as a pass.

```bash
bun run eval
```

## 4. The knowledge layer

[`brain/`](../brain/) is markdown as source of truth — learnings, anti-patterns,
decision records, ingested external knowledge — with a derived SQLite FTS5 index
for retrieval. The index is gitignored and regenerable; the markdown is the
thing, and a human can read and diff all of it.

Decision records are gated on structure, not vibes: decision, why, alternatives
considered, what-would-prove-it-wrong, revisit trigger
(`bun run check-decisions`, enforced as a ratchet).

```bash
bun run ingest                      # refresh the derived index
bun run ask "what did we decide about X"
```

## What isn't built

Stated plainly, because a governance page that only lists wins isn't one:

- **No graph layer.** `brain/schema.sql` defines `entities` and `edges` tables
  with typed relations. They are **empty stubs**. Retrieval today is full-text
  search over markdown, not traversal over a graph, and there is no ontology,
  no formal vocabulary, and no reasoner.
- **No canonical-definitions layer.** Metric definitions live in per-product
  markdown. Nothing prevents two products from defining the same term
  differently — the pain that would justify building the semantic layer hasn't
  shown up yet.
- **The brain isn't served to other agents.** `/brain-ask` is a local CLI. There
  is no MCP server, no HTTP endpoint, no query interface for anything but this
  repo's own sessions.

## Limits

- **The guards read commands, not intent.** Matching is regex over the tool
  call; an action expressed a way the patterns don't anticipate passes through.
  They raise the floor. They are not a sandbox.
- **Nothing here is a security boundary.** Every mechanism on this page assumes a
  cooperative-but-fallible agent and a trusted operator. They stop confident
  mistakes, not an attacker with shell access.
- **Config is global.** One `guardhooks.conf` per machine; no per-repo override.

## Related

- [`factory/hooks/guardhooks/README.md`](../factory/hooks/guardhooks/README.md) — the guards in detail
- [`docs/security.md`](security.md) — the product-level security baseline
- [`meta/evals/PLAN.md`](../meta/evals/PLAN.md) — why the judge is blind
- [`brain/README.md`](../brain/README.md) — the knowledge layer
