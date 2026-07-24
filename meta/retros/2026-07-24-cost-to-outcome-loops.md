# 2026-07-24 — factory · cost-to-outcome loops: model-independence bench + evidence router + reward-wired hill-climb (v2.21.0)

> A frontier post described, almost verbatim, the architecture the factory already chose — so the work wasn't a pivot, it was closing three loops that were already scaffolded.

## Context

- Trigger: a frontier "hill-climbing" post (MAI models for Copilot/Excel) read against the factory. Its thesis — externalize harness/memory/context/skills outside the model, keep evals hill-climbing even if a model is removed, route to the cheapest model that clears the bar — is what Hamzaish's 4-layer agent OS already is.
- Goal: close the open loops the post pointed at, without becoming a training lab.
- Time budget: one session, four slices (D→B→A→C), local commits, ship as one MINOR.
- Starting state: a real but **static** tier router (`model-policy.ts`); an eval harness that ran but **pinned one model per case**; `/goal` scored on a **subjective rubric**; telemetry with **no reward dimension**.

## What worked

- **Additive over invasive.** The cross-model sweep is a new module (`lib/sweep.ts`) that left the battle-tested single-model floor in `run.ts` untouched; the cascade is opt-in (`Task.cascade`), so all existing loop tests stayed green. Nothing load-bearing was rewritten.
- **Existing rails absorbed everything.** `**/*.local.jsonl` gitignore already covered the reward ledger; the `friction.ts` (CLI + pure `lib/` + test) pattern mirrored cleanly into `reward.ts`; the loop's `Generator`/`Judge` injection seams made the cascade unit-testable with zero live model calls; extending `bun test` to `./meta` finally put the eval harness under test.
- **Doctrine first (D) paid off.** Writing the doctrine page before B/A/C gave the three code slices one shared vocabulary and one honest boundary to point at.
- **The gap was already scouted.** The `references/metaharness/` clone's cost-predicting router + cheap→frontier cascade were already logged as parked change-candidates — so B/A were "activate the parked work," not "invent."

## What didn't

- **Headless `claude` OAuth was expired**, so the live bench couldn't produce real capability numbers — every tier returned an auth error at $0 in <1.5s. The sweep pipeline was still proven end-to-end (it substituted models, parsed `total_cost_usd`/verdict, and wrote a valid `leaderboard.json`); it faithfully recorded a live *auth* signal instead of a capability one. The bogus zero-pass artifact was deleted rather than committed. This is the **same expiry** flagged in v2.20.0's revisit list (it also blocks the feature-slicing LLM case and the autonomy loop).

## Decisions made

- **The honest boundary:** the factory optimizes the harness / router / skill selection against real outcomes — never model weights. Hamzaish is an agent OS, not a training lab; MAI-style RL fine-tuning is deliberately out of scope. Recorded in the doctrine page.

## Updates to Hamzaish itself

- **New:** `factory/playbooks/ai-native-2026/cost-to-outcome-and-model-independence.md`; `meta/evals/lib/sweep.ts` + `leaderboard.ts` (+ test); `scripts/check-model-independence.ts`; `factory/runtime/eval-score.ts` (+ test); `scripts/reward.ts` + `scripts/lib/reward.ts` (+ test).
- **Updated:** `meta/evals/run.ts` (`--models` sweep), `factory/runtime/model-policy.ts` (leaderboard routing + `nextTierUp`), `factory/runtime/loop.ts` (cascade), `factory/model-policy.md` (Phase 3), `factory/commands/hamzaish.md` (front-door refresh), `factory/commands/goal.md` (objective signal), `CLAUDE.md`, `README.md`, `BEST-PRACTICES.md`, `package.json` (`bench`/`reward`/`check-model-independence`, test scope → `./meta`), `.github/workflows/ci.yml`.
- **Bumped** → v2.21.0.

## Surprises

- The public post and an already-cloned reference both crystallize the same one-liner — *"the model is replaceable; the harness is the product"* — and the factory had independently arrived there. The most useful output of reading the post was a mapping table showing Hamzaish was ~80% of the way there, not a to-do list of new things to build.

## Open questions / things to revisit

- **Populate a real leaderboard** — revisit when: `claude` is re-authenticated. Then `bun run bench` produces real capability-per-dollar numbers, `routedModel()` routes on evidence, and `check-model-independence` validates a real artifact.
- **First real product RLE** — revisit when: a product wires an `activated` / `key_action_performed` event into `bun run reward log`, giving the hill-climb a customer-valued trend rather than only eval outcomes.

## Next

→ **Re-auth `claude` → `bun run bench` → first evidence-based route + first real reward trend.** Until then the loops are built, tested, and inert-safe (absent leaderboard / absent ledger both fall back cleanly).
