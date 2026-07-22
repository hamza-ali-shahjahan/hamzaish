# HEARTBEAT — the factory's weekly pulse checklist

> **Template.** `bun run setup` copies this to `HEARTBEAT.local.md` (gitignored). The
> heartbeat program (see STANDING-ORDERS) runs this checklist as ONE batched, context-aware
> pass — flexible timing, main-session context — as opposed to exact-time isolated cron jobs.
> Output: one report at `meta/telemetry/heartbeat/<YYYY-MM-DD>.local.md` + an updated spend
> line in FACTORY-ORDERS.local.md. If nothing changed since last pulse, the report is one
> line: `[SILENT] — no state change`. Keep prompts thin: this file lists WHAT to check;
> the how lives in the named skills/scripts.

## Checklist (in order)

1. **Gates** — run `bun run check-gates`. Copy the dashboard in. Flag OVERDUE at the top.
2. **Spend** — sum the week from `meta/telemetry/spend.local.jsonl`; update the
   FACTORY-ORDERS spend line; flag if any product consumed budget with no gate movement
   (the drifting-product smell).
2b. **Friction** — `bun run friction report`. Blockers to the top of the report; a source
   with 2+ entries this week is a `/learn-loop` candidate. Zero entries = one line asking
   whether the week was smooth or capture lapsed.
3. **Product state** — read each active product's `status.md` (focus · next actions · gate
   being chased). Note any status untouched for 14+ days (stale = silent failure).
4. **GTM queue** — count drafts waiting in `gtm/queue/` older than 7 days (drafted-but-never-
   published is wasted work — surface it, don't delete it).
5. **Escalations** — any `ESCALATION.md` under `.goal/*/` unresolved? Top of report.
6. **Mandate check** — does FACTORY-ORDERS still name this week's mandate, or is it last
   week's? Stale mandate → flag (the operator rewrites it Monday; the heartbeat never does).

## Report shape

```
# Heartbeat — YYYY-MM-DD
FLAGS: <overdue gates / spend anomalies / stale statuses / unresolved escalations — or "none">
<gate dashboard>
Spend: $X/$Y this week (per product: …)
Queue: N drafts (M stale)
```
