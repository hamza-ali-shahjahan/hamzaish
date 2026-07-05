# Goal: The Live Path — set up once, live in minutes

> Status: **ACTIVE** — approved by the operator 2026-07-05, set against the go-live audit of the same date. Pursued via `/goal live-path` (run log will live at `.goal/live-path/`).

## Capability statement

A builder who has completed the one-time account setup (`stack/README.md`) can take any scaffolded product from local to a **live, verified production URL** — own domain, valid HTTPS, auth in production mode, email domain verified, analytics + error tracking receiving events, a working signup on the live site — in a single session, with automation handling everything after account signup, and with **no account-level re-setup on any subsequent product**.

## Named metrics

- **`time_to_live`** — wall-clock minutes of human involvement from `/go-live <slug>` start to all live-assertions passing (measured from the go-live ledger timestamps).
- **`manual_dashboard_actions`** — count of steps where the human must leave the terminal for a service dashboard (measured by the ledger: every step is tagged `automated` | `manual`).
- **`live_assertions_passed`** — score on the A1–A10 eval harness from `factory/playbooks/ai-native-2026/go-live-provisioning.md`, run against the live URL (not the local build).

## Evals (numeric, agent-runnable)

- **E1 — Fast path:** on a fresh scaffolded product with accounts already set up, `/go-live` → `/security-check` → `/ship` completes with `time_to_live ≤ 15` and `manual_dashboard_actions ≤ 5`.
- **E2 — Actually live:** the A1–A10 harness passes **10/10** against the deployed URL: domain resolves (apex + www), HTTPS cert valid, auth in production mode (not dev-instance — the IP Radar 100-user-cap trap), email domain verified, an analytics event and a Sentry test event received, and a real end-to-end signup completes on the live site.
- **E3 — Compounding:** three consecutive products ship through the same accounts with **zero** account-level setup steps re-executed (ledger shows all account-stage items auto-skipped on products #2 and #3).

## Acceptance rule

The goal is met when **E1 and E2 pass on two different products** — one on the default path (Supabase), one on the scale path (Neon + Clerk) — **and E3 holds across three ships**, verified by a fresh-eyes agent reading only the ledgers and the live URLs, not the chat.

## Non-goals (explicit, so scope can't creep)

- **Not** automating account creation, ToS acceptance, or card entry — those stay human, permanently.
- **Not** building MCPs for every service — only the four audited dead-ends: registrar/DNS, Neon provisioning, Clerk app + webhook, Resend domain verification.
- **Not** load testing / multi-region / concurrency proofs — separate goal, after this one ships (stays research-baked until a real product needs it).
- **Not** distribution automation (marketplaces, affiliates) — separate goal.
- **Not** a cross-product cost/observability dashboard — Phase C-adjacent, parked.

## Feasibility check

- Already landed: fnox secrets backend (2026-07-04, red-teamed), pitchfork server supervision, `vercel env add` / `gh secret set` automation, the resumable per-service ledger, the A1–A10 assertion *design*.
- The build is bounded: wire the eval harness into `/go-live` (small), close four manual dead-ends via existing CLIs/APIs (medium), make the ledger account-aware across products (small).
- Anti-gaming: E2 runs against the live URL by a fresh-eyes agent, so "declared done" can't pass; E1's ledger timestamps are machine-recorded, not self-reported.
- Honest-copy dependency: `stack/README.md` previously claimed "product #2, #3, #10 in ~5 minutes" — softened 2026-07-05 (this goal is what earns the claim back). E3 passing restores it, with receipts.

## Milestones (suggested order)

1. **M1 — Prove "live":** wire A1–A10 into `/go-live` as a blocking verify step before handoff to `/ship`. (Highest leverage, smallest build — turns "declared live" into "verified live.")
2. **M2 — Kill the dead-ends:** automate registrar/DNS records, Resend verification polling, Clerk app + webhook creation, Neon provisioning — CLI/API first, MCP only where no CLI exists.
3. **M3 — The compounding fast path:** account-aware ledger so product #2 skips every account-level step; measure E1/E3 on the next two real ships.
4. **M4 — The kill switch, scaffolded:** PostHog feature-flag gating + `KILL_SWITCH` env pattern in the starter template, with a 3am runbook in production-operations.md. (From the abuse-and-cost-controls playbook — described, currently unbuilt.)
