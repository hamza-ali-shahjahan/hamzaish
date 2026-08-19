# Valuable — Live Status

**Stage**: build
**Status**: active
**Code**: `~/Claude/Valuation - Valuable`

## North star this sprint
> One app that values the UK, London, a public company and a startup from real data —
> with 10 years of history and the events that moved the numbers. Proof: our UK figure
> reconciles to the official £13.3tn ONS balance sheet.

## Active sessions (lock — update when you start/stop work)

| Session / branch | Scope (files/area owned) | Status | As of |
|---|---|---|---|
| main (foundations) | `docs/`, `engine/`, `data/uk.ts` | shipped | 2026-08-14 |

## Positioning (corrected 2026-08-15 by the operator)

**Valuable is a method and a platform for finding what a country, city, company or
startup is genuinely worth — and understanding what moves that number.**

The audit trail is the *credibility mechanism*, not the product. It earns the right to be
believed; it is never the headline. An earlier build led with "show your working", which
sold the proof rather than the thing being proved.

Live at **https://valuable-index.vercel.app**

## Slice log

### Slice 1a — First principles + engine foundations ✅ SHIPPED 2026-08-14

**Done means:** the valuation maths is written down, encoded, and provably correct
against the official UK number.

- `docs/00-FIRST-PRINCIPLES.md` — the Universal Value Identity plus the four entity
  types, with every formula sourced
- `docs/01-DATA-SPINE.md` — 10 verified free sources, licences, and the do-not-ship list
- `engine/` — core, country, company, startup modules
- `engine/invariants.test.ts` — **77 tests passing, 0 failing**, typecheck clean
- UK reconciles: 6.6 + 6.9 − 0.1998 = **£13.30tn** vs published **£13.31tn** ✅

### Slice 2a — Event corpus schema + UK 2016–2026 (THE MOAT) ✅ SHIPPED 2026-08-14

**Done means:** a weak causal claim is structurally incapable of masquerading as a
measured one.

- `docs/02-EVENT-CORPUS.md` — how causality is claimed without overclaiming
- `engine/events.ts` — evidence tiers as types, not labels. A narrative claim has **no
  estimate field**; `effectSize()` throws on one (INVARIANT 19)
- `data/uk-events.ts` — Brexit, the S&P downgrade, the mini-budget, the ONS release,
  plus the leadership series 2010→present
- 8 refuted figures encoded so they cannot creep back in
- **105 tests passing, 0 failing**, typecheck clean

**Key finding driving the design:** of 13 researched policy episodes, only 6 have a
genuine counterfactual. Singapore, Saudi Vision 2030, Rwanda and Ireland's 12.5% rate
have none — and Rwanda's outcome data is actively disputed (FT 2019: a consistent
deflator reverses the sign on poverty).

### Slice 3a — Verifiable computation (SPEC steps 1, 2, 5, 6) ✅ SHIPPED 2026-08-14

**Done means:** every published number recomputes to the same fingerprint, and anyone can
run one command to prove it.

- `SPEC.md` — the build brief; verifiability is the architecture, not a feature
- `engine/trace.ts` — `Traced<T>`; a bare number cannot reach a page because it won't
  compile. Three node kinds: observed / derived (recursive) / **assumption**
- `engine/valuations.ts` — the publishable layer. Pure maths stayed pure; the 105
  original tests were not touched
- `scripts/verify.ts` + `bun run verify` — recomputes every number, prints the full trail,
  exits 1 on drift. Wired into CI
- `.github/ISSUE_TEMPLATE/` — challenge + source templates, both requiring the trace hash
- **175 tests passing** (105 original untouched + 70 new), typecheck clean, verify green

**Proof:** 1,000 independent constructions of the UK figure produce **one** hash.
Determinism was the risk that could have invalidated the whole design; it's retired.

**The publication gate is doing real work:** per-capita is currently *withheld* because the
population figure is flagged unverified. Correct behaviour, not a bug — and it means the
first community contribution has an obvious front door.

### Slice 3b — Trace viewer + UK page (SPEC steps 3, 4) ✅ SHIPPED 2026-08-14

**Done means:** a reader can follow the UK trail on screen and click through to challenge
any step.

- `app/trace/[hash]/page.tsx` — the signature page, built *before* the pages linking to it
- `components/TraceTree.tsx` — recursive renderer; three visually distinct node kinds
- `app/country/uk/page.tsx` — four answers, r−g, withheld per-capita, event timeline with
  evidence tiers, leadership table
- `app/method/page.tsx` — the three refusals, how the fingerprint works, refuted figures
- `lib/registry.ts` — every trace addressable by hash, including nested ones

**Verified against the really-running app:** all 5 routes return 200; production build
generates 10 static pages including all 5 trace pages; 175 tests pass; typecheck clean;
`bun run verify` green.

