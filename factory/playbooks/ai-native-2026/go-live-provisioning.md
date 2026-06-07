# Go-Live Provisioning Layer — the 0-to-live machine

**Status**: design spec (2026-06-04). Not yet built. This is the architecture for turning Hamzaish from a *build* accelerator into a *ship* machine — where a product goes from named to live-on-its-own-domain (auth + DB + email + analytics wired, deployed, verified) without the founder leaving the chat.

**Why this exists**: building IP Radar surfaced the gap. The code shipped in-session, but every *infrastructure* step forced a context-switch to a browser — buy the domain on Vercel, click through ID.me/USPTO, reset the Neon password in the dashboard, create the Clerk webhook, verify the Resend domain in DNS. `/scaffold` writes a `SETUP.md` *checklist* of these; it doesn't *do* them. The founder is the manual orchestrator across 5 dashboards. That's the bottleneck this layer removes.

---

## The principle

**Set up your factory once; never touch a provider dashboard again.**

A new Hamzaish user does a one-time "factory provisioning" (add a handful of API tokens to a local, gitignored vault). After that, every product they build is provisioned, deployed, and verified by the factory — domain bought, DNS pointed, DB created, auth wired, email verified, analytics on, deployed, and a live-health eval run — all from inside the session.

This is the **self-coordinating** half: the factory does the cross-provider orchestration a human used to do by tab-switching.

The **self-evolving** half is the eval harness (below): every go-live run verifies its own output against live assertions, scores pass/fail, and logs failures as learnings that improve the playbook. The factory gets better at shipping every time it ships.

---

## Architecture

### 1. The Factory Credential Vault (one-time, per user)

A single gitignored file — `~/.hamzaish/factory-keys.json` (or `factory/.keys.local.json`, gitignored) — holding the founder's provider tokens:

| Token | Provider | Unlocks |
|---|---|---|
| `VERCEL_TOKEN` | Vercel | project create, env push, deploy, **domain buy + DNS** (Vercel is also a registrar) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare *(optional)* | at-cost registrar + DNS, if preferred over Vercel domains |
| `NEON_API_KEY` | Neon | create project/branch/DB, get connection strings |
| `CLERK_SECRET` + Clerk **Dashboard API** | Clerk | create application, JWT templates, **webhook endpoints** |
| `RESEND_API_KEY` | Resend | add + verify sender domain, emit DNS records |
| `GITHUB_TOKEN` | GitHub | repo create (already have via `gh`) |
| `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, etc. | per-product AI | app runtime |

**Discipline (non-negotiable, ties to `commands/deployment-learnings.md`)**:
- Vault is gitignored, lives outside any product repo, `chmod 600`.
- Multi-line secrets stored base64 (Vercel CLI truncates multi-line stdin — learned the hard way).
- The factory reads the vault; it never echoes a secret back into chat or a commit.
- Per-product secrets get pushed to that product's Vercel envs (`--sensitive` on prod/preview, NOT development).

### 2. Provisioning MCPs (the hands)

Each provider gets a thin MCP server exposing the *mutating* operations the dashboards do. Build in priority order (highest manual-pain first):

| # | MCP | Key tools | Replaces the manual step |
|---|---|---|---|
| 1 | **registrar** (Cloudflare or Vercel domains) | `domain_search`, `domain_check`, `domain_register`, `dns_record_set`, `vercel_domain_attach` | "go to Vercel/Cloudflare, buy, click Configure, set DNS" — the exact thing the founder just did manually for patently.legal |
| 2 | **neon** | `project_create`, `branch_create`, `connection_strings`, `password_reset` | "Vercel → Storage → Neon → reset password" |
| 3 | **clerk** | `app_create`, `jwt_template`, `webhook_endpoint_create` | "Clerk dashboard → Webhooks → add endpoint → copy secret" |
| 4 | **resend** | `domain_add`, `domain_dns_records`, `domain_verify_status` | "resend.com → Domains → add → paste DNS → wait" |
| 5 | **vercel** (have partial via MCP) | `project_create`, `env_add`, `deploy`, `git_connect`, `runtime_logs` | already mostly automatable today |

Vercel domains API covers the registrar need for v1 (the founder already buys there) — so MCP #1 can ship as a thin Vercel-domains wrapper first, with Cloudflare as a later at-cost upgrade. **Registrar MCP is the single highest-leverage build** — it's the step that pulled the founder out of the chat most recently.

### 3. The orchestration skill: `/go-live`

A new factory skill (`factory/skills/go-live/`) that runs the pipeline for a scaffolded product. Composes the MCPs deterministically (like the clearance DAG in IP Radar — fixed stages, each verified before the next):

```
/go-live <slug>
  0. preflight   — vault has required keys? product has code_path + a chosen name?
  0.5 clearance  — name-clearance skill: same-industry collision + TM signal + domain.
                   HARD GATE — a RED verdict blocks the buy. (The patently.legal miss:
                   domain was free, the *name* collided with an 8yr-old patent platform.)
  1. domain      — registrar.domain_register(<name>) ; dns_record_set → Vercel
  2. repo        — gh repo create --private --source --push   (if not already)
  3. vercel      — project_create ; git_connect ; env_add (per-product keys from vault)
  4. database    — neon.project_create ; push DATABASE_URL(_UNPOOLED) to Vercel envs
  5. auth        — clerk.app_create ; push keys ; webhook_endpoint_create → /api/webhooks/clerk
  6. email       — resend.domain_add ; dns_record_set the SPF/DKIM/DMARC ; poll verify
  7. deploy      — vercel deploy --prod ; poll until buildSha matches HEAD
  8. EVAL        — run the go-live eval harness (below) ; emit a scorecard
  9. record      — write FACTORY.md to the repo (domain, project id, db id, urls, statuses)
