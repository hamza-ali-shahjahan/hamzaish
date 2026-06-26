# 2026-06-26 — Attach BOTH apex and www on Vercel, or www serves a mismatched cert

## What happened

The founder hit a full-page **"This connection isn't private"** block on
`patently.legal` (surfaced/dramatized by NordVPN "Threat Protection Pro"). Root
cause was NOT a hack and NOT anything in that day's deploy: the apex
`patently.legal` had a valid Vercel cert, but **`www.patently.legal` was never
added as a project domain**, so Vercel never issued a cert covering the `www`
name. `www` still pointed at Vercel and even 307-redirected to the apex — but the
TLS handshake failed the name check *before* the redirect, because the presented
cert didn't list `www`. Browsers show a cert warning; NordVPN escalates it to a
scary block that reads like a compromise.

Diagnosis that nailed it (read-only):
- `curl -sSI https://patently.legal` → `200`, valid cert. ✅ apex fine.
- `curl -sSI https://www.patently.legal` → `SSL: no alternative certificate
  subject name matches target host name 'www.patently.legal'`. ❌
- `curl -skSI https://www.patently.legal` (ignore cert) → `307 → https://patently.legal/`,
  `server: Vercel` — so www WAS wired to Vercel, only the cert was missing.

## The fix

`patently.legal` is registered through Vercel (Vercel registrar + nameservers), so
DNS+certs are fully managed — no external DNS edits needed. One command from the
linked project dir:

```
vercel domains add www.patently.legal      # single-arg form when the project is linked
```

(The CLI's trailing `domains inspect` 403 is benign — that API is apex-scoped; the
add itself succeeds.) Cert auto-issued within seconds; `https://www.patently.legal`
then returned `200` with a valid cert (curl verified with no `-k`). Optional tidy-up:
set `www → apex` as a **Redirect** in the dashboard for one canonical URL (CLI can't
set the redirect type).

## The rule (now a guardrail)

**Every Vercel product ships BOTH the apex and `www` as project domains.** Vercel
only issues a TLS cert for names actually ADDED to the project — a `www` (or any
subdomain) that resolves to Vercel but isn't attached serves a *mismatched* cert,
which browsers/VPNs flag as insecure. DNS pointing at Vercel is NOT enough; the
name must be attached.

Verify BOTH, not just the apex:
```
curl -sSI https://<domain>/        # 200 + valid cert
curl -sSI https://www.<domain>/    # 200 + valid cert (no -k). If it errors → www not attached.
```

## Where it's baked in

- `factory/playbooks/ai-native-2026/go-live-provisioning.md`:
  - Stage 1 (domain) now says attach BOTH apex AND www (+ www→apex 308 redirect).
  - Assertion **A2** now checks a valid cert on apex **and** www (was apex-only —
    that omission is exactly why this slipped; A1 already checked DNS for both).

## Portfolio audit (2026-06-26, read-only `curl` of apex+www)

| Domain | apex | www |
|---|---|---|
| patently.legal | 200 | 200 ✅ (fixed this session) |
| hamzaish.com | 200 | 200 ✅ |
| ventbox.co | 200 | 200 ✅ |
| calculatrs.com | 200 | 200 ✅ |
| **theresasystemforthat.xyz** | 200 | ❌ same www-cert gap (CNAME→Vercel, 307→apex, no www cert) |

`theresasystemforthat.xyz` needs the same `vercel domains add www.…` fix — left
untouched pending the founder's go-ahead (don't change another product's prod infra
from outside it). Related: [[2026-06-09-clerk-prod-launch]] (other go-live footguns).
