# Tech Stack — The 2026 Default

Every new product scaffolded by `/scaffold` gets this stack pre-wired. Deviate only with a written reason in the product's `decisions/`.

## Why this stack

Picked on three criteria: (1) **free tier covers $0 → $1K MRR**, (2) **one-shot setup** (CLI or web form, no infra work), (3) **AI-native** (built to work with agents and prompts).

## The stack

| Layer | Choice | Free tier limit | Cost when paid | Why |
|---|---|---|---|---|
| **Framework** | Next.js 16 (App Router + RSC) | — | — | RSC, Vercel-native, every AI SaaS uses this, biggest LLM training corpus → Claude writes it best |
| **Runtime / pkg manager** | Bun | — | — | One tool = runtime + package manager + test runner; runs TS with no build step; the factory itself runs on Bun. (Existing products on pnpm/npm are fine — migrate opportunistically, don't churn.) |
| **UI** | Tailwind v4 + shadcn/ui | — | — | Copy-paste components, owns the code, no runtime dep. Unanimous across every product — the one true invariant. |
| **Hosting** | Vercel | Hobby tier (100GB bandwidth/mo) | $20/mo Pro | Push-to-deploy from GitHub, edge functions, preview URLs per branch |
| **Auth** | Supabase Auth | 50K MAU | $25/mo Pro | Magic link + OAuth + SSO; same project as DB. → For multi-tenant B2B (orgs, SSO/SAML), swap to **Clerk** — the documented scale path (see below). |
| **Database** | Supabase Postgres + RLS | 500MB DB, 1GB transfer | $25/mo | RLS for security, generated types, real-time, vectors (pgvector) built in. → At multi-tenant scale, swap to **Neon** (git-style branching, scale-to-zero) — see scale path. |
| **File storage** | Supabase Storage | 1GB | included in Pro | Same project |
| **Payments** | Stripe | — | 2.9%+30¢ per txn | Subscriptions, customer portal, webhook signing, tax (Stripe Tax add-on) |
| **Email transactional** | Resend | 100/day, 3K/mo | $20/mo (50K) | React Email templates, deliverability, webhooks |
| **Background jobs** | Inngest | 50K runs/mo | $20/mo (500K) | Crons, retries, fan-out, observable, type-safe |
| **AI primary** | Anthropic Claude (Opus 4.7 + Sonnet 4.6 + Haiku 4.5 + prompt caching) | — | per token | See `agent-stack.md` for model routing |
| **AI fallback / cheap reasoning** | Nous Research Hermes (via OpenRouter) | — | per token | For bulk reasoning where Claude is overkill |
| **CDN / images** | Vercel + next/image | included | included | Auto WebP, responsive, lazy |
| **Domain** | Cloudflare Registrar | — | at-cost (~$10/yr) | No markup, free DNS, easy SSL |
| **Form input** | React Hook Form + Zod | — | — | Type-safe forms, validation, parses URL params |
| **Markdown / content** | MDX + Contentlayer (or content collections) | — | — | Long-form blog/docs in version control |

## Folder structure inside each product (Next.js)

```
src/
├── app/                          # App Router
│   ├── (marketing)/              # public pages
│   │   ├── page.tsx              # landing
│   │   ├── pricing/page.tsx
│   │   └── waitlist/page.tsx
│   ├── (app)/                    # auth-gated app
│   │   ├── dashboard/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── stripe/webhook/route.ts
│   │   └── inngest/route.ts
│   ├── sitemap.ts                # auto sitemap
│   ├── robots.ts                 # auto robots
│   └── layout.tsx                # metadata, GA4, Plausible, PostHog, Sentry init
├── components/
│   ├── ui/                       # shadcn primitives
│   └── ...                       # product components
├── lib/
│   ├── supabase/{server,client,middleware}.ts
│   ├── stripe.ts
│   ├── resend.ts
│   ├── posthog.ts
│   ├── analytics.ts              # unified track()
│   └── env.ts                    # zod-validated env
├── emails/                       # React Email templates
└── inngest/                      # background functions
```

## Env vars (the one-shot list)

Every scaffolded product ships with `.env.example` containing exactly these keys, grouped:

```bash
# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# --- Stripe ---
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# --- Resend ---
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# --- Analytics ---
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
NEXT_PUBLIC_GSC_VERIFICATION=          # the meta tag content from Search Console

# --- Sentry ---
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# --- AI ---
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=                    # fallback for Hermes etc.

# --- Inngest ---
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=

# --- DataForSEO (optional, for /keyword-research) ---
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=

# --- App ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=
```

## The scale path (the #1 documented deviation)

**Swap Supabase → Neon + Clerk when you hit multi-tenant B2B.** This isn't theoretical — it's what **IP Radar** and **Scope Intelligence** actually shipped. Take it when you need: separate customer orgs/teams, SSO/SAML, role-based access, or a DB branch per preview deploy.

- **Neon** — serverless Postgres that branches like git (isolated DB per preview), scales to zero, pgvector built in. Provisionable through the Vercel marketplace on one bill.
- **Clerk** — multi-tenant orgs, prebuilt auth UI, B2B SSO/SAML, user-management dashboard.

Everything else (Next.js, Bun, Tailwind/shadcn, Stripe, Resend, Vercel, Claude) stays the same.

## Other deviations

Switch to **Convex** if: you need a reactive backend with magical realtime and you're OK trading portability for velocity.

Switch to **Astro + MDX** if: the product is content/SEO-first (blog, docs, marketing) with no real app layer — ships zero JS by default.

Switch to **Cloudflare Workers + D1** if: you need ultra-low cold-start and are building edge-first / API-as-product. Lose Supabase's pgvector / RLS ergonomics.

Switch payments to **Lemon Squeezy / Paddle** if: you're indie-consumer ($5–20/mo SKU) or selling where Stripe's tax support is weak — they're merchant-of-record (handle global tax for you).

**Default = Next.js 16 + Bun + Supabase + Stripe + Resend + Vercel + Claude.** Don't deviate without a real reason, and log it in the product's `decisions/`.
