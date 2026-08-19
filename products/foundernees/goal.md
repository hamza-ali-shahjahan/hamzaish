# Foundernees — Goals

> Forged on 2026-08-16 (day 3 of Year One). `/goal` *pursues* a goal; this *is* the goal.
> Two layers: the **Year One scoreboard** (the movement) and the **v1 site goal** (what gets built now).

---

## Layer 0 — The clock, stated plainly

Year One runs **14 Aug 2026 → 14 Aug 2027**. Today is **16 Aug 2026**.
**Day 3 of 365. 362 days left. Nothing is live yet.**

That is the frame every number below sits inside. A national clock only works if
someone is watching it — so the countdown ships on the site, publicly.

---

## Layer 1 — The Year One scoreboard (five numbers)

Set on 14 Aug 2026. Answered for on 14 Aug 2027.
**Operator-confirmed 2026-08-16: 100K is the shipping number, exactly as written in the brief.**

| # | Number | Target | Counted as |
|---|---|---|---|
| 1 | **People reached** | 10,000,000 | Unique humans who see Foundernees — site visitors + partner-channel impressions, deduped where measurable |
| 2 | **Builders who ship a first thing** | 100,000 | A working artifact with a URL another person can open. Not a certificate. Not a completed lesson. |
| 3 | **Foundernees who complete the programme** | 10,000 | Finished Stage Three — assessed on what they built |
| 4 | **Founderships granted** | 1,000 | Tool-and-credit grants actually disbursed, not announced |
| 5 | **Companies still alive at 14 Aug 2027** | 200 | Still operating. Revenue not required — a pulse is. |

**The operating number underneath the scoreboard:** **1,000,000 builders onboarded** —
signed up *and* finished a first session with the tools. It is the input; #2 is the output.

### The funnel this implies — a decimal cascade

**10,000,000 → 1,000,000 → 100,000 → 10,000 → 1,000 → 200.**

A clean 10% at every step, and 20% survival on the last. It is easy to say and easy to
publish — which is exactly why each step has to be defended rather than assumed:

| Step | Rate | The bet |
|---|---|---|
| Reached → onboarded | 10% | Strong for cold traffic; normal for partner-referred traffic. Achievable **only** if most reach is partner-referred, not social. |
| Onboarded → ships a first thing | 10% | Roughly 2–3× typical free-programme completion. This is what Stage One and Stage Two exist to earn. |
| Ships → completes the programme | 10% | Stage Three is deliberately narrow. |
| Completes → Foundership | 10% | Selection, not attrition. |
| Foundership → alive at 14 Aug | 20% | Most grants land late in the year with little runway before the clock stops. |

### The consequence you are accepting — distribution is the critical path

Ten million reached in Pakistan in 362 days is a national-broadcast number. It has
precedent — DigiSkills.pk cleared millions of enrolments — but every one of those
precedents ran on **state or telco distribution**, not on organic growth.

So the honest statement of this plan: **the product is not the risk. The signature is.**
Foundernees can build a perfect site and a perfect Stage One and still miss #1 by an
order of magnitude if no national channel opens.

That makes partnerships a **tracked workstream with its own gate**, not a marketing
afterthought:

- **P1 — Partner pipeline exists.** ≥20 named institutional targets (telcos, HEC, Ignite,
  NAVTTC, university networks, broadcasters, large employers of blue-collar workers)
  with a named contact and a status. **Due: 14 Sep 2026.**
- **P2 — First signature.** ≥1 partner with committed distribution to ≥500,000 people.
  **Due: 14 Nov 2026 (the quarter mark).**
- **P3 — Reach on pace.** ≥2,500,000 reached by 14 Feb 2027, or the scoreboard is
  formally revised in public rather than quietly missed.

**If P2 misses, that is the moment to revise #1 openly** — not on 13 Aug 2027. A clock
anyone can watch only works if you move the hands honestly.

### What this changes in the v1 site — one addition

The confirmed targets make partner capture urgent from day one. Rather than the separate
partner page that was scoped out, the signup form carries a **role** field —
*builder · volunteer · partner/institution* — so the partner pipeline starts filling from
the first visitor at effectively zero build cost. Partners route to a different
confirmation email and a flagged list. Page count stays at five.

**Decision status:** CONFIRMED by the operator, 2026-08-16. See `decisions/0001-year-one-scoreboard.md`.

---

## Layer 2 — The v1 marketing site (what gets built now)

