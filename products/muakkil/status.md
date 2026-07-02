# Muakkil — Live Status

**Last updated**: 2026-07-02
**Stage**: MVP (venture-agent re-aim — Phase 1 build)
**Sprint**: venture-agent MVP — "speak your idea → launched"

> **Direction change 2026-07-02:** Muakkil is now a venture agent for non-technical founders (build + distribute end-to-end). See `decisions/2026-07-02-venture-agent-pivot.md`. The buildathon assistant scope below is superseded; kept for history. Validation (Mom-Test interviews + paid concierge pilot) runs in parallel with the build — debt recorded in the decision entry.

## North star this sprint

> A non-technical founder speaks an idea to Muakkil and, without touching code, DNS, or a marketing tool, gets a live product at their own domain with a launch executed and first-user data reported back. Metric: ventures reaching ≥10 non-founder users within 30 days.

## Phase 1 slices (each ships with an eval + e2e test)

| # | Slice | Status |
|---|---|---|
| 1 | Auth + Venture object + dashboard + approval queue | 🔨 in progress |
| 2 | Scribe intake (voice/chat → venture brief) | ⏳ |
| 3 | Seeker validation pack | ⏳ |
| 4 | Maker thin (brand kit + landing + waitlist, auto-deploy) | ⏳ |
| 5 | Herald-lite (domain, SEO/AEO, launch kit, welcome email) | ⏳ |
| 6 | Weekly founder report | ⏳ |
| 7 | Import-and-launch (Lovable/Bolt export → distribution) | ⏳ |

---

## Superseded buildathon status (history)

> Original sprint north star: user speaks a charge, gets a research email within 60s.

## What's done

- [x] Landing page (1465 LOC, ritual animations, scroll-driven curtain, sigil drawing, agent cards)
- [x] Email waitlist (Supabase, RLS-hardened, anon-INSERT only)
- [x] GA4 wired (`G-RYWKGMVS7K`, fires `page_view` on route changes)
- [x] Lovable round-trip sync working
- [x] Tech stack locked (TanStack Start · React 19 · Bun · Supabase · Cloudflare Workers)
- [x] Brand + voice + naming locked (Arabic موكّل + four-muakkal mythos)

## 48h timeline status

| Block | Status | Owner |
|---|---|---|
| 1. Foundation (auth UI, dashboard shell, migrations, env) | ⏳ pending | Lovable + Claude Code |
| 2. Voice + Scribe API (`/api/transcribe` via Groq) | ⏳ pending | Claude Code |
| 3. Orchestrator (`/api/orchestrate`, intent→plan, 10-charge eval) | ⏳ pending | Claude Code |
| 4. Seeker (`/api/seeker` with web search, `/app/seeker` UI) | ⏳ pending | Claude Code |
| 5. Herald — Email + Slack OAuth ⚠️ critical path | ⏳ pending | Claude Code |
| 6. Charge runner + SSE streaming | ⏳ pending | Claude Code |
| 7. Result UX (`/app/charges/:id`, recent charges feed) | ⏳ pending | Claude Code |
| 8. Quotas (middleware + error toast) | ⏳ pending | Claude Code |
| 9. Landing copy tweaks (Scribe role, "platform is live") | ⏳ pending | either |
| 10. Demo prep + submission (video, push, submit) | ⏳ pending | both |

## Critical path risks (from buildathon-plan.md)

1. **Orchestrator misroute** — mitigate with 10-canonical-charge eval before submission
2. **Slack OAuth eats > 4h** — ship email-only Slack v1.5 post-buildathon if needed
3. **Email deliverability** — `muakkil.app` DKIM/SPF v1 + `resend.dev` fallback
4. **LLM rate limits** — Anthropic Tier 1 + Groq free tier; queue-with-toast on 429
5. **DNS doesn't propagate** — `onboarding@resend.dev` for demo if needed

## Today's recommended action

(Updated by Hamzaish on every `/product-pulse muakkil` invocation.)

→ **Confirm Lovable Prompt 1 (auth) status. If not run yet: paste it. If run: pull, then start Block 1 (migrations + env wiring + /app/charge stub).**

## Outstanding decisions for Hamza

- [ ] Run Lovable Prompt 1 (auth)
- [ ] Drop API keys into `.env.local`: `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `RESEND_API_KEY`
- [ ] Create Slack app (Client ID + Secret) before Sunday afternoon
- [ ] Cloudflare DNS access ready for Resend `muakkil.app` setup

## Explicitly deferred to v2+

- The Maker (real code generation)
- Chrome extension (Whisper-Flow-tier dictation anywhere)
- Tab-audio meeting capture (Granola-tier)
- Herald scheduling (delayed sends)
- SMS / Twilio / Discord
- Speaker diarization, custom vocabulary
- Mobile/iOS/Android native
- Paid tiers + Stripe
- Workspace / team accounts

## Verification gate before submission

End-to-end smoke: open muakkil.app in fresh browser → Google sign-in → "Speak your charge" → say "Research the top 3 AI meeting note apps and email me a summary" → email arrives within 60s. Plus mobile Safari smoke (graceful text-input degrade).

Full checklist at `muakkil-code/docs/buildathon-plan.md` §Verification.
