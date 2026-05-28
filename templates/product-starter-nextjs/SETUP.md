# Setup — {{PRODUCT_NAME}}

11-step onboarding. Estimated time: 25 min for first product, 5 min for subsequent (reusing accounts).

## 1. Supabase (auth + DB)
- Go to https://supabase.com/dashboard → New project
- Project name: `{{PRODUCT_SLUG}}`
- Region: closest to your users
- Copy: `URL`, `anon key`, `service_role key` → `.env.local`
- Enable Email auth provider; configure magic-link template (optional, default works)

## 2. Stripe (payments)
- Go to https://dashboard.stripe.com (use test mode for setup)
- Get keys → Developers → API keys → publishable + secret → `.env.local`
- Create Products: free, pro, team (one Price each, monthly + annual)
- Copy price IDs to `.env.local`
- Set up webhook: Developers → Webhooks → Add endpoint
  - URL: `https://yourdomain.com/api/stripe/webhook` (use `stripe listen` locally)
  - Events: `customer.subscription.*`, `invoice.payment_*`
  - Copy webhook signing secret → `.env.local`

## 3. Resend (email)
- Go to https://resend.com
- Add and verify your domain (DNS records)
- Create API key → `.env.local`
- Set `RESEND_FROM_EMAIL=hi@yourdomain.com`

## 4. PostHog (product analytics)
- Go to https://posthog.com → New project: `{{PRODUCT_SLUG}}`
- Copy project key → `.env.local`
- Recommended: enable session replay (free tier 5K replays/mo)

## 5. GA4 (web analytics for GSC linkage)
- Go to https://analytics.google.com → Admin → Create property: `{{PRODUCT_SLUG}}`
- Add web data stream → copy Measurement ID → `.env.local`
- Link to Search Console (Admin → Search Console links)

## 6. Plausible (clean web analytics)
- Go to https://plausible.io → Add site: `yourdomain.com`
- Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com` → `.env.local`

## 7. Sentry (errors)
- Go to https://sentry.io → New project: Next.js, name `{{PRODUCT_SLUG}}`
- Copy DSN → `.env.local`
- Create auth token (Settings → Auth Tokens) → `.env.local`
- Set `SENTRY_ORG` and `SENTRY_PROJECT`

## 8. Google Search Console (SEO)
- Go to https://search.google.com/search-console
- Add property → Domain or URL prefix → enter `yourdomain.com`
- Verification → HTML tag → copy the content value → `.env.local` as `NEXT_PUBLIC_GSC_VERIFICATION`
- Submit sitemap: `https://yourdomain.com/sitemap.xml`

## 9. Ahrefs Webmaster Tools (free SEO data)
- Go to https://ahrefs.com/webmaster-tools
- Add and verify your domain (DNS or HTML file)
- No env var — verification only. Returns organic keywords, backlinks, site audit.

## 10. (Optional) DataForSEO (competitor / keyword research)
- Go to https://dataforseo.com → Sign up
- Top up $50 (lasts months at indie volume)
- Copy login + password → `.env.local`
- Test: `/keyword-research` skill should work

## 11. Domain + Vercel deploy
- Buy domain at https://dash.cloudflare.com (cheaper than competitors, no markup)
- Connect repo to https://vercel.com → New project → import
- Add custom domain in Vercel → update DNS at Cloudflare
- Add all env vars to Vercel project settings
- Push to main → auto-deploy

## Final check
```bash
cp .env.example .env.local
# fill in everything
pnpm install
pnpm dev
```
Visit http://localhost:3000 — landing page should render. `/pricing` should show tiers. `/waitlist` should accept emails. Sentry test error (curl `/api/test-error` if you build that route) should appear in Sentry within 60s.

## What's deferred
- SOC 2 (start with Vanta/Drata when first enterprise asks)
- Status page (BetterStack free tier when you have paying customers)
- Custom support tool (use email + PostHog for now)
