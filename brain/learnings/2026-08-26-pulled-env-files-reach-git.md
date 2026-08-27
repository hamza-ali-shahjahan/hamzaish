# 2026-08-26 — A file pulled from a host is a live secret, and ignore rules are only a convention

## What happened

Claude told Hamza to run a `vercel env pull` into a file named `.env.check`, so
he could read a value that `vercel env ls` shows only as "Encrypted". The file
arrived holding **every production credential** for GetHired: the database URL,
the Stripe secret and webhook signing keys, the session-signing secret, the
Resend key, the blob token, and the full Neon set.

An auto-commit hook staged it and pushed it to GitHub. It sat on the remote for
**thirteen minutes** before a `/ship` pre-flight gate flagged a `wip(auto):`
commit in the range and Claude looked at what was inside it.

The repo is private, sole collaborator, zero forks, zero watchers. Real
exposure was negligible — and that was luck, not design. The same mistake on a
public repo is a full credential compromise with a crawler watching.

## Why three existing protections all missed it

The house rule already says: never Read/Write/Edit a real-secrets file, and it
names `.env.local`, `.env.*.local`, `.dev.vars`, `*.pem` and friends. A
`PreToolUse` hook enforces it. All three layers missed, for the same reason:

- **The tool guard watches Claude, not git.** Claude never touched the file —
  it told the *user* to create it. Nothing in the tool layer was involved.
- **The ignore file covered `.env*.local`.** The new name did not match it.
  Worse, the name was Claude's own invention, made up in the moment.
- **The auto-commit hook stages everything.** It has no opinion about content.

Three guards, and none was watching the one path that mattered: an arbitrary
filename, created by the user, staged by a robot.

## The rules that follow

**Never invent a filename for pulled credentials.** Any command that
materialises live secrets — `vercel env pull`, `doppler secrets download`,
`heroku config` — must write to a path the ignore rules ALREADY cover, or not
run at all. When a value cannot be read from a listing, send the user to the
dashboard: a dashboard read leaves no file behind.

**Ignore rules are a convention; a commit hook is a wall.** Widening the
pattern is necessary and insufficient, because the next tool invents another
filename. GetHired now carries `.githooks/pre-commit` refusing any staged
`.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa*`, `credentials.json` or
`secrets.*`, with `*.example` explicitly allowed because templates are the
sanctioned pattern. `core.hooksPath` is set in the repo so it survives a clone.

**Auto-commit and secrets do not mix.** Any repo with a hook that stages
everything needs a content guard, not merely an ignore file. The two features
are individually reasonable and jointly dangerous.

## What to copy into a new product

1. Ignore `.env.*` with a `!*.example` negation — and make the negation cover
   ANY example, not the two that happen to exist today. A first pass at this
   blocked a legitimate `.env.probe.example` and had to be corrected.
2. `.githooks/pre-commit` from GetHired, plus `git config core.hooksPath .githooks`.
3. A line in the product's own brief: never invent a filename for pulled secrets.

## The check that actually caught it

`/ship`'s pre-flight step — "scan the range for `wip(auto):` commits" — is what
surfaced this, and it was looking for untidy history, not for secrets. Worth
keeping precisely because it forces somebody to look at what is about to
deploy. Without it, the file would have reached the production branch unseen.
