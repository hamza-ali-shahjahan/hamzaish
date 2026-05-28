# Solopreneur Stack — 2026

The tooling that lets one person run 10 products.

## The framework in one paragraph

A solopreneur in 2026 should default to: AI as the cofounder (Claude as primary, Hermes via OpenRouter as fallback), a single boring + powerful tech stack used across all products (Next.js + Supabase + Stripe), automation for everything that recurs (Inngest + Zapier where needed), one CRM + one project tool + one analytics tool used across the portfolio. The trap: tool sprawl. Every additional tool is overhead. Resist.

## The categories and recommendations

### Coding
- **Claude Code** (primary IDE-with-AI)
- **Cursor** (alternative; some prefer for certain workflows)
- **Vercel CLI + Supabase CLI + Stripe CLI** for shipping

### AI
- **Claude (Anthropic)** for everything where quality matters
- **Nous Hermes (via OpenRouter)** for bulk reasoning where Claude is overkill
- **OpenRouter** as the model router (use multiple models with one API key)
- **PostHog** for LLM call tracking (cost + perf)

### Productivity (cross-portfolio)
- **Notion** OR **Obsidian** for personal knowledge (pick one, not both)
- **Linear** for project tracking (cheaper than Jira, better DX)
- **Cal.com** for meeting scheduling
- **Superhuman** OR **HEY** OR **Spark** for email (pick one)

### Communication
- **Loom** for async video updates
- **Discord** OR **Slack** for community per product (only if community is justified)
- **X** (Twitter) for distribution
- **LinkedIn** for B2B distribution

### CRM / sales
- **Attio** (modern alternative to Salesforce; reasonable indie pricing)
- OR **HubSpot Free** (good enough for indie)
- OR **Airtable** (if you have < 100 contacts to track)

### Email
- **Resend** for transactional (in product code)
- **Loops** for marketing sequences (per product)
- **Beehiiv** or **Substack** for newsletter (per product, if applicable)

### Analytics
- **PostHog** (product analytics, free tier huge)
- **Plausible** (web analytics, clean)
- **GA4** (free, for Search Console linkage)
- **Sentry** (errors)
- **Google Search Console** (SEO)
- **Ahrefs Webmaster Tools** (free, for owned sites)

### Finance / ops
- **Stripe** (payments — every product)
- **Brex** or **Mercury** (business banking — one for the whole portfolio)
- **Ramp** (corporate cards + expense management)
- **Pilot** or **Bench** (accounting; or DIY at indie scale)

### Hiring (when you need a VA)
- **Athena** (premium VA)
- **MagicVA** (mid-tier)
- **Upwork** (project-based)
- For the factory: AI replaces 80% of what a VA would do; hire one only for context-heavy tasks

### Distribution / SEO
- **Ahrefs Webmaster Tools** (free, owned sites)
- **DataForSEO API** (pay-per-query, see `stack/analytics-stack.md`)
- **Mangools KWFinder** ($30/mo if you want a UI)
- **Buffer** or **Typefully** for social scheduling

### Documentation (for users)
- **Mintlify** (modern docs)
- OR **Docusaurus** (open source)
- OR keep docs in Markdown in the product repo (simplest, works for small products)

### Forms / surveys
- **Tally** (free, fast)
- **Typeform** (prettier, more expensive)
- **PostHog Surveys** (in-product, no extra tool)

### Status / monitoring
- **BetterStack** (status page + uptime) — free tier 10 monitors

## The "one of each" rule

Pick ONE tool per category. Use it across all products. Examples:
- One CRM, not five
- One project tracker, not different ones per product
- One email marketing tool, not different ESPs per product

Why: switching mental models has a cost. Cross-portfolio consistency reduces it.

## The 80/20: minimum viable solopreneur stack

If you're starting absolutely cold and want the shortest list:

1. **Claude Code** (build with)
2. **Next.js + Supabase + Stripe + Vercel** (build on)
3. **Notion** (personal brain)
4. **Linear** (track work)
5. **Resend + Loops** (email)
6. **PostHog + Sentry + Plausible** (analytics)
7. **X + LinkedIn** (distribution)
8. **Cal.com** (meetings)

That's 9 tools. Everything else is optional and earns its way in by proving value.

## Tools that get added too early

- **Customer success platform** (Intercom / Pylon)** — before customer 100
- **A/B testing platform** (Optimizely) — before you have traffic to test
- **Data warehouse** (BigQuery / Snowflake) — before product analytics is exhausted
- **Marketing automation suite** (HubSpot full version, Marketo) — before product-market fit
- **Project management** beyond Linear — Asana / Monday / Jira are all heavier than needed at solo scale

## Tools that get added too late

- **Stripe** (sometimes founders use Lemon Squeezy or other for simplicity, then pay 2-3x in fees over time)
- **Sentry** (added "later" after a real outage)
- **Status page** (added after the first outage when angry users had no idea)
- **GSC verification** (added after months of SEO with no data)
- **Backup strategy** (added after the first data scare)

## Source for follow-up

- @marc_louvion (Marc Lou's indie stack threads)
- @pieterlevels (Pieter Levels' stack posts)
- Indie Hackers product pages (filter by revenue) — see what real $100K-$1M ARR products use
- This factory's own `stack/` directory
