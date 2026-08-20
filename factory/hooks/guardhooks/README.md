# guardhooks — policy the agent doesn't get a vote on

Four `PreToolUse` hooks that block a small set of unrecoverable actions before
the tool call runs.

The point is **where** the decision happens. A rule written in `CLAUDE.md` is
read by the agent, weighed by the agent, and — on a long enough timeline —
reasoned around by the agent. A rule in a `PreToolUse` hook is evaluated by the
shell, outside the model's context, on the way to the tool. The agent cannot
argue with it, cannot forget it under context pressure, and cannot talk itself
past it at 2am on the fortieth turn. Same instruction, different enforcer.

Everything here defends against the same shape of failure: an agent mid-cleanup,
confidently doing something that cannot be undone.

## The four

| Guard | Blocks | Still allowed |
|---|---|---|
| `guard-repo-visibility` | Making an existing public repo private, or archiving it | private→public, creating a new private repo |
| `guard-force-push` | Force-push, refspec-force, or remote-delete of a protected branch | Force-pushing feature branches |
| `guard-mass-delete` | Recursive-force delete aimed at `/`, a home directory, a system dir, `.`, `..`, or a bare glob | `rm -rf node_modules`, `rm -rf ./dist`, anything targeted |
| `guard-secrets-files` | Reading, writing, copying, or printing real-secrets files (`.env.local`, `id_rsa`, `*.pem`, …) | `.example` templates, and non-printing checks like `grep -c`, `test -s`, `wc -l` |

`guard-secrets-files` exists because of a specific mechanism, not general
caution: any file the agent touches becomes harness-watched, so when a human
later pastes real keys into it, the harness echoes the file's contents into the
chat transcript. The leak happens after the agent is done. The sanctioned
pattern is that the agent only ever creates `<name>.example` with placeholders,
and a human fills in the real file.

## Two rules every guard follows

**Fail open.** A guard exits non-zero *only* on a clear match. Malformed input,
a missing config, an unreadable file, anything unexpected — exit 0 and get out of
the way. A safety hook that breaks ordinary work gets uninstalled, and an
uninstalled guard protects nothing.

**One-shot overrides, not standing ones.** Three of the four take an override
token (`I-CONFIRM-FORCE-PUSH`, `I-CONFIRM-MASS-DELETE`,
`I-CONFIRM-SECRETS-FILE-ACCESS`) or an equivalent environment variable, meant to
be used for a single approved command after a human says yes out loud.

The never-private tier of `guard-repo-visibility` is the deliberate exception: it
has **no override**. A repo listed in `GUARDHOOKS_NEVER_PRIVATE` can only be
un-listed by a human editing the config by hand. That tier exists for
commitments you don't want an agent reasoning its way around, and an override
token would defeat the purpose of making it a separate tier at all.

## Install

`bun run setup` offers to register all four (it asks first — this edits your
global Claude Code settings). To configure:

```bash
cp factory/hooks/guardhooks/guardhooks.conf.example ~/.claude/guardhooks.conf
```

Then edit that file. Every setting is optional; the guards run with safe defaults
if it doesn't exist. To uninstall, remove the `PreToolUse` entries from
`~/.claude/settings.json`.

## Known limits

- **They read commands, not intent.** Matching is regex over the tool call. An
  action expressed a way the patterns don't anticipate — a wrapper script, an
  alias, a language binding — passes through. These raise the floor; they are not
  a sandbox.
- **Writing about a guarded action can trip the guard.** Authoring a script or
  doc containing `gh repo edit --visibility private` reads exactly like doing it.
  This bit during this folder's own construction. Route prose through a file-write
  tool rather than a shell heredoc, or phrase around the literal.
- **`guard-force-push` can't see your current branch.** It matches protected
  branch *names* in the command. `git push --force` with no branch named is
  allowed, because guessing wrong would break every feature-branch workflow.
- **Config is global, not per-repo.** One `guardhooks.conf` covers every repo on
  the machine. There is no per-project override.
- **Not a security boundary.** Anything with shell access can edit or unregister
  these. They stop an agent's confident mistake, not an attacker.
