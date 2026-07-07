---
name: metaharness-factory-for-harnesses
description: Three transferable patterns mined from ruvnet's MetaHarness (a factory for agent harnesses) — score-before-scaffold, the Darwin measured-retention rule, and cost-per-dollar as a first-class metric — each a CANDIDATE per the factory-change gate, with named applications and revisit triggers.
type: knowledge
source: https://github.com/ruvnet/metaharness (studied 2026-07-07; shallow clone at references/metaharness, mining guide in references/README.md)
---

# MetaHarness — what a factory-for-harnesses teaches a factory-for-products (noted 2026-07-07)

MetaHarness (ruvnet / Reuven Cohen, 381★, v0.1.3 June 2026, MIT) turns any GitHub repo into its own branded agent harness in under a minute — "a factory for agent frameworks," structurally the same species as Hamzaish. Three patterns are worth keeping. All three enter as **candidates** per `meta/evals/factory-change-gate.md` — promoted by bench or product proof, not by looking reasonable. (A fourth take-away, the `mcp-scan` security pattern, was ported directly into `/security-check` § 7 + `scripts/check-mcp-config.sh` the same day — that one is bench-checked, not parked.)

## 1. Score before scaffold

**The mechanism**: `metaharness score <repo>` emits a one-screen static report card *before* any scaffold happens — harness fit, build likelihood, tool safety, and rough **cost-per-run** — with zero code execution; inferred build commands are tagged `trust: inferred · execution: disabled`. (`references/metaharness/docs/USAGE.md`, `docs/USERGUIDE.md`.)

**The application here**: `/scaffold` ignites with no cheap static gate. A pre-ignition "product report card" — stack fit, estimated API cost/run, secrets surface — is informational, not a toll, so it preserves the momentum default while making the bet legible. Same philosophy as `bun run check-validation`: never block silently, always make the debt explicit.

**What would prove it wrong / revisit**: if the report card ever becomes a step the operator skips-through without reading (measure: two consecutive scaffolds where the card changed nothing), it's ceremony — kill it. Revisit when the next `/scaffold` runs.

## 2. The Darwin retention rule — the factory only keeps measured improvements

**The mechanism**: Darwin Mode mutates the harness's *own configuration* in an offline sandbox, benchmarks each variant against real SWE-bench Lite tasks, and retains **only changes that measurably improve performance**. The frozen model never changes; the harness architecture evolves. (`references/metaharness/packages/darwin-mode/LEARNINGS.md`, `packages/darwin-mode/bench/results/RESULTS.md`.)

**The application here**: this is the eval-gated version of our learn-loop, aimed at the factory itself — the same principle `meta/evals/factory-change-gate.md` already states ("a change earns its place by a verdict"). The sharpening Darwin adds: promotion should be *automatic-downward* too — a promoted playbook rule whose named falsifier fires gets demoted, not debated. Our gate covers admission; Darwin covers retention.

**What would prove it wrong / revisit**: if sandboxed self-mutation costs more eval-runs than the improvements it retains are worth (their own LEARNINGS.md documents caveats — read before building anything). Revisit at Phase C when `meta/evals/` grows beyond skill cases.

## 3. Capability-per-dollar is a rankable, first-class metric

**The mechanism**: the Cost-Pareto leaderboard ranks harnesses by capability-per-dollar, not raw capability. Flagship result: a cheap-model→frontier **cascade** (GLM escalating to Opus) hit **55.6% on SWE-bench Verified at ~1/10th** the cost of frontier-only. (`references/metaharness/README.md` + `docs/research/cheap-vs-frontier/REPORT.md`; `SUBMISSIONS.md` is the leaderboard's submission guide.)

**The application here**: for a bootstrapped factory, cost-per-run belongs next to accuracy in any product's measurement framework — Muakkil first (its agent runs are the COGS). The cascade shape (cheap model attempts, frontier verifies/rescues) is the concrete lever when an LLM bill becomes real.

**What would prove it wrong / revisit**: cascades add latency and routing complexity — wrong trade for products with tiny volume. Revisit when any product's monthly API spend crosses real money (~$50/mo) or when designing Muakkil's unit economics.

## Credit (port the idea, never the code)

ruvnet (Reuven Cohen) — https://github.com/ruvnet/metaharness, MIT. Mining guide: `references/README.md` § metaharness. Also flagged the same day as **prior art for Muakkil's venture-agent pivot** — that evidence note lives in the Muakkil Phase 0 research folder, outside this repo.
