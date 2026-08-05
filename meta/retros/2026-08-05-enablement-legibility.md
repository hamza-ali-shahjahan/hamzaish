# 2026-08-05 — Hamzaish enablement · the factory learned to announce itself, legibly

> A live build session used the factory perfectly once, then silently dropped it — and the operator's two verdicts ("not enablement at all"; the receipts "will make no sense to a new user") became v2.24.0: mechanical enablement plus a legibility gate on everything the factory says.

## Context

- Goal (as it evolved): an operator-directed build day on a personal product (slug `mini-minecraft`; its metadata folder is kept operator-local by design) turned into a factory upgrade — make Hamzaish default-on for follow-up requests and legible to a day-1 user.
- Stakes: new users only leverage what they can see and read; the wider July-2026 "agent output reads like another language" discourse made this a positioning question, not a nicety.

## Timeline (what actually happened)

- 2026-08-01 — Build #1 routed through `/hamzaish` correctly: goal pinned, validation speed-bump recorded, guardrails applied.
- Same session — builds #2 and #3 silently dropped the flow: no re-entry, no trace-grounded retro. The practices survived only as habit, not mechanism.
- Operator verdict #1 → stickiness: session-continuation contract (§4), tendril `CLAUDE.md` planted at registration, SessionStart hook injecting the protocol, `setup` step 9 registering it for new users. Five legacy product repos seeded.
- Operator verdict #2 → legibility: approved 4-line plan + 3-line receipt formats, then the gate (`bun run check-legibility`).
- 2026-08-05 — push to `main` rejected (PR + required guards — correctly); PR #75 opened; `check-retro` failed it for missing this very file. The ladder caught its own author.

## What worked

- **Encode the failure as mechanism, same day.** Prose rules were dropped by a well-behaved session twice in one arc; the hook + check versions cannot be.
- **Calibrate gates against operator-approved references.** The legibility check is tuned so the approved bookends always pass and the pre-fix jargon receipt fails with named reasons — taste, pinned mechanically.
- **The guards chain worked on the factory itself** — three honest catches in one PR cycle: a `code_path` that belonged in the local map, a version-doc drift, and this missing retro.

## What didn't

- **Prose protocols don't survive sessions** (structural) → hook injection is now the enforcement layer.
- **Insider vocabulary leaked into user-facing output** (structural) → banned-noun list in the gate; "if a term needs the codebase to explain it, say what it does instead."
- **Partial local guard runs before pushing** — CI runs the full battery; run the workflow's exact list locally next time.

## Decisions made

- Product-scoped decision records 0001–0003 (enablement gap, protocol, legible formats) live in the product's operator-local metadata folder, deliberately outside the public repo.

## Updates to Hamzaish itself

- `factory/commands/hamzaish.md` §4–§5 · `factory/hooks/factory-session-context.sh` · `scripts/check-legibility.ts` · `templates/claude-md-template.md` · starter `CLAUDE.md` · `setup` step 9 · `check-product-layout` tendril warning. Version → **2.24.0**.

## Surprises

- The strongest enablement lever wasn't better prompting — it was planting a file (`CLAUDE.md` tendril) in the product repo. Sessions read files, not intentions.

## Open questions / things to revisit

- **Port the bookends into `/full-cycle` stage handoffs** — revisit on the next full-cycle run.
- **README "Your agent stopped speaking human" section** — ships when its screenshot asset lands.
- **Legibility cases in the eval judge** — the gate exists as a script; make it a judged eval too.

## Next

→ **Merge PR #75, then add legibility eval cases so the judge enforces what the gate lints.**
