# Valuable — Learnings

## 2026-08-14 — Foundations

### Worked

**Encoding invariants as executable tests, not documentation.** 18 rules earned from
specific error modes became 77 tests. Three of them (`INVARIANT 10`, `12`, `18`) are
functions whose entire job is to *throw* — `addListedEquityToNetWorth()` exists only to
refuse. A rule that can only be violated by deleting a test is a much stronger rule than
one in a style guide.

**Making the type system carry a domain rule.** Startup and country valuations return a
`Range`, never a `number`. "Don't publish false precision" stops being a convention
someone forgets and becomes a compile error.

**Research agents with an explicit verification contract.** Asking for confidence
markers (`[V]` verified / `[R]` recalled / `[UNVERIFIED]`) produced findings that could be
acted on differentially. One agent's honest *"I could not verify AI-native competitors —
treat 'no competitor' as unproven, not established"* was more valuable than a confident
guess would have been.

### Pitfalls, and the fix

**Published worked examples contain rounding errors. Don't fit to them.**
Three tests failed against numbers from a source article; the engine was right and the
article had rounded ($5M × 1.3^8 = $40.79M, not the stated $43M). A fourth — Damodaran's
Nvidia breakeven revenue — we genuinely could not reproduce from his four stated inputs
($362.8bn vs a published $483.38bn).
**Fix:** assert internal consistency (round-trip the formula) and record the discrepancy
in the test name. Never quietly tune a coefficient until an external number appears.
*Encoded as a test that asserts the gap exists.*

**A wrong benchmark propagates further than a wrong formula.** The widely-circulated burn
multiple scale ("Amazing <1x, Great 1–1.5x") is *not* Sacks' SaaS scale — those bounds
belong to Craft's marketplace adaptation, which also uses a different denominator
(gross-profit growth, not net new ARR). A founder using the wrong one misreads 1.5x as
"Suspect" instead of "Good."
**Fix:** benchmarks are stored with their denominator and their source, and the API takes
a business-model argument. *Encoded: `BURN_MULTIPLE_SCALE` in `engine/startup.ts`.*

**HTTP 200 does not mean the file exists.** BEA's `MAGDP2.zip` returns status 200 with a
26 KB HTML 404 page. An ingest checking status codes alone would store a 404 page as
metro GDP.
**Fix (generalises to every ingestion job): check `Content-Type`, never the status code
alone.**

**Indicator codes go stale silently.** World Bank's governance codes (`GE.EST`, `RL.EST`)
still appear in the registry but return "indicator not found" — the live ones need a
`GOV_WGI_` prefix and `source=3`. The IMF's entire old API host no longer resolves in
DNS, breaking every library pinned to it.
**Fix:** ingestion asserts non-empty payloads per indicator, not just HTTP success.

## 2026-08-14 — Verifiable computation

### Worked

**Prove the risky assumption before building on it.** The whole verifiability design rested
on "the same inputs always produce the same fingerprint." Floats are the obvious threat, so
that got built and tested first — 1,000 runs, one hash — before a single line of the engine
was migrated. Cost about twenty minutes; would have cost days if discovered at step 5.

**Migrate by composing, not rewriting.** Rather than rewrite `country.ts` to carry trails,
the pure maths stayed exactly as it was and a new layer composed it with provenance. All
105 existing tests passed untouched, and the pure functions remain independently testable.
*Adding a layer beat editing a layer.* The rule that made this work: "no test may be edited
during the migration" — it forced the composing approach.

**Rounding to 15 significant figures absorbs float noise without losing anything real.**
IEEE-754 needs ~17 digits to round-trip, so 15 discards last-bit differences from
equivalent-but-reordered operations while preserving precision far beyond anything a
valuation could justify. `0.1 + 0.2` and `0.3` hash identically; £13.31tn and
£13.310000001tn do not.

### Pitfalls, and the fix

**Running the thing found a bug the tests didn't.** `bun run verify` rendered a 3.8%
interest rate as "£0" — the formatter assumed everything was money. The tests all passed
because none of them rendered anything.
**Root cause, which was deeper than the formatter:** a traced value didn't carry its unit.
A number without its unit isn't merely badly displayed, it's ambiguous. Fixed by putting
`unit` on the trace itself *and in the hashed identity*, since a unit change is a semantic
change. **Always run the user-facing command, not just the test suite.**

**The typechecker caught a test that was asserting something the types already guaranteed.**
`leaves()` returns a type that excludes derived nodes, so `expect(n.kind !== "derived")` was
dead weight. Good signal: when the compiler says an assertion is impossible, the assertion
belongs in the type system, not the test.

