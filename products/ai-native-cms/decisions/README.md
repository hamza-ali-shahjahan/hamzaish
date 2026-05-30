# Decisions log — AI Native CMS

Append-only. Each non-trivial product decision gets a date-prefixed entry: **what was decided · why · what would prove it wrong · revisit trigger.**

## Index

The full architecture / stack ADRs (Apache-2.0 vs MIT, pnpm vs npm, WXR-first vs REST-first, Pass 3/4 reordering, "stop at Pass 6 for v1") live in the source repo at `~/Claude/AI Native CMS/docs/decisions.md`. Five entries as of 2026-05-30.

Factory-level decisions (about *the product as a product*, not the codebase) live in this folder as `YYYY-MM-DD-slug.md` files.

## 2026-05-30 — Validation phase before further build

**Context**: Six build passes shipped end-to-end without a single conversation with a WordPress refugee. v0.6.1 was the result of a real-world test against canonical theme test data; that test surfaced bugs synthetic fixtures missed. The Hamzaish factory's #1 discipline rule was violated ("Don't build before you validate. 5 conversations with target-profile users before production code.").

**Decision**: Stop further build work. Enter a validation sprint with explicit exit criteria (5 real WP migrations done for real refugees, ≥3 unprompted price signals, screencast recorded, war-story draft written for dev.to). Only after the sprint's exit criteria are met does v0.7 polish or any HN launch happen.

**Why**:
- The v0.7 punch list (HTML sanitization, --permalink, non-Latin slugs, verify --build) has 4 items and I don't know which one matters most. Real users will tell me; my guess is just guess.
- The HN launch is one-shot. Without a war story ("I migrated 5 sites this month"), it's a coin flip. With one, the post writes itself.
- The Hamzaish factory was designed for *focused parallelism* — currently 8 products in MVP simultaneously. AI Native CMS sitting in "validation" rather than "another MVP I'm half-building" matches the discipline.

**What would prove it wrong**:
- Zero responses to the r/selfhosted post within a week (= no demand → reconsider the wedge framing or audience)
- All 5 responders pay $0 unprompted, even after migration succeeds (= pricing thesis wrong, no managed service)
- 5/5 migrations succeed perfectly with current 0.6.1 (= v0.7 polish was wasted thinking; ship as-is and chase distribution harder)

**Revisit trigger**: At end of validation sprint OR if a single conversation reveals a fundamental wedge-misframing (e.g., "WP refugees don't actually want Astro; they want WordPress + AI editing on top of WP").

## 2026-05-30 — Stay OSS-CLI-first; defer hosted service until traction

**Context**: Research report (in `<code>/docs/research-report.md`) recommended OSS CLI → distribution → paid managed migration ($249-499). We have OSS; we don't yet have distribution.

**Decision**: Don't build the hosted dashboard. Don't put up a "Hire me $249" Stripe Payment Link yet. Just the OSS CLI + validation conversations until there are 100+ GitHub stars or 10+ unsolicited paid expressions of interest.

**Why**:
- Building paid surface before distribution = paying for ads to acquire customers for a tool nobody's heard of (the report explicitly warns against this).
- First 5 paid customers can be served manually with Stripe Payment Link + me running the CLI on their WXR. No dashboard needed.
- The hosted dashboard is the kind of thing that *eats your year*. Don't start it before it earns its keep.

**What would prove it wrong**: Validation sprint surfaces 3+ refugees saying "I want to pay you to do this for me right now; what's the link?" → set up the Stripe Payment Link the same day, defer dashboard, take the money manually.

**Revisit trigger**: First paid customer OR sustained inbound interest (5+ requests in a week).
