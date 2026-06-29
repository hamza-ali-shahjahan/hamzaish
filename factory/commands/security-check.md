---
description: Fast security baseline audit of a product — tracked secrets, unpinned/vulnerable GitHub Actions, workflow permission scope, untrusted-input triggers, and an RLS reminder. Returns a pass/fail checklist with a verdict.
argument-hint: <product-slug>
---

The user invoked: `/security-check $ARGUMENTS`

A fast, mechanical baseline audit — **not** a substitute for the full pre-launch
review in `factory/agents/mvp/security-reviewer/` (run that before real users).
This catches the cheap, high-signal config mistakes that AI-generated repos ship
silently. Companion to `/ship` and `docs/security.md`.

If `$ARGUMENTS` is empty, ask which product (or `Read ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/_portfolio.md` to list). Resolve the code path from
`${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/$ARGUMENTS/product.config.json` → `code_path` (the code lives at the absolute path it maps to). Run the checks **in that product's code repo**.

## Run these checks

### 0. Backend reality check (is there even a backend? — do this FIRST)
A site can look fully **static / "no backend"** when its backend is **env-gated** —
the data/auth client only initializes when env vars are present and degrades to
local-only when absent. **Never conclude "fully static / no backend / scales
trivially" from a keyless code read** — the keyed/production state is the truth.
First-timer rule: *if the site has a sign-in button, a save/share feature, or an
admin page, it HAS a backend — open the `.env` and check.*
- Read `.env`, `.env.local`, `.env.production`, `.env.example` — populated keys = the backend is **LIVE in prod** even if the code path is conditional.
- Grep deps + src for backend SDKs **even when usage is conditional**: `supabase`, `@clerk`, `firebase`, auth libs, `prisma`/`drizzle`/any DB client, server SDKs.
- Check hosting config (`vercel.json`, `netlify.toml`, `next.config.*`) for **rewrites/proxies to OTHER deployments** — a "static" route can front a separate app with its own scale limits.
- A site documented/claimed as "static" or "no backend" while env vars + a backend SDK say otherwise = **FAIL** (the verdict is graded on the wrong state). If a backend exists, then audit the scale ceilings: auth/**SMTP rate limits**, **DB tier limits** (connections/auto-pause/storage), and **RLS** (below). Full required list: `factory/playbooks/mvp-stage/security-checklist.md` → *Backend reality check*.

### 1. Tracked secrets / `.env` files
- `git -C <code_path> ls-files | grep -E '(^|/)\.env($|\.)'` — anything other than
  `.env.example` is a **FAIL** (a real env file is tracked).
- Confirm `.gitignore` ignores `.env`, `.env.*`, `*.env.local` and re-includes `!.env.example`.
- Run `gitleaks detect --no-banner -c .gitleaks.toml` if gitleaks is installed; if not, note it and recommend installing. Any finding = **FAIL** (and the key must be rotated, not just removed).

### 2. GitHub Action versions (pinning + known-vulnerable)
- For every `uses:` in `.github/workflows/*.yml`:
  - `@main`, `@master`, `@beta`, or any moving/branch ref = **FAIL** (unpinned — a moving tag can be repointed at malicious code). Want a version tag or, better, a full commit SHA.
  - **`anthropics/claude-code-action` below `v1.0.94`** = **FAIL**. Versions before
    v1.0.94 are subject to a prompt-injection → secret-exfiltration advisory; pin to `>= v1.0.94` (ideally the patched commit SHA). Flag bare `@v1`/`@beta`/`@main` on this action as unpinned-and-unsafe.

### 3. Workflow permission scope (least privilege)
- Each workflow should declare `permissions:` explicitly. Missing block = **WARN**
  (inherits the repo default, often `write`).
- Flag any `permissions: write-all` or broad `contents: write` / `id-token: write`
  that the job doesn't actually need = **FAIL**. The secret-scan / CI jobs want
  `contents: read`.

### 4. Untrusted-input triggers
- `pull_request_target` or `issue_comment` / `issues` triggers that then check out
  **and run** PR code, or pass issue/PR body text into a step = **FAIL** (classic
  privileged-context injection — the attacker controls the input, the job has the
  secrets). Treat all issue/PR/comment text as untrusted; see `docs/security.md`.
- Workflows triggered by forks that expose secrets = **FAIL**.

### 5. RLS-enabled reminder (Supabase)
- Not auto-verifiable from config alone — **remind + spot-check**: every table in
  `supabase/migrations/*.sql` that holds user data should have
  `enable row level security` + a policy. Grep for `enable row level security`;
  if a `create table` has no matching RLS, flag = **FAIL** (or **WARN** if you
  can't confirm). No `public`-readable policies on user data.

### 6. Deploy hygiene (quick)
- `.no-auto-push` marker present in the code repo (wip snapshots stay local). Missing = **WARN**.
- Production branch is `production` and Vercel's Production Branch is set to it (confirm with the user if unknown).

## Output — pass/fail checklist + verdict

Print a checklist (✅ pass / ⚠️ warn / ❌ fail), one line each, with the exact
file/line for every finding and the one-line fix. Then force a verdict:

- **❌ BLOCK** — any FAIL (a "static / no backend" claim contradicted by env-gated
  backend code, tracked secret, unpinned/vulnerable action, over-broad
  permissions, untrusted-input trigger, missing RLS on user data).
- **⚠️ CLEAR WITH CAVEATS** — only WARNs; list them with an owner/date.
- **✅ CLEAR** — all checks pass.

Do not grade on a curve. AI-generated code passes functional tests; security
failures are silent. If the user wants the deep pass, point them to the
`security-reviewer` agent and `factory/playbooks/mvp-stage/security-checklist.md`.