## 2026-08-14 — The trace viewer

### Pitfalls, and the fix

**Two CSS bugs that only a browser could find.** The tests were green and the build was
clean when both shipped:

1. *Label and source ran together* — "Produced assets**ONS National Balance Sheet**" —
   because `.node-sub` was a `<span>` with a `margin-top` and no `display: block`. Margin
   does nothing on an inline element.
2. *Nested markers took the wrong colour.* `.node-derived .node-mark` is a **descendant**
   selector, and a derived node literally contains its children's markers — so every
   nested observation was repainted with the parent's blue. Fixed with direct-child
   selectors (`.node-observed > .node-mark`), with a comment recording why.

**Generalises:** a recursive component makes descendant selectors dangerous by
construction, because "inside" and "is" stop being the same thing. Reach for `>` in any
tree renderer.

**When the screenshot tool fights you, assert on the DOM instead.** The browser pane's
viewport desynced from the screenshot and kept returning mostly-blank images. Rather than
keep retrying, `getComputedStyle` confirmed the thing that actually mattered —
assumption background `rgb(42,32,19)` vs transparent for observations, a 3px amber left
border, the challenge link present, 311 characters of rationale rendered. **That is
stronger evidence than eyeballing a picture**, and it took one call instead of five.

### Worked

**Building the viewer before the pages that link to it.** Both CSS bugs were in the
recursive renderer. Had the country page been built first, the same two bugs would have
been found later and in more places.

## 2026-08-15 — Making it readable

### The problem, stated properly

The product promises "anyone can check these numbers." The first build shipped
`NW = K_produced + K_non-produced + NFW`, `r − g = 30bp`, `6.6000e+12 + 6.9000e+12` and
"synthetic control". **If only an economist can read it, the promise is a lie** — not a
polish issue, a credibility issue.

### The UX decision that mattered

Not a simple/expert toggle. A toggle fails both readers: hiding the maths undercuts
"show your working", and a simple mode makes plain English second-class. Instead:
**plain English became the primary layer with the technical detail underneath it —
always present, never first.** Nothing was removed. The formula sits behind a "Written
as a formula" disclosure; the plain sentence is what you read.

### Worked

**Deciding what NOT to hash.** Plain descriptions are deliberately excluded from the
fingerprint, so wording can keep improving without orphaning published links. Then a
404 during testing revealed the same argument applied one level further: rewriting
`6.6000e+12 + 6.9000e+12` as `£6.60tn + £6.90tn` had changed the hash, because step
*expressions* were hashed. But that is presentation, not arithmetic. Narrowed hashing to
step **values** only and bumped the engine version — which is exactly what the version
field is for. **The line to hold: the computation is pinned, the explanation is free.**

**Making readability a tested guarantee.** Six new tests: every calculation, input and
step must carry plain text; no internal jargon (`INVARIANT`, `§`, `CWON`, `K_`, `.md`)
may appear in reader-facing strings; no scientific notation anywhere; sentences under 45
words; and a proof that rewording does not change a fingerprint while changing a value
does. Style guidance rots — a failing test does not.

**An analogy did more than a paragraph.** "Four answers" only clicked once the page said:
*it is the same as asking what a company is worth — its buildings? its share price? what
its staff will produce?* One sentence replaced an explanation nobody would have read.

### Pitfall

**Six tests failed because they asserted on exact wording of warnings.** Rewriting them
to assert *substance* ("mentions house prices", "mentions £50 billion") rather than
phrasing makes them survive the next rewrite too. One failure was genuine, though: the
test wanted "twice" and the prose said "a third time" — the prose was convoluted, so the
fix went into the writing, not the assertion. **When a readability test fails, check
whether the text is actually worse before loosening the test.**

## 2026-08-15 — Scaling to 149 countries

### Worked

**Verify the API before building on it.** Four exploratory calls before a line of
ingestion code, and they found two errors that would otherwise have shipped silently:
a chained volume index being summed as if additive, and a *gross* foreign-assets series
being used where *net* was needed (the UK figure would have been +$17tn instead of
−$0.53tn). Neither was in the documentation. Both were obvious the moment the components
were checked against the published total.

**A reconciliation check inside the ingest, not after it.** The script refuses to write a
snapshot if implied nonrenewable capital comes out negative for more than 5% of
countries. A pipeline that fails loudly at ingest beats one that produces plausible
nonsense downstream.

