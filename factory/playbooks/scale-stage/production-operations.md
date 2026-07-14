# Production Operations — Incident Response, Runbooks, Backup/DR

The moment a product has paying users, "it works on my machine" stops being enough. This playbook is the minimum operational layer for a one-person factory: enough to survive an outage at 2am without inventing the process during the fire.

> **Status: research-baked, not yet scar-tissue.** This codifies standard SRE practice (Google SRE, PagerDuty incident response) adapted for the bootstrapped stack — it has *not* yet been battle-tested by a Hamzaish ship. Tracked in [`meta/RESEARCH-BAKED-PRACTICES.md`](../../../meta/RESEARCH-BAKED-PRACTICES.md). Patch it the first time it meets a real incident.

## The principle

You don't rise to the occasion in an incident — you fall to your level of preparation. Three artifacts make that level non-zero: a **severity ladder**, a **runbook per known failure**, and a **tested restore**.

## Severity ladder (decide before you need it)

| Sev | Meaning | Response | Example |
|---|---|---|---|
| **SEV1** | Users can't use the core product; data at risk | Drop everything, fix now | DB down, auth broken, payments double-charging |
| **SEV2** | Major feature broken, workaround exists | Same-day | One route 500s, emails not sending |
| **SEV3** | Minor / cosmetic / single-user | Next working session | Layout bug, slow page |

For a solo founder the response *is* you — so the ladder's real job is permission to **not** panic over a SEV3 and to **stop everything** for a SEV1.

## Incident loop (the 5 steps)

1. **Detect** — Sentry alert, uptime monitor (BetterStack free tier), or a user email. Set these up *before* launch, not after.
2. **Triage** — assign a Sev. Post a one-line status (status page or a pinned tweet/Discord msg) the moment it's SEV1/2. Communicating early buys trust.
3. **Mitigate before you fix** — stop the bleeding first. Roll back the deploy (`vercel rollback` / redeploy last-good), flip a feature flag, or put up a maintenance page. A fast rollback beats a slow root-cause fix.
4. **Resolve** — fix forward once the bleeding stops.
5. **Retro** — every SEV1/2 gets a 15-min postmortem in `meta/retros/` (blameless: what happened, why it wasn't caught, what guardrail prevents a repeat). Promote the guardrail into a playbook or a test.

> **A breach is not an outage.** If data was (or may have been) accessed, this loop is the wrong runbook — switch to the data-breach runbook in [`security-at-scale.md`](security-at-scale.md) (contain → scope → notify → disclose → retro). An outage ends when service resumes; a breach ends when users are safe and informed.

## The "DB went down" runbook (the most common SEV1)

```
1. Confirm: is it the DB or the app? Check Supabase dashboard status + status.supabase.com.
2. If Supabase outage (theirs): post status, wait, nothing to fix. Subscribe to their status page.
3. If connection exhaustion (yours): you opened too many clients.
   → Use the pooled connection string (port 6543 / pgbouncer), not the direct one (5432),
     for serverless. This is the #1 self-inflicted DB outage on Vercel + Supabase.
4. If a bad migration: restore from PITR (see below) to just before the migration.
5. If quota/usage: you hit the free-tier ceiling — upgrade tier, it's instant.
6. Always: capture the timeline while it's fresh → retro.
```

## Backups & disaster recovery (the test that matters)

- **Supabase Pro includes Point-in-Time Recovery (PITR).** On the free tier you get daily backups only — know which you're on *before* you have data worth losing.
- **A backup you've never restored is a hope, not a backup.** Once, on a throwaway project, actually restore to a fresh DB and confirm the app boots against it. Write down the steps. That's your DR plan.
- **Migrations are forward-and-back.** Keep `supabase/migrations/` reversible where feasible; never hand-edit prod schema (it breaks PITR-to-migration parity).
- **Secrets have no backup.** Keep env vars in Vercel + a password manager. Losing the only copy of `SUPABASE_SERVICE_ROLE_KEY` is its own incident.

## Pre-paying-customer checklist

- [ ] Uptime monitor on the prod URL (BetterStack / UptimeRobot free)
- [ ] Sentry alerts routed somewhere you'll see them (email/Slack)
- [ ] You know your one-command rollback and have done it once
- [ ] Pooled connection string in use for all serverless DB access
- [ ] Backup tier confirmed; one restore rehearsed
- [ ] Severity ladder + this runbook skimmed by whoever is on call (you)

## Provenance

Authored 2026-06-07 as a research-baked default to close the "no production-ops layer" gap. Sources: Google SRE Book (incident management), PagerDuty incident response, Supabase production checklist. Awaiting first real-incident validation — see [`meta/RESEARCH-BAKED-PRACTICES.md`](../../../meta/RESEARCH-BAKED-PRACTICES.md).
