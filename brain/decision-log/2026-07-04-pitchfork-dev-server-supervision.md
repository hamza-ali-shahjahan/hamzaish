# Decision — pitchfork as the supervised dev-server floor

**Date:** 2026-07-04
**Status:** Adopted for the starter + go-live (opt-in); pilot-validated, fleet rollout deferred
**Scope:** factory — product starter, `/go-live` localhost-link verification
**Companion:** `brain/decision-log/2026-07-04-fnox-secrets-backend.md` (Phase 1). Phase 2 of the jdx/en.dev toolchain evaluation.

## Decision

Adopt **pitchfork** (jdx/en.dev, https://pitchfork.jdx.dev) as the *opt-in* supervisor for local dev servers in Hamzaish products, replacing ad-hoc `bun dev`. Ship a validated `pitchfork.toml.example` in the starter, add its MCP server to `.mcp.json.example`, and wire `/go-live` to verify a server is up (via pitchfork) before emitting any localhost link. **The reverse proxy (CA install + `/etc/hosts` edit) is deliberately NOT enabled by the template** — it's a system change the operator turns on explicitly.

## Why

Ad-hoc dev servers orphan on ^C, collide on ports, and die between sessions — and the operator's global rule is "never hand over a dead localhost link." pitchfork supervises: start-once (idempotent), ready-checks, persistence across sessions, and an MCP server so an agent can start/verify/stop servers. It's also the process-supervision half of the "safe unattended runs" floor (with fnox as the secrets half) that the autonomy grading (`brain/knowledge/2026-07-04-autonomy-grade-osmani-scale.md`) names as prerequisite to the orchestration rung.

## Pilot evidence (scratchpad, throwaway daemons — no showcase repos touched)

`code-paths.local.json` has an empty products map (all repo products are showcase), so there were no registered product repos to pilot against — piloted the mechanics in scratchpad instead, same discipline as the fnox pilot.

| Property | Result |
|---|---|
| HTTP ready-check gates "started" | ✓ waits, then `✔ started` |
| Endpoint actually serves | ✓ HTTP 200 |
| **Start-once idempotency** | ✓ 2nd start → "already running, use --force" |
| Supervisor persists daemon across shells/sessions | ✓ stays `running` |
| MCP tools for agents | ✓ `pitchfork_start/stop/restart/status/logs` |
| Crash detection | ✓ immediate-exit → `errored` + captured logs ("boom") |
| **Port-conflict false-positive** | ✗ **gotcha** — a 2nd daemon on an already-bound port reported `running` while its process had **died** (`Errno 48 Address already in use` in its logs), because the `--http` check was answered by the *first* server |
| Config-schema validated | ✓ real fields are `run`/`auto`/`ready_delay`/`ready_output`/`depends`/`cron`; a guessed `ready = {http=…}` table is **silently ignored** (checked against README, not assumed) |

## Honest limits (documented, not hidden)

- **Readiness ≠ liveness.** An HTTP/port ready-check confirms *something* answers, not that *this* daemon is alive. Mitigation baked into the template: prefer `ready_output` (matches the daemon's own stdout) and give each parallel product a **distinct port**.
- **Reverse proxy is a system change.** `pitchfork proxy` auto-installs a CA into the system trust store and edits `/etc/hosts`. Not enabled by the template; requires explicit operator action (escalation-gated).
- **Immaturity.** v2.15.0, ~550 stars — the least-adopted tool in the jdx set (37signals/entire.io-sponsored). Opt-in, not forced; the plain `bun dev` path still works.
- **No agent deny-rules needed** (unlike fnox): pitchfork commands expose no secret values, so the agent may drive them at the shell or via MCP freely.

## What would prove this wrong / revisit trigger

- The port-false-positive or supervisor instability bites in real multi-product use → demote to "reference only" and lean on `ready_output` + manual curl checks.
- pitchfork release cadence stalls > 3 months, or the proxy/CA behavior changes.
- Revisit at the next quarterly toolchain review, or when the trigger-driven manager (autonomy L4→L5) actually dispatches runs against supervised servers — that's when supervision stops being a convenience and becomes load-bearing.

## Not in this decision

Fleet-wide rollout across all products (pilot + opt-in template only); production process supervision (local-dev only); coupling to any autonomous manager (this only makes it *possible*).
