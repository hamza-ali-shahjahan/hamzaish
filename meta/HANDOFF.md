# Session Handoff — paste this to start a fresh Hamzaish session

> Open the new Claude Code session **in `~/Claude/Hamzaish`**, then paste the block below. Update this file at the end of any major session so the next one starts clean.

---

```
Continue building Hamzaish — my AI Co-builder & Startup OS at ~/Claude/Hamzaish.

ORIENT FIRST (read in this order, then summarize back what you understand):
1. AGENTS.md + CLAUDE.md — operating instructions + hard rules
2. meta/changelog.md (top 3 entries) — recent state
3. meta/SELF-EVOLUTION.md — the north-star arc (Selection → Heredity → Coordination)
4. brain/operating-principles.md — the rules I don't violate
5. products/_portfolio.md — the registered products
6. brain/identity/operator.local.md — how I work
7. brain/learnings/ (latest dated files) — recent lessons

CURRENT STATE:
- Private repo, AGPL-3.0, in sync on github.com/hamza-ali-shahjahan/hamzaish
- Brain ~188 docs · 14 products · 9 skills · 32 agents · 34 playbooks
- Global commands work from any folder: /work-on, /portfolio-pulse, /brain-ask, /brain-ingest
- Auto-commit+push hook fires every turn; .local/.example split keeps personal data out of the repo
- Onboarding: `bun run setup` (one command) + docs/your-first-product.md (10-min walkthrough)
- Maturity: "Closed" rung — variation ✅ + heredity ✅ (manual). Selection (evals) NOT built yet.

FIRST: run `git status`. If anything's pending, review + commit with a real message.

WHAT'S NEXT (propose a plan, then let me pick):
1. Ship Muakkil — the proof story. Its orchestrator's 10-charge eval = brick #1 of the harness.
2. Movement 1 / Phase D — build the eval harness (Selection): 4-outcome verdict (PASS/FAIL_BUILDABLE/
   GAP/UNCERTAIN), agent-blind separation, executable-criteria-at-decomposition. See meta/evals/PLAN.md.
3. Movement 2 — proposals/ queue: automate the learnings→guardrails loop I run by hand.
4. The headless runtime — a `claude -p` / Agent SDK loop that cranks generate→verify→route unattended.
   This is the actual self-evolution runtime (see brain/knowledge/2026-06-04-interactive-vs-headless-*).
5. Readability for a true public distribution — the README top + 10-min walkthrough + stranger test
   are DONE. Remaining first-timer item: decide whether the public repo ships with my real products
   visible, or a genericized examples/ set. (Launch-readiness tracker = GitHub issue #2, gate #3/#5.)
6. Public flip → v2.0 (squash to a clean release commit, then flip).

HOW I WORK: move fast, lead with the answer, push back on bad ideas with evidence, approval gates
before big changes, honesty over flattery, never overclaim. Don't push anything sensitive to git
without my go. Use plan mode for anything multi-step.

Start by orienting (steps 1–7), confirm the state back to me, then propose what we tackle first.
```

---

## Notes for whoever updates this file

- Keep the prompt block self-contained (someone pastes it cold).
- When a "what's next" item ships, move it out and pull the next priority in.
- The single most important next domino is **Muakkil** — it's both the proof story and where the eval harness (Movement 1) gets born.
