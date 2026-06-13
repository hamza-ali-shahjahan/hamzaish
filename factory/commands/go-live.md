---
description: Guided, stateful provisioning of a product's production stack — deep-links, key-format validation, .env.local writes, a resumable ledger, CLI automation after signup. Hands off to /security-check → /ship. The walked version of SETUP.md.
argument-hint: <product-slug>
---

The user invoked: `/go-live $ARGUMENTS`

Take a **local-first** product (built with `/builder-mode`, running with zero accounts) to **production-ready**, one service at a time — then hand off to deploy. This is the walked, resumable version of `templates/product-starter-nextjs/SETUP.md`; the full protocol, service catalog, key-format checks, and state-ledger shape are in **[`factory/skills/go-live/SKILL.md`](${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/factory/skills/go-live/SKILL.md)** — read it first, then run it.

Short version:

1. If `$ARGUMENTS` is empty, ask which product (or `Read ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/_portfolio.md`). Resolve `code_path` from `products/$ARGUMENTS/product.config.json`; work **in that code repo** (where `.env.local` lives).
2. Read the resume ledger `.hamzaish-go-live.json` — skip services already `done`/`skipped`, resume at the first `pending`.
3. Walk the service catalog (required-to-deploy first): explain → deep-link → ask for key → **validate format** → write to `.env.local` → mark `done` (offer `skip`/`later` every step).
4. Automate after signup where safe (Vercel `env add`, `gh secret set`, Cloudflare DNS) — confirm before each mutation.
5. When the required set is green, **verify** the keys, then offer the handoff: `/security-check <slug>` → `/ship <slug>`. `/go-live` provisions; `/ship` deploys.

Hard rules: never commit a real key (only gitignored `.env.local` / the platform secret store); you can't create accounts for the user — guide, validate, automate-after. Where Builder Mode says "ship when you're ready," **this is the command that gets you there.**

This command lives at `factory/commands/go-live.md` (canonical); `.claude/commands/` symlinks there for auto-discovery.