**Design decisions that held up:** an assumption renders on an amber panel with a 3px
left border against a transparent observation row — confirmed distinct in the DOM, not
just intended. Comprehensive wealth expands inline to show net worth, which expands again
to the three ONS figures, each level linking to its own page.

### Slice 3c — Plain English everywhere ✅ SHIPPED 2026-08-15

**Done means:** someone with no finance background can read any page top to bottom, and
an expert loses nothing.

- Every formula, input, step and evidence claim now carries a plain-English twin that
  **leads**; the notation sits behind a "Written as a formula" disclosure
- Scientific notation gone — `£6.60tn + £6.90tn = £13.50tn`, not `6.6000e+12 + 6.9000e+12`
- Evidence tiers in plain words: "compared against a stand-in country", not
  "synthetic control"
- Every claim answers "so what?" — e.g. people are worth nearly twice all UK land and
  buildings combined
- **Readability is now tested, not just intended:** 6 tests enforce plain text on every
  calculation/input/step, ban internal jargon from reader-facing strings, ban scientific
  notation, and cap sentence length
- **Engine 0.2.0** — step labels and expressions removed from the hash. Rewriting
  arithmetic so a non-expert can follow it is presentation, not maths, and must never
  orphan a published link. Step *values* are still hashed.

**190 tests passing**, typecheck clean, verify green, all routes 200.

### Slice 4 — Scale to every country + go public ✅ SHIPPED 2026-08-15

**Done means:** every country the data supports is valued, verified and live on a public
site, with the peer-review loop actually functional.

- `ingest/worldbank.ts` — real pipeline, CC BY 4.0, cached and committed so builds are
  reproducible offline and a published fingerprint never depends on an API being up
- `engine/countries.ts` — **149 countries** on one World Bank convention
- `/countries` ranked index · `/country/[iso3]` per country · ~300 trace pages
- UK page now shows **both** conventions side by side — ONS £38.8tn vs World Bank
  $25.93tn for the same country — as the clearest possible demonstration of INVARIANT 10
- `LICENSE` (MIT, code only) + `DATA-LICENCES.md` — attribution plus the list of obvious
  sources we deliberately refuse and why
- **201 tests · 1,712 assertions · 303 calculations verified**

**Live:** https://valuable-rouge.vercel.app
**Repo:** https://github.com/hamza-ali-shahjahan/valuable (public)

**Two ingestion landmines caught by measurement, not documentation:**
1. CWON's "real chained 2019 US$" series is a **chained volume index — not additive**.
   Components overshot the total by ~0.2%. Switched to current US$, which reconciles.
2. `NW.NFA.TO` is **gross** foreign assets (UK +$17tn), not net. Net is total minus
   domestic (UK −$0.53tn, matching the ONS sign). Using gross would have inflated every
   country enormously.

### Slice 5 — Motion, only where it explains ✅ SHIPPED 2026-08-15

**Done means:** dragging the discount-rate dial visibly moves the answer, the maths behind
it is honest and labelled as an approximation, and the page still reads with motion off.

- `engine/sensitivity.ts` — pure, testable annuity model, pinned so it reproduces the
  published figure exactly at the published rate
- `components/SensitivityDial.tsx` — one draggable judgement, with jump points for both
  statistics offices so you can move between conventions and watch the gap open
- **£33.00tn ↔ £44.13tn** across the range on the UK figure — an £11tn swing from one
  number nobody measured
- Respects reduced-motion; the dial still works with animation off
- **217 tests**, 303 calculations verified, live

**Deliberately NOT animated:** counting numbers (a figure that spins up reads like a slot
machine, not a fact), fade-on-scroll, the trail assembling itself (the evidence should
already be there), the verified badge (it must be boring to be believed), page
transitions.

**Honesty note carried into the UI:** our simplified model gives 19% per percentage point
where ONS guidance implies 25–30%. Real career earnings are back-loaded and therefore more
rate-sensitive than a level stream. The component states the gap AND its direction — the
dial understates the point it is making — and a test pins the discrepancy so nobody
"fixes" it by tuning the model until the numbers agree.


### Slice 7 — Europe's cities ✅ SHIPPED 2026-08-15

**Done means:** every city's figures come from a named official source and add up, and
the coverage gap is stated as prominently as the numbers.

- `ingest/eurostat.ts` — 255 metropolitan regions, 29 countries, Commission Decision
  2011/833/EU (commercial reuse authorised)
- `engine/metros.ts` — values only the **capital share** of city output
- `/metros` index · `/metro/[code]` per city · all in the checkable trail
- **244 tests · 558 calculations verified · 968 pages**

