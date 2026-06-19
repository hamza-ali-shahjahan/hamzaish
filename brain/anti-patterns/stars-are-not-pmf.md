---
name: stars-are-not-pmf
description: Treating GitHub stars (or any vanity launch spike) as evidence of product-market fit
type: anti-pattern
---

# Stars are not PMF

## The pattern

A repo's star count (or an HN front page, a launch-day traffic spike, a viral tweet) gets read as validation that the product *works* — that people want it, use it, and would miss it. Roadmap and confidence then get anchored to the vanity number instead of to usage and retention.

## Why we don't do it

The data is unambiguous (our [road-to-stars research](../../meta/research/2026-06-11-road-to-stars.md), live GitHub API):

- **maybe-finance: 54,000 stars, product dead by mid-2025.** Stars measured attention, not fit. The clearest single counterexample in the whole cohort.
- An HN front page converts ~1.4 stars/upvote with a ~24h half-life; HN score explains only ~8% of long-run star variance. A launch spike is a *pulse*, not traction.
- AutoGPT drew ~185k stars off one mesmerizing demo, then struggled to convert the spike into a durable product.

Stars are *engagement* — bookmarking and appreciation (arXiv:1811.07643: appreciation 52.5%, bookmarking 51.1%, usage only 36.7%). Engagement and fit are different axes. Confusing them is how you scale the wrong thing and mistake a dead product for a healthy one.

This is the evidence behind **CLAUDE.md hard rule #1**: never claim PMF from launch-week numbers.

## What to do instead

- **Track fit on its own axis:** Sean Ellis ≥40% "very disappointed" over 2 weeks **AND** a flattening retention curve. Below that, it's "early traction," not PMF — say so plainly.
- **Treat stars/spikes as a distribution signal, never a fit signal.** A spike says "the message reached people," not "the product is right."
- **Run `bun run check-validation <slug>`** before expensive/irreversible bets so validation is recorded, not skipped silently (hard rule #2).
- When reporting, separate the two numbers explicitly: "N stars (attention)" vs "retention/Sean-Ellis (fit)." Never let the first stand in for the second.

**Credit (port the idea, never the code):** maybe-finance — https://github.com/maybe-finance/maybe · AutoGPT — https://github.com/Significant-Gravitas/AutoGPT. Distilled via our road-to-stars research; see [`docs/LEARN-FROM-REPOS.md`](../../docs/LEARN-FROM-REPOS.md) entries A8/A9.
