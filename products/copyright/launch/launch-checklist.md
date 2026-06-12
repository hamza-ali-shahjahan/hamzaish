<!--
  LAUNCH WORKBOOK — per-project tracker.
  Copy this file to the launching project as `launch-checklist.md` and fill it in.
  Update Status in place. The rule that makes this work: Done ≠ Verified.
  Nothing is closed until its "How to verify" check passes independently.
-->

# Patently — Launch Checklist

> Public-launch tracker. Patently (formerly IP Radar) is live in private beta at patently.legal; this tracks the path to **public launch**.

## Project info

| Field | Value |
|---|---|
| Project name | Patently |
| Domain | patently.legal _(live, private beta)_ |
| Launch target date | _TBD — public launch_ |
| Project owner | Hamza |
| Stack | Next.js 16 + Neon/pgvector + Claude tool-calling + Clerk + Resend |
| Hosting | Vercel (auto-deploy via GitHub) |
| CDN | Vercel edge _(no separate CDN)_ |
| CMS | none (app, not content site) |

> **Triage snapshot — web-launch dry-run, 2026-06-09.** First pass from `status.md`; not a full walk. Statuses below are *initial* — most items are `Open` pending an actual walk of the live site. **Gate verdict: DO NOT LAUNCH (publicly)** — see blockers.
>
> **Already strong (mark Verified only after the stated check):**
> - Domain live + HTTPS (patently.legal), Vercel auto-deploy / CI-CD (#11, #14, #19), error/cost tracking + admin dashboard (#23), rate limiting on chat/clearance (#125), citation validator (no hallucinated cases). Auth-gated app (Clerk).
>
> **🔴 P0 blockers toward public launch (from status.md + app-shape):**
> 1. **Rotate burned credentials** (Clerk, Anthropic, Resend, CourtListener, Voyage, Neon) — maps to #128 *No secrets exposed*. Cannot public-launch with burned creds. **Top priority.**
> 2. **Run pending prod DB migration** (`pnpm db:migrate`, migration 0001) — release/rollback hygiene (#20/#21); a half-migrated prod is a launch risk.
> 3. **Legal pages** — `/privacy-policy` + `/terms` + cookie consent (#58, #59, #60, #122). A legal-research SaaS handling user queries *must* have these before public.
> 4. **Cost-runaway guard at public scale** — current caps are per-user (50/50/day); public launch needs global spend ceilings + abuse controls (#125 + cost). ~$15 cold/user worst case × public traffic = real exposure.
>
> **N/A for this stack (app, not content/pSEO site):** most of Phase 3 IA taxonomy at scale, pSEO/sitemap-index (#30 light), CMS/blog GTM split (#108) unless a marketing site exists separately. Confirm whether patently.legal has a separate marketing/content surface — if yes, those re-activate.
>
> **Biggest unknowns to resolve on a real walk:** SEO foundation (titles/canonical/schema/robots — Phases 6), analytics (GA4/GSC even installed? #106–113), security headers (#121), a11y (Phase 10). For an auth-gated beta these were likely deferred — they become real for public launch.
>
> **Single most important next action:** rotate the burned credentials (#128). Nothing else matters if creds are live.

## How to use

1. **Copy** this file into the project repo as `launch-checklist.md`.
2. **Read Definitions** below so everyone uses the same words for Priority and Status.
3. **Walk the Master Checklist** phase by phase. Mark stack-irrelevant items `N/A`.
4. **Assign an owner** to every live item. Unowned items don't get done.
5. **Update Status** as work moves: `Open → In Progress → Done → Verified`.
6. **Pre-launch:** walk the Sign-Off Gate. Every P0/P1 must be `Verified`. No exceptions.
7. **Post-launch:** run the Monitoring cadence (Day 1/3/7/14/30). This is where launches succeed or fail.
8. **Read `launch-gotchas`** before you start — the failure-mode library. Items below tagged ⚠ link to a specific gotcha.

---

## Definitions

### Priority

| Code | Name | Meaning |
|---|---|---|
| **P0** | Blocker | Launch cannot proceed until this is **Verified**. Hard gate. |
| **P1** | Critical | Must be Verified before launch. Deferrable only with a written reason, named owner, and revisit date. |
| **P2** | Major | Should be done by launch; may slip into week 1 post-launch if consciously deferred. |
| **P3** | Minor | Nice at launch; otherwise schedule into the post-launch backlog. |
| **P4** | Nice | Optional polish. Do if time allows. |

### Status

| Status | Meaning |
|---|---|
| **Open** | Identified, not started. |
| **In Progress** | Actively being worked. |
| **Blocked** | Can't progress; depends on something else (note the blocker). |
| **Done** | Work complete — **awaiting independent verification**. NOT closed. |
| **Verified** | The item's "How to verify" check passed independently. Closed. ⚠ see gotcha *Done-without-verification*. |
| **Deferred** | Consciously postponed with a written reason + revisit trigger. |
| **N/A** | Doesn't apply to this stack. |

### Phases

1. Strategic Foundation · 2. Technical Architecture · 3. Information Architecture · 4. Design & UX · 5. Content · 6. SEO Foundation · 7. Performance & CWV · 8. Analytics & Tracking · 9. Security & Privacy · 10. Accessibility · 11. QA & Testing · 12. Pre-Launch Verification · 13. Launch Day · 14. Post-Launch (First 7 Days)

---

## Master Checklist

> Status legend per row: ☐ Open. Replace with `In Progress` / `Blocked` / `Done` / **Verified** / `Deferred` / `N/A` as you go.

### Phase 1 — Strategic Foundation

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | Define target audience + primary personas | Without clear users you optimize for the wrong things. Drives all IA, content, design. | Written audience doc with 2–3 named personas, signed off by founder/product. | P0 | Product | ☐ |
| 2 | Define success metrics (90d / 6mo / 12mo) | Without metrics you can't say if launch worked. | Written success-criteria sheet: named metrics, baseline, targets, measurement method. | P0 | Product/Founder | ☐ |
| 3 | Confirm positioning + differentiation | Drives content, keywords, voice. If you can't say "why us not them," the site reads like noise. | Written positioning statement + competitor analysis. | P0 | Product/Founder | ☐ |
| 4 | Confirm v1 scope (in / out) | Scope creep is the #1 killer of launch timelines. | Scope doc with explicit "in" and "out" lists, signed off by all leads. | P0 | Product | ☐ |
| 5 | Identify legal/compliance reqs (GDPR, CCPA, industry) | Skipping risks fines and forced post-launch redesigns. | Legal review doc; cookie-consent strategy; privacy-policy draft started. | P0 | Legal/Founder | ☐ |
| 6 | Define budget + resource constraints | Hosting/CDN/tool/dev-hours all need to fit a budget. | Budget sheet with itemized recurring costs. | P1 | Founder/Finance | ☐ |
| 7 | Document long-term content cadence | A site without ongoing content decays. | Content calendar for first 90 days post-launch. | P1 | Content | ☐ |
| 8 | Identify SEO pillars + keyword themes | Drives URL structure, templates, internal linking. | SEO strategy doc: pillar topics, keyword themes, target intents. | P1 | SEO | ☐ |
| 9 | Stakeholder comms plan for launch | Coordinated comms = traction; uncoordinated = silence. | Comms timeline: email list, social, PR, partner announcements. | P2 | Marketing | ☐ |

### Phase 2 — Technical Architecture

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 10 | Choose hosting provider + tier | Sticky decision; affects perf/cost/reliability for years. | Hosting decision doc + account + billing set up. | P0 | Engineering | ☐ |
| 11 | Register apex domain | Without a domain, nothing launches. | Domain registered, DNS provider chosen, ownership confirmed. | P0 | Eng/Founder | ☐ |
| 12 | Decide canonical host (apex vs www) + 301 | Both resolving without redirect splits SEO authority + duplicate content. | `curl` test: one version 301s to the chosen canonical, no chain. ⚠ *Cloudflare-redirect-quirks* (preserve query strings). | P0 | Engineering | ☐ |
| 13 | Decide trailing-slash policy + enforce site-wide | Inconsistent slashes cause duplicate content, redirect chains, crawl waste. | Pick one; document it; `curl` confirms the non-canonical 301s. ⚠ *Trailing-slash-internal-hrefs* — href cleanup is a SEPARATE task from the redirect rule. | P0 | Eng + SEO | ☐ |
| 14 | SSL installed + HTTPS enforced | No HTTPS = browser warnings, no Search Console, no modern features. | SSL Labs grade A. HTTP 301s to HTTPS. | P0 | Engineering | ☐ |
| 15 | CDN configured (if using) | Cheapest global-latency win — but watch caching behavior. | CDN active; test from multiple regions. ⚠ *CDN-cache-analytics-blind-spot*. | P1 | Engineering | ☐ |
| 16 | Environment separation: dev / staging / prod | Mixing environments → data loss, broken deploys, lost trust. | 3 distinct envs, separate URLs/DBs. Staging not visible to crawlers. | P0 | Engineering | ☐ |
| 17 | Staging is noindex / password-protected | Indexed staging duplicates content + confuses crawlers. | `curl` staging: `X-Robots-Tag: noindex` OR HTTP basic auth. | P0 | Engineering | ☐ |
| 18 | Git repo + branch protection | Direct-to-main pushes break things. | Repo with main protected, PR review required. | P1 | Engineering | ☐ |
| 19 | CI/CD pipeline for safe deploys | Manual deploys are how prod breaks. | Automated build + test + deploy on merge to main. | P1 | Engineering | ☐ |
| 20 | Database backup strategy | No backups = catastrophic loss one mistake away. | Automated daily backups + a manual restore tested. | P1 | Engineering | ☐ |
| 21 | Rollback procedure documented + tested | When prod breaks at launch, you need a known-good revert. | Documented steps + one practice rollback in staging. | P1 | Engineering | ☐ |
| 22 | Email deliverability (SPF, DKIM, DMARC) | Transactional email in spam = broken signups/resets. | mail-tester score 10/10; SPF/DKIM/DMARC records set. | P1 | Engineering | ☐ |
| 23 | Error monitoring installed (Sentry/Rollbar/…) | You can't fix bugs you don't know about. | SDK installed; test error visible in dashboard. | P2 | Engineering | ☐ |
| 24 | Uptime monitoring (Pingdom/UptimeRobot/…) | Find out from monitoring, not angry users. | Monitor pings homepage every 5 min; alert configured. | P2 | Engineering | ☐ |

### Phase 3 — Information Architecture

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 25 | URL taxonomy designed + documented | URL structure is hard to change later; sets SEO/IA destiny. | Written URL blueprint covering every content type, with examples. _(Illustrative: `/tool/<slug>`, `/compare/<a>-vs-<b>`, `/category/<slug>`, `/function/<slug>`, `/blog/<category>/<slug>`.)_ | P0 | SEO + Eng | ☐ |
| 26 | Slug convention defined + documented | Inconsistent slugs are an SEO regret. | Rule: lowercase, kebab-case, no IDs, descriptive. Enforced in CMS. ⚠ *Empty-loc-from-missing-slugs*. | P0 | SEO | ☐ |
| 27 | Primary navigation finalized | Top nav defines what users + crawlers think the site is about. | Header nav locked, max 5–7 items, each links to a real populated page. | P1 | Design + Product | ☐ |
| 28 | Footer navigation finalized | Footer is your second-biggest crawl link source. | Footer with About, Privacy, Terms, Contact + secondary nav. | P1 | Design | ☐ |
| 29 | Breadcrumb design + schema planned | Breadcrumbs aid users + crawlers; BreadcrumbList is high-signal. | Component designed; BreadcrumbList JSON-LD planned for every non-root page. | P1 | SEO + Design | ☐ |
| 30 | Sitemap architecture decided (single vs index+leaves) | For 500+ URLs or hybrid stacks, a sitemap index is cleaner. | Architecture doc. ⚠ *Sitemap-nested-index-errors* — index must point to leaf `urlset`s, never another index. | P0 | SEO + Eng | ☐ |
| 31 | Internal linking strategy (per template) | Templates without intentional linking create orphans + waste equity. | Doc: per template type, what it links to, what links to it, related-content slots. | P1 | SEO | ☐ |
| 32 | Pagination strategy decided | Affects how crawlers reach deep content; JS-only infinite scroll = invisible. | Decision documented; if JS-based, server-rendered fallback exists. | P1 | SEO + Eng | ☐ |
| 33 | 404 page designed + useful | 404s are an opportunity; recover users with search + popular links. | 404 includes clear message, search, links to top sections, friendly tone. | P2 | Design + SEO | ☐ |
| 34 | 301 redirect map (if migrating) | Failing to redirect old URLs = lost equity. | Spreadsheet of old→new mappings, tested in staging. ⚠ *Old-domain-ghost-URLs* (use 410 for URLs to forget). | P1 | SEO + Eng | ☐ |

### Phase 4 — Design & UX

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 35 | Brand identity locked (logo, palette, type) | Inconsistent brand reads as low-quality. | Brand guide doc: primary/secondary colors, type hierarchy, logo variants. | P0 | Design | ☐ |
| 36 | Design system / component library | Per-page custom design is unsustainable. | Figma library OR coded design system: buttons, inputs, cards, nav, modals. | P1 | Design + Eng | ☐ |
| 37 | Designs for every page template | Building without designs → scope creep + ugly results. | Approved designs: home, category, detail, listing, blog index, blog post, static, 404, search. | P0 | Design | ☐ |
| 38 | Mobile designs for every template | Mobile is 50%+ of traffic. | Mobile sign-off per template; tested at 375/414px. | P0 | Design | ☐ |
| 39 | Hero / above-the-fold optimized for clarity | First 5 seconds decide bounce vs engage. | Hero answers: what is this, who's it for, what next. | P1 | Design + Content | ☐ |
| 40 | CTA hierarchy clear per template | Multiple equal CTAs confuse users. | One primary, one secondary max; secondary visually de-emphasized. | P1 | Design + Product | ☐ |
| 41 | Loading states designed | Blank white during load = users think it's broken. | Designs for page nav, async fetch, form submit. | P2 | Design | ☐ |
| 42 | Empty states designed | Default empty states say nothing. | Design + copy for: search no-results, empty list, empty dashboard, 404. | P2 | Design + Content | ☐ |
| 43 | Error states designed | Cryptic errors destroy trust. | Inline form errors, toasts, full-page errors — each with clear next-step copy. | P2 | Design + Content | ☐ |
| 44 | Favicon + OG images created | Missing favicon/OG = unprofessional + ugly social previews. | favicon.ico + apple-touch-icon + manifest icons; default OG 1200×630. | P1 | Design | ☐ |
| 45 | Per-template OG image strategy | Default OG is fine for v1; per-template is better. | Default OG configured; dynamic OG if scoped. | P2 | Design + Eng | ☐ |
| 46 | Brand guidelines published (incl. voice) | Locks rules so anyone can apply them consistently. | Living guide: logo do/don't, colors w/ hex, type hierarchy, voice/tone, photography, iconography. | P1 | Design | ☐ |
| 47 | Brand asset library in shared storage | Single source prevents badly-recreated assets. | Shared folder: logo variants (SVG+PNG), OG images, social templates, email artwork. | P1 | Design | ☐ |
| 48 | Email design templates (transactional + marketing) | Generic emails undermine brand + engagement. | Coded HTML templates: welcome, reset, notifications, newsletter, launch announce; tested in Gmail/Outlook/Apple Mail. | P2 | Design + Eng | ☐ |
| 49 | Image naming + alt-text conventions | Filenames + alt are direct SEO + a11y signals. | Doc: descriptive kebab filenames (not `IMG_3421.jpg`), alt rules, decorative `alt=""`, max file size. | P2 | SEO + Content | ☐ |
| 50 | ImageObject schema on hero/featured images | Improves Google Images + AI-engine ingestion. | `curl` key templates: ImageObject JSON-LD with contentUrl, license, creditText. Rich Results valid. | P3 | SEO + Eng | ☐ |

### Phase 5 — Content

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 51 | Content strategy doc (themes, formats, cadence) | Content without strategy reads as noise. | Doc: target topics, formats, cadence, voice/tone. | P0 | Content + SEO | ☐ |
| 52 | Editorial / style guide | Inconsistent voice reads as a content farm. | Style guide: voice, grammar choices, formatting, image rules. | P1 | Content | ☐ |
| 53 | Content templates per type | Reusable templates make scaling possible. | Templates per type: structure, required sections, internal-link slots, schema slots. | P1 | Content + SEO | ☐ |
| 54 | Minimum launch content produced + reviewed | Launching thin kills SEO trust. | Per type: minimum count met; each piece reviewed for quality. ⚠ *Manager-review-chain-ambiguity*. | P0 | Content | ☐ |
| 55 | Brand FAQ page + FAQPage schema | FAQ is critical for AI-engine entity/citation signals. | 10–15 brand Q&A on `/faq` with valid FAQPage schema; Rich Results passes. | P1 | Content + SEO | ☐ |
| 56 | About page tells the brand story | One of the most-visited pages; bad About = lost trust. | Covers what/why/who; founder/team if relevant. | P1 | Content | ☐ |
| 57 | Contact page with working mechanism | No contact = looks like a scam. | Working email/form; submissions tested end-to-end. | P1 | Content + Eng | ☐ |
| 58 | Privacy Policy published | Legal requirement in most jurisdictions. | `/privacy-policy` live; legal-reviewed where required. | P0 | Legal/Content | ☐ |
| 59 | Terms of Service published | Required for data/payments/user content. | `/terms` live; legal-reviewed where required. | P1 | Legal/Content | ☐ |
| 60 | Cookie policy / consent banner (non-essential cookies) | GDPR/CCPA require explicit consent. | Banner live; granular consent; defaults to least-tracking. | P0 | Legal + Eng | ☐ |
| 61 | Author bios (E-E-A-T) | Google rewards credentialed authors; anonymous underperforms. | Each writer has a bio page (credentials, links, photo); articles link to author. | P2 | Content + SEO | ☐ |
| 62 | Content quality threshold enforced | Thin content gets deprioritized. | Quality rubric documented; editorial review before publish. | P1 | Content | ☐ |
| 63 | Brand voice/tone guide with examples | Guidelines without examples are unusable. | Doc: archetype, voice attributes, do/don't examples for headlines/body/CTAs/errors. | P1 | Content + Design | ☐ |
| 64 | One-pager / media kit | Press/partner inquiries need a quick reference. | One-page PDF + web version at `/press`: what you do, founders, facts, logos, screenshots, contact. | P2 | Marketing + Founder | ☐ |
| 65 | Social media templates per platform | Ad-hoc posts produce visual inconsistency. | Branded templates for LinkedIn, X, Instagram, YouTube; locked dims/fonts/colors. | P3 | Design + Marketing | ☐ |

### Phase 6 — SEO Foundation

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 66 | XML sitemap(s) generated + valid | Sitemap is how Google efficiently discovers content. | `curl` sitemap → 200, valid XML, every `<loc>` resolves. ⚠ *Empty-loc-from-missing-slugs* — validate every URL is non-empty. | P0 | SEO + Eng | ☐ |
| 67 | robots.txt configured correctly | Wrong robots.txt = site invisible OR sensitive areas indexed. | `curl /robots.txt` → text/plain, sitemap announced, disallows intentional. ⚠ *Robots.txt-user-agent-override*. | P0 | SEO + Eng | ☐ |
| 68 | Self-referencing canonical on every page | No/wrong canonical = duplicate-content risk across variants. | `curl` any page: `<link rel="canonical">` present, points to itself in clean format. ⚠ *Done-without-verification* (redirect ≠ canonical). | P0 | SEO + Eng | ☐ |
| 69 | Unique `<title>` per template | Duplicate titles get deprioritized. | Title template per page type; crawl confirms uniqueness. ⚠ *Brand-doubling-in-titles* — apply suffix once at root layout. | P0 | SEO + Eng | ☐ |
| 70 | Unique meta description per template | No description = Google auto-generates random snippets. | Description template per type; unique, ≤155 chars. | P1 | SEO + Content | ☐ |
| 71 | One `<h1>` per page, matching topic | Multiple/missing H1 = confused topic signal. | `curl` + `grep "<h1"` → exactly one per page; matches title intent. | P0 | Engineering | ☐ |
| 72 | Structured data (JSON-LD) on key templates | Unlocks rich results; strong AI-engine signal. | Per template: WebSite/Organization on home; SoftwareApplication/Product/Article as fits; BreadcrumbList on non-root; FAQPage where relevant. | P1 | SEO + Eng | ☐ |
| 73 | All structured data validates in Rich Results Test | Invalid schema = no rich results + audit-tool errors. | Every template URL passes Rich Results with zero errors. ⚠ *Schema-validation-gap* — RRT ≠ true schema validation. | P1 | SEO | ☐ |
| 74 | OG + Twitter Card tags on every page | Without them, shares look ugly + lower CTR. | `curl`: og:title, og:description, og:image, twitter:card present. | P1 | Engineering | ☐ |
| 75 | hreflang tags (if multi-language) | Without them Google may serve the wrong language. | hreflang per variant + x-default; validate in GSC. | P1 | SEO | ☐ |
| 76 | Image alt text on every meaningful image | Missing alt = a11y failure + SEO miss. | CMS enforces alt field; build-time check fails if missing on important images. | P1 | Content + Eng | ☐ |
| 77 | Descriptive internal anchor text (not "click here") | Anchor text is a strong in-content signal. | Spot-check 20 internal links; all descriptive. | P2 | Content | ☐ |
| 78 | Pagination canonical strategy | Page 2+ must self-canonical, not point to page 1. | `curl /page/2/`: canonical points to itself. | P1 | SEO + Eng | ☐ |
| 79 | AI-bot directives in robots.txt (documented decision) | Strategic allow/block per AI bot; document the WHY. | Doc per agent (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, etc.); robots.txt reflects it. ⚠ *Robots.txt-user-agent-override* — explicit block REPLACES `*`, doesn't inherit. | P1 | SEO + Founder | ☐ |
| 80 | IndexNow enabled (Bing/Yandex) | Speeds Bing indexing; free, low effort. | IndexNow key file at `/<key>.txt`; submission in CMS publish hook. | P2 | SEO + Eng | ☐ |
| 81 | BreadcrumbList JSON-LD on non-root pages | One of the highest-value schema types. | `curl` non-root: BreadcrumbList with itemListElement per level; Rich Results valid. | P1 | SEO + Eng | ☐ |
| 82 | Organization schema + sameAs on homepage | Strongest entity-grounding signal for Google + AI. | `curl` home: Organization JSON-LD with legalName, logo, url, foundingDate, sameAs (LinkedIn, Crunchbase, X, Wikidata Q-item). | P1 | SEO + Eng | ☐ |
| 83 | Author (Person) schema + sameAs on articles | Author-level entity signals materially affect ranking. | Each article: Person with name, url, jobTitle, sameAs (LinkedIn, X, Wikidata), knowsAbout, worksFor → Organization. | P1 | SEO + Eng | ☐ |
| 84 | Internal link-depth audit (≤3 clicks) | Pages >3 clicks deep rarely get crawl budget. | Crawl depth report: every important URL ≤3 clicks; orphans = 0. | P1 | SEO | ☐ |
| 85 | Content-gap analysis vs top 3 competitors | Competitors reveal proven demand. | Gap tool list of keywords competitors rank for that you don't; prioritized. | P2 | SEO + Content | ☐ |
| 86 | Search intent mapped per template | Mixed-intent templates lose to focused ones. | Doc mapping each template → primary intent + example queries; checked vs real SERPs. | P2 | SEO | ☐ |
| 87 | Mobile-first indexing verified per template | Google indexes the mobile version. | GSC URL Inspection: "Crawled as Googlebot smartphone"; mobile DOM has all content + schema + links. | P1 | SEO + Eng | ☐ |
| 88 | llms.txt published at site root | Emerging convention; cheap optionality for dev/AI-adjacent sites. | Markdown at `/llms.txt`: H1 brand, blockquote pitch, curated link sections. Fetch from ChatGPT/Claude/Perplexity to verify. | P2 | SEO + Content | ☐ |
| 89 | Content formatted for LLM citation | LLMs cite concise, factual, front-loaded answers. | Editorial rule: every article opens with a 40–80 word direct answer; clear headings, lists, factual statements. | P2 | Content + SEO | ☐ |
| 90 | Wikidata / Wikipedia entity presence | Q-items strengthen entity recognition by Google + AI. | Wikidata Q-item for company (+ key authors) with sameAs, founding date, key people. | P3 | Marketing + SEO | ☐ |
| 91 | FAQPage schema on FAQ + key landing pages | One of the highest-signal types for AEO. | `curl`: FAQPage JSON-LD with Question + acceptedAnswer pairs; Rich Results passes. ⚠ *Schema-validation-gap* — never ship empty schema fields. | P1 | SEO + Content | ☐ |

### Phase 7 — Performance & Core Web Vitals

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 92 | CWV targets defined per template | "Fast enough" is undefined without targets; CWV is a ranking signal. | Per-template doc: LCP <2.5s, INP <200ms, CLS <0.1; tested mobile + desktop. | P0 | SEO + Eng | ☐ |
| 93 | Hero image optimized (LCP) | Hero is usually the LCP element. | WebP/AVIF, sized, `fetchpriority="high"`, priority loading; PSI shows hero LCP <2.5s. | P1 | Eng + Design | ☐ |
| 94 | Image optimization pipeline (WebP/AVIF, srcset, lazy) | Unoptimized images are the #1 cause of slow sites. | Build serves modern formats, srcset sizes, below-fold lazy. ⚠ *Compare-page-performance-disaster* — test image-optimizer paths against CDN hotlink rules (403s). | P0 | Engineering | ☐ |
| 95 | JS bundle audited + code-split | Bundles >~200kB hurt mobile; tank LCP/INP. | Bundle analyzer shows per-page size; heavy components dynamically imported. | P1 | Engineering | ☐ |
| 96 | CSS minified + tree-shaken | Unused CSS adds bytes to every load. | Minified in prod; unused styles purged. | P1 | Engineering | ☐ |
| 97 | JavaScript minified | Unminified JS = 30–60% larger, slower parse. | `curl` JS asset: confirm minified. ⚠ *Backlog-warning-inflation* — don't dismiss "unminified" warnings. | P1 | Engineering | ☐ |
| 98 | Third-party scripts deferred | Synchronous third-party scripts block render. | Tag manager uses afterInteractive/lazyOnload; others deferred/async. | P1 | Engineering | ☐ |
| 99 | Font loading optimized | Custom fonts cause FOIT/FOUT, hurt LCP/CLS. | `font-display: swap`; preload critical fonts; ≤2–3 families. | P2 | Engineering | ☐ |
| 100 | Caching headers configured | Aggressive cache for static, revalidate HTML. | `curl -I` assets: appropriate Cache-Control; static immutable, HTML revalidates. | P1 | Engineering | ☐ |
| 101 | CDN cache rules reviewed | Misconfig serves stale OR misses cacheable assets. | Rules reviewed; hit ratio tested. ⚠ *CDN-cache-analytics-blind-spot* — HTML caching vs server-side analytics. | P1 | Eng + SEO | ☐ |
| 102 | TTFB under 600ms | Slow TTFB is a foundation problem no frontend fix solves. | `curl -w "%{time_starttransfer}"` <0.6s consistently. | P1 | Engineering | ☐ |
| 103 | Lighthouse ≥75 mobile / ≥85 desktop on key templates | De-facto benchmark; below = noticeable pain. | Run Lighthouse incognito on home + 2–3 key templates. ⚠ *Compare-page-performance-disaster* — test clean to avoid extension noise. | P1 | Eng + SEO | ☐ |
| 104 | PSI field data passing (if available) | Field (CrUX) data is what Google actually uses. | PSI field data green for LCP/INP/CLS (may need 28 days of traffic). | P2 | SEO | ☐ |
| 105 | GTmetrix/WebPageTest baseline saved | Pre-launch baseline = detect regressions later. | Baseline reports saved to project folder for home + key templates. | P2 | SEO | ☐ |

### Phase 8 — Analytics & Tracking

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 106 | GA4 property created + configured | No analytics = no decisions. | Property created, data stream live, realtime test event visible. | P0 | SEO + Marketing | ☐ |
| 107 | Tag Manager container created | Centralizes tags; direct script tags everywhere is unsustainable. | Container live, loaded on every page. ⚠ *Hybrid-stack-analytics-gaps* — verify on every stack. | P0 | SEO + Marketing | ☐ |
| 108 | Tag manager on EVERY template (incl. CMS/blog) | Hybrid sites notoriously miss one stack. | `curl` every template: container ID present. ⚠ *Hybrid-stack-analytics-gaps*. | P0 | SEO + Eng | ☐ |
| 109 | GA4 ↔ tag manager connection verified | GA4 must actually receive events. | Tag Assistant shows GA4 config tag firing on every page; realtime shows events. | P0 | SEO | ☐ |
| 110 | GA4 ↔ GSC connection enabled | Surfaces organic search data in GA4. | GA4 → Admin → Product Links → Search Console linked. | P1 | SEO | ☐ |
| 111 | Key events / conversions defined in GA4 | Default GA4 misses what matters to the business. | Per success metric: a GA4 event; marked Key Event where it's a conversion. | P1 | SEO + Marketing | ☐ |
| 112 | Google Search Console verified | Only direct line to Google's view of the site. | Property verified; Domain property preferred. | P0 | SEO | ☐ |
| 113 | Sitemap submitted to GSC | Accelerates discovery; gives the Sitemaps report. | GSC → Sitemaps → status Success; URLs discovered appears. | P0 | SEO | ☐ |
| 114 | Bing Webmaster Tools verified + sitemap | Bing powers Bing/Yahoo/DuckDuckGo + ChatGPT search. | BWT verified; sitemap submitted; URL Inspection works. | P1 | SEO | ☐ |
| 115 | AI-bot analytics installed | Without it you can't measure AEO position. | Bot-analytics tool tracking GPTBot/ClaudeBot/PerplexityBot; realtime shows visits. ⚠ *CDN-cache-analytics-blind-spot*. | P1 | SEO + Eng | ☐ |
| 116 | Heatmap / session recording installed | Surfaces UX issues analytics miss. | Clarity (free) or Hotjar installed; test session recorded. | P2 | SEO + Marketing | ☐ |
| 117 | Cross-domain tracking (if relevant) | Multiple domains split sessions without it. | GA4 cross-domain config includes all domains; test session crosses in one session. | P2 | SEO | ☐ |
| 118 | LLM referral tracking configured | Closes the AEO loop: bot visits + human referrals from AI engines. | GA4 referral source includes chatgpt.com, claude.ai, perplexity.ai, gemini.google.com, copilot.microsoft.com; "AI referrals" segment created. | P2 | SEO | ☐ |

### Phase 9 — Security & Privacy

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 119 | HTTPS enforced on every page | Mixed content breaks trust. | `curl http://` 301s to `https://`; every internal link uses https. | P0 | Engineering | ☐ |
| 120 | HSTS header configured | Prevents downgrade attacks. | `curl -I`: Strict-Transport-Security, max-age ≥15768000. | P1 | Engineering | ☐ |
| 121 | Security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) | Missing headers fail audits + raise XSS risk. | securityheaders.com scan: grade A or better. | P1 | Engineering | ☐ |
| 122 | GDPR/CCPA cookie consent banner | Required by law in EU + California. | Banner on first visit; granular consent; defaults to least-tracking; choices persist. | P0 | Eng + Legal | ☐ |
| 123 | GA4 IP anonymization / data retention reviewed | GA4 retention defaults may not match jurisdiction. | GA4 → Data Settings → Retention reviewed + aligned with legal. | P1 | SEO + Legal | ☐ |
| 124 | No PII in URLs, query strings, or analytics | PII in URLs is a privacy breach. | Manual audit: no emails/phones/user-IDs in URLs; analytics events scrubbed. | P1 | Eng + Legal | ☐ |
| 125 | Rate limiting / DDoS protection on forms + APIs | Unprotected forms = spam flood within hours. | reCAPTCHA / bot challenge on every public form; rate limits on APIs. | P1 | Engineering | ☐ |
| 126 | Admin areas protected (strong pw, 2FA, IP) | Default admin URLs + weak passwords get owned in days. | Non-default admin URL; strong-password policy; 2FA; optional IP allowlist. | P0 | Engineering | ☐ |
| 127 | Dependencies scanned for vulnerabilities | Most breaches come from outdated libs with known CVEs. | npm audit / Dependabot / Snyk: zero high or critical. | P1 | Engineering | ☐ |
| 128 | No secrets committed to repo | Public repos with secrets get scraped within minutes. | git-secrets / truffleHog clean; secrets in env/vault. | P0 | Engineering | ☐ |

### Phase 10 — Accessibility

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 129 | WCAG 2.1 AA baseline targeted | AA is the legal threshold in most jurisdictions. | Lighthouse a11y ≥90 every template; axe DevTools: zero serious/critical. | P1 | Eng + Design | ☐ |
| 130 | Keyboard navigation on every interactive element | Keyboard-only users excluded otherwise. | Tab through each page; every interactive element reachable; visible focus. | P1 | Engineering | ☐ |
| 131 | Color contrast meets AA (4.5:1 text, 3:1 UI) | Low contrast is unreadable for low-vision users. | WebAIM contrast checker on all text/background combos; all meet AA. | P1 | Design | ☐ |
| 132 | Alt text on every meaningful image | Missing alt excludes users + misses SEO. | CMS enforces; manual review of home + key templates; decorative `alt=""`. | P1 | Content + Eng | ☐ |
| 133 | Form fields have associated labels | Unlabeled inputs unusable for screen readers. | Every `<input>` has a `<label for/id>`; axe confirms. | P1 | Engineering | ☐ |
| 134 | Logical heading hierarchy (no skips) | Screen readers navigate by headings. | No h2 without h1, no h3 without h2; Lighthouse confirms. | P2 | Eng + Design | ☐ |
| 135 | Modals accessible (focus trap, escape, announce) | Inaccessible modals trap assistive tech. | Focus enters on open, traps inside, escape closes, focus returns to trigger. | P2 | Engineering | ☐ |
| 136 | Skip-to-main-content link | Without it, screen-reader users tab through nav every page. | First focusable element is "Skip to main content". | P2 | Engineering | ☐ |
| 137 | Tested with a screen reader (VoiceOver/NVDA) | Automated tools catch ~30% of issues. | Navigate home + one detail page with VoiceOver/NVDA; identify showstoppers. | P2 | Design + Eng | ☐ |

### Phase 11 — QA & Testing

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 138 | Cross-browser testing (Chrome, Firefox, Safari, Edge) | Each browser has rendering quirks. | Manual walkthrough of home + key templates in each; no P0/P1 issues. | P1 | QA | ☐ |
| 139 | Cross-device testing (real iOS + Android + tablet + desktop) | Emulators lie. | Real-device tests; no P0/P1 issues. | P1 | QA | ☐ |
| 140 | Edge cases (empty, very long, special chars) | Edge cases are where templates crack. | Per template: min content, max content, special chars, missing fields. | P2 | QA | ☐ |
| 141 | Slow-network / offline behavior | Slow networks reveal hidden bugs. | DevTools throttle Slow 3G + Offline; graceful degrade, no infinite loaders. | P2 | QA + Eng | ☐ |
| 142 | User-journey testing (5+ end-to-end) | Pages work in isolation; journeys reveal flow problems. | Document 5+ journeys; walk each as a new user; log every hesitation. | P1 | QA + SEO | ☐ |
| 143 | All internal links return 200 | Broken links waste crawl budget + frustrate users. | Crawl: zero 4xx on internal links. | P0 | SEO | ☐ |
| 144 | All forms submit + trigger expected actions | Broken forms = lost revenue from day 1. | Submit every public form; confirmation seen; backend received; email arrived. | P0 | QA + Eng | ☐ |
| 145 | Search returns relevant results (if applicable) | Broken search = instant bounce. | Test 10 representative queries; relevant; no crashes on edge inputs. | P1 | QA | ☐ |
| 146 | Cross-browser CSS quirks fixed | Per-browser quirks accumulate to look unprofessional. | Spot-check known-quirky elements per browser. | P2 | Eng + Design | ☐ |
| 147 | Print stylesheet OR sane default print | Some users print; default print is usually broken. | Print Preview: content prints, no nav/decorative noise, readable. | P3 | Engineering | ☐ |

### Phase 12 — Pre-Launch Verification

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 148 | noindex meta audit (no accidental prod noindex) | One rogue noindex on home = invisible site. | `curl` every primary template + grep robots tag; none "noindex" unless intentional. | P0 | SEO | ☐ |
| 149 | X-Robots-Tag header audit | Headers can carry noindex too. | `curl -I` every primary template; no `X-Robots-Tag: noindex` unless intentional. | P0 | SEO + Eng | ☐ |
| 150 | GSC Live Test passes for top 5 pages | Live Test is the source of truth for indexability. | GSC URL Inspection → Live Test on home + 4 templates: "URL is available to Google." ⚠ *Stale-GSC-data* — Live Test overrides cache. | P0 | SEO | ☐ |
| 151 | Sitemap final submission Success in GSC + BWT | "Couldn't fetch" blocks discovery. | GSC + BWT Sitemaps: status Success for every sitemap. | P0 | SEO | ☐ |
| 152 | Final crawl, zero P0 issues | A final crawl catches what you missed. | Site Audit health ≥85%, no 5xx, no critical broken links, no P0 backlog open. ⚠ *Audit-tool-blind-spots* (JS-rendered crawl). | P0 | SEO | ☐ |
| 153 | GA4 Realtime confirms tracking live every template | Final tracking check before announcing. | Visit each template; GA4 Realtime → Pages shows the URL within 30s. | P0 | SEO | ☐ |
| 154 | Tag manager Debug confirms tags fire | Debug shows tag-by-tag what fired. | Preview mode through 3 templates: all expected tags fire, no errors. | P0 | SEO | ☐ |
| 155 | All forms tested end-to-end (again) | Forms break during final config changes. | Submit every form; backend received + notifications sent. | P0 | QA | ☐ |
| 156 | Mobile experience walked on a real device | Final check on actual device, not emulator. | Real iPhone + Android: home → critical journey → completion; no P0/P1. | P0 | QA | ☐ |
| 157 | All P0/P1 backlog closed or explicitly deferred | Launching with open P0/P1 = launch unfinished. | Master Checklist: zero rows P0/P1 with Status Open or In Progress. | P0 | Project owner | ☐ |
| 158 | Pre-launch screenshot/video archive | You'll want to remember what v1 looked like. | Screenshots of every primary template at desktop + mobile, saved. | P2 | SEO | ☐ |
| 159 | Final stakeholder approval (founder sign-off) | Launch without sign-off invites post-launch complaints. | Written sign-off; deferred-item decisions confirmed. | P0 | Project owner | ☐ |

### Phase 13 — Launch Day

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 160 | War room set up (team available) | Things break at launch; have the team ready. | Dedicated channel; Eng/SEO/Content/Founder available first 4 hours. | P0 | Project owner | ☐ |
| 161 | DNS cutover executed (if migrating) | DNS propagates slowly; time it. | Records point to prod; TTL reduced 24h prior. | P0 | Engineering | ☐ |
| 162 | Verify HTTPS on apex + www | DNS changes can break SSL temporarily. | `curl https://domain` + `https://www.domain` → 200, valid SSL, green padlock. | P0 | Engineering | ☐ |
| 163 | Verify canonical-host redirect still works post-DNS | Redirect rules can need refresh after DNS. | `curl` confirms 301 to canonical host. | P0 | SEO + Eng | ☐ |
| 164 | Sitemap re-submitted in GSC + BWT | Re-ping engines to crawl the new location. | GSC + BWT: re-submit each sitemap. | P1 | SEO | ☐ |
| 165 | "Request Indexing" for top 10 URLs in GSC | Puts URLs in Google's priority queue. | URL Inspection → Request Indexing on home + 9 priority URLs. | P1 | SEO | ☐ |
| 166 | Smoke test critical journeys live | Prod differs from staging. | Each critical journey walked on live site; no breakage. | P0 | QA + SEO | ☐ |
| 167 | Analytics verified live (GA4 Realtime) | Confirm tracking survived cutover. | GA4 Realtime shows live traffic from your visits + seed traffic. | P0 | SEO | ☐ |
| 168 | Launch announcement sent | Coordinated launch = traction; don't launch silently. | Comms plan executed: internal team first, then external. | P1 | Marketing | ☐ |
| 169 | Monitoring dashboards open + watched | First hour reveals immediate issues. | Uptime green; error monitor no spike; GA4 Realtime + server metrics normal. | P0 | Eng + SEO | ☐ |
| 170 | Rollback plan reviewed | Hope is not a plan. | Rollback steps reviewed by on-call; one-command revert available. | P0 | Engineering | ☐ |

### Phase 14 — Post-Launch (First 7 Days)

| # | Item | Why it matters | How to verify | P | Owner | Status |
|---|---|---|---|---|---|---|
| 171 | Day 1: watch error monitor + uptime | Bugs that survived launch surface within 24h. | Daily: error rate, uptime, GA4 Realtime patterns. | P0 | Eng + SEO | ☐ |
| 172 | Day 1: GSC URL Inspection on submitted URLs | Confirm Google is picking up the site. | URL Inspection on 10 priority URLs: "Last crawl" today/yesterday. | P1 | SEO | ☐ |
| 173 | Day 1: manual sanity check of critical journeys | Re-verify everything one day post-launch. | Walk each critical journey; no P0/P1 regressions. | P0 | QA + SEO | ☐ |
| 174 | Day 3: indexation count check in GSC | How many pages indexed in 72h? | GSC Pages report: indexed count; trajectory reasonable for site size. ⚠ *Indexation-patience-curve*. | P1 | SEO | ☐ |
| 175 | Day 3: server/CDN cost check | Misconfig can balloon cloud costs. | Provider dashboard: cost trajectory matches estimate; no spikes. | P1 | Engineering | ☐ |
| 176 | Day 7: full re-crawl to detect regressions | Compare pre-launch baseline to day-7. | Site Audit re-run; delta vs baseline; new P0/P1 opened. | P1 | SEO | ☐ |
| 177 | Day 7: GSC Performance first data | After 7 days GSC has early performance data. | GSC Performance: impressions trending up; note initial queries. | P2 | SEO | ☐ |
| 178 | Day 7: Bing/IndexNow indexation check | Bing should be discovering pages. | BWT Sitemaps + Pages: discovered count rising. | P2 | SEO | ☐ |
| 179 | Day 7: CWV re-measurement | Production traffic differs from staging. | PSI on key templates vs baseline; investigate regressions. | P1 | SEO | ☐ |
| 180 | Day 7: AI-bot traffic check | Which AI bots arrived? Any odd patterns? | Bot dashboard: visits by agent, top crawled paths, any 4xx to investigate. | P2 | SEO | ☐ |
| 181 | Day 7: lessons-learned doc started | Capture learnings before memory fades. | Document: what went well, what broke, what to do differently, what surprised us. → feed back into `launch-gotchas`. | P2 | Project owner + SEO | ☐ |

---

## Pre-Launch Sign-Off Gate

> **Every item below must be `Verified` — not merely `Done` — before launch. No exceptions.** This is a refuse-to-launch condition.

| # | Critical item | P | Owner | Status | Verification evidence |
|---|---|---|---|---|---|
| 1 | Domain registered + SSL active + HTTPS enforced | P0 | Engineering | ☐ | |
| 2 | Canonical host decision live (apex vs www) with one-hop 301 | P0 | Engineering | ☐ | |
| 3 | No production page accidentally noindexed | P0 | SEO | ☐ | |
| 4 | GSC Live Test passes for top 5 priority URLs | P0 | SEO | ☐ | |
| 5 | Sitemap submitted + Success status in GSC and BWT | P0 | SEO | ☐ | |
| 6 | robots.txt clean (no accidental `Disallow: /`) | P0 | SEO | ☐ | |
| 7 | Self-referencing canonical on every primary template | P0 | Engineering | ☐ | |
| 8 | Unique title + meta description + single H1 per template | P0 | SEO + Eng | ☐ | |
| 9 | Structured data validates in Rich Results Test | P0 | SEO | ☐ | |
| 10 | GA4 + tag manager live on EVERY template (incl. CMS) | P0 | SEO | ☐ | |
| 11 | GSC + BWT property verified | P0 | SEO | ☐ | |
| 12 | All public forms submit end-to-end successfully | P0 | QA | ☐ | |
| 13 | Mobile experience walked on real iOS + Android | P0 | QA | ☐ | |
| 14 | Critical user journeys complete without errors | P0 | QA | ☐ | |
| 15 | Lighthouse Performance ≥75 mobile / ≥85 desktop on top templates | P1 | Eng + SEO | ☐ | |
| 16 | Lighthouse Accessibility ≥90 on top templates | P1 | Engineering | ☐ | |
| 17 | Security headers configured (securityheaders.com grade A+) | P1 | Engineering | ☐ | |
| 18 | Privacy Policy + Terms + Cookie Consent live | P0 | Legal | ☐ | |
| 19 | No secrets committed to repo | P0 | Engineering | ☐ | |
| 20 | Rollback procedure documented + tested | P0 | Engineering | ☐ | |
| 21 | Error monitoring + uptime monitoring live | P1 | Engineering | ☐ | |
| 22 | Email deliverability tested (SPF + DKIM + DMARC valid) | P1 | Engineering | ☐ | |
| 23 | All P0 backlog items closed or explicitly deferred with reason | P0 | Project owner | ☐ | |
| 24 | Founder/CEO written sign-off received | P0 | Project owner | ☐ | |

### Final sign-off

| Role | Signature | Date |
|---|---|---|
| Founder / CEO | | |
| Engineering Lead | | |
| SEO Lead | | |
| Content Lead | | |

---

## Post-Launch Monitoring

> Daily checks the first week, weekly thereafter. Catch regressions early.

| When | Check | Owner | Status | Findings / action |
|---|---|---|---|---|
| Day 1 | Error monitor — rate of new errors | Engineering | ☐ | |
| Day 1 | Uptime monitor — 100% in first 24h | Engineering | ☐ | |
| Day 1 | GA4 Realtime — tracking active across templates | SEO | ☐ | |
| Day 1 | GSC URL Inspection — top 10 URLs crawled? | SEO | ☐ | |
| Day 1 | Manual walkthrough — all critical journeys | QA | ☐ | |
| Day 1 | Forms — submit every public form, confirm receipt | QA | ☐ | |
| Day 1 | Server load + TTFB normal under real traffic | Engineering | ☐ | |
| Day 1 | No spike in 4xx/5xx in CDN logs | Engineering | ☐ | |
| Day 3 | Indexation count in GSC — reasonable trajectory? ⚠ *Indexation-patience-curve* | SEO | ☐ | |
| Day 3 | Search Console — zero new Coverage errors | SEO | ☐ | |
| Day 3 | Cloud/hosting cost trajectory matches estimate | Engineering | ☐ | |
| Day 3 | AI-bot traffic appearing in bot analytics? | SEO | ☐ | |
| Day 3 | Crawl stats in GSC — Googlebot active | SEO | ☐ | |
| Day 7 | Full re-crawl vs pre-launch baseline | SEO | ☐ | |
| Day 7 | GSC Performance — first impressions/clicks | SEO | ☐ | |
| Day 7 | PSI — re-measure CWV on key templates | SEO | ☐ | |
| Day 7 | BWT — Bing has discovered URLs | SEO | ☐ | |
| Day 7 | GA4 — user/session counts reasonable, no tracking gap | SEO + Marketing | ☐ | |
| Day 7 | Heatmap recordings — review for UX issues | SEO + Design | ☐ | |
| Day 7 | Week 1 lessons-learned doc started | Project owner | ☐ | |
| Day 14 | Indexation rate progress check | SEO | ☐ | |
| Day 14 | Backlog hygiene — close completed items | SEO | ☐ | |
| Day 14 | Stakeholder update with first numbers | Project owner | ☐ | |
| Day 30 | CWV field data first available in PSI (CrUX) | SEO | ☐ | |
| Day 30 | First post-launch SEO audit — formal cycle resumes | SEO | ☐ | |
| Day 30 | Retrospective — full team review | Project owner | ☐ | |
