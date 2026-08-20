# 2026-08-20 — Recall that lagged, and the call that was buried

> Two failures of the same shape, found an hour apart: the factory knew something
> and put it somewhere the reader wouldn't look. One was in code (search answering
> from a stale index), one was in prose (a recommendation real but buried). Both
> ended as mechanism.

## Context

- **Goal:** assess an external repo the operator dropped in, then act on the result.
- **Starting state:** the repo — Graft — turned out to have been assessed here three weeks earlier, with an approved-but-never-run trial and recorded watch triggers.
- **Stakes:** low individually; the compounding kind. A search that lags its files corrupts every later decision that trusts it.

## Timeline

- Searched the repo before answering, and found the prior study — so the question stopped being "what could we take" and became "what changed, and which of our own triggers fired."
- Two of three watch triggers had fired. Checked them against live sources rather than the marketing: stars/forks/contributors up an order of magnitude, publishing cadence down ~6×, but still 0.x with **zero tagged releases**.
- The strongest fit wasn't the one being advertised. The pitch was "agents re-explore your repo"; the real gap here is that the brain indexes every decision and **zero code**.
- Proposed the port, not the tool. The operator asked for the recommendation — it was in the response, under its own supporting analysis, and hadn't landed.
- Built both fixes: refresh-on-read for search, and a `Recommendation` line baked into every session's receipt.

## What worked

- **Searching before answering.** The prior study existed. Producing a from-scratch assessment would have been confident, plausible, and would have silently discarded a code-grounded read plus its recorded gates. The cheapest good decision of the session was made before any analysis started.
- **Grading the claim, not repeating it.** The source claimed the generated map is shared with a team via git; the tool's own README says the opposite — it is gitignored as a regenerable cache, and each teammate rebuilds their own. Reporting the gap was worth more than reporting the feature.
- **Fixing the trap found in passing.** `documents.mtime` held wrapped int32 garbage. Nothing depended on it yet, which is precisely why it was cheap to fix — the next mtime-based optimization would have inherited silent wrongness.
- **Asserting the blind spot instead of describing it.** The freshness probe can't see a same-length edit with a restored timestamp. That is now a passing test that proves stat mode misses it and hash mode catches it, so the limit is a fact rather than a claim in a comment.

## What didn't

- **The recommendation was buried.** The standing rule to lead with one has existed in prose for months. Prose was followed in structure — a "Recommendation" heading existed — and still failed in effect, because the surrounding analysis outweighed it and the receipt, the part actually read, didn't carry it. Structure that is optional under pressure is not structure.
- **Ran a linter as if it were a gate.** `check-legibility` takes text as input; invoking it bare through `verify` produced a real recorded failure that was purely operator error. The ledger keeps it, correctly — but the lesson is that a "gate" and a "linter that needs input" are different things and the sweep already knew that.
- **Reached for a toolchain the repo deliberately doesn't have.** Ran `bunx tsc` for a typecheck in a zero-dependency repo, which resolved and installed packages. Caught and reverted, but the repo's own README said not to.

## What surprised me

That the fix for a code defect and the fix for a communication defect were the *same* fix. Search knew the file had changed and only mentioned reindexing in its no-hits footer — i.e. in the one case where staleness was harmless. The proposal knew the recommendation and put it where the reader had already stopped reading. In both cases the information existed, was correct, and was placed where it couldn't act. "Where does the reader actually look?" turned out to be a debugging question, not a writing one.

## What changed as a result

- `brain/freshness.ts` + `brain/corpus.ts` — refresh-on-read, one shared corpus list, first tests in `brain/`.
- `Recommendation` in the receipt across all five definition sites, enforced by `check-legibility` against both omission and hedging.
- A hook test that builds a receipt to the hook's own instructions and runs it through the gate — so the instructions and the check can't drift apart.

## Open

- The Graft trial stays gated on its original trigger (the operator naming a TypeScript product repo). Two of three watch conditions have fired; 1.0 and tagged releases have not.
- The brain still indexes no product code. That gap is now named, not closed.
