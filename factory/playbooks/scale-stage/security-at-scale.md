# Security at Scale — Drift Re-Audit, Self-Scan, Breach Response, Retention

The ship-time gates (`/security-check`, the `security-reviewer` agent) verify the repo at the moment of deploy. At scale the threat changes shape: **drift** — the live system quietly diverging from the last audited state. A table added in the dashboard, a policy dropped in a hotfix, a bucket flipped public, data accumulating with no purge. Every mega-leak headline ("unsecured server, N billion records") is drift plus hoarding, found by a stranger's scanner before the owner's.

> **Status: research-baked, not yet scar-tissue.** Codifies standard practice (OWASP, GDPR Art. 33/34, Supabase production advisories) adapted for the bootstrapped stack. Tracked in [`meta/RESEARCH-BAKED-PRACTICES.md`](../../../meta/RESEARCH-BAKED-PRACTICES.md).

## The principle

**Verification must be continuous, and leakable data must be minimal.** A gate that fired once decays; data you never kept can't leak.

## 1. Drift re-audit — `/security-check <slug> --live`

The live mode (see `factory/commands/security-check.md` § Live mode) checks the **running system**, not the repo: RLS status of every live table, storage-bucket visibility, the Supabase Security Advisor panel, preview-deployment protection.

Run it on these triggers — each is checkable, none is optional:

- **Quarterly** for every product at Launch stage or beyond (calendar it; the quarterly `kill-or-double-down` review is the natural anchor — no product gets a verdict with a stale audit).
- **After any schema or storage change** that didn't go through `supabase/migrations/` (dashboard edits are the classic drift vector).
- **Before any scale push** (paid acquisition, launch spike) — traffic brings probes.

## 2. Self-scan the attack surface — see what the internet sees

Attackers find exposed data by scanning; the defender's move is scanning yourself first. Enumerate what is publicly reachable and confirm each item is *meant* to be:

- **Storage buckets** — every `public = true` bucket named and justified; user content is never in one.
- **Preview deployments** — an authed app's Vercel previews sit behind Deployment Protection, not obscurity.
- **Subdomains & dashboards** — everything DNS resolves to is inventoried; no staging DB UIs, `/debug` routes, or admin panels reachable without auth.
- **Backups & exports** — a backup copy is an exposure surface with the same sensitivity as the DB. It lives access-controlled (provider-managed PITR, not a bucket), and ad-hoc `pg_dump`s are deleted after use.

## 3. Data-breach runbook (this is NOT the outage runbook)

An outage ends when service resumes; a breach ends when users are safe and informed. If data was (or may have been) accessed:

```
1. CONTAIN  — rotate every key (service_role first), revoke all sessions,
              disable the exposed surface (bucket → private, route → down).
              Containment beats forensics; act on "may have", not proof.
2. SCOPE    — from logs: which tables/buckets, which rows, how many users,
              what fields (PII? credentials? tokens?). Write it down as you go.
3. NOTIFY   — GDPR: supervisory authority within 72h of awareness (Art. 33);
              affected users "without undue delay" when risk is high (Art. 34).
              Draft honestly: what leaked, when, what you did, what they should do.
4. DISCLOSE — public post if users are affected. Understatement discovered
              later costs more trust than the breach.
5. RETRO    — blameless, in meta/retros/, same as a SEV1: why the gate missed
              it, which guardrail prevents a repeat, promote the guardrail.
```

Severity: any confirmed or suspected data access is **SEV1** on the [production-operations](production-operations.md) ladder.

## 4. Data minimization & retention

Eleven billion leaked records is a hoarding failure before it's an auth failure.

- **Every table that stores user or event data names a retention rule at spec time** — "kept while account active", "purged after 90 days", or a written reason for forever. No named rule → it doesn't get stored. (Enforced in the spec template — `factory/skills/spec-driven-development/SKILL.md`.)
- **Logs and analytics purge on a schedule** — raw request logs ≤ 30–90 days; scrub PII before it enters them (already in `security-checklist.md`).
- **Account deletion actually deletes** — rows, storage objects, and analytics identifiers, not just the auth record.

## Checklist

- [ ] `/security-check --live` run in the last quarter for every Launch+ product
- [ ] Every public bucket / subdomain / preview URL named and justified
- [ ] Breach runbook read *before* it's needed; key-rotation steps known cold
- [ ] Every user-data table has a named retention rule; purges are scheduled jobs, not intentions
- [ ] One ad-hoc backup/export audit done: nothing sensitive sitting in a download folder or public bucket

## Provenance

Authored 2026-07-14 to close the "coverage is event-gated, not continuous" gap — prompted by the 7TB/11B-record open-server disclosure (drift + hoarding, the exact class this playbook defends). Sources: OWASP CheatSheetSeries, GDPR Art. 33/34, Supabase production checklist + Security Advisors. Awaiting first real drift-catch or (hopefully never) breach — see `meta/RESEARCH-BAKED-PRACTICES.md`.
