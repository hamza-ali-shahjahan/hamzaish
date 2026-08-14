# Retro — the validation gate passed on an empty ledger (2026-08-14)

**Trigger:** a guard with visibly wrong-shaped behavior, found 2026-08-13 while
seeding muakkil's validation ledger: `bun run check-validation muakkil` printed
"Clear to build" for a product with zero conversations logged, and counted the
`## Validation debt` block — a written record of *not* validating — as one
evidence block *for* validation.

**What happened:** two independent defects in `scripts/check-validation.ts`,
both leaning the same way (toward a pass):

1. **Scope-blind counting.** `text.match(/^###\s+\d{4}-\d{2}-\d{2}/gm)` matched
   dated headings anywhere in the file. The template's debt block is a dated
   `###` heading, so recording debt *raised* the evidence count. Two live
   products were affected: muakkil (worked around locally by writing its debt
   heading backwards — `### Building before validation — 2026-07-02` — with a
   comment explaining the dodge) and repolish (reported 1, actually 0).
2. **`in-progress` passed unconditionally.** It sat in the PASS set next to
   `validated` and `debt-accepted` with no minimum evidence, so typing it and
   writing nothing else printed "Clear to build" indefinitely.

Combined effect: the one state a stalled product naturally reaches for was also
the one that could never fail, and the act of being honest about skipping
validation made the numbers look better. muakkil sat in that state for six weeks
with the build lane open and measured traction at zero.

**Root cause:** the gate was written to read a *declaration* (the State line)
and treated the *evidence* as decoration — a count to print, never a condition
to meet. A gate that can pass with nothing behind it isn't a gate. The local
workaround compounded it: it fixed the symptom in one product's markdown, which
removed the pressure to fix the script every other product shares.

**Fix:** parsing extracted to `scripts/lib/validation-ledger.ts` (pure) and
made provable — evidence counted only inside the `## Evidence` section with
HTML comments stripped, and any state that *claims* validation happened
(`validated`, `in-progress`) requires at least one block. `debt-accepted` still
passes with zero evidence by design: it claims the opposite, and saying so out
loud is the entire requirement. muakkil's workaround reverted to the template
format in the same change.

**Check-ladder:** the check itself was the thing that broke, so the rung above
it is the test — `scripts/lib/validation-ledger.test.ts` pins eleven behaviors,
including the one that would have caught this on day one: *a ledger containing
only a debt block reports 0 evidence blocks.*

**Generalizes to:** every other `check-*` guard. The question to ask of each is
not "does it run?" but "can it pass with nothing behind it?" A guard whose
happy path is reachable from an empty file is documentation wearing an exit code.
