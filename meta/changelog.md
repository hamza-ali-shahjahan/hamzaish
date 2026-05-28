# Hamzaish Changelog

Append-only. Newest first. Each entry: date · version · summary · what changed · why · what to revisit.

---

## 2026-05-26 — v1.1 · Memory layer + entry-point wiring

**What changed**
- **Built the brain memory layer** (Phase C scope brought forward to A.5):
  - `brain/schema.sql` — SQLite schema with FTS5 documents index, stub entities/edges tables for Phase C, ingest_runs audit log
  - `brain/ingest.ts` — Bun script that scans `brain/`, `meta/`, `factory/playbooks/skills/agents/commands/workflows/`, `stack/`, root MD, and `products/*/*` (config + README + status + decisions + launch + analytics + interviews). Incremental, change-detected by mtime + content hash. ~15ms for 123 docs incremental, ~50ms full rebuild.
  - `brain/ask.ts` — FTS5 search with BM25 ranking, snippet highlights, `--product`, `--source`, `--limit`, `--json` flags
  - `brain/README.md` — explains the layer
  - `brain/.gitignore` — brain.db is derived, not tracked
- **Wired slash commands** (`factory/commands/*.md`, also discoverable via `.claude/commands/` symlink):
  - `/brain-ask` — query the brain
  - `/brain-ingest` — refresh the index
  - `/work-on <slug>` — enter a product workspace with full context loaded (`factory/workflows/work-on-product.md` is the detailed protocol)
  - `/portfolio-pulse [hours]` — all-products snapshot with prioritization, tunes to available hours
- **Fixed broken paths in all agents** — global find-replace `knowledge-base/` → `factory/playbooks/` across `factory/agents/` (MVP, launch, scale stages all had stale refs)
- **Verified Founder's Playbook distillation already exists** at `factory/playbooks/ai-native-2026/founders-playbook-distilled.md` (~165 lines, production-quality). Routing in CLAUDE.md was never actually broken.
- **Retro template** at `meta/retros/_template.md` — canonical shape with closing-loop checklist that updates brain/learnings, playbooks, anti-patterns, decision-log, changelog, ingest
- **`.claude/commands/` and `.claude/skills/`** symlinked to their `factory/` canonical homes so Claude Code auto-discovers everything
- **Audited 8 carried-over skills** (verdict: 5 B-grade ready, 2 C-grade need rework — `kill-or-keep`, `keyword-research`. Both deferred to a focused fix-up after Muakkil)
- **Audited 5 MVP-stage agents** (all B-grade, only fix needed was path updates)

**Why**
- The user pushed back: "make it the best of everything first, then apply to Muakkil." I countered that "build everything before any pressure" risks the wrong shape — and proposed A.5 as the surgical foundational pass. User approved A.5 as scoped. This entry is that pass.
- Memory was the biggest gap. Without a real index, "self-improving" was a rule, not a capability. FTS5 was the right first step — vectors are Phase C once we know what semantic queries actually look like.
- The `/work-on` entry point was missing: without it, "how do I drive Muakkil through Hamzaish" had no concrete answer.

**Inventory after this pass**
- 123 documents indexed (32 agents · 32 playbooks · 12 product docs · 11 product configs · 9 skills · 5 meta · 5 stack · 4 brain root · 4 commands · 3 root · 1 each of anti-patterns/identity/knowledge/learnings/workflows/portfolio)
- 4 working slash commands
- 1 new workflow
- ~600 lines of TS for the memory layer

**What to revisit**
- After Muakkil's buildathon retro: which brain queries actually got asked? Which skills/agents fired? Patch the laggards.
- C-grade skills (`kill-or-keep`, `keyword-research`) — rewrite during the post-buildathon retro window
- Phase C trigger: when does FTS5 start missing the semantic queries we want? At that point: add Voyage/OpenAI embeddings to a `vectors` table, layer in RRF, expose `--semantic` flag
- Phase D trigger: when does the user notice "Hamzaish should have remembered X but didn't"? At that point: wire a `Stop` hook that auto-appends to `brain/learnings/`

---

## 2026-05-26 — v1.0 · Layered architecture + Muakkil registration

**What changed**
- Created `/Users/hamza/Claude/Hamzaish/` (new root, dropped the "AI Cofounder" suffix from folder name)
- Archived the prior folder `Hamzaish the AI Cofounder/` verbatim at `_archive/v0/`
- Restructured contents into four layers: `brain/`, `factory/`, `products/`, `meta/` (plus `references/`, `stack/`, `templates/`, `dashboard/`)
- Renamed `knowledge-base/` → `factory/playbooks/` (cleaner separation: knowledge vs. how-to)
- Moved `agents/`, `skills/`, `workflows/` under `factory/`
- Extended `brain/` with `identity/`, `learnings/`, `anti-patterns/`, `knowledge/` subfolders
- Cloned three reference repos into `references/` (shallow): gbrain, hermes-agent, openclaw
- Registered **Muakkil** as product #11 (`products/muakkil/`) with config + status + symlink to `~/Claude/Muakkil`
- Rewrote `CLAUDE.md`, `README.md`, created `MEMORY.md` to reflect the new layered architecture and self-improvement loop
- Wrote `references/README.md` documenting the composition story (openclaw=channels, hermes=runtime, gbrain=brain) and the mining plan

**Why**
- Old folder was 70% of v1 but pre-dated Muakkil (started May 23 vs. folder last touched May 19)
- Goal is a full-blown brain+orchestrator that learns and grows — needed a `meta/` layer to close the self-improvement loop
- Muakkil's buildathon this weekend is the proof — Hamzaish needs to ship it end-to-end

**What to revisit**
- After Muakkil's buildathon: did `/hamzaish` (alias of `/full-cycle`) actually drive the sprint end-to-end? If yes, ship retro; if no, fix the factory.
- Phase C: decide whether to wrap gbrain directly (run it as a sibling process queried via HTTP/MCP) or implement our own brain layer in `brain/`
- Phase E: revisit openclaw for cross-channel GTM/outbound

---
