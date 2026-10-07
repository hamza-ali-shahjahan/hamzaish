# Eval rubric — /legal-check (scanner pair)

Deterministic, agent-blind: the scanner `scripts/check-legal-traps.ts` is run on two
fixture apps that differ only by the six house fixes. Case 01 must catch every trap
(true positives); case 02 must stay quiet on the fixed twin (false-positive guard).
A scanner that flags everything is as useless as one that flags nothing.

The `--fix` half of `/legal-check` (refute, patch, re-scan, PR) is judgement work and
is not pinned here. Its upgrade path is a planted-repo behavioral case once the debt
budget allows. The regressions from the 2026-10-07 sweep live as unit tests in
`scripts/check-legal-traps.test.ts`: terms-page "18+", `hmac.digest()`, CSV imports,
tool catalogs naming FullStory, and "billed annually".
