# Auth go-live (Clerk) — never ship on a dev instance

**Status**: hard-won checklist (2026-06-09), distilled from taking Patently (IP Radar) live.

## Why this exists (the trap)

Auth "worked" on Clerk's **development instance** through the entire build — so it
felt done. Then at launch we discovered the dev instance is a **launch trap**, and the
dev→prod migration (custom domain DNS + our own OAuth + key swap + webhook) turned into
a fiddly, last-moment scramble. Worse: local `.env.local` still held the **dev** keys
while prod ran **live** keys, which caused a stale-state misread — we looked at the local
key and wrongly concluded production was still in dev mode.

**The rule:** decide and provision **production auth EARLY** — before launch traffic,
ideally as part of go-live provisioning. **Never launch on a dev instance. Never read a
local Clerk key and assume that's what production runs.**

## Dev-instance limits (know these before you rely on it)

- **~100-user hard cap** — the 101st signup fails. A LinkedIn launch can blow past it.
- **"Development mode" + "Secured by Clerk"** watermark on the auth UI — looks unfinished.
- **Shared dev social OAuth** (Clerk's Google app, not yours) — the consent screen shows
  Clerk, it's rate-limited, and it's not meant for real users.
- **Separate user pool** — dev users do NOT carry over to production.

## Production go-live checklist (Clerk)

1. **Create the production instance** in Clerk (clones the dev config).
2. **Custom-domain DNS** — add Clerk's CNAMEs (`clerk`, `accounts`, `clkmail`,
   `clk._domainkey`, `clk2._domainkey`, …) on the product's domain; wait for "verified".
   Vercel-managed DNS makes this a few API calls.
3. **Your OWN OAuth credentials** per social provider (e.g. Google Cloud Console → OAuth
   consent screen + OAuth client → add Clerk's Authorized redirect URIs) → paste client
   id/secret into Clerk prod. The dev shared OAuth is dev-only.
4. **Swap keys**: put `pk_live_…` / `sk_live_…` into the host's **Production** env ONLY
   (not Development/Preview). Keep dev keys in local `.env.local`.
5. **Webhook**: Clerk → Webhooks → add endpoint `https://<domain>/api/webhooks/clerk`,
   subscribe to `user.*` (+ others you need), copy the signing secret →
   `CLERK_WEBHOOK_SECRET` in the Production env. NOTE: the webhook only fires on **new**
   events — it won't backfill existing users; resolve emails via `clerkClient` on-demand
   in admin views.
6. **Branding**: set the Application name (the sign-in card title + Clerk emails).
7. **Redeploy** so the live publishable key is baked into the client bundle.

## Verify (don't trust the dashboard alone)

- Fetch the live sign-in page and confirm it ships **`pk_live_`** (not `pk_test_`):
  `curl -s https://<domain>/sign-in | grep -oE 'pk_(live|test)_[A-Za-z0-9]+'`
- Decode it to confirm the **custom frontend-API domain**:
  `echo -n '<the base64 after pk_live_>' | base64 -d` → should print `clerk.<domain>$`.
- **No "Development mode"** banner on the auth UI.
- Clerk → Webhooks shows recent **successful** deliveries.
- A throwaway signup creates a user in the **production** instance.

## Gotchas (the ones that bit us)

- **Local ≠ prod keys.** `.env.local` = dev keys; the host's Production env = live keys.
  ALWAYS verify prod by the **shipped `pk_` prefix / frontend-API domain**, never by the
  local key. (This exact confusion cost a debugging detour.)
- **Shared DB across instances.** If dev + prod share one database, dev-era userIds won't
  resolve against the live Clerk key (different pool) — they show as raw IDs in admin.
  Harmless test noise; real prod signups resolve fine.
- **Going-prod is also a credential rotation** for auth — `pk_live`/`sk_live` are fresh,
  retiring any burned dev keys. (The *other* secrets still need separate rotation.)

## Where this fits

This is the production-grade version of stage 5 (`auth`) of
[`go-live-provisioning.md`](go-live-provisioning.md). Until that stage is automated, run
this as a manual checklist — and run it BEFORE the launch push, not during it.
