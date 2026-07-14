# DNSDoctor — Live Status

**Last updated**: 2026-07-09 (**v1 CODE-COMPLETE** — all 20 tasks done, one day after revival)
**Stage**: MVP → ready for launch prep
**Model**: Free public tool (v1); paid monitoring deferred

## North star

Ship the free public tool to a usable v1, then take it through the **Live Path gate** (`meta/goals/live-path.md`) — dnsdoctor is the chosen vehicle for the goal's first E1/E2 measurement. Three features must work cleanly:
1. Global propagation check across 20+ resolvers in <5s
2. AI diagnosis grounded in actual records (no hallucinated records)
3. Stack-aware setup wizard with paste-ready output for common stacks

## Where the build actually is (2026-07-09: ALL 20 TASKS DONE)

Revived 2026-07-08 (code found at the registered `code_path`, 4/20 tasks committed since May), finished 2026-07-09 across five chunked build sessions. Verified on the committed tree:

- **185 unit/integration tests passing + 4 key-gated live-API tests** (skip cleanly until real keys; auto-unskip after)
- **48 e2e passing**, incl. an axe accessibility pass (zero serious violations) + keyboard operability
- **Production build green — 248 static pages** (236 `/setup/[combo]` SEO guides + sitemap/robots/OG/tools)
- Lighthouse: `/` and combo pages **100 SEO / 100 a11y**; `/check/*` intentionally `noindex` (its SEO score reflects that, by design)
- Shipped: 20-resolver parallel propagation engine (<5s) · grounded AI diagnosis (email/web/Cloudflare-proxy; ungrounded output structurally impossible — validate → one strict Opus-escalated retry → typed failure) · stack-aware setup wizard with conflict detection · rate-limited + cached API with zero-spend guards

## Remaining to launch (operational, not code)

1. **Real env values** (user-entered): `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL/TOKEN` (provision a free Upstash Redis), `NEXT_PUBLIC_SITE_URL` — API routes 500 until then; 4 live tests then auto-unskip.
2. **Name + domain** — SPEC says "working name TBD": run `/name-clearance` (or `/name-product`) before buying anything. `NEXT_PUBLIC_SITE_URL` bakes into all 248 SSG pages, so the domain decision precedes the production build.
3. **Vercel project + env wiring** → `/security-check dnsdoctor` → `/go-live dnsdoctor` (**A1–A10 live gate — the Live Path goal's first E1/E2 measurement**) → `/ship dnsdoctor`.
4. Post-deploy: submit sitemap to GSC, live-smoke both APIs, add the CI workflow (SPEC §5 — no `.github/` yet; repo has no remote yet).

## Open decisions

- Stage: v1 ships free → measure adoption → decide paid monitoring tier scope
- **Name/domain**: SPEC says "working name, final brand TBD" — run `/name-clearance` before buying the domain (Live Path gate needs a real domain)
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
- [ ] **A1–A10 live gate passes 10/10 on the deployed URL** (`scripts/verify-live.ts` — Live Path M1)