### Capability statement

A person in Pakistan — including someone who has never built anything, reading on a
cheap Android over patchy mobile data — lands on **foundernees.com**, understands what
Foundernees is and what it will ask of them, and signs up as a builder in under 90
seconds. Every signup is captured, visible, and attributable to a source.

### The exact metrics

**M1 — Reachability on a real Pakistani phone.**
Measured on a throttled mid-tier Android profile (slow 4G, 4× CPU throttle):
- Largest Contentful Paint **< 2.5s**
- Initial transfer **< 400 KB** (all pages)
- Lighthouse mobile Performance **≥ 90**, Accessibility **≥ 95**
- *Robustness guard:* a page that scores well by being empty fails M2 and M3 — the
  three metrics have to pass together, so gaming one breaks another.

**M2 — Comprehension for a first-time reader.**
- Core pages read at **Flesch-Kincaid grade ≤ 8** (the "office-boy" bar — if a
  17-year-old in Lyari can't read it, it doesn't ship)
- Every page states a next action in one verb
- *Robustness guard:* the manifesto page keeps its voice — grade-8 means short sentences
  and plain words, not a stripped-out mission. Em dashes stay.

**M3 — Capture integrity (zero silent drops).**
- 100% of submitted signups land in the database
- 100% receive a confirmation email
- 100% carry a source attribution (`utm_source` or referrer, `direct` when neither)
- *Robustness guard:* verified by 20 seeded end-to-end submissions producing exactly
  20 rows, 20 sends, 20 attributions — not by the form "looking like it worked."

**M4 — Conversion.**
Visitor → completed signup **≥ 8%**, measured over the first 1,000 real unique visitors.

### Evals (numeric targets)

- **E1:** `https://foundernees.com` returns 200 over HTTPS with a valid certificate.
- **E2:** M1 passes on the throttled mobile profile — all four numbers.
- **E3:** M2 passes — grade ≤ 8 on home, manifesto, and the four stages page.
- **E4:** M3 passes — 20 seeded submissions → 20 rows, 20 emails, 20 attributions, 0 errors.
- **E5:** Automated tests green: unit + an end-to-end run that fills and submits the real form.
- **E6:** The Year One countdown on the page shows the correct days remaining to 14 Aug 2027.
- **E7:** The role field works end to end — a `partner` signup lands flagged and receives
  the partner confirmation email, not the builder one.

### Acceptance rule

**E1–E7 all pass on a fresh run against the deployed site**, not against localhost.

### The first real number after launch

**5,000 verified signups within 30 days of going live**, of which **≥25 are
partner/institution role signups** (the P1 pipeline, seeded by the site itself).

Put in context so it cannot flatter anyone: 1,000,000 onboarded in 362 days is an average
of **~2,760 signups per day**. Five thousand in month one is roughly **6% of the pace
required** — acceptable as a ramp, alarming as a plateau. The number that matters is not
month one's total; it is whether month two is a multiple of it.

Missing it is not a failure of the site. It is the signal that distribution, not the
product, is the bottleneck — and that the next month's effort belongs in partnerships,
which is exactly what P1–P3 above exist to catch early.

### Non-goals (v1 site)

Login · dashboards · courses · lesson content · payments · a community forum · an admin
panel beyond a read-only signup list · Stage Three/Four application flows · anything that
belongs to the platform rather than the pitch.

The site's only job is: **explain the mission, and capture the builder.** Everything else
is the platform — and the platform is the next build, not this one.

### Feasibility verdict

**Reachable.** No unsolved technical problem — a static-first marketing site with one
form and one table. The two real risks are both non-technical:

1. **Distribution.** Building the site is days. Reaching 1.5M Pakistanis is the year.
   The site cannot fix this; it can only be ready and measurable when traffic arrives.
2. **The accessibility promise is easy to say and hard to keep.** "Built for office boys"
   dies quietly the moment the site assumes English fluency, a fast phone, and a laptop.
   M1 and M2 exist specifically to make that promise falsifiable rather than decorative.
   **Urdu is the open question** — see the decision record; English-only v1 with the
   copy written for translation is the recommended start, not the end.

**Ceiling note:** conversion rate (M4) is capped by traffic *quality*, not by the page.
A page cannot convert an audience that never arrives, and cold social traffic converts
several times worse than a partner referral. M4 is therefore reported *with* its source
mix, never as a bare number.
