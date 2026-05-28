# SEO Content Strategy — From Zero to Compounding

## The framework in one paragraph

SEO works for products where (1) people search for the problem you solve, (2) the search volume is real enough to matter, and (3) you can produce content better than what's already ranking. Built on a hub-and-spoke topology, anchored on real keyword data (GSC + DataForSEO — see `stack/analytics-stack.md`), with technical SEO as a baseline and content as the compounding asset. Most products take 6-12 months for SEO to be a meaningful channel; commit or don't bother.

## When SEO is the right channel

- ✅ B2B SaaS in a category with established demand (e.g., "best CRM for X")
- ✅ Vertical tools where buyers Google before buying
- ✅ Content-heavy products (blog → product conversion)
- ✅ Evergreen problems (people always search)
- ❌ New category nobody searches for yet (no demand to capture)
- ❌ Very small TAM (volume too low)
- ❌ Need traction in < 90 days (SEO compounds over 6-18 months)
- ❌ Product is impulse-buy / viral mechanic better suits

## Hub-and-spoke topology

```
[Pillar page: "complete guide to X"] (the hub)
   │
   ├── [Spoke: "X vs Y"] (commercial intent)
   ├── [Spoke: "how to do X in <tool>"]
   ├── [Spoke: "X for <segment>"]
   ├── [Spoke: "common mistakes in X"]
   └── [Spoke: "X best practices"]
```

Rules:
- Every spoke links UP to the hub
- Hubs cross-link to related hubs
- The product's signup CTA appears in every page
- Each page targets one primary keyword + 3-10 supporting

## Technical baseline (the must-haves)

These are not optional. They go into the Next.js starter (`templates/product-starter-nextjs/`) so every product ships with them.

- [ ] **Sitemap.xml** auto-generated from routes (`app/sitemap.ts`)
- [ ] **Robots.txt** allows crawl, points at sitemap
- [ ] **JSON-LD schema** on every page type:
  - Article (blog posts)
  - Product (pricing page)
  - FAQPage (FAQ sections)
  - BreadcrumbList
  - Organization (homepage)
  - SoftwareApplication (homepage for SaaS)
- [ ] **Open Graph + Twitter Card** meta on every page
- [ ] **Canonical URLs** explicit
- [ ] **Lighthouse**: SEO ≥ 95, Performance ≥ 90 mobile
- [ ] **H1 unique per page**, hierarchy logical
- [ ] **Internal links** use descriptive anchors (no "click here")
- [ ] **No orphan pages** — every page reachable in ≤3 clicks from homepage
- [ ] **Image alt text** on everything
- [ ] **Verification** in Google Search Console + Bing Webmaster

## Content quality bar

The 2026 SEO winner is content that:
- Has been used recently (freshness signal)
- Cites specific sources / data / examples
- Includes original screenshots / charts / examples (E-E-A-T)
- Answers the search intent fully — no "for more info..."
- Has a clear author with credentials
- Loads fast on mobile

AI-generated mediocre content does NOT rank in 2026. Google's helpful content + spam updates have killed the volume play. One genuinely better post > 50 generic ones.

## Cadence

Start: 1 post/month, well-researched, 1800-2500 words.

Scale rules:
- After the first 3 posts: check GSC at month 4. Any climbing positions 30 → 15? If yes, the strategy is working — keep cadence.
- If yes and you have content systems: scale to 2/month
- If yes and great: scale to 4/month at month 6+
- If no after 6 months: stop. The strategy isn't right for this product.

Don't scale cadence before you have proof of compounding.

## Pillars to start with (for SaaS)

| Pillar type | Example for a form-builder | Why |
|---|---|---|
| Best-of comparison | "Best form builders for indie SaaS in 2026" | Commercial intent, high CTR |
| How-to / tutorial | "How to build a form with conditional logic" | Informational, captures research-phase users |
| Use case / persona | "Form builder for founder waitlists" | Specific persona search |
| Vs. competitor | "<Product> vs Typeform" | Bottom-funnel, high intent |
| Problem-frame | "Why your signup form converts at 3%" | Top of funnel, brand-building |

## Keyword data sources

See `stack/analytics-stack.md`. Use:
- GSC for own-site queries
- Ahrefs Webmaster (free) for own-site backlinks
- DataForSEO API for keyword research and competitor analysis
- (Optional) Mangools KWFinder UI at $30/mo if API friction is high

## Link building (bootstrapped)

- IndieHackers (link in profile + relevant comments)
- Niche newsletter mentions (DM authors with genuine reason)
- HN / Product Hunt launches (one-time, durable)
- Free tools as link bait (a public calculator that solves a niche problem)
- Reddit posts with genuine value (no spam)

Avoid: paid links, link exchanges, PBNs. Google will catch you.

## Anti-patterns

- **AI-bulk content** — Google's spam updates target this. Will not rank.
- **Keyword stuffing** — algorithmic detection is good now.
- **Thin pages** — < 300 words on a topic that needs depth.
- **Doorway pages** — many near-duplicate pages targeting variations of one keyword.
- **Buying expired domains for link juice** — caught.
- **"SEO content" that no human would read** — kills your bounce metric.

## What success looks like at 6 months

A product committed to SEO and executing it well, 6 months in:
- 10-20 published posts
- 5+ ranking on page 1 for target keywords
- 500-3000 organic visits/month
- Compounding upward (Q-over-Q growth)

This is the foundation. Year 2 is when it multiplies.

## Source for follow-up

- Brian Dean / Backlinko (despite age, still solid foundations)
- Ahrefs blog (especially their content marketing series)
- @withseanyk / various indie SEO threads on X
- Google's E-E-A-T docs (official, useful)
