# AI Native CMS — Scope

What this product does AND what it deliberately doesn't. The "doesn't" list is load-bearing — it's the moat against feature-creep and the reason the build stayed shippable.

## What it does

- Migrates WordPress sites to clean Astro + MDX project directories that the user can git-init, host anywhere, and edit with any tool
- Reads from two input modes:
  - **WXR XML file** (the universal WordPress export — works offline, no auth)
  - **Live WP site via REST API** (requires Application Password — fetches `content.raw` Gutenberg markup, Yoast head_json, settings)
- Maps these Gutenberg blocks faithfully: `core/paragraph`, `core/heading` (h2-h6), `core/list` (modern flat), `core/quote`, `core/code`, `core/separator`, `core/image`
- Preserves WordPress pages alongside posts (`src/content/pages/<slug>.mdx`)
- Downloads images, converts PNG/JPG to WebP via sharp, writes to `src/assets/images/`, rewrites MDX references
- Extracts Yoast SEO metadata (both WXR postmeta and REST `yoast_head_json`) into MDX frontmatter
- Generates 301 redirect maps in two formats: `_redirects` (Netlify) and `vercel.json` (Vercel)
- Initializes the output dir as a git repo with one clean commit
- Provides a `verify` subcommand for structural sanity check on the migrated output
- Is itself open-source (Apache-2.0) so anyone can run it locally with zero trust required

## What it deliberately doesn't do

- **Recreate the WordPress theme.** The honest promise is content fidelity, not design fidelity. Users bring (or commission, or vibe-code) the design. Themes are PHP + theme-specific block variants + custom CSS — a tarpit.
- **Migrate every Gutenberg block.** ~80% of real content is the 7 we map. The long tail (gallery, cover, columns, embeds, table, buttons, plugin blocks) lands in v0.7+ — for now it's preserved as raw HTML with a TODO marker so nothing is silently lost.
- **Handle WooCommerce, BuddyPress, bbPress, ACF Pro, Elementor templates, Divi.** Document explicitly as "not migratable; use Shopify for commerce, or keep WP for those features."
- **Multilingual sites** (WPML, Polylang). Out of v1.
- **Dynamic features without a static equivalent.** Forms become stubs pointing at Formspree/Web3Forms/Resend with TODOs. Comments become read-only static export (suggest Giscus for new comments). Search is replaced with Pagefind at build time.
- **Visual design recreation.** Tied to "won't migrate the theme."
- **Host the output.** Don't try to be a hosting service. Output is yours; deploy to Cloudflare Pages / Vercel / Netlify / S3 / wherever.
- **AI-rewrite the content during migration.** The migration is faithful by default. AI-driven cleanup is a separate, optional Pass 7+ feature with explicit user opt-in.
- **Be free for managed migrations forever.** OSS CLI is free; the managed service (run the migration on your real site, fix what breaks, deliver as a PR) will be priced at $249-499 per the research-report pricing study. Currently in pre-validation phase — no Stripe link yet.

## What's deferred (will do, just not yet)

| Bucket | Items | Trigger to start |
|---|---|---|
| **v0.7 polish** | HTML sanitization for MDX (br, comments, stray <), `--permalink` CLI flag for WXR redirects, non-Latin slug fallback, `verify --build` deeper validation | When the 5-WP-refugee sprint surfaces which one matters most |
| **v0.8+ blocks** | `core/gallery`, `core/cover`, `core/columns`, `core/group`, `core/embed` (YouTube/Twitter/Vimeo), `core/table`, `core/buttons` | Driven by real-user content needs |
| **REST extensions** | RankMath SEO parsing, ACF Pro fields, custom post types, SSRF allowlist for image fetcher | Pass 4 set the groundwork; extension is incremental |
| **Hosted managed service** | Landing page, Stripe Payment Link, manual migration workflow for first ~5 customers | After $0.6.1 lands with 100+ stars or 10 paid expressions of interest |
| **AI editing layer** | Built-in `wp-to-astro ai-rewrite <flag>` command using Claude API to clean legacy formatting / generate alt text / harmonize heading hierarchies | After managed-service revenue hits ~$5k/month and the AI-CMS thesis is funded |

## The moat

The thing that's hardest to copy isn't the migration code — it's:

1. The **architecture** (source-adapter → versioned Zod IR → emitter) which means future sources (Webflow, Ghost) and future emitters (Next.js, Hugo) are additive, not rewrites
2. The **opinionated output format** (Astro content collections with deterministic frontmatter) which makes the output AI-agent-editable by construction
3. The **operations + warranty around the paid service** — competitors who go OSS-only can't promise "we'll do it for you in 24 hours or refund"

This is the wedge. The AI-native CMS is the wedge-handle.
