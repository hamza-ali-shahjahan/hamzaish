# 2026-06-13 — spec-lock: pilot before build (decision)

**Context.** Operator explored "build a new programming language optimized for AI-first coding / 1000x error reduction." Settled: no new language — ecosystem gravity + LLM training data make new syntax strictly worse for agent coding. The durable idea underneath: **specs as first-class, machine-checkable contracts** (`SPEC.md` per slice: contracts / invariants / forbidden states) compiled into agent-blind checks feeding the existing 4-outcome verdict engine (PASS / FAIL_BUILDABLE / GAP / UNCERTAIN, `meta/evals`).

**Decision: pilot manually, don't build the skill yet.**

- A spec→test compiler is a product-sized commitment wearing a skill costume — building it now is the meta-work spiral (factory rule: ship products through the factory before polishing it).
- The spec-format layer is commoditizing (GitHub Spec Kit, Amazon Kiro). The non-commoditizing moat is the closed loop we already own: agent-blind verify → verdict → learn-loop promotion. Spec-lock, if built, is a thin input layer on that loop — not a new system.

**The pilot (next real Patently slice — it already has the citation-contract validator):**

1. Hand-write one `SPEC.md` (contracts / invariants / forbidden states) before the slice is built.
2. Generate checks from it in a separate session the building agent never sees.
3. Run one full cycle. Generated checks live **alongside the slice**, not in a central corpus — intent must travel with the thing it constrains.

**Metric (defined before the pilot, per measurement-before-launch):** did the spec catch a drift or architectural error the current flow would have missed? Count catches per cycle + rework avoided. "1000x" is a hypothesis, never copy (principle #13).

**Promotion gate:** log the pilot result here; let `/learn-loop` score it at the next major-cycle boundary. ≥24/35 → build the skill thin on `meta/evals`. Below → LOGGED, history only.

**Long-range, if it proves out:** the spec→verify→verdict loop packaged for other people's agents is a candidate first standalone product of the factory — but it earns that by catching real errors in real products first.

**Status:** OPEN — pilot not yet run. Revisit trigger: next Patently build slice, or next `/learn-loop` boundary, whichever comes first.
