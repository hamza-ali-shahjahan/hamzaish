# 2026-06-06 — SEO + AEO foundation as a day-one ship, not a launch-week scramble

**Setting:** Hamzaish landing page launched today. SEO and AEO (Answer Engine Optimization — being citable by ChatGPT/Claude/Perplexity/AI Overviews) got treated as a pre-launch foundation, not post-launch optimization. Codified the pattern as a reusable skill so every future product inherits it.

## The reusable insight

**SEO and AEO are different games, but they share a foundation — and that foundation costs nothing to ship on day one.** Shipping it after launch means leaving a month of organic discoverability on the table while you chase the obvious distribution channels (HN, PH, Twitter).

The split:
- **SEO** = be ranked. Solved by title/description hygiene, JSON-LD, robots, sitemap, semantic HTML, heading hierarchy.
- **AEO** = be cited. Solved by `llms.txt`, explicit AI-bot allows in robots, `FAQPage` schema, `SoftwareApplication` schema (for tools), clean machine-readable prose.

The overlap is the JSON-LD graph. Six interlinked schemas — `Person → Organization → WebSite → WebPage → SoftwareApplication → FAQPage` — and you've satisfied both engines simultaneously.

## What was missing across the existing playbooks

`factory/playbooks/launch-stage/seo-content-strategy.md` covered **content strategy** (keywords, topic clusters, cornerstone articles). It did NOT cover **technical foundation** — the markup and discovery layer that lets the content get found in the first place. Two different concerns, both belong to launch-stage.

Added `seo-aeo-foundation.md` for the technical foundation; the content-strategy file stays unchanged for the content layer.

## The new artifacts

| Path | What |
|---|---|
| `factory/playbooks/launch-stage/seo-aeo-foundation.md` | 8-piece foundation, validation gate, anti-patterns |
| `factory/skills/seo-aeo-bootstrap/SKILL.md` | Executable scaffolder — `/seo-aeo-bootstrap <slug>` |
| `factory/skills/seo-aeo-bootstrap/templates/head.html.tmpl` | Full `<head>` block w/ JSON-LD graph and `{{vars}}` |
| `factory/skills/seo-aeo-bootstrap/templates/llms.txt.tmpl` | Markdown summary template for LLMs |
| `factory/skills/seo-aeo-bootstrap/templates/robots.txt.tmpl` | Allowlist for GPTBot/ClaudeBot/PerplexityBot/etc. |
| `factory/skills/seo-aeo-bootstrap/templates/sitemap.xml.tmpl` | Minimal sitemap referencing `/llms.txt` |

## Anti-patterns I'd hit if I weren't paying attention

1. **AI-generated FAQ answers** — Google's helpful-content system penalizes obviously-AI FAQs. The skill **prompts the founder to write the 6 answers manually** rather than auto-generating them.
2. **Slogan-as-title** — "Stop researching. Start building." is a poster line; it doesn't rank. The keyword-honest title goes in `<title>`; the slogan goes in the H1. Different jobs.
3. **Stuffing the JSON-LD with empty fields** — schemas with empty `aggregateRating` etc. fail Google's rich-results test. The skill omits anything we don't have real data for.
4. **Forgetting `<link rel="alternate" type="text/markdown" href="/llms.txt">`** — LLM crawlers won't discover the file without it. Easy to drop, easy to verify with view-source.

## Validation gate (6 checks, all must pass before launch)

1. `search.google.com/test/rich-results` → all schemas valid
2. `<domain>/llms.txt` → returns markdown
3. `<domain>/robots.txt` → lists AI bots
4. View source → exactly one `<h1>`, title ≤60ch, desc ≤160ch
5. `curl -A "GPTBot" <domain>` → 200 (not blocked)
6. Open Graph debugger + LinkedIn Post Inspector → preview correct

## When this applies

**Every product, every launch.** Foundation-tier — no debate, no override. The keyword-research + content-cluster layer comes LATER (different skill, different stage).

The skill is idempotent: running `/seo-aeo-bootstrap` on a product that already has the foundation just updates the `{{vars}}` and re-validates. Use it freely when product config changes (name, value-prop, founder bio, FAQ wording).

## Source

Shipped to hamzaish.com on 2026-06-06 (commit `c75a668`). Verified by the 6-check validation gate before sundown.