**The mistake avoided:** capitalising all of city output gives ~23× a year — wrong by a
factor of three. Most of what a city produces is wages, which belong to people who can
move away. Only the immobile share is a claim on the city. Ours lands at **6.5×**,
mid-band of the defensible 4–8×.

**Three ingestion landmines, all found by measurement:**
1. The source dimension mixes metros with country totals — unfiltered, the largest
   "metro" in Europe is Germany.
2. **Capitals use the suffix MC, not M.** A filter on `M` alone silently drops Paris,
   Berlin, Madrid, Vienna, Warsaw, Prague, Stockholm and Amsterdam while still returning
   226 believable rows. Now asserted by a test.
3. The series is frozen — Eurostat stopped updating it in early 2024 and 2022 is
   fractionally populated. We use 2021 and say so.

**Two honesty flags carried into the UI:** London is absent because the UK left the EU
(a real gap on a site that began with a British question), and Dublin ranks 3rd because
Ireland's accounts are inflated by onshored intellectual property and aircraft leasing —
flagged on its page, and only its page.

### Slice 1b — Metro engine + ingestion — SUPERSEDED by Slice 7

**Done means:** London values end-to-end from ingested NUTS3 data, not hardcoded
constants.

### Slice 1c — The four pages + founder simulator UI — QUEUED

### Slice 2b — Extend the corpus beyond the UK — QUEUED

Priority by identification quality: Poland/Baltics accession, China WTO, Estonia's
distributed-profits tax, Greece.

### Slice 11 — Extend the event corpus beyond the UK — NEXT

The moat, and the one thing still UK-only. Priority by identification quality:
Poland/Baltics accession, China WTO, Estonia's distributed-profits tax, Greece.

All four entity types are now live, so the site answers "what is it worth". The event
layer is what answers "what moved it" — which is the second half of the positioning and
currently exists for one country out of 149.

## Open immediately

- Ingest is not built — `data/uk.ts` is verified constants, not a pipeline
- `UK_POPULATION` is flagged `needsVerification` — blocks publishing any per-capita figure
- Breakeven-revenue discrepancy vs Damodaran's published Nvidia figure is unresolved
  (ours £362.8bn, his $483.38bn from the same four stated inputs) — flagged in the test
  suite, deliberately not fitted away

## Validation ledger

**Status: debt-accepted.** Building before 5 target-user conversations, deliberately.
Reason: the artefact *is* the validation instrument — a country page that reconciles to
the official number is the thing you show a founder or an economist to find out whether
they care. The operator is also a target user for the founder simulator. Revisit before
any paid tier.

## Strategy (from competitive research, 2026-08-14)

Four wedges, ranked by role rather than by revenue:

| Wedge | Role | Underserved | Buildable free | WTP |
|---|---|---|---|---|
| Live country valuation index | **Megaphone** | High | High | ~zero |
| **Event-annotated history** | **MOAT** | **Very high** | High | Low-med |
| Metro valuation sold to metros | **Revenue** | Medium (Dealroom partly occupies) | Low | **Highest, proven** |
| Founder DD simulator | **Cash flow** | Medium | Medium | High per-user |

**The strategic error to avoid:** leading with the founder simulator, where we compete
head-on with Equidam giving the same number away free, using a country product as
decoration.

**Timing:** the Musk exchange was 12 Aug 2026 — two days before this was scoped.

### Slice 8 — Front page, sources page, repositioning ✅ SHIPPED 2026-08-15

**Done means:** a stranger can start from nothing, and every source is listed with its
licence.

- **New address:** valuable-index.vercel.app (free Vercel subdomain — nothing purchased)
- Nav is now Countries · Cities · Sources · Method. United Kingdom removed — it was one
  country among 149 and made the whole site look UK-centric.
- Tagline "show your working" → "what it's worth, and what moves it"
- `components/PlaceSearch.tsx` — one box over all **404 places**, the front door for
  someone who arrives wanting to look something up
- Home organised around the four things we value: Countries (149) and Cities (255) live;
  Companies and Startups shown honestly as engine-built but unpublished
- `engine/findings.ts` — 5 findings **computed** from our own figures, so they can't
  drift out of line with the pages they link to
- `engine/sources.ts` + `/sources` — generated from actual usage, not hand-written, so it
  can't rot. Shows what each source feeds, its licence, and what we **refuse** and why.
- **257 tests · 969 pages**

**On "latest numbers":** we don't have any and said so. Country wealth is 2020, cities
2021 — a freshness ticker would have been the first dishonest thing on the site. Findings
replace it: not news, but things our data says that a reader wouldn't expect.

### Slice 9 — The founder tool ✅ SHIPPED 2026-08-15

**Done means:** a founder enters their own numbers and gets a range plus a ranked list of
what to fix first.

