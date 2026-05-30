# AI Native CMS — Live Status

**Last updated**: 2026-05-30
**Stage**: MVP (CLI shipped)
**Sprint**: Validation — 5 WP-refugee conversations before further build

## North star this sprint

> Run the migration personally on 5 real WordPress sites for real refugees. Collect the punch list of what actually breaks vs what synthetic tests caught. Get at least 3 unprompted price signals ("I'd have paid $X for this"). Use the war stories as the HN launch ammunition.

**Definition of done for this sprint:**
- [ ] 5 real WP sites migrated (free, in exchange for honest feedback)
- [ ] Each migration produces a deployed Astro project (Cloudflare Pages / Vercel)
- [ ] Punch list of issues sorted by frequency-across-the-5 — not by my synthetic guess
- [ ] 3+ "I'd have paid $X" signals collected (the real price discovery)
- [ ] One 60-90s screencast recorded (local Docker WP → migration → live Astro site)
- [ ] dev.to long-form draft "I migrated 5 WordPress sites to Astro this month" written

## What's done (factory-side)

- [x] OSS CLI shipped to npm: `wp-to-astro@0.6.1` (54 kB tarball, 78 files, Apache-2.0)
- [x] Public GitHub repo: `github.com/hamza-ali-shahjahan/wp-to-astro-cli` (10 commits, v0.6.1 tagged, GitHub Release published)
- [x] 6 build passes complete: WXR → IR → Astro spine; +5 blocks + pages; image pipeline; REST adapter; SEO postmeta + yoast_head_json; redirects + verify subcommand
- [x] 138 tests across 25 files, all green
- [x] Real-world smoke test against canonical WordPress Theme Unit Test Data (58 posts + 21 pages migrated; 44/57 render cleanly in Astro)
- [x] Real-world smoke test against Docker-hosted live WordPress via REST (57 posts + 22 pages, same 44/57 render rate, slug schema bug found + patched as 0.6.1)
- [x] CHANGELOG documents the v0.7 known-issues punch list
- [x] Strategic frame documented in `docs/research-report.md` (the original Build & Launch plan)

## Open immediately (this week)

| # | Action | Owner | Cost |
|---|---|---|---|
| 1 | Record 90s screencast from the still-running Docker WP / Astro dev demo (Hamza filming, factory supplying script) | Hamza | 30 min |
| 2 | Post in r/selfhosted: "Built OSS CLI to migrate WP→Astro. Looking for 5 sites to test on — free in exchange for feedback." | Hamza | 15 min draft + monitor replies |
| 3 | Same post tweaked for r/SideProject | Hamza | 5 min |
| 4 | DM 3 publicly identifiable WP-refugee Xs from the last 30 days | Hamza | 20 min |
| 5 | For each respondent: run migration, deploy, collect feedback + price signal | factory | ~2h per site |

## Activation / retention / false-positive shape

**Activation** (single-shot for a CLI tool):
- User installs `wp-to-astro` from npm (or runs via `npx`)
- Runs against their real WP site (WXR file or live URL with App Password)
- Migration completes with exit 0
- Resulting `pnpm dev` in the output dir serves their content correctly
- Activation rate goal in validation phase: 5/5 = 100% (1 manual cleanup per site is acceptable; "I gave up and went back to WP" is not)

**Retention** (CLI is one-shot, so retention is downstream):
- Migrated user deploys the Astro project (proxy: domain DNS points to the new build within 30 days)
- Migrated user makes at least one content edit in the migrated repo (via Claude Code, Cursor, or any editor) within 30 days — proves the "vibe-code your way out" thesis
- Tracked manually in the validation phase via followup messages, not telemetry

**False-positive shapes to watch for:**
- GitHub stars from people who never ran the CLI (vanity)
- HN upvotes from people who like the *idea* but don't have a WP site (vanity)
- "I'll definitely try this" responses that never convert to an actual migration (the worst signal)
- Migrations that "succeeded" technically but the user manually rewrites the content because the MDX wasn't usable (= 13/57 broken posts pattern at real-world scale)

If any of these three are the dominant signal pattern, it means the wedge isn't drawing real WP refugees and the strategy needs adjustment — not more polish.

## What's NOT done (deferred, intentional)

- v0.7 polish (HTML sanitization for MDX, `--permalink` flag, non-Latin slug fallback, `verify --build`) — waiting on real-user signal to know which fix matters most
- Hosted managed-migration service ($249 one-time per the research report) — only after OSS traction
- AI rewrite layer (Claude/GPT pass for legacy formatting cleanup, alt-text generation) — Pass 7+ in original roadmap, deferred
- Premium adapters (ACF Pro, Elementor, Divi) — out of v1 scope
- WooCommerce, Multilingual (WPML/Polylang) — out of v1 scope

## Discipline check (Hamzaish rules)

- [x] **Persistent context** — `<code>/CLAUDE.md`, `<code>/docs/spec-pass-*.md`, `<code>/docs/decisions.md`, `<code>/docs/research-report.md` all present
- [x] **Scope** — every pass had a locked spec; v0.7 deferred items are listed in CHANGELOG
- [ ] **Validate before building** — VIOLATED in passes 1-6 (built without WP-refugee conversations). Sprint is the catch-up.
- [x] **Measurement framework before launch** — north-star + activation + retention + false-positive shape defined above. Will be re-checked before any HN post.
- [x] **Security review** — code-review skill ran on all 6 passes; SSRF + WXR XXE + auth handling + path traversal addressed. v0.6.1 final post-publish review found the slug bug; documented.

## Today's recommended action

Record the screencast (item #1 above). Cheapest first artifact; gives Hamza the visual asset every subsequent conversation needs. Then post #2.
