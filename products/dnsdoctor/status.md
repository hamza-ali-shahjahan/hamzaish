# DNSDoctor — Live Status

**Last updated**: 2026-05-26 (factory onboarding)
**Stage**: MVP
**Model**: Free public tool (v1); paid monitoring deferred

## North star

Ship the free public tool to a usable v1. Three features must work cleanly:
1. Global propagation check across 20+ resolvers in <5s
2. AI diagnosis grounded in actual records (no hallucinated records)
3. Stack-aware setup wizard with paste-ready output for common stacks

## What's done (per CLAUDE.md / SPEC — verify on next session)

- [x] Architecture locked — server-only DNS, Upstash cache + rate limit
- [x] SPEC.md authored
- [x] ADR log at `docs/decisions.md`
- [x] AI prompt structure documented
- [x] Cache-key discipline (sha256 of sorted records)
- [x] Privacy boundary (no persistence beyond cache TTL)

## Outstanding

- [ ] Status of the 3 main features — what's shipped, what's in progress
- [ ] Test coverage status (vitest + playwright)
- [ ] Production deploy status
- [ ] Rate-limit tuning under load
- [ ] AI citation post-validator — is it active in prod?

## Today's recommended action

→ **Run `/work-on dnsdoctor` to load full context. Likely next focus: verify AI-diagnosis citation post-validator is active.**

## Open decisions

- Stage: v1 ships free → measure adoption → decide paid monitoring tier scope
- Launch channel for v1 (devs / SRE Twitter / HN / dev.to / Reddit r/devops?)
- Sean Ellis target for the free tool (proxy metric: weekly returning users)

## Explicitly deferred

- Paid monitoring tier
- Authenticated dashboard
- Domain monitoring + alerting
- Historical propagation timelines

## Verification gate before launch

- [ ] Real-resolver tests passing reliably
- [ ] AI citation post-validator covering every model output
- [ ] Rate limit holds under burst from a single IP
- [ ] Setup wizard tested against ≥10 stack combinations
