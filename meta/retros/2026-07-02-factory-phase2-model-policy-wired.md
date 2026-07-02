# 2026-07-02 — Factory · Phase 2: the model policy is wired, not declared

> The roadmap's Phase 2 landed same-day as Phase 1: every spawnable agent carries its model tier as frontmatter, a tested resolver reads it, stakes escalation is active, and the headless runtime picks its model from the policy.

## Context

- Goal: convert `factory/model-policy.md` from "Phase 1 (declarative). Not yet wired." into executed machinery, and finish whatever was actually unfinished in `factory/runtime/`.
- Time budget: same working session as Phase 1 (the operator's "continue all the way" directive).
- Starting state: v2.1.1; policy untracked and unread by any code; runtime loop complete but hardcoding `model ?? "sonnet"`.

## What actually happened

- **The audit misreported the runtime — again in our favor.** The inventory claimed `loop.ts` had a `// TODO: wire orchestrator`. Direct read: zero TODOs; the loop, four-way router, feedback-regeneration, and route-forcing tests were all complete. The real gap was exactly what the runtime's own "deliberately OUT" list implied: nothing read the model policy. Second confirmed instance of "audit inventories are leads, not facts" (see learning 2026-07-02).
- `model_tier:` frontmatter inserted into all 34 spawnable agents (15 opus / 15 sonnet / 4 haiku), per the policy tables + 3 new engineering rows; `_orchestrator` deliberately untiered (it IS the main loop).
- New `factory/runtime/model-policy.ts`: `modelForAgent()` (frontmatter → model, Tier-B fallback, never crashes), `escalate()` (stakes beat role, up only), `stakesFromPrompt()` (auth/payments/migrations/RLS sniffer as fallback).
- `loop.ts` Task gained `agent`/`stakes`; model resolution order: explicit override → frontmatter tier → default, then escalation. Demo task now resolves its model from the policy.
- Tests: 18/18 (existing loop routes + new policy suite, including the assertion that *every agent on disk resolves to a valid tier* — the wiring claim, tested).
- Policy doc updated to Phase 2 ACTIVE; orchestrator step 5 now distinguishes in-context execution (session model — a tier can't change the current context) from delegated execution (pin from frontmatter + escalate); builder carries the stakes-escalation discipline line.

## What worked

- **Frontmatter as the machine-readable source of truth** — the tier lives next to the agent it governs; the policy doc is rationale, the code reads the frontmatter, and the disagreement rule is written down (frontmatter wins).
- **Escalation up-only** — automating de-escalation was considered and rejected: a "trivial" auth tweak is the classic trap. Judgment stays manual in the down direction.

## Decisions made

- Frontmatter-wins on tier drift; no automated de-escalation (recorded in `factory/model-policy.md` §Phase 2).

## Open questions / things to revisit

- The tuning loop (log tier × outcome per run, re-tier on evidence) still has no data pipeline — revisit when the runtime runs real tasks regularly.
- Fable-tier verification for brand/creative work remains open (the policy's "unverified" row).

## Next

→ **Phase 3: brain recall injection (`ask.ts --context`) + learn-loop proposals.**
