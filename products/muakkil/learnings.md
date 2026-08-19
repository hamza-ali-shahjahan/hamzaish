# Learnings — Muakkil (موكّل)

_Capture the transferable lesson only — never keys, credentials, or proprietary internals._

## What worked

- **Deterministic machine, LLM only fills content.** Stages and steps are declared, pure and
  unit-tested; the model never decides what happens next. This is why reject/regenerate took
  one function instead of a refactor — `nextStepTemplate` already treated `pending` as
  runnable, so returning a step to `pending` was the whole mechanism.
- **Constraining the model to real numbers.** The weekly report prompt says "ONLY these numbers
  exist — use them exactly, never invent others" and the numbers come from our own database.
  Cheaper and more trustworthy than any after-the-fact check.
- **Rebuilding HTML instead of accepting it.** The founder edits the welcome email as plain
  text; paragraphs are re-wrapped server-side. An editor that accepted markup would have been
  an injection surface in a message sent in the founder's name, for no benefit they wanted.

## What we would do differently (pitfalls)

| Pitfall | The fix | Guardrail it became |
|---|---|---|
| **"Built" recorded for code that had never run.** Slices 1–6 were marked built and live-smoked; in fact production held 1 of 8 required keys and no sign-in existed anywhere in the codebase, so no step had ever executed. Six weeks of status entries described a product nobody could open. | Separate *written* from *works*. A slice is "built" only when it has been executed end to end against real keys. | Status now labels unverified work explicitly; the same bar was applied to the sign-in and P0 work shipped the same day. |
| **Approve was the only verb.** Nine server functions, one editor. The founder could edit the brief and nothing else — the validation report, plan, public page copy, launch kit and welcome email were take-it-or-leave-it. Approval without a reject is a speed bump, not control. | Reject + regenerate carrying the founder's reason, plus editors on everything that reaches the public. | Test asserts every stage template has a runner, so no rejected step can dead-end. |
| **A measured signal that nothing displayed.** The Seeker stored `grounded: true/false` from the day it shipped. No screen ever read it, so a report built on zero live sources looked identical to one built on ten. | Show the provenance next to the claim. | The report now leads with its own source count, or says plainly there were none. |
| **Evals that cannot fail for the reason that matters.** Both live evals count shape — fields ≥8 characters, item counts, body length >40 chars. A launch kit naming five fictional communities scores 7/7. | Score faithfulness and check that claimed links resolve; report per item, never an aggregate percentage. | Still open (P2). |
| **A validation checker that returned a false green.** `check-validation` counts any `### YYYY-MM-DD` heading as evidence, including the one inside the "we built without validating" debt block — so a ledger with zero interviews reported "1 evidence block. Clear to build." | Count only headings under `## Evidence`; require a minimum before `in-progress` passes. | Filed as a factory fix; Muakkil's ledger works around it by not dating the debt heading. |

## Open questions

- Nothing verifies the Seeker's competitors or the Herald's target communities exist. For a
  non-technical founder making a go/no-go call, a confidently wrong competitor set is worse
  than no report — and a fictional subreddit costs them Day 1 of their launch.
- Is the wedge right at all? Validation gate 2026-08-16: five conversations, ≥3 raising the
  post-build stall unprompted, ≥1 naming a figure they'd pay. Zero evidence logged as of
  2026-08-13.
