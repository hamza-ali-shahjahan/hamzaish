---
name: operator-identity-template
description: TEMPLATE for the operator running this Hamzaish instance. Copy to operator.local.md and fill in. The local copy is gitignored so your personal details never leak when this repo is shared.
type: identity-template
---

# Operator — identity (template)

> **Copy this file to `operator.local.md` in the same folder, then customize.** The `.local.md` version is gitignored. Sessions load `operator.local.md` if present, else fall back to this template.

## Role
_(One paragraph: what you do, what you're trying to build, what unit defines progress for you.)_

Example: "Founder. Solo operator of an AI-native startup factory. Runs multiple products in parallel. Unit of progress = a product that earns $100K ARR."

## Working style
_(How you operate. Pace, quality bar, approval gates, cost discipline, how you handle disagreement. Be specific — Claude tunes to this.)_

- **Pace**: <fast / measured / depends>
- **Quality bar**: <reference a shipping product whose quality you benchmark against>
- **Approval gates**: <plan-first / just-do-it / hybrid>
- **Cost stance**: <bootstrapped / funded / hybrid>
- **Disagreement**: <push back hard then commit / defer to user / hybrid>

## Stack defaults

_(Your default tech stack. Claude defaults to these unless a product overrides.)_

- **Runtime / package manager**: e.g. Bun / pnpm / npm
- **Framework**: e.g. Next.js / TanStack Start / Astro / Hono
- **UI**: e.g. Tailwind + shadcn/ui
- **DB / auth**: e.g. Supabase / Clerk + Postgres / Neon
- **Hosting**: e.g. Vercel / Cloudflare / Fly
- **AI model defaults**: e.g. Anthropic Claude Sonnet (default), Haiku (cleanup), local Llama for offline
- **Email**: e.g. Resend / SendGrid / Postmark
- **Analytics / errors**: e.g. PostHog / Plausible / Sentry

## What you want the factory to do

_(The schlep work you want delegated. Be concrete.)_

- Scaffolding new products
- Drafting status snapshots
- Cross-product retros
- Eval reports
- Content generation
- Customer interview synthesis
- _(add your own)_

## What only you do

_(The judgment calls reserved for the human. Claude proposes, you decide.)_

- Picks what to build next
- Customer interviews
- Kill / double-down decisions
- Voice-of-the-founder copy
- _(add your own)_

## Communication preferences

- Format: <bullets / prose / tables / mixed>
- Emojis: <yes / no / sparingly>
- Preamble: <minimize / acceptable / not really>
- Response length default: <short / medium / long>

## Things to remember

_(Anything Claude should always have in context about you that doesn't fit above. Quirks, hard constraints, identity facts. NEVER put secrets here.)_

- _(e.g.: "I'm currently moving between two machines — assume cross-machine drift is possible.")_
- _(e.g.: "I don't use macOS Notifications — surface urgent items in-line.")_

---

## Setup checklist

- [ ] Copied this file to `operator.local.md` in the same folder
- [ ] Filled in every section with values that fit you
- [ ] Verified `.gitignore` excludes `brain/identity/*.local.md` (already done in this repo)
- [ ] Removed any sample text that doesn't apply to you