**Computed meaning beats templated meaning.** Each country's "so what" sentence is derived
from its own ratios, so Nigeria reads *"natural resources are 37% of the total — high
enough that this country's wealth moves with commodity prices"* while Japan doesn't. One
code path, 149 genuinely different sentences.

**Scaling made an invariant tangible.** The UK now has two legitimate figures — ONS
£38.8tn and World Bank $25.93tn — and the page shows both side by side with an explicit
"never add these together". The rule stopped being an abstract guard and became the most
instructive thing on the site.

### Pitfalls, and the fix

**`new URL(...).pathname` percent-encodes spaces.** The ingest reported success and wrote
nothing, because the project lives in a folder called "Valuation - Valuable" and the
output path silently became `Valuation%20-%20Valuable`. **Use `fileURLToPath`, always.**
The tell was a success message with no file — trust the filesystem, not the log line.

**Filter on what you actually need, not on a proxy for it.** `valuableCountries()`
filtered on total and domestic wealth existing, but a valuation also needs produced
capital — and one country reports the totals without it. The filter now calls the
valuation and checks it builds. **If a predicate is "can I do X", the honest
implementation is to try X.**

## 2026-08-15 — Motion that earns its place

### The test worth reusing

**Not "would this look nice" but "does the motion do something the words can't?"** On a
product whose credibility is its seriousness, most animation actively costs you. A number
that counts up reads like a slot machine rather than a fact. A verified badge that
animates feels like theatre. A trail that assembles itself makes people wait for the
evidence they came for.

By that test almost everything failed — and the list of what NOT to animate turned out to
be the more valuable half of the answer.

### Worked

**One interaction, chosen because it IS the argument.** The product's central honesty
claim was a sentence nobody feels: "shift this rate by a percentage point and the answer
moves ~25%." Made draggable, it becomes the most persuasive thing on the site — you watch
£38.80tn slide to £33.00tn by moving a number nobody measured. Motion here *increases*
honesty rather than polish; every competitor hides this sensitivity and we dramatise it.

**Putting jump points on the two conventions.** The dial has marks at 3.5% (UK statistics
office) and 4% (World Bank), so a reader can move between the two published methods and
watch the gap open. That converts an abstract invariant into a thing you do with your
thumb.

**The interactive maths is still maths, so it got the same treatment.** Pure function,
own test file, pinned so the baseline reproduces the published figure exactly. An
interactive widget that recomputes a published number is not exempt from the rules that
govern the number.

### Pitfall, and the fix

**The model disagreed with the published sensitivity — and the fix was to say so.** A
level 40-year annuity gives 19% per percentage point; ONS guidance implies 25–30%. The
tempting move is to tune the horizon until they match. That is fitting to a published
answer, which this product explicitly refuses.
**Fix:** state the gap in the UI *and its direction* — real career earnings are
back-loaded, so the true sensitivity is larger and our dial understates its own point —
then pin the discrepancy with a test, so a future "improvement" that tunes it away fails
loudly instead of silently.

## 2026-08-15 — The composition bar

### Worked

**Deriving the examples from the data instead of hardcoding them.** The "try these"
buttons compute the most resource-heavy, most people-heavy and most capital-heavy
countries from the figures themselves, filtered to economies above a size floor so one
mine in a tiny country doesn't top the chart. They came out as Lao PDR, Singapore and
Japan — genuinely striking, and they stay correct if the underlying data is ever revised.
**A hardcoded example is a fact that quietly rots.**

**Animating only the thing being compared.** The bar transitions on country change and
never on load, and the country pages get a static version because there is nothing to
compare against there. Same component, no motion where motion has no job.

**A picture of a number needs the same honesty as the number.** Tests assert that all 149
countries' shares sum to exactly 100% and that no share is ever negative. A stacked bar
that doesn't add up is a lie told in a nice colour.

### Pitfall, and the fix

**Net foreign assets can be negative, which breaks a stacked bar.** Most countries owe
the world more than they own abroad. Including it would mean rendering a negative slice —
meaningless — or silently clamping it, which hides a real liability.
**Fix:** the bar shows DOMESTIC composition only, normalised to 100%, and net foreign
assets are stated in words underneath with their sign. The constraint improved the
design: "what the country holds inside its borders" is a cleaner idea than "everything,
sort of".

**Check before fixing.** A grep for an exact heading on the deployed page came back empty
and looked like a broken deploy. It wasn't — React's server rendering splits
`What {name} is made of` across text nodes. Two minutes of checking avoided "fixing"
something that was already correct.

