# Architecture Decisions

## The framework in one paragraph

Architecture decisions are the load-bearing choices that determine what's easy and what's hard six months from now. In an AI-native build, they're especially critical because **agentic coding compounds drift** — without written decisions, each Claude Code session re-derives them, and the codebase loses coherence. The cure: capture each decision as a short ADR (Architecture Decision Record) before code is written, then keep it referenced from `CLAUDE.md`.

## When to write an ADR

- Picking a database / framework / auth provider
- Adopting a pattern (e.g., "all server actions return `Result<T, E>`")
- Deciding what NOT to support (e.g., "no offline mode")
- Whenever a session ends with "we decided X because Y" worth remembering

## ADR template

```markdown
## ADR-NNNN — <title>
Date: YYYY-MM-DD
Status: Proposed | Accepted | Superseded by ADR-MMM

### Context
What's the situation that requires a decision? What's at stake?

### Decision
What did we decide?

### Why
Brief reasoning. What alternatives were considered.

### Consequences
- Good: what gets easier
- Bad: what gets harder
- Risks: what could go wrong

### Wrong if
What signal would prove this wrong? (Triggers re-opening the decision.)
```

Numbered sequentially. Stored in `products/<name>/decisions/`.

## The first ADRs every product should have

### ADR-0001 — Tech stack
Captures the deviation (or not) from `stack/tech-stack.md`. Examples of reasonable choices to log:
- "Next.js 15 App Router + Supabase + Stripe + Vercel — default per stack/tech-stack.md"
- "Switching auth to Clerk because we need SSO + audit log for enterprise prospects"

### ADR-0002 — Data model
The 3-5 core entities and their relationships. ASCII diagram fine.

### ADR-0003 — Auth & authorization model
- Who can sign up? (open / waitlisted / invite-only)
- What roles exist? (user / admin / owner)
- How is multi-tenancy handled? (RLS by org_id column)

### ADR-0004 — AI integration pattern
- Which Claude model is default for which task
- Prompt caching: on by default
- Where calls happen (server actions only / API routes / both)
- Telemetry: where do we log invocations?

### ADR-0005 — Background jobs
- Inngest by default
- When to use synchronous server actions vs jobs
- Retry / DLQ policy

## CLAUDE.md vs ADRs

- **CLAUDE.md** is the working brief — the synthesis you read at the start of every session
- **ADRs** are the source of truth — the full reasoning behind each decision

CLAUDE.md cites ADRs:
```
## Auth
Supabase Auth. RLS-based authz. See ADR-0003 for the role model.
```

When you change a decision, supersede the old ADR (don't delete it) and update CLAUDE.md.

## Patterns vs ADRs

If a pattern is universal across all your products (e.g., "always validate server-action input with zod"), put it in the factory's `knowledge-base/mvp-stage/architecture-decisions.md` (this file) — not per-product.

If it's product-specific (e.g., "in linkedup, all LinkedIn API calls go through the LinkedInClient class"), it's a per-product ADR.

## Common failure modes

- **No ADRs.** Foundation drifts every session. Eventually unmaintainable.
- **ADRs without "wrong if" sections.** Decisions become dogma. Hard to revisit.
- **ADRs as essays.** No one reads them. Aim for under 1 page each.
- **CLAUDE.md doesn't reference ADRs.** Disconnected from source-of-truth.

## Source for follow-up

- Michael Nygard's original ADR essay (2011): "Documenting Architecture Decisions"
- ADR Github org: github.com/joelparkerhenderson/architecture-decision-record (templates)
