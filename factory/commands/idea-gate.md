---
description: The gate an idea must pass before it earns a validation attempt — six items that make it TESTABLE, not "good". Fills products/<slug>/validation/idea-gate.md and is checked by `bun run check-idea-gate <slug>`.
---

# The Ideation Gate

**What this gate decides: is this idea *testable*?** Not "is it good" — you cannot know that yet, and finding out is what the validation attempt is for. What you *can* know, before spending three weeks of reach, is whether a null result will mean anything.

An untestable idea burns a whole validation cycle and produces zero learning, because the null result is unreadable: was the idea wrong, or was the test unspecifiable? That failure is silent and expensive, and it's the one this gate exists to prevent.

Six items. All required. Roughly two hours. It is the cheapest gate in the factory and the highest-leverage one, because it's the last point where the answer to "what's the smallest thing that could produce this signal?" can still stop a build.

**Where the answers live:** `products/<slug>/validation/idea-gate.md`, seeded from `products/_template/validation/idea-gate.md`. Next to the conversation ledger (`validation/README.md`), because they're two halves of the same stage.

**How it's scored:** `bun run check-idea-gate <slug>` — exit 0 means testable, go run a validation attempt; exit 1 lists the items that aren't ready. The checker targets *vagueness*, not absence: a form full of plausible mush is the real failure mode, so it rejects placeholder text, demands three real quotes, and requires an actual number in the hypothesis.

---

## The six items

### 1. A named ICP with a named watering hole

Not "small businesses." A segment you can name, **plus the specific place 100 of them congregate** — this subreddit, this newsletter, this Slack, this conference attendee list, this search query, this directory.

The watering hole is the load-bearing half. If you cannot name where to find 100 of them, you cannot run a validation attempt at all, so the idea isn't ready to be tested — regardless of how good it is. This is the cheapest and strongest filter in the system, and it fails more ideas than the other five combined.

**Good:** "Solo immigration attorneys in the US who file 5–40 I-130s a year. Reachable in r/immigrationlaw (18k), the AILA member directory, and the 'immigration paralegal' LinkedIn title search."
**Not good:** "Law firms." "SMBs who care about compliance." "Founders."

### 2. The pain, in their words — three verbatim quotes

Three real quotes from real humans or real public artifacts: support threads, G2 reviews, forum posts, complaint threads, sales-call notes. **Verbatim, with a source.**

Paraphrase is banned here, and the reason is specific: paraphrase is where your own hypothesis quietly substitutes itself for the evidence. Once that happens the whole gate is circular and everything downstream inherits the error. If you cannot find three people saying it in their own words, that is itself the finding.

### 3. The current workaround, named, with its cost

Every real problem is already being solved, badly. Name what they do today — the spreadsheet, the VA, the competitor, the manual process, the doing-nothing-and-eating-it.

If you can't name the workaround, you probably have a feature idea rather than a problem. This item pays for itself twice, because the workaround's cost is also your pricing anchor.

### 4. A falsifiable demand hypothesis, written before the attempt

One sentence, this exact shape:

> At least **X%** of **[ICP]** reached via **[channel]** will **[specific action]** when told **[specific message]**.

Dated and locked before any data exists. This is what stops "well, we learned a lot" from standing in for a result. The number matters less than the fact that it was committed to in advance — a threshold picked after seeing the data is not a threshold.

The action must be something a stranger does that costs them something: hand over an email, book a call, reply, complete an onboarding step. "Visits the page" is not an action.

### 5. The kill condition, pre-committed

What result makes you stop? Written before you look at anything.

It must be falsifiable — a number or a comparison, not a mood. "If it doesn't feel promising" is not a kill condition. "If conversion stays under 2% after 600 qualified reach across three channels" is.

This is states-and-dates, one rung earlier than the factory's existing gates apply it. Committing to it now is the whole point: the version of you that has spent three weeks on this will not write an honest one.

### 6. The cheapest test that could produce the signal

What is the smallest artifact that would generate the evidence in item 4? Usually a landing page. Sometimes a DM script and a spreadsheet. Sometimes a single well-placed post.

**If the honest answer is "a working product," you have not found the test yet — go back to this item.** This is the single gate item that would have prevented most of the architecture, database, and dollar commitments this factory has regretted, because it forces the question *before* a repo exists.

Name three things: the artifact, the **qualified reach** the attempt needs (the denominator — see below), and the window.

---