- `/simulate` — eight numbers, four stages, nothing stored or sent anywhere
- `founderValuation()` returns a **Range**; there is no code path to a single figure
- **Exit revenue is derived, not asked for** — projected with growth *decaying* at 65% a
  year. Assuming flat growth is the commonest way a founder model produces a fantasy.
- Failure odds shown openly as a named assumption (pre-seed 75% → Series B 35%) rather
  than buried in a scary discount rate
- All six assumptions listed with why each matters
- Levers ranked: broken first, then by valuation impact, each with a concrete action
- **271 tests · 970 pages**

**Verified in a browser:** switching stage moves the bar — pre-seed 0 gaps and "this
pattern raises", Series B 5 gaps and "gets passed on". The range rises with stage because
survival odds improve, which is correct.

**Three refusals on the page, stated plainly:** no single number, no top-down market size,
and no flattery — growth is assumed to slow because it always does.

### Slice 9b — Usability fixes from the operator ✅ SHIPPED 2026-08-15

- **Country picker sorted A–Z.** It was ranked by wealth, so India sat at position 8 and
  Pakistan at 43 among 149 rows — present but unfindable. Nothing was missing from the
  data; a correct list in the wrong order simply reads as broken.
- **Front page de-anglicised.** Two of five findings led with Britain, the search
  suggestions ended with United Kingdom, the footer named two British bodies. Now zero
  findings lead with Britain and one mentions it at all, framed as the method lesson.
- New findings, all computed: India 8th by total and 114th per person · Iraq 72% under
  the ground · Singapore 79% people vs Lao PDR 74% rock
- **278 tests** — including that the picker is alphabetical and that findings span four
  or more continents

**None of this was caught by 271 passing tests.** Tests prove the numbers are right; they
say nothing about whether the thing is usable or whose story it tells.

### Slice 10 — Companies ✅ SHIPPED 2026-08-16

**Done means:** a reader can look up a real, named company and see — from its own filed
accounts — what it earns on the money invested in it, what that money costs, and
therefore whether it is creating or destroying value; plus what a share price they type
in would require the business to deliver. Every figure traces to a filing.

The last of the four entity types. `engine/company.ts` has the cash-flow model, the
consistency checks and breakeven revenue; none of it is published.

**The two constraints turned out to be the design:**
1. Forbes/Fortune rankings are copyright — so we built **our own ranking, on value
   created**, which nobody publishes and which is far more interesting than another list
   of big companies.
2. Market data may never be stored (`docs/01-DATA-SPINE.md` §7) — so the reader supplies
   the price and we invert it. That is a better page than showing a market cap would have
   been: it turns a fact to read into a question to answer.

- `ingest/sec.ts` — 250 US public companies from SEC EDGAR XBRL frames, public domain
  under 17 U.S.C. §105
- `engine/companies.ts` — return on capital against its cost, straight out of the
  Universal Value Identity. No forecast anywhere: filed figures plus exactly two marked
  judgements (cost of capital, long-run growth capped at the risk-free rate)
- Value is a **range** — no-growth floor to today's-returns ceiling, typically 2–4×
  apart. The width is the honest part
- `/companies` · `/company/[cik]` · `components/PriceCheck.tsx`
- **303 tests · 1,754 computations verified · 2,413 pages**

**The finding that justifies the whole method: 91 of 246 destroy value.** Most are
profitable. Intel, Boeing, Walgreens, Warner Bros. Discovery and PG&E all appear.

**Four ingestion landmines, every one found by measurement:**
1. **There is no single revenue tag.** Four are needed, and tag choice correlates with
   sector — reading one loses whole industries, not a random sample.
2. **Flows key on `CY2024`, balances on `CY2024Q4I`.** Asking for `Assets` at `CY2024`
   returns an empty set, not an error. Easy to read as a dead concept.
3. **72 of 250 companies do not close on 31 December.** Joining a September income
   statement to a December balance sheet would have produced plausible nonsense.
4. **The SEC edge 403s any User-Agent containing a URL** — including the exact
   `(+https://github.com/…)` convention the World Bank ingest uses. `SEC_CONTACT` is read
   from the environment and never committed.

**Three refusals held:** negative book capital is declined rather than given a nonsense
return (McKesson, Marriott, Booking, Wayfair); a loss-making company gets no valuation at
all rather than a recovery forecast; banks and insurers are absent because they need
return on tangible equity, not this.

**A guard that earned its place immediately.** The ingest fails loudly if Walmart, Amazon,
Apple, Alphabet or Microsoft are missing from the top 250. It fired on the first run —
Amazon uses a different pre-tax income tag and had been dropped silently, leaving a
ranking that was wrong in a way that still looked completely plausible.
