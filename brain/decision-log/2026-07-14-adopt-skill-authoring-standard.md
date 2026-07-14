# 2026-07-14 — Adopt the skill-authoring standard (from mattpocock/skills) + first context-load audit

**Decision.** From the study of mattpocock/skills (18 promoted skills, active daily-driver repo, last commit 2026-07-13), Hamzaish adopts the *skill-authoring meta-layer* as `factory/playbooks/ai-native-2026/skill-authoring.md`: the context-load vs cognitive-load split (`disable-model-invocation`), leading words, the no-op test, checkable completion criteria, progressive disclosure, and the six named failure modes. The repo is registered as a study reference in `references/`. We do **not** adopt his process skills wholesale — wayfinder, triage/.out-of-scope, CONTEXT.md domain modeling, and five smaller folds are separately proposed and individually decidable.

**Why this is the 100x.** Hamzaish's product is skills. The standard improves every skill written from now on *and* cuts a permanent per-session tax: the first audit (below) measured ~3.8k tokens of skill/command descriptions loaded into every session before any work happens. Meta-leverage compounds where object-level skills only add.

## Audit findings (2026-07-14)

**Measured context load.** 42 `factory/skills/` descriptions ≈ 10,672 chars (~2.7k tokens) + 24 `factory/commands/` descriptions ≈ 4,585 chars (~1.1k tokens) ≈ **~3.8k tokens per session, every session**.

**Duplicate-listing finding (fix separately).** Live sessions list several names twice, some with divergent text (`brain-ask`, `brain-ingest`, `full-cycle`, `auto`, `goal`, `build`, `review`, `ship`, `test`, `setup`) — double context load. Initially misdiagnosed as symlink drift; verified same day that `.claude/commands` → `../factory/commands` and `.claude/skills` → `../factory/skills` are intact directory-level symlinks (`ls -la` follows a dir symlink and lists target contents as plain files — verify wiring with `readlink`/`git ls-files`, never `ls`). One confirmed cause: **name collisions** — `factory/skills/brain-ask/` and `factory/commands/brain-ask.md` both exist, so the name loads as both a skill and a command; the remaining pairs need the same collision check. Fix = merge or rename colliding names + a CI check that fails on a skill/command name collision.

**Applied now (reversible one-liners):**

| Skill | Change | Reason |
|---|---|---|
| `go-live` | `disable-model-invocation: true` | Deliberate walked ritual; `/go-live` in CLAUDE.md's command table is the door. Auto-fire of a 25-min provisioning flow is wrong. |
| `scaffold` | `disable-model-invocation: true` | Creates folders/config; ignition must be deliberate. Routed via `/scaffold` + builder-mode. |

**Flagged, not applied (operator + Codex review):**

- **Merge candidates (duplication):** `auto-orchestrator` skill vs `/auto` command — same job, two descriptions loaded; `ideate` vs `idea-refine` — overlapping triggers, `idea-refine`'s description even names "ideate" as its trigger.
- **Prune candidates (longest descriptions, rewrite to ≤~280 chars keeping one trigger per branch + negative routing):** `pseo-at-scale` (~600 chars), `launch-gotchas` (~520), `web-launch` (~450), `go-live` (~350, now user-invoked so its description no longer costs context), `tidy`, `competitor-research`.
- **Borderline invocation conversions (kept model-invoked for their natural-language triggers):** `portfolio-pulse`/`product-pulse` ("where should I focus today"), `kill-or-keep` ("should I kill X?"), `launch-plan`, `validate`, `brand-assets` (composed by launch flows — must stay model-reachable).

**Wrong if.** (a) User-invoked conversions cause missed invocations in practice — the operator types "take X live" and the agent no longer finds the flow because CLAUDE.md routing didn't catch it; then revert the frontmatter (one line) and record the miss. (b) The pruned descriptions lose real trigger coverage — measurable as wrong-skill or no-skill routing in sessions; the audit table above preserves originals in git history.

**Revisit trigger.** Next quarterly kill-or-keep, or the first observed invocation miss on a converted skill; the symlink-drift repair and description rewrites land as their own follow-ups.
