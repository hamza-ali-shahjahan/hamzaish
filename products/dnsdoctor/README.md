# dnsdoctor

See [`product.config.json`](product.config.json). Code at `../dnsdoctor-code` (symlink → `/Users/hamza/Claude/DNSChecker`).

## What this is

Differentiated DNS toolkit. Three pieces:
1. **Global propagation check** across 20+ DNS resolvers in parallel
2. **AI diagnosis** of DNS/email issues (citation-grounded against actual records)
3. **Stack-aware setup wizard** that emits ready-to-paste DNS records for known stacks

**v1 = free public tool.** Paid monitoring tier on the roadmap.

## Stage

**MVP** — substantial codebase with SPEC.md, ADR log, deployment docs, AI-prompt docs.

## Stack snapshot

- Next.js 15 (App Router) + TypeScript
- Tailwind + shadcn/ui
- pnpm (deviation from Hamzaish default Bun — captured in product CLAUDE.md)
- Upstash Redis (cache + rate limit)
- Anthropic Sonnet 4.6 (AI diagnosis)
- Vercel hosting

## Working on this product

- Read `product.config.json`
- Read `../dnsdoctor-code/CLAUDE.md` — DNS-specific gotchas live there
- Read `../dnsdoctor-code/SPEC.md` for full specification
- ADR log: `../dnsdoctor-code/docs/decisions.md`
- Prompt structure: `../dnsdoctor-code/docs/prompts.md`

## Hamzaish-relevant gotchas

- **DNS queries are server-only**. Importing `lib/dns/*` from a client component leaks the user's IP — and won't work in-browser anyway
- **Real resolvers in tests** — no mocking. Use stable domains, retry-once on flake
- **5-second total budget** for 20-resolver checks; 2s per-resolver via `Promise.allSettled`
- **AI must cite actual records** — post-validate every record the model references against the raw DNS results passed to it. Without this guardrail, the model hallucinates
- **Cache key sorting matters** — `sha256(domain + recordType + sortedRecordHash)`. Don't fragment by ordering
- **Privacy**: don't persist user-submitted domains beyond cache TTL
- **Cloudflare proxy off** for MX/TXT in setup wizard output; never CNAME at apex

## Working flow

```
/work-on dnsdoctor
```
