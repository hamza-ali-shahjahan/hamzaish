# 2026-08-29 — Company Brain audit → Phase 1 · two slices shipped, one dropped, one swapped

> Read Slite's Company Brain research ebook against `brain/`, scored it, proposed a
> 4-phase plan; this session built Phase 1.

## Context

- Goal: ship the cheap, no-new-infra items from the Company Brain proposal — the
  gap-line and a drift check.
- Time budget: single session.
- Starting state: `brain/` at FTS5-only, no gap disclosure, no staleness signal.

## What worked

- **Checking real data before building the planned item.** The plan called for a
  telemetry-based drift check. Querying every `product.config.json` first showed
  zero products have any Stripe/PostHog/Sentry ID wired — the check would have
  fired on a permanent constant, not a signal. Caught before writing code, not
  after shipping a noisy check.
- **Reusing the `lib/*.ts` + `*.test.ts` + thin CLI split** (`gates.ts` was the
  template) for the new staleness logic — kept the classification pure and
  testable, matched the CI gate's own conventions.

## What didn't

- The original plan's third item (a Sylph-style review queue for brain edits)
  looked right by pattern-matching the source material, but Hamzaish already has
  the equivalent (`/learn-loop`'s propose→ratify→promote) for the case that
  matters. **Structural lesson:** an architecture audit against an external
  framework can suggest a component that's already solved differently in-repo —
  check what exists before building the profiled shape.

## Decisions made

→ `brain/decision-log/2026-08-29-company-brain-phase-1.md`

## Updates to Hamzaish itself

- **New**: `brain/ask.ts` gap-line (`coverageGaps()`), `scripts/lib/staleness.ts`
  + test, `scripts/check-status-staleness.ts`, wired as `bun run check-status-staleness`.
- **Bumped Hamzaish version** → `meta/changelog.md`, `2.29.0`.

## Surprises

- 61% of the portfolio flagged stale at a naive 21-day threshold before verdict
  filtering; the `AUTOPILOT`-verdict exclusion cut that to 7. Worth capturing in
  `brain/learnings/`: a status-page staleness check is only useful once it knows
  which quiet products are *intentionally* quiet.

## Open questions / things to revisit

- **Threshold calibration** — revisit after a few `/portfolio-pulse` cycles against
  real review behavior.
- **Phase 2 (shared brain-core for Muakkil)** — revisit when Muakkil's buildathon
  actually needs its own query history (the roadmap's own Phase B gate).

## Next

→ **Run `bun run check-status-staleness` at the next `/portfolio-pulse` refresh and
see whether the 7 flagged products are genuinely stale or already known-paused —
that's the real calibration signal.**

---

- [x] Wrote `brain/learnings/2026-08-29.md`
- [x] Logged decision in `brain/decision-log/2026-08-29-company-brain-phase-1.md`
- [x] Updated `meta/changelog.md`
- [ ] Re-ran `bun brain/ingest.ts` (do after this session's files are final)
- [x] No product stage changed
