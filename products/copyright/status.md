# Patently (formerly IP Radar) — Live Status

**Stage**: mvp (private beta)
**Status**: active
**Prod**: https://patently.legal
**GitHub**: https://github.com/hamza-ali-shahjahan/ip-radar
**Admin**: /admin (email-gated to hamza)

## North star this sprint
Private beta live on patently.legal → drive 5–10 target users through chat + clearance → collect feedback → lift fair-usage limits → public launch.

## Open immediately
- [x] Pick production domain → **patently.legal** (live)
- [ ] Run `pnpm db:migrate` on prod Neon — applies migration 0001 (cost breakdown columns)
- [ ] Rotate burned credentials (Clerk, Anthropic, Resend, CourtListener, Voyage, Neon)

## Done (key milestones)
- [x] Full-stack scaffold: Next.js 16 + Neon/pgvector + Claude tool-calling + Clerk + Resend
- [x] Research chat, clearance memo DAG (9-step pipeline), watchlist digests
- [x] Google Patents BigQuery replacing USPTO ODP
- [x] Full design refresh: Linear × Vercel, emerald accent, mobile-first
- [x] Personal-tier daily rate limits (50 chat / 50 clearance per 24h)
- [x] All-in cost tracking: LLM + embeddings + BigQuery breakdown per run
- [x] Admin dashboard at /admin (cross-user cost + run view)
- [x] Vercel auto-deploy via GitHub; CRON_SECRET rotated; GCP key base64 in envs
- [x] Citation contract validator — no hallucinated cases
- [x] 401 → sign-in redirect on clearance page

## Cost at 50-msg/day cap: ~$2–5 warm, ~$15 cold worst case per active user
