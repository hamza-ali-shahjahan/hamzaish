# 2026-07-02 — Backend on self-owned Supabase, not Lovable Cloud

**Decision:** Muakkil's database/auth run on a Supabase project in the operator's own account. The Lovable-managed project (`mdlwixmwvdqwwpanzmzb`, provisioned during the buildathon) is retired after a one-time waitlist export. Lovable remains a frontend editor via GitHub sync only; database and auth changes happen in the operator's own dashboard + `supabase/migrations/` files.

**Why:** Data ownership and sovereignty — the venture platform's core asset is user/venture data, and it should never live in a vendor's org the operator can't directly access (the operator discovered they couldn't even see the project in their own dashboard). Also removes Lovable as a single point of failure for the backend.

**What would prove it wrong:** Self-managed Supabase ops (auth SMTP, migrations, key rotation) costing meaningful founder time that Lovable Cloud would have absorbed, without a corresponding ownership benefit at beta scale.

**Revisit trigger:** If Lovable's resync starts fighting the repo's `.env` (rewriting it back to its managed project), decide then between pinning `.env` or disconnecting Lovable Cloud from the project entirely.
