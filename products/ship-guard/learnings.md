# ship-guard — Learnings

## 2026-06-23 — Birth
- **Worked**: reverse-engineering the check set from a *real* audit
  (`meta/security/REPO-ACCOUNT-SECURITY-AUDIT.md`) gave a non-guessed, high-signal
  spec — the secret patterns (Anthropic `sk-ant-`, Clerk/Stripe `sk_live_`, Neon
  `npg_`/Postgres URLs, Supabase `service_role` JWT, Sentry `sntryu_`, private-key
  blocks) and the four vectors are all things that actually bit the operator's fleet.
- **Decision**: zero-dependency single-file Node scanner over a Next.js app — a
  security tool's trust surface should be minimal and droppable. See decision 0001.
- **Pitfall caught early**: a recall-only metric is game-able (flag everything → 100%).
  Forged the goal with a clean-fixture false-positive guard so the dumbest output fails.
- **Self-scan trap**: a secret scanner whose own source contains secret regexes will
  flag itself. Fixed with a `ship-guard:ignore-file` sentinel + default fixture/
  vendored-dir path ignores. (Candidate anti-pattern if it recurs in other scanners.)
