---
name: pseo-at-scale
description: Quality and indexation discipline for programmatic / templated SEO at scale — sites with hundreds to tens of thousands of generated pages (directories, /tool, /compare, /category, location or entity pages). Use when planning, launching, or auditing a large templated page set: preventing mass thin-content, designing sitemap-index architecture, locking slug discipline, staging the indexation ramp, and deciding what to index vs noindex. The risk at scale is not one bad page — it's 15,000 mediocre ones dragging the whole domain down. Companion to web-launch and launch-gotchas.
---

# pseo-at-scale

> Programmatic SEO is a force multiplier in both directions. One good template × 15,000
> rows is a moat; one mediocre template × 15,000 rows is a sitewide quality penalty. The
> launch checklist warns about thin content lightly — at your scale it's the **main event.**
> This skill is the quality gate the volume demands.

## When you activate

- Planning or launching a templated page set at scale (directory, `/tool`, `/compare`, `/category`, `/function`, location/entity pages, glossaries).
- Auditing why a large templated site isn't indexing or ranking.
- Deciding the index/noindex policy for generated pages.

## The core risk: aggregate thin-content

Search engines judge templated sets in aggregate. A page that's *technically unique* (different row of data) can still be *substantively thin* (same boilerplate, little added value). At scale, a high ratio of thin pages signals "low-quality site" and suppresses even the good pages. **Your job is to make every generated page clear a value bar — or never let it get indexed.**

### Thin-content gates (enforce at generation time, not after)

1. **Minimum substance per page.** Define a floor: unique words beyond boilerplate, a minimum number of populated data fields, at least one element no other page in the set has. A row that can't meet the floor doesn't get a published page.
2. **Boilerplate ratio cap.** If >~60–70% of a page's rendered text is identical template chrome shared across the set, it's thin regardless of word count. Vary intros, pull in row-specific facts, generate row-specific FAQs.
3. **Uniqueness check across the set.** Programmatically diff pages — near-duplicate detection on rendered (not template) HTML. Clusters of near-identical pages either merge or get value added.
4. **Empty-state policy.** A `/compare/a-vs-b` with no real comparison data, or a category with 1 item, is thin. Decide up front: suppress, noindex, or redirect to the parent — don't publish-and-index a hollow shell.
5. **Index-worthiness gate.** Not every generated page deserves indexing. Pages below the value floor should be `noindex,follow` (crawlable for link equity, not indexed) until they earn their way in. **Indexing is a privilege a page earns, not a default.**

## Sitemap-index architecture at scale

A single flat sitemap breaks down past ~a few thousand URLs. Use a **sitemap index → leaf `urlset`s**, split by content type:

```
/sitemap.xml                 (index — points ONLY to leaf urlset files)
  ├─ /page-sitemap.xml       (static pages)
  ├─ /tool-sitemap.xml       (one urlset, ≤50k URLs / ≤50MB each)
  ├─ /compare-sitemap.xml
  ├─ /category-sitemap.xml
  └─ /blog-sitemap.xml
```

Hard rules (each maps to a launch-gotcha):
- **Index points to leaf `urlset`s, never to another index.** Nested indexes get rejected. (*Sitemap-nested-index-errors*.)
- **Every `<loc>` is non-empty and resolves to a 200.** Validate at generation; reject publishing a row with an empty slug. (*Empty-loc-from-missing-slugs*.)
- **Split leaves by type and keep each ≤50,000 URLs / ≤50MB.** Per-type leaves also let you watch indexation *by template* in the console.
- **Only include indexable URLs.** A `noindex` page in the sitemap sends mixed signals — keep gated pages out of the sitemap until they pass the value floor.

## Slug discipline

At scale, slugs are generated, so the rule must be enforced in code:
- lowercase, kebab-case, no IDs, descriptive, stable.
- **Stable forever** — a slug that changes after indexing creates a redirect + lost equity per page, times N. Lock the slug-generation function before launch.
- Reject empty/duplicate slugs at publish time. Collisions in a generated set are silent and common.
- Pick the trailing-slash policy once and bake it into the generator AND every internal href the template emits — not just the redirect rule. (*Trailing-slash-internal-hrefs*.)

## Indexation ramp — expectations at scale

New or young domains ration crawl budget; a large page set indexes on a **6–12 week ramp**, not at launch. (*Indexation-patience-curve*.)
- Track **indexation rate by template type** (per-type sitemaps make this possible), and track the **trajectory**, not the launch-week absolute.
- Rough mental model for a young domain: ~30–40% indexed early, ~50–70% by ~6 weeks — adjust to the site's authority. A low week-1 number that's on-curve is not an emergency.
- **Help the crawler:** keep every important page ≤3 clicks from home via hub/category pages; submit per-type sitemaps; ensure internal linking surfaces deep pages (templated related-content slots). Orphan pages in a 15k set will simply never index.
- **Phase the rollout if the set is huge.** Releasing 15k pages at once on a young domain can overwhelm crawl budget and dilute quality signal. Consider launching the highest-value slice first, proving indexation + ranking, then expanding.

## Internal linking for generated sets

Templated pages create orphans by default. The template must emit intentional links:
- Each generated page links **up** (to its category/hub) and **across** (to related rows — same category, comparison counterparts).
- Hub/category pages link **down** to their members.
- Avoid linking every page to every page (link-equity noise); link by genuine relatedness.

## Audit checklist for an existing pSEO set

1. Indexation rate by template type (console Pages report + per-type sitemaps).
2. Near-duplicate clusters (crawl + content-similarity).
3. Pages below the value floor that are currently `index` (should be `noindex` until improved).
4. Orphans (>3 clicks from home, or zero internal inbound links).
5. Empty `<loc>` / empty-slug rows in sitemaps.
6. Thin empty-states (categories/comparisons with no real data) that are indexed.
7. Crawl-budget waste: redirect-hop internal hrefs, 404/410 ghosts, parameter explosions.

## Routing

For the SEO mechanics underneath (schema, internal-linking execution, on-page checks), delegate to `searchfit-seo:*` when installed. This skill owns the **at-scale quality + indexation policy**; the specialist skills own the per-page craft. Always run a pSEO launch under the `web-launch` spine and its sign-off gate.