## The denominator — why every threshold here is a rate

Twelve signups from 60 qualified visitors is 20% conversion: the product is fine and the only problem is traffic. Twelve signups from 6,000 visitors is 0.2%: the message or the ICP is wrong, and more traffic will never save it.

**Those two situations are indistinguishable from the signup count alone, and they demand opposite actions.** Everyone tracks the numerator. Almost nobody tracks qualified reach. Without the denominator, "no demand" is an unfalsifiable claim — which is why kills made on gut feel have always felt arbitrary.

So item 4 is a rate, item 6 names the reach that makes the rate meaningful, and item 5 kills on a rate at a minimum denominator. Never on an absolute count.

**Before any reach is delivered: free-tier keepalive is a precondition, not hygiene.** If the database pauses mid-attempt, you keep sending traffic while the signup form fails — and you don't just lose signups, you *corrupt the denominator*. You'll believe you delivered 800 qualified reach when 200 of it hit a broken form, and every verdict computed from it is fiction. Every auto-pausing free service needs a keepalive, and the signup path needs its own liveness probe, before shot one.

---

## What happens after the gate

Passing means the idea has earned a validation attempt — a portfolio of **shots**, where one shot is a channel × message × ICP-segment. Exhaustion is a claim about that portfolio, never about elapsed time:

- **≥3 distinct channels** — one channel failing is a channel result, not a product result.
- **≥2 message angles** on the best channel — "no demand" and "wrong words" look identical from outside, and this is the most common false kill.
- **Minimum qualified reach delivered** — the denominator from item 6.
- **≥1 ICP re-cut** — many "failed products" are correct products aimed at the wrong buyer.

Verdicts read two axes, effort and signal, and the calendar only ever schedules the *conversation*:

| | No signal | Signal |
|---|---|---|
| **Portfolio exhausted** | **KILL — earned.** Gets a post-mortem; the next product aimed at this segment inherits it. | **PASS** |
| **Portfolio incomplete** | **SHELVED — untested.** Not a market verdict. Revivable. | **PASS** |

The distinction in the bottom-left cell is the one that matters across a portfolio: *which ideas did the market reject, and which did we just never test?* Those carry completely different information, and a system that can't tell them apart loses the reusable knowledge in every real rejection.

Before any earned kill, one question: **did the rate respond to effort?** Record conversion per shot over time. If the rate rose when you pushed, that's a distribution problem and one concentrated push is warranted. If it stayed flat regardless of effort, it's a product or ICP problem and no push fixes it.

---

## How to run this

1. Seed the form: copy `products/_template/validation/idea-gate.md` to `products/<slug>/validation/idea-gate.md`.
2. Fill all six items. Pull from existing docs where they already answer an item — `status.md`, `scope.md`, `decisions/`, `competitors.md`, and the conversation ledger at `validation/README.md`.
3. Interview the operator for what isn't on disk. Do not invent an answer to be helpful; an invented watering hole is worse than a blank one, because it passes.
4. Set `**Status**: locked` and the date once every item is real.
5. Run `bun run check-idea-gate <slug>`.
6. On a fail, report which items are missing and why — do not soften it. On a pass, the next step is designing the shot portfolio.
7. Append a `decisions/` entry recording the gate result, using the factory's decision format (decision · why · wrong-if · revisit).

Related: `/validate` (the fuller validation pass), `/work-on` (product context), `bun run check-validation` (the conversation ledger's own speed bump), `factory/playbooks/idea-stage/mom-test.md`.

---

## Known limitations

- **It measures testability, not quality.** A well-specified bad idea passes cleanly. That is by design, and it means a pass is permission to spend *reach*, never permission to build.
- **The checker reads structure, not truth.** It can verify three quotes exist with sources; it cannot verify a human said them. A determined author can fabricate a passing form, and nothing here stops that.
- **The watering-hole item can be gamed** by naming a place that technically exists but that you have no actual access to. A subreddit with rules against promotion is not reachable, and the form can't tell.
- **Thresholds are defaults, not truths.** Three channels and three quotes are starting points calibrated against this factory's own portfolio, not universal constants. A product with one genuinely dominant channel may deserve an argument for two — make it in `decisions/`, don't silently lower the bar.
- **It says nothing about the MVP or later stages.** Deliberately. Those gates are unwritten until a product actually reaches them.
- **It cannot detect a stale form.** An idea-gate locked six months ago against an ICP that has since moved will still read as passed.
