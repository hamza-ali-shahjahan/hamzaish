# FACTORY ORDERS — the factory's weekly mandate

> **Template.** `bun run setup` copies this to `FACTORY-ORDERS.local.md` (gitignored — yours,
> never committed). Every unattended session — autonomy loop, heartbeat, cron job — reads the
> `.local` file FIRST and operates inside it. One file for the whole factory: per-product
> roadmaps live in each product's `status.md`; THIS file decides which products get effort,
> how much money, and when to stop. (Pattern: a versioned loop directive the worker re-reads
> every tick — allocation flows down, state flows up.)

## Mandate (rewrite every Monday)

<!-- One to three lines. Name products + the gate each is chasing. Example:
     - ventbox: GTM push — 10 signups this week (gate: traction)
     - dnsdoctor: PAUSED — no effort until ventbox push concludes
-->
- (no mandate set — unattended runs should refuse substantive work and idle on health checks)

## Budget (update the spend line every run)

- **Weekly cap:** $___ <!-- the HARD ceiling for all unattended work this week -->
- **Spend:** $0.00 / $___ <!-- updated from meta/telemetry/spend.local.jsonl; autonomy-loop enforces --max-spend-usd per run -->
- Auth note: on an API key these are real billed dollars; on a Pro/Max subscription they're
  API-rate *equivalents* (never billed) and the cap throttles your plan's shared 5-hour/weekly
  usage windows instead — same enforcement, different thing protected.
- Per-product weekly budgets live in each `product.config.json` → `gates.budgets`.

## Tick discipline

- Idle tick = ONE line: `spend $X/$Y · <what you're waiting on>`. Nothing else.
- Substantive output only when something verifiably lands (a gate moves, a slice ships).
- Never re-derive portfolio state — read `products/*/status.md` + the gate dashboard (`bun run check-gates`).

## Stop / complete conditions

- STOP when: the mandate's gate condition is verified, OR no remaining lever fits the
  remaining budget, OR a STANDING-ORDERS approval gate is reached. Then idle on health checks.
- Budget spent → hard stop (the loop aborts; do not creatively continue in-session).
- Blocked on a human → write the escalation, notify, stop. Never wait-loop on a human.

## Hard ops rules (append-only; each line earned by an incident)

- Branch-only; never push to main; no deploy, no publish, no send, no spend, no visibility
  changes — unattended. (STANDING-ORDERS.local.md is the authority table; read it.)
- Only measured numbers in reports — never claim on partial evidence; n=small stays labeled.

## Honesty rules

- The spend line and the mandate status must reflect the ledger and the repo, not optimism.
- "Done" requires the named verification (eval/e2e/live check) green — otherwise say "unverified".
