# Your Stack & Accounts — Set Up Once

> **The front door to the factory's tech stack.** This is what every Hamzaish product is built on, the accounts you sign up for **once** (then reuse for every product), and — the part most stack docs skip — **what each service actually buys you beyond the obvious.** New here? Read this top-to-bottom once. After that, starting product #2, #3, #10 reuses the same accounts in ~5 minutes.
>
> Deeper docs: full rationale + when-to-deviate → [`tech-stack.md`](tech-stack.md) · click-by-click account walkthrough → [`../templates/product-starter-nextjs/SETUP.md`](../templates/product-starter-nextjs/SETUP.md) · how Claude is wired → [`agent-stack.md`](agent-stack.md).

## The canonical stack (2026 default)

> **Next.js 16** (App Router) · **Bun** · **Tailwind v4 + shadcn/ui** · **Supabase** (DB + Auth + Storage) · **Stripe** · **Resend** · **Vercel** · **Claude** (Opus 4.7 / Sonnet 4.6 / Haiku 4.5, prompt-caching always on)
>
> **Scale path:** when you hit multi-tenant B2B (separate orgs, SSO, a DB branch per preview), swap **Supabase → Neon + Clerk**. Proven on IP Radar and Scope Intelligence — not theoretical.

Picked on three rules: **(1)** the free tier carries you from $0 → ~$1K MRR, **(2)** setup is a web form or CLI, never infra work, **(3)** it's AI-native — Claude writes it well and tools talk to each other.

## What "package manager" / "Bun" / "runs TS" mean (if you're new)

A **package manager** downloads the pre-built code libraries your app depends on and tracks their versions. **Bun** is an all-in-one toolkit that's the package manager *and* the engine that runs your code *and* the test runner — one tool instead of three. "**Runs TypeScript directly**" means no extra build step: you point Bun at a `.ts` file and it runs. Fewer moving parts to babysit — why it's the default here.

## Accounts you set up once (reused across every product)

The magic of "set up once": these are **per-account**, not per-product. Sign up once, then every new product plugs into the same accounts.

| Service | The obvious job | **What it *also* unlocks** (the leverage) | Free tier | Sign up |
|---|---|---|---|---|
| **Vercel** | Deploy your site | **Provisioning marketplace** (spin up Neon/Upstash/etc. on *one* bill) · **v0** (AI generates UI) · a live preview URL for every pull request · cron jobs · edge functions · Speed Insights. A distribution + infra hub, not just hosting. | Hobby (100GB/mo) | [vercel.com](https://vercel.com) |
| **Supabase** | Database + login | **Half your backend in one account**: Postgres + Auth + file Storage + Realtime + **pgvector** (AI embeddings) + auto-generated REST API + a visual table editor. One signup, most of the backend done. | 50K users, 500MB DB | [supabase.com](https://supabase.com) |
| **Stripe** | Take payments | Also your **revenue source-of-truth / mini-CRM**: subscriptions, a hosted customer billing portal, **Tax** (handles global VAT/sales tax for you), invoices, fraud screening. | pay-per-txn (2.9%+30¢) | [stripe.com](https://stripe.com) |
| **Resend** | Send transactional email | Write emails as **React components**, plus **broadcasts** (so it doubles as your marketing-email tool), deliverability monitoring, webhooks. | 100/day, 3K/mo | [resend.com](https://resend.com) |
| **PostHog** | Product analytics | **5 tools in one** — analytics + **session replay** (watch real users) + **feature flags** + A/B tests + surveys. Replaces 3 separate vendors. | 1M events/mo | [posthog.com](https://posthog.com) |
| **Sentry** | Error tracking | Catches crashes *with the exact line + user context*, performance traces, release health. Find bugs before users report them. | 5K events/mo | [sentry.io](https://sentry.io) |
| **Cloudflare** | Buy your domain | Domains **at cost** (no markup) + free DNS + free SSL + **R2** (file storage with zero egress fees) + **Turnstile** (free, privacy-friendly CAPTCHA). | domains ~$10/yr | [cloudflare.com](https://dash.cloudflare.com) |
| **Anthropic** | The AI (Claude) | Not just a chatbot: the **Agent SDK**, **prompt caching** (cuts repeat-context cost ~10×), tool use, and MCP so Claude can read your DB/Stripe/etc. directly. | pay-per-token | [console.anthropic.com](https://console.anthropic.com) |

**Optional, add when you launch (free):** [GA4](https://analytics.google.com) + [Plausible](https://plausible.io) (web analytics), [Google Search Console](https://search.google.com/search-console) + [Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools) (SEO). **Pay-per-use:** [DataForSEO](https://dataforseo.com) (~$50 lasts months — powers `/keyword-research`).

**The scale-up accounts (only when you graduate to multi-tenant B2B):**

| Service | The obvious job | What it *also* unlocks | Sign up |
|---|---|---|---|
| **Neon** | Serverless Postgres | Postgres that **branches like git** — an isolated copy of your DB for every preview deploy — plus scale-to-zero (you pay nothing when idle) + pgvector. Provisionable straight through the Vercel marketplace. | [neon.tech](https://neon.tech) |
| **Clerk** | Login / auth | **Multi-tenant orgs** (teams, roles, invites) + drop-in prebuilt UI + B2B **SSO/SAML** path + a user-management dashboard. The reason both serious SaaS products here use it. | [clerk.com](https://clerk.com) |

## The order to set it up (first product ≈ 25 min)

1. **Supabase** → new project, copy the 3 keys.
2. **Stripe** → test-mode keys + your pricing tiers.
3. **Resend** → verify your domain, get an API key.
4. **PostHog** + **Sentry** → one project each, copy keys.
5. **Cloudflare** → buy the domain.
6. **Vercel** → import the GitHub repo, paste all the keys into project settings, connect the domain → push to deploy.
7. **Anthropic** → API key (you likely have this already).

Every scaffolded product ships a `.env.example` listing the exact keys, grouped by service. The click-by-click version (with what to copy where) is in [`SETUP.md`](../templates/product-starter-nextjs/SETUP.md). Once these accounts exist, product #2 just reuses them.

## When to deviate

The default covers ~85% of products. The decision matrix for the other 15% (Convex, Astro, Expo, Lemon Squeezy, the Neon+Clerk scale path, etc.) lives in [`stack-selection.md`](stack-selection.md). Rule: deviate on **one** component at a time, and write a 3-line note in the product's `decisions/` saying what you changed and why.
