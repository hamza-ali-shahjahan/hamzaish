---
name: launch-gotchas
description: A library of real, hard-won website-launch failure modes — each with what happened, the root cause, and how to prevent it. Use before starting a launch, when debugging a launch-time SEO/analytics/performance problem (indexation not happening, redirect or canonical issues, analytics undercounting, schema validation failing, CWV regressions, robots.txt mistakes), or when a launch checklist item refuses to verify. These are the mistakes that normally only get learned by being burned. Companion to web-launch.
---

# launch-gotchas

> The stuff that usually only lives in someone's head after they've shipped a few sites
> and gotten burned. Read it **before** a launch so you recognize the trap, and **during**
> a launch when something won't verify. Stack specifics (Cloudflare / Yoast / Next.js /
> Semrush) are illustrative common-stack examples — each lesson states the underlying
> principle so it survives a stack swap.

## The meta-lesson

**"Done" is not "Verified."** Most entries below are a variation of the same root failure: someone marked something complete, and the objective check was never run — or was run with the wrong tool. Every prevention here reduces to *run the real check, independently, before closing the item.*

---

## Verification & audit-tool traps

### Done-without-verification *(the crown jewel)*
**What happened:** A duplicate-canonical issue was marked Done. Two weeks later search-console validation FAILED — several URLs still affected. The redirect was working; the canonicalization wasn't.
**Root cause:** A single user-visible symptom can have multiple independent mechanisms behind it: redirect rule **+** canonical tag **+** internal href **+** sitemap entry. Fixing one and seeing the symptom partly improve reads as "done."
**Prevent:** Never accept "Done" without independent re-verification. Enumerate every mechanism that contributes to the item and verify each before closing.

### Audit-tool blind spots
**What happened:** A crawler's default mode didn't execute JavaScript. On a JS-rendered site it reported false-positive missing H1s, low word count, and low text-to-HTML ratio on pages that were actually fine when rendered.
**Root cause:** The audit tool and the browser see different DOMs.
**Prevent:** Cross-verify any crawler finding against `curl`-rendered HTML **and** browser DevTools before escalating to engineering. Use a JS-rendered crawl if the tool supports it. Build the cross-check into the audit workflow.

### Schema-validation gap
**What happened:** A template auto-applied a specialized schema type (e.g. `HowTo`) to a whole URL pattern without populating its required fields. A real validator flagged it invalid; Google's Rich Results Test said "fine" — only because Google had deprecated rich results for that type.
**Root cause:** Rich Results Test only checks what Google *currently renders*. It is not a schema validator.
**Prevent:** Validate against schema.org's validator (or parse the JSON-LD manually) for true correctness. Never ship empty schema fields. Don't apply a specialized schema type unless the content actually fits it.

### Backlog "warning" inflation risk
**What happened:** An audit tool's "Warning" (vs "Error") label tempted the team to ignore items that were actually serious — thin text-to-HTML on hundreds of pages, unminified JS — both of which compounded into real quality/perf problems.
**Root cause:** Vendor severity labels optimize for their own scoring, not your ranking.
**Prevent:** For each warning, ask "is this a proxy for a real ranking/UX factor?" Re-classify into your own P0–P4 with reasoning. Don't outsource triage to a vendor label.

### Stale GSC data
**What happened:** A section had been deindexed by an old noindex tag. The tag was removed, but search console kept showing "Excluded by noindex" for weeks because its index data is heavily cached.
**Root cause:** Console index status lags reality.
**Prevent:** When the console shows an issue you believe is fixed, run URL Inspection → **Test Live URL**. The Live Test is real-time and overrides cached index status.

---

## Redirect, canonical & URL traps

### Cloudflare-redirect-quirks (query-string loss)
**What happened:** Migrating www→apex via a CDN dynamic redirect using the URL *path* dropped query strings. Pages with `utm`, `gclid`, `fbclid` lost their tracking on redirect.
**Root cause:** Redirecting on `…uri.path` discards the query string; you need the full URI.
**Prevent:** Build the redirect target from the full request URI (e.g. `concat("https://canonical-domain.com", http.request.uri)`), not the path. **Test query-string preservation explicitly** in pre-launch QA. Principle: any redirect rule must preserve the query string unless you intend otherwise.

### Trailing-slash internal hrefs
**What happened:** After the slash-redirect rule was live and working, ~970 internal links still used the old slash format. Every internal click triggered an unnecessary 301 hop — a crawl-budget tax and a real perf/SEO cost, with no visible breakage.
**Root cause:** The redirect rule and the internal-href cleanup are **two separate tasks**. Fixing the rule doesn't fix the links already baked into templates/content.
**Prevent:** When you set a slash policy, separately audit and clean up internal hrefs in code/content. Don't mark the trailing-slash item Done until *both* are verified.

### Old-domain ghost URLs
**What happened:** On a previously-owned domain, bots kept hitting URLs from the domain's prior life (different content). Each returned 404, wasting crawl budget on a young domain.
**Root cause:** Search engines remember a domain's old URLs.
**Prevent:** On a reused domain, request URL removal in Google + Bing for the old URLs, and return **410 Gone** (not 404) for URLs you want engines to actively forget. Watch bot logs in the first 30 days for ghost-URL patterns.

### Brand-doubling in titles
**What happened:** A title-rendering bug produced `Best <X> | Brand | Brand` — the brand suffix was applied at both the root layout **and** per-page metadata.
**Root cause:** Suffix applied in two places that both run.
**Prevent:** Apply the brand suffix **once** at the root layout (e.g. a metadata `title.template`). Per-page title should be the page-specific portion only.

