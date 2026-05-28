# Scope Intelligence — Live Status

**Last updated**: 2026-05-26 (factory onboarding)
**Stage**: MVP
**Sprint**: vertical-slice-build

## North star this sprint

Ship the 15 vertical slices in `docs/SPEC.md` to a usable v1, then onboard 5 small agencies for paid validation. Real revenue from the recovery loop is the proof point.

## What's done (per CLAUDE.md / SPEC reference — verify on next session)

- [x] Architecture locked (Next.js 16, Drizzle schema as source of truth)
- [x] 15 vertical slices defined in `docs/SPEC.md`
- [x] Interactive UI prototype at `docs/prototype.html`
- [x] Multi-tenant org-scoped query pattern established
- [x] Token hashing pattern for portal tokens
- [x] Clerk safe-wrapper convention for client auth

## Outstanding (verify next session)

- [ ] Status of each of the 15 vertical slices — which are shipped, which in progress, which queued
- [ ] First-customer interviews booked?
- [ ] Stripe + Clerk + Supabase connected in prod?
- [ ] Sentry + PostHog wiring
- [ ] Decision on launch channel (Product Hunt? cold outreach? agency communities?)

## Today's recommended action

(Updated by Hamzaish on every `/product-pulse scope-intelligence` invocation.)

→ **Run `/work-on scope-intelligence` to load full context, then ask which vertical slice is the current build target.**

## Open decisions

- [ ] Stage assessment: is this still "MVP" or has it crossed into "Launch"? Depends on whether real users are paying.
- [ ] Pricing for the recovery loop (overage pricing) — is this set?
- [ ] Sean Ellis target — defined yet?

## Explicitly deferred

(Populate from product team — to be confirmed.)

## Verification gate before launch

- [ ] All 15 vertical slices ship
- [ ] Multi-tenant security review (per `factory/agents/mvp/security-reviewer`)
- [ ] At least 5 paying agencies on the system
- [ ] Recovery-loop revenue proves the value prop

Full conventions at [`../scope-intelligence-code/CLAUDE.md`](../scope-intelligence-code/CLAUDE.md).
