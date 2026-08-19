# Abuse & Cost Controls — Rate Limiting, Bots, Runaway Spend

An AI-native product has a failure mode the old SaaS playbook didn't: a single abusive user (or a bug in a loop) can run up a real bill in hours, because every request costs money downstream — LLM tokens, metered APIs, scan-billed queries. This playbook is the cheap insurance.

> **Status: tested, and found insufficient.** Patently followed this playbook and was still billed $93.91 in 17 days with zero users (2026-08-20). Everything below bounds *how big a call is*; nothing here bounds *whether the call should happen at all* — which is what actually failed. Read [`spend-belongs-to-a-customer.md`](../mvp-stage/spend-belongs-to-a-customer.md) first; this page is the second layer. Tracked in [`meta/RESEARCH-BAKED-PRACTICES.md`](../../../meta/RESEARCH-BAKED-PRACTICES.md).

## The principle

**Every metered downstream call needs a ceiling that a single actor cannot exceed.** Default-open is how you wake up to a $4,000 bill. Bound spend at three layers: per-request, per-user, and per-account.

**But a ceiling is not a gate.** Ceilings assume a human actor whose usage you want to bound. A scheduled job has no user, spends right up to every ceiling you set, and does it forever for nobody — so start by deciding *who is allowed to spend at all*. See [`spend-belongs-to-a-customer.md`](../mvp-stage/spend-belongs-to-a-customer.md).

## Rate limiting (per-user / per-IP)

- **Where**: at the edge, before the expensive work. On Vercel + Supabase, use Upstash Redis (`@upstash/ratelimit`, free tier) — serverless-friendly, no connection-pool cost.
- **What to limit**: every route that triggers an LLM call, an email send, a metered API, or a write. Unauthenticated routes (waitlist, contact, login) get the tightest limits — they're the bot targets.
- **Sane starting limits**: auth/reset 5/hour/email · AI-endpoints 20/hour/user (free tier) · public forms 3/min/IP. Tune from real traffic, don't guess forever.
- **Return 429 with `Retry-After`** — don't silently drop; legitimate clients back off, abusers reveal themselves in logs.

## Abuse & bot handling

- **Email enumeration**: same response whether an account exists or not (already in `security-checklist.md`).
- **Disposable-email block** on signup if abuse appears (the free tier is the abuse surface).
- **Bot defense for public forms**: a honeypot field + timing check beats a CAPTCHA for indie volume. Add Turnstile (Cloudflare, free) only when bots actually show up.
- **Per-account hard cap**: a free-tier user gets N AI actions/day, enforced server-side (not just UI). The UI limit is a suggestion; the server limit is the wall.

## Cost-runaway safeguards (the AI-native killer)

| Risk | Guard |
|---|---|
| LLM token blowup | Cap `max_tokens` per call; cap calls/user/day; use the cheapest model that passes evals (Haiku before Sonnet before Opus) — see `stack/agent-stack.md` |
| Retry storms | Bounded retries with backoff; never retry a 4xx; circuit-break a failing provider |
| Scan-billed queries (BigQuery et al.) | **`LIMIT` does not bound cost — it bills on bytes scanned, not rows returned.** Select only needed columns. **Do not assume a date filter prunes anything** — on a table you don't own it may prune nothing at all, and Patently paid a flat 231 GiB per query for months on that assumption (2026-08-20). **Dry-run every query** (free, exact) and set `maximumBytesBilled` *from that measurement*, below expected normal — a cap set above real cost never fires. (IP Radar 2026-06-04; corrected 2026-08-20) |
| Metered search APIs | Local-first cache (seed once, search free); enforce batch limits inside the provider wrapper, not at the call site |
| Background-job loops | Idempotent upserts + a max-iterations guard; per-item try/catch must *record* failures, not swallow them |

## Hard billing backstops (set these on day one)

- **Provider spend alerts + caps**: Anthropic usage limits, Stripe Radar, a billing alert on every metered service. Email yourself at 50% / 90% of budget.
- **A global kill switch**: one env var / feature flag that disables the expensive feature without a redeploy. When spend spikes at 3am, you flip it and investigate in the morning.
- **`stack/agent-stack.md`'s $200/mo cap is a *posture*, not a *mechanism*** — these alerts and caps are what make it real.

## Checklist

- [ ] Rate limiting on every metered/unauthenticated route
- [ ] Per-user daily cap on AI actions, enforced server-side
- [ ] `max_tokens` and model-tier discipline on every LLM call
- [ ] `maximumBytesBilled` on any scan-billed query
- [ ] Billing alerts + spend caps on every paid provider
- [ ] A no-redeploy kill switch for the most expensive feature

## Provenance

Authored 2026-06-07 to close the "no abuse / cost-runaway safeguards" gap. Cost-runaway rows draw on the real IP Radar BigQuery lesson; rate-limiting/abuse rows are research-baked standard practice awaiting first-incident validation — see [`meta/RESEARCH-BAKED-PRACTICES.md`](../../../meta/RESEARCH-BAKED-PRACTICES.md).
