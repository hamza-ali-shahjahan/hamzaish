# ship-guard — Scope

## Does
- **One-command install** of a git **pre-push hook** into any repo (`ship-guard install`).
- **Ad-hoc scan** of any repo (`ship-guard scan [path]`), printing a clear PASS/FAIL report.
- Detects the four "ransack" vectors from the 2026-06-19 audit:
  1. **Committed secrets** — Anthropic, OpenAI, Stripe/Clerk `sk_live_`, Resend,
     Neon/Postgres connection strings with passwords, webhook secrets, Sentry tokens,
     AWS keys, GitHub tokens, Google API keys, private-key blocks, and Supabase JWTs
     (decoded to flag `service_role` as CRITICAL vs `anon` as low).
  2. **Tracked secret files** — `.env` / `.env.*` committed to git (excluding
     `.env.example`), `*.pem`/`*.key`/`id_rsa`, service-account JSON, `*KEYS_VAULT*`.
  3. **Force-push blast radius** — detects auto-commit/force-push hook setups and
     whether auto-push is *armed* (`.auto-push`) vs. protected (`.no-auto-push` /
     `.no-auto-commit`); flags when a leaked token could wipe history.
  4. **Risky GitHub Actions** — `pull_request_target`, broad/`write-all` or missing
     `permissions:`, secrets exposed to forks, unpinned third-party `uses:` (tag/branch
     instead of full commit SHA).
- **Local-first**: zero network calls, zero telemetry, zero dependencies. Pure Node
  (runs on Node 16+ and Bun). Nothing leaves the machine.
- Severity-graded findings, a tuneable `--fail-on` threshold, and `--json` output.

## Deliberately does NOT
- No SaaS, no account, no dashboard, no phone-home.
- Does not rotate or revoke keys (it reports + links the rotation steps; the human acts).
- Does not rewrite git history or purge committed secrets (reports; points at BFG/git-filter-repo).
- Does not verify server-side branch protection (unreadable from disk — it *reminds* you to).
- Not a full entropy/verified-secret engine like gitleaks/trufflehog (named as the v1+ lever).
