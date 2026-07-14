# Research-Baked Practices — the honest ledger

> **What this is.** Hamzaish bakes in two *kinds* of practice, and conflating them would be dishonest:
>
> 1. **Scar tissue** — earned from a real Hamzaish ship that broke. Proven. (e.g. the npm bin-path gotcha, the codegen output-validation rule, the BigQuery scan-billing cost lesson.)
> 2. **Research-baked** — adopted from established best practice (SRE, security, testing convention) because it's clearly right, but **not yet battle-tested inside Hamzaish.**
>
> This file tracks category 2 so a new user knows exactly which guardrails are proven and which are sensible-but-unproven. In the self-evolution frame ([`SELF-EVOLUTION.md`](SELF-EVOLUTION.md)): these are **variation awaiting selection** — they become scar tissue (or get corrected) the first time a real product runs them in anger.

**Convention**: when a research-baked practice survives its first real-world test, move its row to "Graduated" with the ship + date that proved it, and update the playbook's provenance line.

---

## Currently research-baked (unproven inside Hamzaish)

| Practice | Where it lives | Source / rationale | Validates when… | Status |
|---|---|---|---|---|
| **Test scaffolding in the starter** (Vitest unit/component + Playwright e2e + example tests) | `templates/product-starter-nextjs/` (`vitest.config.ts`, `playwright.config.ts`, `src/**/*.test.*`, `e2e/`) | Standard Next.js testing stack; closes the "no test harness" gap | A scaffolded product actually writes real tests against it and CI catches a real regression | ⏳ unproven |
| **CI/CD pipeline template** (typecheck → lint → test → build → e2e on push/PR, Bun-based) | `templates/product-starter-nextjs/.github/workflows/ci.yml` | GitHub Actions + `oven-sh/setup-bun`; placeholder-env build so it's green on clone | A product pushes to GitHub and the pipeline runs end-to-end without hand-editing | ⏳ unproven — *risk: per-product env-var names; needs a real `bun.lockb` committed for `--frozen-lockfile`* |
| **Production-ops playbook** (severity ladder, incident loop, DB-down runbook, backup/DR) | `factory/playbooks/scale-stage/production-operations.md` | Google SRE Book, PagerDuty IR, Supabase prod checklist | A real SEV1/2 incident is handled with it and the retro confirms (or corrects) the runbook | ⏳ unproven |
| **Abuse & cost controls** (rate limiting, bot defense, LLM/scan-billed cost caps, kill switch) | `factory/playbooks/scale-stage/abuse-and-cost-controls.md` | Standard practice + the IP Radar BigQuery cost lesson (partially proven) | A product enforces these and either survives an abuse/cost spike or learns where the defaults were wrong | 🟡 partially proven (cost-runaway rows draw on a real lesson; rate-limit/abuse rows do not) |
| **Security at scale** (quarterly `/security-check --live` drift re-audit, attack-surface self-scan, data-breach runbook, retention rules in the spec template) | `factory/playbooks/scale-stage/security-at-scale.md`, `factory/commands/security-check.md` § Live mode, `factory/skills/spec-driven-development/SKILL.md` § Data Model & Retention | OWASP CheatSheetSeries, GDPR Art. 33/34, Supabase Security Advisors; prompted by the 2026-07 7TB/11B-record open-server disclosure | A live run catches real drift (an RLS-less table, a public bucket) that the ship-time gate missed — or a breach is handled with the runbook and the retro confirms it | ⏳ unproven |
| **Validation enforcement** (the `check-validation` speed bump + ledger) | `scripts/check-validation.ts`, `products/_template/validation/README.md`, wired in `/scaffold` + `/hamzaish` | Designed response to the wp-to-astro violation (build-before-validate) | The next new product hits the gate and it actually changes behavior — validation happens, or the debt is recorded instead of skipped silently | ⏳ unproven — *the violation it's meant to prevent is itself the proof case* |

---

## Graduated (research-baked → proven by a real ship)

| Practice | Proven by | Date | Now lives as |
|---|---|---|---|
| _none yet_ | | | |

---

## How to read this as a new user

If you're picking up Hamzaish: the **four "What you inherit on day one" items in the README are scar tissue — proven.** The five rows above are **good defaults we believe in but haven't yet proven inside this factory.** Use them; they're better than nothing and grounded in established practice. But if one bites you, that's expected — log it in `brain/learnings/`, fix the playbook, and move its row to Graduated. That's the factory working as designed.

_Created 2026-06-07. Append-only-ish: rows move from "research-baked" to "graduated", they don't vanish._