```

Every stage is idempotent and resumable (re-running skips completed stages — same discipline as the patent seed's `onConflictDoUpdate`). A stage failure stops the pipeline with a specific remediation, never a silent continue (learned from the G06F21 silent-drop).

---

## The eval harness (the self-evolving part)

`/go-live` is only "done" when the product is **provably live** — not when the commands returned 0. The eval is a set of live assertions run against the real deployed product. This is the canonical case for `meta/evals/skills/go-live/`.

### Assertions (the rubric)

| # | Assertion | How | Pass criteria |
|---|---|---|---|
| A1 | Domain resolves | DNS lookup of the apex + www | both resolve to Vercel |
| A2 | HTTPS serves | `GET https://<domain>/` | 200, valid cert |
| A3 | Health endpoint green | `GET /api/health` | `ok: true`, all probes pass |
| A4 | Build is current | `/api/health.buildSha` | equals local HEAD short-sha |
| A5 | Auth gate works | `POST /api/<authed-route>` no session | 401 (not 500, not 200) |
| A6 | DB reachable | health `db` probe | ok |
| A7 | Auth signup works | create a throwaway user via Clerk test mode | user created |
| A8 | Email verified | resend domain status | "verified" (or flagged pending w/ ETA) |
| A9 | Cron gated | `GET /api/cron/*` no secret | 401 |
| A10 | No secret leakage | scan deployed env for values in client bundle | none |

### The scorecard + the loop

`/go-live` ends by printing `EVAL: 9/10 (A8 PENDING: Resend domain DNS propagating, recheck in 1h)` — never a bare "done." Then:

- **Pass** → write `FACTORY.md`, register the product as `stage: live` in its config, done.
- **Fail** → each failed assertion maps to a specific remediation. The orchestrator attempts the fix or surfaces the exact manual step (the rare thing that genuinely can't be automated, e.g. a provider's human-in-the-loop KYC).
- **Every failure is appended to `brain/learnings/`** with the assertion id + cause + fix. Recurring failures get promoted into the playbook as a pre-check (e.g. "always verify Resend DNS before asserting A8"). This is the self-improvement flywheel: the factory's ship success-rate climbs over time because every miss becomes a guardrail.

This mirrors the Karpathy eval-driven loop already in `eval-driven-development.md` — but applied to *shipping*, not just code quality.

---

## Build sequence (incremental, one MCP per session)

Don't build all of this at once. Each piece is independently useful:

1. **Registrar MCP** (Vercel domains wrapper) + extend `/scaffold`'s SETUP.md to call it. ← start here; it's the step that hurt most recently. ~1 session.
2. **Neon MCP** — DB provisioning. ~1 session.
3. **`/go-live` skill skeleton** wiring registrar + repo + vercel + neon (stages 0-4 + 7) and the **eval harness** (A1-A6, A9). This is the MVP go-live — the long pole minus auth/email. ~1-2 sessions.
4. **Clerk MCP** + stage 5 + A5, A7. ~1 session.
5. **Resend MCP** + stage 6 + A8. ~1 session.
6. **Cloudflare registrar** as an at-cost alternative to Vercel domains. Optional.
7. **Populate `meta/evals/skills/go-live/cases/`** with 5 canonical product shapes; run on every change to the skill.

After step 3, a founder can `/scaffold` then `/go-live` and get a deployed, DB-backed, domain-attached, self-verified product without leaving the chat. Steps 4-5 add auth + email. That's the whole vision, shipped incrementally, each step paying for itself.

---

## How `/full-cycle` and `/hamzaish` absorb this

`/go-live` becomes the SHIP phase's execution arm. Today SHIP runs a pre-launch *checklist*; with this layer it runs the *provisioning + deploy + eval* and reports a live scorecard. The momentum router (`/hamzaish`) gains a real "ship it" terminal state: idea → scaffold → build → **go-live (provisioned + verified)** — no human tab-switching in the loop.

The handoff contract: `/scaffold` produces the product folder + chosen name; `/go-live` consumes it and produces a live URL + `FACTORY.md`; `/portfolio-pulse` reads `FACTORY.md` to monitor it. Clean seams, each skill owns one transformation.

---

## The honest constraint

This does **not** make infrastructure free or magical. It makes it *keyless-after-setup*. The founder still:
- Does the one-time vault setup (add provider tokens once).
- Handles the rare genuinely-human gate (a provider's KYC, a payment method, an ICANN email verification) — but the factory *detects* these and hands the founder the single click, instead of making them discover it.
- Pays the provider bills (the factory provisions; it doesn't pay).

What changes: the founder goes from "manual orchestrator across 5 dashboards per product" to "approve a few prompts, click the occasional unavoidable human gate." For a portfolio of products, that's the difference between days of setup and minutes.
