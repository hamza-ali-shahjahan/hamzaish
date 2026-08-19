# Repolish — Goal (v1: the evidence layer)

> Forged via `/write-a-goal` on 2026-08-16. Extends [`goal.md`](goal.md) (v0) — it does
> not replace it; v0's M1/M2 remain live and must not regress.

## Why this goal exists

v0 grades README claims against README **text** plus shallow existence checks (is there
a test folder, is there a CI file). That caps honesty recall, and v0's own ceiling note
named an LLM semantic pass as the only lever.

That is the wrong lever. The lever is **more measured facts** — which keeps the offline,
deterministic, zero-network promise that is itself part of the product's honesty claim.

## Capability statement

Given a path to a local repo, repolish measures the repo's actual state — git history,
per-file metrics, and a static dependency graph — and grades each README claim against
those measurements, offline, deterministically, with no model call at verdict time.

## The exact metrics (Check A — split, because one number hid three things)

### M3 — evidence-grounded honesty (the new metric)

Two claim classes behave completely differently, and averaging them hides the point:

- **Class 1 — text-resolvable.** Decidable from the README alone ("100% coverage" with
  no test directory). v0 already handles these; measured by v0's M2.
- **Class 2 — evidence-dependent.** *The same sentence is honest in repo A and a lie in
  repo B* — "actively maintained", "well-tested", "modular", "community-driven",
  "lightweight", "stable". Text alone can never decide these. **M3 measures only these.**

**Measured on:** a hand-labeled corpus of **10 real repos** — 5 of the operator's own
(ground truth is cheap to verify) and 5 external (prevents the claim taxonomy overfitting
to one author's writing habits). External repos are read statically only; nothing from
them is executed.

**Scored as:** recall over evidence-dependent claims, plus false positives on claims the
repo genuinely supports. **A false positive costs more than a miss** — telling a
maintainer they are lying when they are not is the worst failure this product can have.

> **Robustness guard — the paired-context test.** Every evidence-dependent claim in the
> corpus appears **at least twice**: once in a repo whose facts support it (label:
> honest) and once in a repo whose facts refute it (label: overclaim). A detector that
> ignores the repo cannot beat chance on this subset — flag both and it eats a false
> positive, flag neither and it eats a miss. High scores are reachable **only** by
> actually measuring the repo. This is what makes M3 un-fakeable by pattern matching.

### M4 — measurement correctness

Every measured fact must be **exactly** right: last-commit date, commits in the window,
top-author share of commits, test-file-to-source ratio, largest-file share of LOC,
declared + transitive dependency count, import-cycle count.

**Scored as:** exact match against hand computation on the same 10 repos. Not a
tolerance — these are countable integers and dates.

> **Why this is stricter than M3:** M3 is the product; M4 is the license to ship it. A
> confidently wrong fact is worse than the shallow-but-honest v0. M4 has no partial credit.

### The determinism trap (closed here, before it bites)

Facts like *"commits in the last 90 days"* and *"last commit was 14 months ago"* are
functions of **now**. Left unpinned, the same repo at the same commit produces different
output on different days — CI would go red with no code change, and two runs would
disagree, breaking the determinism the product sells.

**Resolution:** every run records an `as_of` timestamp in its output. Absolute facts are
stored absolute (`last_commit: 2025-03-14`); relative facts are computed from `as_of`,
never from wall-clock at read time. Evals pin `as_of` to a fixed date.

This also earns the downstream feature: a "claims verified &lt;date&gt;" badge is only
honest because verdicts are as-of dated.

## Evals (numeric targets)

- **E1 — facts are right.** M4 = **100%** exact match across all fact types × 10 repos.
  A single mismatch fails the goal.
- **E2 — honesty recall.** M3 recall **≥ 0.8** over evidence-dependent claims judged
  resolvable, with **≤ 1** false positive across the whole corpus.
- **E3 — paired discrimination.** On paired claims (same sentence, opposite ground
  truth), **≥ 0.9** are correctly decided **on both members of the pair**. This is the
  eval a text-only detector structurally cannot pass.
- **E4 — no regression.** v0's E1, E2, E3 still pass unchanged.
- **E5 — deterministic and offline.** Same repo at a pinned commit with a pinned
  `as_of`, run twice → identical fact output. Run with the network disabled → exit 0,
  zero network calls attempted.

## Acceptance rule

E1–E5 all pass on a fresh run, confirmed by a fresh-eyes agent that did not build it.

## Non-goals (v1)

- **A code-health score as a user-facing output.** Measurements exist only to decide a
  claim. If a measurement resolves no claim, it does not ship. *(This is the line that
  keeps repolish a README tool rather than becoming a different product.)*
- **Refactoring plans / rot reports.** Different product.
- **Any network or model call at verdict time.**
- Editing the repo's real README in place · the demo-GIF recording · README taste and
  quality as a metric (still a taste call, per v0).

## Feasibility verdict (Check B)

**Reachable — with the target set on the right denominator.**

**The ceiling.** Measurement resolves only claims that map to a countable fact.
"Blazing fast" (no benchmark in the repo), "easy to use" (taste), and "secure"
(needs analysis, not counting) are **unresolvable by construction**. So E2's recall is
defined over the **resolvable subset**, and the corpus must label unresolvable claims as
such. Scoring recall over *all* claims would set a target no architecture can hit — the
trap this check exists to catch.

**Inside the ceiling, with headroom.** Once a claim is mapped to a fact, the verdict is a
deterministic lookup and near-certain. The realistic limiter is **claim extraction** —
finding the sentence and routing it to the right fact family — not the measurement.

**Levers that raise the ceiling:** adding a new measured fact family (each one unlocks a
whole claim class). And a refinement on v0's ceiling note — an LLM would help at
**extraction**, not adjudication; the verdict could stay deterministic and offline while
extraction recall rises. Still a non-goal here, and now for a stated reason rather than
a blanket one.

**Levers that only optimize within it:** more phrasings for claim families already covered.

## Where this lands against the product's gates

The blocking gate is honesty recall on ≥5 real-world READMEs, then npm
([status.md](status.md)). This goal is the path through it — E2 and E3 are that gate,
made harder and un-game-able. Ship this before npm, not after.
