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
  - **Mandate hard rule:** no beta outreach until this rotation is *verified*, not just done.

## In flight
- [x] **SHIPPED 2026-08-20 — spending money now requires a paying customer.**
  Live on patently.legal via PR #17 (`dab5e72`); `/api/health` confirms the new build
  serves production. Decision `0005`.
  Google Cloud billed **$93.91 for Aug 1-17 with zero user traffic**. Measured by dry
  run: the public patents table does **not** prune on our `publication_date` filter, so
  *every* query — search, seed, single-patent lookup — scans a flat **231 GiB ($1.41)**.
  The daily digest ran **77 times, returned 0 items, sent 0 emails**, for one watchlist
  owned by a free test account; the Monday top-up cost ~$25/run to add a few hundred rows
  to a 58k index.
  Shipped: a live lookup requires a signed-in user on an active paid plan — never a
  scheduled job, never a free account, and explicitly never an admin account (test usage
  must not bill). Behind it: free dry-run pre-check + per-query byte cap, a monthly budget
  that **fails closed**, a `service_usage` ledger of every call billed or refused, alert
  emails at 50/80/100%, and month-to-date spend by caller on `/admin`. Digest now reads
  the local index (removes ~$42/mo); weekly BigQuery cron removed (opt in with
  `PATENT_INDEX_REFRESH=1`); seeds need an explicit `--i-will-pay`.
  Verified pre-merge against real BigQuery + the real database: cron refused at $0 billed,
  0 watchlists qualify, all 6 accounts blocked. 40 tests, existing suites green, no new
  lint errors, security review clean (its 2 robustness findings fixed before merge).
  **Expected Google spend at zero paying users: $0.**
  Open call for the operator: a $19 memo-pack buyer currently counts as free for this.

- [ ] **Slice — marketing/pricing surface pass (2026-08-16).** All of it sits in **PR #16
  against `main`**, 4 commits, Vercel preview green, **NOT deployed — awaiting the merge**,
  which is the operator's action. Done = patently.legal serves all four. Decision `0004`.
  (Now behind PR #17 on `main`; may need a rebase before merging.)
  1. Builder badge reads "Best value" with a non-AI-coded icon, on *both* pricing surfaces
  2. "Private beta" → "Public beta" in the nav pill, its hover-card, and 2 homepage mentions
     (legal copy in `/terms`, `/privacy`, `LegalPage` deliberately NOT changed — separate call)
  3. Homepage Builder card highlight strengthened to match `/pricing`
  4. Duplicate homepage disclaimer removed (kept the icon one, folded in the Terms link);
     Pricing now shows in the top nav for signed-in users too
- [x] **Wired this product into the factory (2026-08-16).** `code-paths.local.json` now
  points at the real repo, and the repo carries a `CLAUDE.md` so future sessions there
  re-enter the flow instead of running as plain coding sessions. See decision `0004`.

## Next gate
**validation — due 2026-08-16 (today), verdict DOUBLE-DOWN.** No `validation/` folder
exists yet. Either log 5 target-user conversations or record the debt explicitly
(`bun run check-validation copyright`).

**launch — due 2026-08-18 (2 days).** Verified against the live site 2026-08-16, and the
checklist's P0 list is partly out of date:
- ✅ **Legal pages** — `/privacy` and `/terms` both return 200. Checklist calls this an
  unmet P0; it is done.
- ✅ **Clerk on production keys** — prod serves `pk_live`, so the Clerk production
  migration landed. `product.config.json` still says "test keys"; that note is stale.
- ❌ **Credential rotation** — unverified for Anthropic, Resend, CourtListener, Voyage,
  Neon. Only the operator can close this (compare key creation dates in each dashboard).
  Clerk looks handled via the live instance. **Beta-outreach hold stays until verified.**
- ❓ **Prod migration 0001** — never confirmed applied.
- ❓ **Cookie consent + global cost caps** — not yet verified either way.

**Sprint-label drift:** config says `sprint: private-beta` and the stage line below says
"private beta", but PR #16 changes the site to say public beta. One of the two must move
once that merges.

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