## 2026-08-15 — Europe's cities

### Pitfall, and the fix

**A filter that is wrong can still look completely right.** Eurostat metro codes are
`DE003M` for a city and `DE001MC` for a capital. Filtering on `\d{3}M` returned 226 rows
of real cities with real GDP — Milano, München, Barcelona — and silently dropped **every
capital in Europe**. Paris, Berlin, Madrid, Vienna, Warsaw, Prague, Stockholm, Amsterdam:
all gone, and nothing looked broken.

It was caught by asking "where is Paris?" rather than by anything failing.
**Fix:** an explicit assertion that named capitals are present, plus a hard failure in
the ingest if fewer than 15 capitals survive. **When a filter produces plausible output,
check for what should be there and isn't — absence never announces itself.**

### Worked

**Refusing the obvious formula.** Treating city output like company revenue and
capitalising it gives ~23× a year — a number that would have looked authoritative and
been wrong by a factor of three. Most of city output is wages, which belong to people who
can move away and take them along. Only the immobile share is a claim on the city itself.
**The first-principles document earned its keep here**: the correct approach was written
down before there was any data to misuse.

**Letting a data quirk become an editorial moment.** Dublin ranks third in Europe, above
Berlin and Milano, on a population less than half Berlin's — because Ireland's accounts
are inflated by onshored intellectual property and aircraft leasing. Rather than
quietly excluding it or letting it mislead, its page carries a warning that no other
metro gets. **A distortion you explain is more valuable than one you remove.**

**Stating the gap as prominently as the figures.** "Cities of Europe" is a much smaller
claim than "cities", and the missing list — London gone with Brexit, and no official
city economics at all across India, most of Africa, South-East Asia and Latin America —
is on the index page rather than buried in a footnote.

## 2026-08-15 — The founder tool

### Worked

**Deriving the inputs a user cannot honestly supply.** A founder asked for "revenue at
exit" will either guess or extrapolate today's growth forever. Projecting it from their
current numbers with growth decaying at 65% a year is both less work for them and much
harder to fool themselves with — the decayed eight-year projection comes out more than
twenty times below naive compounding. **Ask for what someone knows; derive what they
would only guess.**

**Making the ranked levers the product and the valuation the setup.** Any spreadsheet
produces a number. What a founder cannot get anywhere is an honest ordering of which
single thing to fix first. Putting "What to fix first" above "What that's worth" was the
right call — and it is the positioning the operator corrected us toward.

**Surfacing failure odds instead of hiding them in a rate.** Standard practice buries
survival risk inside a 30%+ discount rate, which double-counts and obscures. Showing
"odds this doesn't work: 62%" as a named assumption is both more correct and more useful
— a founder can argue with it.

### Pitfall

**Reading the DOM before React re-renders looks exactly like a broken feature.** A
programmatic click followed by an immediate read returned identical values for every
stage, which read as "the stage buttons do nothing". Adding a short wait showed it had
been working the whole time. **When an interaction appears inert under automation,
suspect the harness before the code.**

## 2026-08-15 — Three things only a user would catch

### The pattern across all three

None of these were found by 271 passing tests. All three came from the operator looking
at the live site. **Tests prove the numbers are right; they say nothing about whether the
thing is usable or whose story it tells.**

### "India and Pakistan are missing"

They weren't. Both were valued, both had pages, both were in the dropdown — sorted by
wealth, so India sat at position 8 and Pakistan at 43 among 149 unlabelled rows. In a
list that long, unsorted is indistinguishable from absent.

**The lesson: a correct list in the wrong order reads as a broken list.** Ranked order is
right for a ranking and wrong for a picker; they are different controls with different
jobs. Now sorted A–Z, with a test asserting the sort actually reorders — so nobody
"simplifies" it back to the engine's default.

### "Too many UK-related items"

Two of five front-page findings led with Britain, the search suggestions ended with
United Kingdom, and the footer named two British bodies out of four sources — on a site
covering 149 countries. Every individual choice was defensible; the aggregate said this
was a British site.

**Nobody notices their own centre of gravity.** The UK had the richest data because it
was built first, and richest data quietly became most-featured. Now zero findings lead
with Britain, one mentions it at all, and it is framed as the method lesson — *most
countries never get a second opinion* — rather than as the subject.

Replaced with genuinely global findings, all computed: India is 8th wealthiest and 114th
per person; Iraq is 72% what's under the ground; Singapore 79% people against Lao PDR 74%
rock.

