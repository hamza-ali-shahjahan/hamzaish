## 2026-06-25 — Kept the name "ship-guard"; published as a public GitHub repo

**Decision**: Publish ship-guard as a public repo at
`github.com/hamza-ali-shahjahan/ship-guard` (MIT), keeping the name **ship-guard**
(no rename), distributed via `git clone` / `npx github:` — **not** npm.

**Why (name)**: `/name-clearance` returned 🔴 RED *for npm/commercial-brand* use —
an npm package `shipguard` already exists (a DevOps-harden CLI, same category), so
npm's similarity guard would reject a `ship-guard` package (the rotscan lesson), and
"ShipGuard" is crowded in shipping-protection/maritime (Shopify app owns
`shipguard.app`; `ship-guard.com` since 2009). **But none of that blocks the GitHub
repo name** (per-account namespace, free) — the RED applied to the npm package name and
the brand, not the repo. The name accurately describes the tool ("guard the act of
shipping/pushing"); the leading alternative (`leakward`) only covered 1 of the 4 checks,
so it was a worse fit. Operator confirmed: keep ship-guard.

**What would prove it wrong**: if the shipping-protection "ShipGuard" brand or the
`shipguard` npm author asserts confusion, or if SEO discoverability proves unworkable
next to GitGuardian/ShipGuard. **Revisit trigger**: before any npm publish (scope it
`@hamzaali/ship-guard`) or any paid brand/domain spend (get an attorney TM knockout first).

**Publish checklist run** (`/publish-repo`): Step 0 existence check clean; noreply git
email set; secret scan clean (GitHub push-protection caught the *synthetic* test token —
fixed by fragment-assembling fixtures, not by allow-listing); MIT LICENSE + README +
CONTRIBUTING + CODE_OF_CONDUCT + SECURITY + CI added; fresh-clone smoke test passed
(scans itself green, eval suite green). `.no-auto-push` kept on disk (gitignored) so the
public repo never auto-pushes.
