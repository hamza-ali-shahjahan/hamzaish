---
name: web-launch
description: Run a website launch as a verification-gated process, not a to-do list. Use when taking a site (or a major site section) to production — scoping a launch, building or walking a launch checklist, deciding if a site is ready to ship, or setting up post-launch monitoring. Emits a per-project tracking workbook, enforces a refuse-to-launch sign-off gate (every P0/P1 must be Verified, not just Done), and routes commodity SEO/security/performance work to specialist skills. Pairs with launch-gotchas and pseo-at-scale.
---

# web-launch

> **The one rule that makes this work: Done ≠ Verified.**
> An item is `Done` when someone finished the work. It is `Verified` only when its
> objective check passed independently. A redirect can be "working" while the
> canonical tag is still wrong; a tag can be "installed" while it's missing on the
> blog. Never close an item on a claim — close it on a check. (See the
> *Done-without-verification* gotcha.)

## When you activate

- Taking a website or major section to production.
- Someone asks "is this ready to launch?" / "what's left before we ship?"
- Building, stamping, or walking a launch checklist for a project.
- Setting up the post-launch monitoring cadence.

## Core model — carry this through every phase

**Priority (P0–P4).** P0 Blocker = launch cannot proceed until Verified. P1 Critical = must be Verified before launch; deferrable only with a written reason + owner + revisit date. P2 Major = should be done by launch, may slip to week 1. P3 Minor / P4 Nice = post-launch backlog.

**Status.** `Open → In Progress → Done → Verified`, plus `Blocked`, `Deferred` (with reason + revisit trigger), `N/A`. **Done is not closed. Only Verified is closed.**

**Every item carries its own check.** The "How to verify" column is the contract — a `curl` test, a tool threshold, a score. If you can't state the check, the item isn't ready to track.

## Process

**Phase 0 — Scope + stamp.** Identify the project, stack, hosting, CDN, CMS, launch date, and **site profile** (`app` / `content-site` / `hybrid`). Copy `templates/launch-workbook.md` into the launching project as `launch-checklist.md` and fill in Project Info. **Use the Site-profile table to pre-mark N/A blocks** so an app launch isn't bloated with content-site rows (and a hybrid gets its both-surfaces analytics audit). Don't leave skipped items ambiguous — mark them. **Read `launch-gotchas` now** — before work starts, not after something breaks.

> **Where to stamp it:** in a standalone repo → the repo root. **Inside Hamzaish** → `products/<slug>/launch/launch-checklist.md` (the product's code repo stays separate and may not be path-wired locally). Log a one-line entry in `products/<slug>/decisions/`.

**Phase 1 — Walk the 14 phases.** Strategic Foundation → Technical Architecture → Information Architecture → Design & UX → Content → SEO Foundation → Performance & CWV → Analytics & Tracking → Security & Privacy → Accessibility → QA & Testing → Pre-Launch Verification → Launch Day → Post-Launch. Assign an owner to every live item. **Delegate commodity work** (see routing below) instead of re-deriving it.

**Phase 2 — The Sign-Off Gate.** Before launch, walk the 24-item gate in the workbook. **Every P0/P1 must be `Verified`.** If any is not, the verdict is **DO NOT LAUNCH** — name the failing items. This is the launch equivalent of a blocking verdict: a refuse-to-ship condition, not a suggestion. A P1 may be consciously deferred only with a written reason, an owner, and a revisit date recorded in the gate.

**Phase 3 — Launch Day.** Walk Phase 13 live. DNS cutover, re-verify HTTPS + canonical redirect post-DNS, smoke-test journeys, confirm analytics survived, war room open, rollback reviewed.

**Phase 4 — Monitoring cadence.** Run the Day 1 / 3 / 7 / 14 / 30 checks. New-domain indexation is a 6–12 week ramp, not a launch-day number — track trajectory, not the absolute (see *Indexation-patience-curve*). Day 7/30: start the lessons-learned doc and **feed new failure modes back into `launch-gotchas`.**

## Routing — delegate, don't re-implement

This skill owns the **process, the gate, and the lessons.** For commodity crafts, delegate to specialist skills when installed; fall back to the workbook's own verification steps when they're not.

| Work | Delegate to (if installed) |
|---|---|
| SEO audit, technical SEO, on-page, broken links | `searchfit-seo:seo-audit`, `searchfit-seo:technical-seo`, `searchfit-seo:on-page-seo`, `searchfit-seo:broken-links` |
| Structured data / schema | `searchfit-seo:schema-markup`, `searchfit-seo:generate-schema` |
| Internal linking, keyword clustering | `searchfit-seo:internal-linking`, `searchfit-seo:keyword-clustering` |
| AEO / AI visibility (llms.txt, AI-bot, LLM referrals, sameAs/Wikidata) | `searchfit-seo:ai-visibility` |
| Security baseline (headers, secrets, deps) | `security-review` |
| pSEO at scale (15K+ templated pages, thin-content gates, sitemap-index, indexation ramp) | `pseo-at-scale` *(this plugin)* |
| Failure-mode library | `launch-gotchas` *(this plugin)* |

Within Hamzaish specifically, `/security-check <slug>` and `seo-aeo-bootstrap` may also be available — use them when present, but never assume they are (this plugin must run standalone in any product repo).

## Verification discipline (the non-negotiables)

- **Cross-verify audit tools.** A JS-rendering site can show false-positive "missing H1 / thin content" in a crawler that doesn't execute JS. Confirm with `curl`-rendered HTML **and** browser DevTools before escalating. (*Audit-tool-blind-spots*.)
- **Rich Results Test ≠ schema validation.** RRT only checks what Google currently renders. Validate against schema.org + a JSON parse. Never ship empty schema fields. (*Schema-validation-gap*.)
- **One fix is rarely the whole fix.** Canonicalization can need redirect rule + canonical tag + internal href + sitemap entry, all four. Verify each before closing. (*Done-without-verification*.)
- **Live Test overrides cache.** When GSC shows an issue you believe is fixed, run URL Inspection → Test Live URL — it's real-time. (*Stale-GSC-data*.)
- **Audit every stack.** On hybrid sites, verify tags/analytics fire on *every* template type via `curl` + `grep`, not just the main app. (*Hybrid-stack-analytics-gaps*.)

## Output

When walking a launch, end each pass with: the workbook updated in place, a count of Verified vs Done vs Open by priority, the **gate verdict** (LAUNCH / DO NOT LAUNCH + failing items), and the single most important thing to do next. Give options on judgment calls; the operator makes the call to ship.

## Templates

`templates/launch-workbook.md` — the full master checklist (14 phases, 181 items), Definitions, the 24-item Sign-Off Gate, and the monitoring cadence. Copy per project; update Status in place.

## Provenance

Distilled from a battle-tested launch workbook. Stack examples (Cloudflare / Yoast / Next.js / Semrush) are illustrative common-stack examples behind stated principles, so each survives a stack swap.
