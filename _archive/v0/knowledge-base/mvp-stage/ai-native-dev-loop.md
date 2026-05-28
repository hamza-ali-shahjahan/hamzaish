# AI-Native Dev Loop

The session-by-session discipline for building with Claude Code (and similar agentic IDEs) without accumulating drift.

## The framework in one paragraph

Each Claude Code session should be **stateful in writing, stateless in memory**. Start by loading the written state (`CLAUDE.md` + `scope.md` + recent decisions). End by writing what changed back to disk. Between sessions, the agent has no memory — the docs are the memory. Get this right and Claude scales your output linearly with sessions; get it wrong and Claude re-derives architecture every time, drifting until the code becomes unmaintainable.

## When to use this loop

Every Claude Code session. No exceptions during MVP and Launch stages.

## The 9-step session protocol

### Open (before any code)
1. **`cd products/<name>` and open Claude Code in this folder**
2. **Read `CLAUDE.md`** — refresh architectural context
3. **Read `scope.md`** — verify the feature you're about to build is in scope
4. **Read last 3 `decisions/` entries** — know recent calls
5. **Plan the change in 3 bullets** before touching code. State files, tests, side effects.

### Build
6. **Implement** — small commits with clear messages
7. **Test** — don't claim done without verification. For UI changes: load the page in a browser. For data changes: query the DB. For API changes: hit the endpoint.

### Close (before moving on)
8. **Append session log** to `decisions/sessions.md`:
   ```
   ## YYYY-MM-DD HH:MM — <session topic>
   Built: <what shipped>
   Decisions: <any architectural calls made>
   Assumptions introduced: <list>
   Next: <what should follow>
   ```
9. **Update `CLAUDE.md`** if architecture changed — new dependency, new pattern, new convention.

## Anti-patterns

### "Skipping the open"
Jumping into code without re-loading context. Fast for 1 session, ruinous after 10.

### "I'll document later"
The decision was made in session, but the close was skipped. By next session, the rationale is lost.

### "Just one more feature"
Three features in one session. Decision log doesn't capture either of them well. Drift.

### "Refactor while you're in there"
Mixing scope changes with feature changes. Both lose review-ability. Different sessions for different intents.

### "Trust Claude on architecture"
Letting Claude infer the architecture from the code each time. Inferences drift. Drift compounds.

## Patterns that work

### Session topics, not project days
Each session has a topic ("ship the Stripe webhook handler", "add the keyword research connector"). Title the session log entry with the topic.

### Pre-commit hooks for self-check
Run linting, type-check, tests on pre-commit. Catches drift the human eye misses.

### "What broke that I didn't expect" log
Append to a `decisions/surprises.md` file when something behaved differently than your CLAUDE.md mental model implied. These accumulate into architecture corrections.

### Periodic re-read of CLAUDE.md
Every 2 weeks, read CLAUDE.md fresh and ask: "is this still accurate to the codebase?" Update if drifted.

## When to extract a pattern up to factory level

If you find yourself making the same architecture decision in 3+ products:
- Add it to the factory's `knowledge-base/mvp-stage/architecture-decisions.md`
- Update `stack/tech-stack.md` if it's a stack-level choice
- Bake it into `templates/product-starter-nextjs/` so the next product gets it for free

This is how the factory itself improves over time.

## What "good" looks like after 3 months

A product that's been through this discipline for 3 months:
- New Claude Code session boots and is productive within 5 minutes (reads CLAUDE.md + recent decisions)
- Decisions folder has 15-30 entries telling a coherent story
- CLAUDE.md is < 300 lines, current, references decisions by number
- Architecture is consistent — no "this part feels old / written by a different person"
- A new collaborator (or future Hamza) can read the docs and onboard in a day

## Source for follow-up

- Anthropic *Founder's Playbook* (the source playbook for this factory) — MVP chapter on persistent context
- Anthropic Claude Code best practices docs
- Karpathy on "vibes coding" + the counter-argument for written specs