---

## Sitemap & indexation traps

### Sitemap nested-index errors
**What happened:** A CMS sitemap plugin created a sitemap that was a **nested index** pointing to another index file. The search console rejected it ("1 error") and stopped processing.
**Root cause:** A sitemap index must point to leaf `urlset` files, not to other index files.
**Prevent:** Point the root sitemap index directly at leaf `urlset` XMLs. If a plugin nests indexes, point the root at the leaf sitemap, not the intermediate index.

### Empty `<loc>` from missing slugs
**What happened:** A handful of published posts had empty slug fields. The sitemap included them with empty `<loc>` tags; the console flagged invalid URLs and reduced sitemap trust.
**Root cause:** The CMS allowed publishing with an empty slug (non-Latin titles, bulk imports, automation can all cause this).
**Prevent:** Add publish-time validation: reject publish if the slug is empty. Periodically audit (e.g. SQL: rows where status=publish and slug is empty). Validate every `<loc>` is non-empty before trusting a sitemap.

### Indexation-patience-curve
**What happened:** A 3-week-old domain with ~540 pages indexed at ~15%. Leadership read it as alarm; in reality 30–40% is typical at that age, with 50–70% by ~6 weeks.
**Root cause:** New domains get crawl-budget rationing. Indexation is a 6–12 week ramp.
**Prevent:** Set expectations upfront. In weeks 1–4 track the *trajectory*, not the absolute number. Don't trigger emergency work over a low launch-week indexation rate that's actually on-curve.

---

## Robots & crawler-directive traps

### Robots.txt user-agent override
**What happened:** Adding explicit `User-Agent` blocks to allowlist specific AI bots (GPTBot, ClaudeBot, etc.) silently OVERRODE the default `User-Agent: *` disallow rules. Those bots could then crawl admin and parameter URLs that `*` had blocked.
**Root cause:** A specific `User-Agent` block **replaces** the `*` block — it does not inherit from it.
**Prevent:** Either keep all bots under `*` (simplest), OR duplicate every `Disallow` rule under each specific `User-Agent` block. After editing robots.txt, `curl` it and confirm the disallows you expect apply to *each* named agent.

---

## Analytics & CDN-cache traps

### Hybrid-stack-analytics-gaps
**What happened:** The tag manager was installed on the main app but missing on the CMS/blog half of a hybrid stack. Blog visits were invisible to analytics for weeks; not caught until a manual per-template audit.
**Root cause:** A snippet installed in one place doesn't apply everywhere on a hybrid stack.
**Prevent:** Audit the tag manager **and** GA firing on *every* template type via `curl` + `grep` for the container ID. Re-test whenever themes/plugins change. Don't assume one install covers all stacks.

### CDN-cache-analytics-blind-spot
**What happened:** A server-side analytics plugin missed visits because the CDN served cached HTML directly from edge — the origin (and the plugin) never saw the request.
**Root cause:** Edge-cached responses bypass origin-side logging.
**Prevent:** With server-side analytics behind a CDN, understand the cache HIT-rate impact on visibility. Either bypass cache for the logged paths (perf cost) or accept partial visibility (analytics gap) — but make the trade-off explicit, and prefer client-side tags for traffic counting behind a CDN.

---

## Performance traps

### Compare-page-performance-disaster (cascade)
**What happened:** A template scored Lighthouse Performance ~40, LCP ~11.7s. Cause was a cascade: a heavy multi-MB JS bundle + an oversized tag-manager container + broken CDN images returning 403. It took weeks to diagnose because lab tests were contaminated by browser extensions.
**Root cause:** Multiple compounding perf problems + a noisy measurement environment.
**Prevent:** Test performance in Incognito or via headless Lighthouse / PSI to eliminate extension noise. Audit JS bundle size with a bundle analyzer. Test image-optimizer fetch paths against CDN hotlink rules early (see below).

### Image-optimizer blocked by hotlink protection
**What happened:** A large set of images returned 403 when the image-optimizer tried to fetch them, because the CDN's hotlink protection blocked the optimizer's requests.
**Root cause:** Hotlink protection didn't allowlist the optimizer's fetch path.
**Prevent:** Test the image-optimizer → origin/CDN fetch path explicitly before launch. Allowlist the optimizer.

### PageSpeed/Lighthouse cache-block by WAF
**What happened:** PSI returned "Unable to resolve" because the CDN's WAF was challenging the Chrome-Lighthouse user agent.
**Root cause:** WAF/bot rules blocking the testing agent.
**Prevent:** When PSI/Lighthouse starts failing on a previously-working site, check the CDN security events for user-agent blocks. Allowlist the Chrome-Lighthouse user agent (or Google's PSI IP ranges) in firewall rules.

---

## Process traps

### Manager-review-chain-ambiguity
**What happened:** Content drafting bottlenecked because the review chain wasn't established upfront. Different stakeholders gave conflicting feedback across rounds.
**Root cause:** No defined drafts→reviews→approves chain.
**Prevent:** Before content drafting begins, establish who drafts, who reviews, who approves — **sequential, not parallel**, with a single decision-maker at the end of the chain.

---

## How to extend this library

After every launch (Day 7/30 lessons-learned step in the `web-launch` monitoring cadence), add any new failure mode here in the same shape: **What happened · Root cause · Prevent.** Keep specifics as illustrative examples; lead with the transferable principle. A gotcha that cost you a week is worth more than a generic best practice.
