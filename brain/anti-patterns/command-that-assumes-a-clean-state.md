---
name: command-that-assumes-a-clean-state
description: Handing the user `bun run dev` when a server is already running — the copyable command is correct in the abstract and fails in the state the user is actually in
type: anti-pattern
---

# A Command That Only Works From A Clean State

## The pattern

The agent gives a runnable, copy-buttoned command that is correct for a *fresh* machine and
fails on the machine the user is sitting at:

> **4. Restart the dev server.**
> ```bash
> bun run dev
> ```

The user pastes it and gets:

```
⨯ Failed to start server
Error: listen EADDRINUSE: address already in use :::3220
```

The command is not wrong. It is *incomplete* — it assumes a precondition (port free, no
server running, no stale process) that the previous steps did nothing to establish. Worse,
the agent frequently **created** that precondition violation itself, by starting a
background dev server earlier in the same session and never mentioning it.

## Why we don't do it

The copy-button rule exists so the user never has to translate prose into a working action.
A command that needs "…but first kill the old one, if there is one, which you'd know how to
do" hands the translation right back — and hands it back specifically to the beginner the
rule was written for. An experienced user knows to reach for `lsof`. A day-1 user reads
`EADDRINUSE` as *the thing is broken*, and stops.

The verb in the instruction is the tell. **"Restart" is not a command the user has — it is
two commands they have to know how to assemble.** Any time the prose says restart, reset,
re-run, redeploy, or "try again", check that a single pasteable command actually performs it.

## Do this instead

**Ship the verb as a script.** If the instruction says "restart", the project gets a
`restart`. One block, one paste, works from any state:

```json
"stop": "kill $(lsof -ti:PORT) 2>/dev/null || true",
"restart": "bun run stop && bun run dev"
```

`2>/dev/null || true` matters: `stop` must succeed when nothing is running, or `restart`
only works on the second try — the same class of bug one level down.

**And say what state it handles**, so the user knows it is safe to run blind:

> `restart` frees the port first, so it works whether or not a server is already up.

## The general rule

**A copyable command must be runnable in the state the user is actually in — including the
state this session put them in.** Before handing one over, ask:

1. Did *I* start something in the background that this collides with? Say so, or stop it.
2. Does this assume a port is free, a file is absent, a branch is clean, a process is dead?
3. Does the prose use a verb (restart / reset / redeploy) with no single command behind it?

If yes to any: make the command self-sufficient, or add the missing step as its own block.
Never bundle both into one block — one command per block stays the rule.

## Provenance

Live session on dinorun.lol, 2026-08-28. The agent started a dev server with `nohup` early
in the session, then later told the operator to run `bun run dev` to pick up new Stripe
keys. The port was still held by the agent's own process. The operator hit `EADDRINUSE` and
had to come back and ask — the exact stall the copyable-command rule exists to prevent.

Related: [`file-path-instead-of-paste-contents`](file-path-instead-of-paste-contents.md) —
same root cause, one step further out: a block the user cannot act on as given.
