# scope-intelligence

See [`product.config.json`](product.config.json) for the canonical manifest.

Code at `../scope-intelligence-code` (symlink → `/Users/hamza/Claude/Scope Intelligence`).

## What this is

Scope enforcement SaaS for small agencies (2-15 people). Integration layer on top of ClickUp, Asana, and Monday.com.

**Core value loop**: Define scope → Track scope → Catch creep → Price the overage → Recover revenue.

## Stage

**MVP** — substantial codebase exists, architecture + 15-vertical-slice spec are locked. The work now is shipping the slices and getting real-user validation.

## Stack snapshot

- Next.js 16.2 (App Router, Turbopack) + React 19
- Tailwind v4 + shadcn/ui (new-york, dark mode)
- Supabase + Drizzle ORM (multi-tenant, org-scoped queries)
- Clerk auth
- Vercel AI SDK + Anthropic (Sonnet 4.6 / Haiku 4.5)
- Stripe, Resend, Upstash Redis, Vercel

## Working on this product

- Read `product.config.json`
- Read `../scope-intelligence-code/CLAUDE.md` — Next.js 16 specifics live there
- Read `../scope-intelligence-code/docs/SPEC.md` and `docs/SPEC-README.md` for the slice plan
- Recent decisions in `decisions/`

## Hamzaish-relevant notes

- **npm, not Bun** (deviation from Hamzaish default; reason captured in product CLAUDE.md)
- **Next.js 16 quirks**: `proxy.ts` not `middleware.ts`, all params are `Promise<{ id }>` (await them), Drizzle schema is the source of truth
- **Multi-tenant**: every DB query must be org-scoped — security failure if not
- **Token hashing**: portal tokens never plaintext — `hashToken()` from `src/lib/tokens.ts`

## Working flow from Hamzaish

```
/work-on scope-intelligence
```

Loads this manifest + status + decisions + MVP-stage playbook + Scope Intelligence's own CLAUDE.md, then announces readiness.
