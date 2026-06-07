# Stack Selection — When to Deviate from the Default

The default stack (see `tech-stack.md`) covers ~85% of new products. Use this decision matrix when one of the remaining cases applies.

## Decision matrix

| If your product... | Use | Instead of default | Why |
|---|---|---|---|
| Needs realtime everything, optimistic UI, cross-device sync | **Convex** | Supabase | Convex is reactive-by-default. Functions auto-sync. Trade portability for velocity. |
| Targets B2B enterprise from day 1 with SSO/SAML/audit-log requirements | **WorkOS + Clerk** | Supabase Auth | Enterprise SSO is the table-stakes. WorkOS does it cleanly. |
| Is content-heavy / SEO-first (blog, docs, marketing site) | **Astro + MDX** | Next.js | Astro ships zero JS by default, better Lighthouse scores. Use Next.js only if it has an app layer. |
| Is API/SDK first (developers as users) | **Hono + Cloudflare Workers** | Next.js | Lower cold start, simpler routing, better for API-as-product. |
| Is mobile-first or needs native | **Expo + React Native** + Supabase | Next.js (alone) | Use Next.js for the web/dashboard but ship the app via Expo. |
| Processes large structured data or vectors at scale | **Supabase + pgvector** | (no change) | Default works. Add pgvector extension. |
| Needs payment in countries Stripe doesn't support well | **Lemon Squeezy** or **Paddle** | Stripe | Merchant-of-record handles tax + global. |
| Is for indie consumers, $5–$20/mo SKU | **Lemon Squeezy** | Stripe | Simpler tax + global. Lower friction for solo. |

## What never changes

- **Frontend framework family**: React (via Next.js, Astro, or Expo). No Vue/Svelte/Solid in this factory; consistency across 10 products matters more than picking the perfect framework for product N.
- **Language**: TypeScript everywhere. Strict mode on.
- **Runtime / package manager**: Bun (runtime + pkg manager + test runner in one; the factory runs on it). Existing products on pnpm/npm are fine — migrate opportunistically.
- **AI primary**: Claude (Anthropic). Other models only as fallbacks or for specific workloads.
- **Hosting**: Vercel or Cloudflare Workers. Not AWS / GCP / DigitalOcean directly — not worth the ops time at this stage.

## Process for picking

1. Default to the stack in `tech-stack.md`.
2. If a single line in the table above clearly applies, deviate on that one component only. Keep everything else default.
3. If you're deviating on >2 components, stop and re-read default. You probably don't need to.
4. Whatever you pick, write a 3-line entry in `products/<name>/decisions/YYYY-MM-DD-stack.md` saying: what we picked, what we deviated from, why.

## Cost ceiling for paid alternatives

If a deviation requires a paid tool that costs > $50/mo per product before revenue, the product needs explicit founder approval. Bootstrapped posture is the default — see `brain/operating-principles.md` § 9.
