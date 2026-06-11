# 2026-06-09 — Don't launch on a Clerk dev instance (auth is a go-live task, not a build task)

## What happened

Taking Patently (IP Radar) live, auth "worked" on Clerk's **development instance** the
whole build — so it felt finished. At launch we hit the dev-instance trap: 100-user cap,
"Development mode" watermark, shared dev Google OAuth. The dev→prod migration (custom
domain DNS + our own OAuth + `pk_live`/`sk_live` swap + webhook) became a fiddly,
last-moment scramble instead of a planned step.

Then a second, sneakier failure: I read the **local `.env.local`** Clerk key (`sk_test`,
dev) and concluded production was still in dev mode — when prod had **already** been
migrated to a live instance (`pk_live`, custom domain `clerk.patently.legal`). Stale
local state masquerading as production truth. Cost a debugging detour and a wrong status
report to the operator.

## Lessons (now guardrails)

1. **Auth is a GO-LIVE task, not a build task.** Provision the **production** auth
   instance before launch traffic — never launch on a dev instance. Decide early.
2. **Never read a local Clerk key and assume it's production.** Verify prod by what it
   SHIPS: `curl /sign-in | grep pk_(live|test)` and decode the publishable key to the
   frontend-API domain. Local `.env.local` = dev keys; host Production env = live keys —
   they legitimately differ.
3. **Webhook only fires on new events** — won't backfill existing users. For admin views,
   resolve user email/name via `clerkClient.users.getUser()` on demand.
4. **Shared DB + separate Clerk pools** = dev-era userIds won't resolve against the live
   key (different pool). Harmless, but explain it rather than calling it a bug.
5. **Going-prod doubles as auth credential rotation** (`pk_live`/`sk_live` are fresh) —
   but the *other* burned secrets (LLM, email, data APIs, DB, cron) still need their own
   rotation; don't assume the auth migration covered them.

## What was built

- New playbook **`factory/playbooks/ai-native-2026/auth-go-live.md`** — the full Clerk
  production checklist (instance, DNS, own OAuth, key swap, webhook, branding, verify) +
  the gotchas above.
- Beefed up stage 5 (`auth`) + verification A7 in `go-live-provisioning.md`: the gate now
  asserts prod ships `pk_live_` + a custom frontend-API domain and shows no dev banner.

## How to apply

When a product approaches launch, run the auth-go-live checklist as a deliberate step.
Add an A7-style "is-this-actually-production" assertion to any go-live eval. Treat
auth-prod with the same seriousness as the domain buy — it's the same kind of
end-moment-or-it-bites footgun. Related: [[2026-06-08-naming-pipeline]].
