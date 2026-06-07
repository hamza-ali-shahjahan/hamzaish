# Eval rubric — /go-live (provisioning harness)

The first **load-bearing** eval (per `meta/evals/README.md`: populate when a skill matters — shipping matters). `/go-live` is only "done" when the product is provably live. These assertions run against the REAL deployed product; the skill prints a scorecard, never a bare "done."

Full design: `factory/playbooks/ai-native-2026/go-live-provisioning.md`.

## Assertions

| # | Assertion | Method | Pass |
|---|---|---|---|
| A1 | Domain resolves | DNS lookup apex + www | both → Vercel |
| A2 | HTTPS serves | GET https://<domain>/ | 200 + valid cert |
| A3 | Health green | GET /api/health | ok:true, probes pass |
| A4 | Build current | /api/health.buildSha | == local HEAD short-sha |
| A5 | Auth gate | POST authed route, no session | 401 (not 500/200) |
| A6 | DB reachable | health db probe | ok |
| A7 | Signup works | Clerk test-mode user create | created |
| A8 | Email verified | resend domain status | verified (or pending+ETA) |
| A9 | Cron gated | GET /api/cron/* no secret | 401 |
| A10 | No secret leak | scan client bundle for env values | none |

## Scorecard format

`EVAL: 9/10 (A8 PENDING: Resend DNS propagating, recheck 1h)` — every run.

## The loop (self-evolving)

- Pass → write FACTORY.md, mark product `stage: live`.
- Fail → map assertion → remediation; attempt fix or surface the exact human gate.
- **Append every failure to `brain/learnings/`** (assertion id + cause + fix). Recurring failures get promoted to pre-checks. Ship success-rate climbs over time.

## Canonical cases (populate when building the skill)

`cases/` — 5 product shapes: (1) static marketing site, (2) Next.js + Neon + Clerk SaaS [IP Radar shape], (3) CLI/npm package [wp-to-astro shape, no domain], (4) API-only service, (5) product reusing an existing domain. Each asserts the relevant subset.
