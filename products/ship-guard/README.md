# ship-guard

A one-command, local-first "are you about to get ransacked?" safety check for any git
repo — installable as a `git pre-push` hook. No SaaS, no telemetry, zero dependencies,
nothing leaves the machine.

Packaged from the 2026-06-19 repo/account security audit
(`meta/security/REPO-ACCOUNT-SECURITY-AUDIT.md`): the same four checks that audit ran by
hand — committed secrets, tracked secret files, force-push blast radius, risky GitHub
Actions — turned into a standing, reusable guard.

- **Code**: a standalone repo **outside** this tree — `/Users/hamza/Claude/ShipGuard`
  (path registered in gitignored `code-paths.local.json` under slug `ship-guard`).
  Single-file Node scanner (`bin/ship-guard`), one-command installer, evals.
- **Goal / done-definition**: [`goal.md`](goal.md)
- **Scope (does / does-not)**: [`scope.md`](scope.md)
- **Status**: [`status.md`](status.md) · **Decisions**: [`decisions/`](decisions/) · **Validation**: [`validation/`](validation/)

> **Stage: MVP. HELD LOCAL** — no public GitHub repo, nothing pushed, by operator
> instruction. Publish + name-clearance pending an explicit go-ahead.

## What the MVP does today
- `ship-guard scan [path]` — scans a repo, prints a severity-graded PASS/FAIL report.
- `ship-guard install` — vendors a self-contained copy + writes a `pre-push` hook that
  blocks a push when a scan fails.
- Detects: API keys/tokens/private keys (incl. Supabase `service_role` JWT decoding),
  tracked `.env`/key files, armed-vs-protected auto-push setups, and risky workflows
  (`pull_request_target`, broad/missing permissions, secrets-to-forks, unpinned actions).
- Verified by evals: recall **1.00** on the bad-repo fixture, **0** blocking false
  positives on the clean fixture, install round-trip green.

See the code repo's `README.md` (`/Users/hamza/Claude/ShipGuard/README.md`) for full
usage. Left for v1 is tracked in [`status.md`](status.md).

> **Layout note:** this `products/ship-guard/` folder is *metadata only* (config,
> scope, goal, decisions, learnings) — committed into the public Hamzaish repo as
> showcase. The actual code is the separate held-local repo above, never inside Hamzaish.
