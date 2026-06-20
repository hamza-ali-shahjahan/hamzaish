# SEO + AEO Foundation — what every Hamzaish product ships with on day one

Source-of-truth playbook for getting a product **rankable on Google/Bing/Yandex** AND **citable by ChatGPT/Claude/Perplexity** before launch. Codifies what we shipped on hamzaish.com on 2026-06-06.

The acronyms, in one line each:
- **SEO** — be ranked on search engines (Google, Bing, Yandex).
- **AEO** — be cited by answer engines / LLMs (ChatGPT, Claude, Perplexity, Google AI Overviews). Different game; overlapping signals.

> **Principle:** Every product gets the foundation on day 1. Real keyword + content work happens later (see `keyword-research` skill). Foundation is *plumbing*, not strategy.

---

## The eight foundation pieces (every product, every time)

### 1. `<title>` and `<meta name="description">` — keyword-honest, human-readable

- **Title:** `<Product> — <One-line value prop with the keyword>` (≤ 60 chars). Not a slogan. Slogans don't rank.
  - ❌ "Stop researching. Start building." (this is a poster, not a title)
  - ✅ "Hamzaish — Build and launch your idea with AI"
- **Description:** plain-language summary of what the product does + who it's for (140–160 chars). No "World-class AI-powered…" filler.

### 2. Open Graph + Twitter Card

- `og:title`, `og:description`, `og:url` (canonical), `og:image` (1200×630), `og:image:alt`
- `twitter:card=summary_large_image` + the same title/desc/image
- The OG image **carries the same headline as the page** so the social preview matches what someone clicks into.

### 3. JSON-LD graph (the AEO heavy-lifter)

This is the single highest-leverage AEO move. Schemas to include, interlinked via `@id`:

| Schema | Why |
|---|---|
| `Person` (the founder) | LLMs cite people. Get your name + LinkedIn + GitHub into the graph. |
| `Organization` | The product entity. Has `founder` → `Person`, `logo`, `image`, `sameAs`. |
| `WebSite` | The site. Has `publisher` → `Organization`, `inLanguage`. |
| `WebPage` | This page. Has `about` → `Organization`, `author` → `Person`, `primaryImageOfPage`. |
| `SoftwareApplication` (if a tool) | LLMs answer "what is X?" by citing this. Include `applicationCategory`, `codeRepository`, `license`, `offers`. |
| `FAQPage` | **The biggest AEO unlock.** LLM answers to "What is X?", "Who is X for?", "How does X work?" pull from here directly. 5–7 questions. |

Use a **single `<script type="application/ld+json">`** with `@graph: [...]` — easier to maintain, parses as one document. Validate with `https://search.google.com/test/rich-results`.

### 4. `/llms.txt` — the AEO standard

Markdown file at site root. Standard proposed by Jeremy Howard (answer.ai). Format:

```markdown
# <Product Name>

> One-line tagline.

2–3 paragraphs of plain prose describing what it is, who it's for, when launched.

## Key facts
- bullet list

## Pages
- `[/](url): description`

## Common questions
**Q:** ...
**A:** ...
```

LLMs that find `/llms.txt` prefer it over re-parsing the HTML. Add `<link rel="alternate" type="text/markdown" href="/llms.txt">` in `<head>` for discovery.

### 5. `robots.txt` — explicitly allow AI crawlers

By default, AI crawlers are allowed by `User-agent: *` — but **explicit beats implicit**. List them out:

```
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Meta-ExternalAgent
Allow: /
```

Why explicit: some enterprise tooling defaults to blocking; explicit allows survive bot-blocker layers (Cloudflare, etc.) more reliably.

### 6. `sitemap.xml`

Minimum: one URL for the homepage. Reference `/llms.txt` so crawlers find it. Update `<lastmod>` on big content changes.

### 7. Canonical, language, robots meta

```html
<link rel="canonical" href="https://product.com/" />
<meta name="robots" content="index, follow" />
<meta name="author" content="Founder Name" />
```

`html lang="en"` (or your locale). Set `og:locale` too.

### 8. Heading hierarchy + semantic HTML

- **One `<h1>`** per page. The H1 is your strongest on-page signal.
- `<h2>` for each section/fold. `<h3>` for sub-sections.
- Use `<section>`, `<article>`, `<header>`, `<footer>`, `<nav>` — not all divs.
- LLMs use the H tag tree to understand structure.

---

## What we deliberately DON'T do at foundation

- ❌ Keyword stuffing or hidden text (penalized by Google, ignored by LLMs)
- ❌ AI-generated boilerplate "About" prose (LLMs detect it and de-rank citations)
- ❌ Paid backlink schemes (poison the domain)
- ❌ FAQ entries that don't match real visitor questions (Google flags this)
- ❌ Cloaking content for crawlers vs humans
- ❌ Bloated structured data with empty fields

## What comes AFTER foundation (later stages)

- **Validation/MVP:** keyword research → content topics (`/keyword-research`)
- **Launch:** publish 1–2 cornerstone articles before launch day
- **Sell:** capture early-customer language; reuse exact phrases in headings
- **Scale:** link-building, comparison pages, programmatic content

---

## The test before shipping

Run this checklist:

- [ ] Visit `https://search.google.com/test/rich-results` with your URL → all schemas pass
- [ ] Visit `https://yourproduct.com/llms.txt` → returns markdown
- [ ] Visit `https://yourproduct.com/robots.txt` → lists AI bots
- [ ] View source → exactly one `<h1>`, ≤60 char title, ≤160 char description
- [ ] `curl -A "GPTBot" https://yourproduct.com/` → returns 200 (not blocked)
- [ ] Open Graph debugger (https://developers.facebook.com/tools/debug/) → image, title, description all correct
- [ ] LinkedIn post inspector → same

If all six pass, the foundation is shipped.

---

## Source

This playbook codifies the SEO+AEO upgrade shipped to hamzaish.com on 2026-06-06 (commit `c75a668`). Reusable via `/seo-aeo-bootstrap` skill, which scaffolds these eight pieces into any product.
