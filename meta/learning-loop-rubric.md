# Learning-Loop Rubric — scored, self-evolving improvement

> The existing loop (`brain/learnings/` → `factory/playbooks/` / `brain/anti-patterns/`, retros in `meta/retros/`, quarterly `/kill-or-keep`) captures *everything*. This rubric adds a **forcing function for what to promote**: score each candidate learning, promote only the few that clear the bar, and later **check whether the promotion actually paid off**. It turns "we wrote it down" into "the factory got measurably harder to break." See `meta/factory-improving-factory.md` for the underlying loop and `/learn-loop` for the command that runs this.

Quality over volume. A cycle that promotes **one** learning that durably removes a class of failure beats a cycle that files ten notes nobody acts on.

> **Before scoring, check eligibility.** A candidate must first clear the [Admission Policy](admission-policy.md): our own products/learnings are eligible only once **dogfooded** (we ran it and it worked for us — shipping a repo isn't enough); community contributions only once **verified-shipped + evidence-backed**. This rubric decides what to *promote*; the policy decides what's even *eligible*.

---

## 1. Major-cycle triggers — when the loop runs

`/learn-loop` runs at a **major-cycle boundary**, not every session. A boundary is any of:

- **A product crosses a stage gate** — Ideate → MVP → Launch → Sell → Scale → Kill.
- **A product ships or is killed** — a real artifact users can touch, or a sunset.
- **A session/sprint with notable friction or a notable win** — something broke badly, stalled work, or a pattern worked surprisingly well.
- **A change to the factory itself** — a new/changed skill, agent, command, hook, or playbook.

Between boundaries you still append raw notes to `brain/learnings/YYYY-MM-DD.md` as always — `/learn-loop` is the periodic pass that *scores and promotes* the accumulated candidates.

---

## 2. Scoring — five axes, weighted composite

Score each candidate learning **1–5** on each axis (1 = negligible, 3 = moderate, 5 = decisive). Two axes carry double weight because the factory exists to ship fast and ship well.

| Axis | What it measures | Weight |
|---|---|---|
| **Speed impact** | How much promoting this speeds up future builds (removes a stall, a re-derivation, a dead end). | **×2** |
| **Build-quality impact** | How much it improves correctness / reliability / security of what we ship. | **×2** |
| **Recurrence** | How often the situation that triggered this will recur (1 = one-off; 5 = every turn / every product). | ×1 |
| **Generalizability** | How broadly it applies (1 = this one product; 5 = every product + any fork of Hamzaish). | ×1 |
| **Confidence** | How sure we are the lesson is real and the fix is right (1 = hunch; 5 = root-caused + verified). | ×1 |

**Composite = (Speed × 2) + (Build-quality × 2) + Recurrence + Generalizability + Confidence**

Range: **7 (min) → 35 (max)**.

### Promotion threshold

- **Composite ≥ 24 / 35** → eligible for promotion.
- Of the eligible, **promote at most the top ~3 per cycle.** If more than 3 clear the bar, promote the 3 highest composites and leave the rest logged (they remain eligible next cycle). This cap is the quality gate — it forces a choice instead of a dumping ground.
- **Confidence acts as a soft gate:** never promote a learning scored **Confidence = 1** even if the weighted total clears 24 — log it and raise confidence by verifying first.

---

## 3. Promotion — turn a learning into a guardrail

A **promoted** learning must become something the next build *can't* skip past. Pick the home that makes the lesson load-bearing:

| Promotion target | Use when… |
|---|---|
| **Guardrail in a skill / agent** (`factory/skills/<slug>/SKILL.md`, `factory/agents/.../SKILL.md`) | The lesson should change how a specific capability behaves. |
| **A playbook step** (`factory/playbooks/<stage>/…`) | The lesson is a reusable how-to / sequence for a stage. |
| **An anti-pattern entry** (`brain/anti-patterns/<slug>.md`) | The lesson is a thing-not-to-do — so the next session re-reads it before repeating. |
| **A routing rule** (`CLAUDE.md` / `AGENTS.md`) | The lesson is "when X, do Y" that must be seen every session. |

**Below-threshold learnings are NOT promoted.** They stay in `brain/learnings/` as history only — searchable via `/brain-ask`, available to re-score next cycle if recurrence climbs.

Every promotion records a **predicted gain** (the speed/quality improvement it should deliver) and a **feedback-check date** — that's what makes the loop self-correcting.

---

## 4. Feedback — `/kill-or-keep` re-checks promotions

The loop closes at the quarterly `/kill-or-keep` (which already reviews the factory itself — see `meta/factory-improving-factory.md` §Quarterly). For each promoted learning whose feedback-check date has passed:

- **Did it deliver the predicted gain?** (Did the stall stop recurring? Did the failure class disappear? Did builds get faster/safer in the way predicted?)
- **Delivered** → keep the guardrail; mark `VALIDATED` with the evidence.
- **Didn't deliver** → **sunset** it: remove or soften the guardrail, mark the learning `SUNSET` with why. A guardrail that costs friction without paying for it is bloat, and bloat slows every session.

This prevents the promoted set from ossifying into cargo-cult rules.

---

## 5. Scored-learning entry format (in `brain/learnings/`)

Scored entries live in `brain/learnings/` (append to the dated file, or a `YYYY-MM-DD-<slug>.md` file for a standalone). Each uses this block so `/kill-or-keep` can find and re-check it:

```markdown
### [SCORED] <short title>

- **Cycle trigger:** <which major-cycle trigger fired>
- **What happened:** <1–2 sentences, honest>
- **Scores:** Speed <n>×2=<n> · Build-quality <n>×2=<n> · Recurrence <n> · Generalizability <n> · Confidence <n> → **Composite <n>/35**
- **Status:** PROMOTED → <target path> | LOGGED (history only) | VALIDATED | SUNSET
- **Promotion target:** <file/guardrail it became, or "n/a — below threshold">
- **Predicted gain:** <the speed/quality improvement it should deliver>
- **Feedback check:** <date /kill-or-keep should re-verify> — <verdict once checked>
```

`/learn-loop` writes these; `/kill-or-keep` updates `Status` + `Feedback check` later. Re-run `bun brain/ingest.ts` after writing so the entries are searchable.
