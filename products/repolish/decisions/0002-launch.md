# 0002 — Launched public on GitHub

- **Date**: 2026-06-23
- **Decision**: Took repolish public as `github.com/hamza-ali-shahjahan/repolish`
  (PUBLIC, MIT, CI green). Scope chosen: **GitHub-public only — NOT npm yet.**
  Pre-flight cleared first: name free on GitHub + npm, secrets scan clean, added a real
  LICENSE file (closed the MIT-claim-without-LICENSE honesty gap) and a CI workflow that
  runs the eval acceptance suite (E1/E2/E3) — confirmed green before adding the CI badge.
- **Why**: User said "Launch!" with the name locked. Held back npm deliberately because
  v0 is honestly labelled "early" and the goal requires validating honesty recall on ≥5
  real-world READMEs before a fuller launch; npm permanently claims the global name and
  unpublish is restricted, so it's a one-step follow-up once validated. Kept auto-push OFF
  (`.no-auto-push`) so pushes stay deliberate rather than every-turn (exfiltration-path
  hygiene).
- **What would prove it wrong**: If real-world READMEs reveal low honesty recall, the
  public v0 oversells the differentiator — would need the LLM semantic pass before
  promoting it (PH/HN/npm).
- **Revisit trigger**: After running the honesty pass on ≥5 real repos → decide on
  `npm publish` + a louder launch (`/launch-plan`).