### Encoded so it cannot drift back

Tests now assert that no finding leads with Britain, at most one mentions it, findings
span four or more continents, and the picker is genuinely alphabetical. **Editorial
balance is a property worth testing, not just intending.**

### Transferable beyond this product

**Ask "whose claim is this?" before valuing anything.** "How much is the UK worth" has
four defensible answers spanning an order of magnitude (£2.7tn listed equity → £13.3tn
balance sheet → £38.8tn comprehensive wealth → ~zero sovereign fiscal capacity).
Averaging them is a category error. Any metric that can be computed several ways needs
the *question* named on the page, not just the number.

**Check whether a headline number is actually defensible IP.** Journalists reproduced the
UK's £13.31tn within hours of Musk's question, from a free government bulletin. If the
obvious product is "here is the number," the product is a two-day news cycle. The
defensible layer was the one thing nobody sells — *what moved it, and who moved it.*

**Sensitivity analysis can invalidate a product, not just annotate it.** Human capital
moves ~1:1 with the discount rate and is 60% of global wealth; natural capital doubles
when the rate goes 4% → 2%. Every one of those swings is larger than the year-on-year
change a tracker would report. That finding forced a design change (three numbers with
bands, never one headline), not a footnote.

**Licence review belongs in architecture, not legal review.** Every retail market-data
API forbids redistribution, which makes market data a *live call*, not a table. Forbes
Global 2000 is compilation copyright, so we build our own ranking. OSM's ODbL
share-alike could force the derived database open, so we use Kontur and GHS-UCDB. Each
of these changed the design.

---

## Slice 10 — Companies (2026-08-16)

### A constraint is a design brief in disguise

Two rules looked like limitations and both produced a better product than the
unconstrained version would have been.

**We may not store market data**, so we cannot show a company's market value. Inverting
it instead — the reader types the price, we compute what the business must deliver to
deserve it — turns a fact to read into a question to answer. Nobody stops to think about
a market cap printed on a page. Everybody engages with "that price needs revenue to grow
26% a year for five years."

**Forbes and Fortune own their rankings** (compilation copyright), so we cannot reproduce
a list of big companies. Ranking on *value created* instead — which required no
permission, because it is computed from filings that belong to the public — produced the
only interesting list on the site. Another size ranking would have been the hundredth.

**The pattern: when a constraint blocks the obvious version, the workaround is often the
differentiated version.** Check that before treating the block as a loss.

### A completeness guard beats a correctness test

The ingest hard-fails if Walmart, Amazon, Apple, Alphabet or Microsoft are missing from
the top 250. It fired on the very first run: Amazon uses a different XBRL tag for pre-tax
income and had been dropped silently, leaving 249 correct companies and a ranking that
was **wrong in a way that looked entirely plausible**.

No arithmetic test would have caught it. Every figure present was right. **When a
pipeline filters, assert the presence of things you know must survive it** — the failure
mode of a filter is not a wrong answer, it is a shorter list nobody counts.

This is the same lesson as the Eurostat metro filter that silently dropped every capital
in Europe while returning 226 believable rows. Twice now. It is a rule, not a coincidence.

### Refusing to answer is a feature that has to be built deliberately

Three refusals ship on the company pages, and each one required code that returns null
where a number would have been easier:

- **Negative book capital** (McKesson, Marriott, Booking, Wayfair — years of buybacks)
  makes every return ratio meaningless rather than merely imprecise. We exclude and
  explain, rather than print 400%.
- **A loss-making company gets no valuation at all.** Valuing one honestly means
  forecasting when it stops losing money, and a forecast is an opinion.
- **An implausible effective tax rate** falls back to the marginal rate *and says so on
  the page*, rather than silently substituting.

**The test that protects this asserts the refusal, not the answer** — that the excluded
set is non-empty, and that each exclusion has a real cause.

### Transferable beyond this product

**A "no forecast" rule is achievable more often than people assume.** The steady-state
identity `V = IC × (ROIC − g)/(WACC − g)` values a company from filed accounts plus two
marked judgements — no revenue projection at all. Most of the apparent need for forecasts
is a need to *look* thorough. Where a forecast is genuinely unavoidable, that is a good
signal the answer should be a range.

**Sort order carries an argument.** Ranking by revenue asserts that size is what matters;
ranking by value created asserts something else entirely, from the same data. Choosing
the sort is an editorial act, and it is worth being explicit about which claim you are
making.
