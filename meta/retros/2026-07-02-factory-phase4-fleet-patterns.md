# 2026-07-02 — Factory · Phase 4: the heavy protocols go fleet-native

> The audit roadmap's final phase: the fan-out-blind → verify-adversarially → judge-synthesis pattern is written once as a playbook and wired into the five protocols whose verdicts gate real decisions.

## Context

- Goal: the factory's multi-perspective protocols (validation, security, review, portfolio) were written for serial execution in one context; when subagent spawning is available they should run as independent, adversarially-verified fleets — faster AND more rigorous.
- Constraint honored: **serial stays first-class.** Every protocol still works in one context (the headless evals run that way); fleet mode is an upgrade, never a requirement, and deliverable formats are identical either way. The devils-advocate eval was re-run after its SKILL.md gained panel mode — still PASS.

## What shipped

- **`factory/playbooks/mvp-stage/fleet-patterns.md`** (playbook #42) — the canonical three moves (fan out blind / refuters default-to-refuted / judge reports disagreement as output), the protocol mapping table, the cost-sanity rule (fleets are for verdicts that gate decisions, not gut checks), and the model-policy tie-in (verifiers/judges on the top tier).
- **`/validate`**: 4 idea-stage agents fan out blind on the raw idea (devils-advocate attacks the unsharpened target — harder and more honest); the kill case AND the strongest FOR evidence each get a refuter; the snapshot reports the agreement/disagreement map.
- **`/security-check`**: categories as blind parallel workers; every would-be BLOCK survives a refuter before it blocks; unverifiable findings reported as *unverified*, never silently dropped.
- **`code-review-and-quality`**: five axes as five blind reviewers; Criticals adversarially verified before they gate; multi-axis agreement = top priority.
- **`devils-advocate` panel mode**: three blind skeptic lenses (market-timing / moat-copyability / founder-fit); agreement = high-confidence kill signals, disagreement = the assumptions to test; solo protocol unchanged.
- **`kill-or-double-down`**: one analyst per product, blind to siblings (anti-halo); every DOUBLE-DOWN challenged against the PMF hard rule.
- **Carried over from Phase 3's revisit list:** `/full-cycle` Step 0 now injects the brain-recall block (defenses first) before the goal is pinned.

## What worked

- Writing the pattern ONCE and referencing it five times — the factory's own "if you orchestrate twice, write it down" rule. Each protocol's wiring is 5-10 lines pointing at the playbook, not a re-explanation.

## Open questions / things to revisit

- Fleet modes are protocol instructions, not yet runtime code — the natural next brick is a `Task[]` fan-out helper in `factory/runtime/` so the headless loop can run a fleet, not just one task. Revisit when a real fleet run happens interactively first.
- No eval yet for "does fleet mode actually get used when it should" — behavioral, hard to floor deterministically; watch the first few gated verdicts.

## Next

→ **The audit roadmap's four phases are shipped (v2.1 → v2.4, one day). Next boundary: run `/learn-loop` v2 for real on this cycle, and the old-vs-new A/B build comparison against `~/Claude/hamzaish-backup`.**
