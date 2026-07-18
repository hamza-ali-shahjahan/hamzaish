# Retro — the factory control plane lands (v2.16.0)

**What shipped.** The orchestration layer the factory was missing: operator-local orders
(FACTORY-ORDERS / STANDING-ORDERS / HEARTBEAT, `.example` → `.local` via setup), a hard
dollar cap + per-session spend ledger on the autonomy loop, lifecycle gates
(states-and-dates) in `product.config.json` with `check-gates` as dashboard + guard, and
`/factory-launch` as the guided ritual. Everything eval-anchored (2 deterministic cases,
baselined) and unit-tested (24 new tests).

**What worked.**
- Studying before building: every component was a *port of a proven pattern* (loop
  directive file, standing orders, fail-open budget arithmetic) rather than an invention —
  the design survived first contact with the code because someone else had already paid
  for its scar tissue.
- The guard-first habit: `check-gates` run on the real portfolio immediately exposed the
  true state (14 registered products, zero gates) — the tool's first output was its own
  backlog, which is exactly what a forcing function should do.

**What didn't / watch.**
- The spend meter reads `total_cost_usd` from `claude -p --output-format json` — a CLI
  format drift would silently zero the meter. Mitigated (parser tolerates the old
  `cost_usd` name, warns on parse failure, treats the meter as a floor), not eliminated.
- `--stream` mode is unmeasured by design; it now requires the conscious
  `.autonomy-spend-ok` acknowledgement — watch that this doesn't become a habit-flag.

**Surprise.** The dashboard's first render was the verdict conversation the quarterly
review kept deferring: making the gate column exist made the absence of gates the
loudest fact in the repo. Rendering absence beats exhorting presence.

**Follow-ups.** Backfill gates for the 14 registered products (the gate-scored portfolio
review); heartbeat scheduling (Phase 2); GTM queue rails (Phase 3); per-session learning
extraction (Phase 4).
