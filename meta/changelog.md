# Hamzaish Changelog

Append-only. Newest first. Each entry: date · version · summary · what changed · why · what to revisit.

---

## 2026-05-28 — v1.2 · Portfolio expansion + global commands + git repo

**What changed**
- **2 new real products registered**:
  - `scope-intelligence` — Next.js 16 + Drizzle + Clerk SaaS for small agencies (~/Claude/Scope Intelligence). 15 vertical slices spec'd, MVP stage.
  - `dnsdoctor` — Next.js 15 DNS toolkit (~/Claude/DNSChecker; product brand "DNSDoctor"). Free public tool v1; monitoring paid tier deferred. MVP stage.
- **1 reserved slot**: `ai-native-cms` (folder exists at ~/Claude/AI Native CMS but empty; Hamza populating later)
- **Global slash commands** installed at `~/.claude/commands/` (symlinks → `factory/commands/`):
  - `/work-on <slug>`, `/portfolio-pulse`, `/brain-ask`, `/brain-ingest`
  - All four updated to use absolute Hamzaish paths so they fire from any cwd
- **Per-product `.claude/HAMZAISH.md`** written into all 11 active product code folders via `scripts/sync-product-refs.ts` (idempotent generator; auto-skips slot_reserved). Includes Muakkil, Scope Intelligence, DNSDoctor, copyright, linkedup, hamza-health, hamzaos, ai-growth-engine (Systems Agent), tasfort, ventbox (App Clone), one-dollar-factory ($1F&S).
- **Portfolio snapshot expanded** to 14 products (8 MVP, 3 active idea, 3 reserved slots)
- **Brain re-ingested**: 131 documents (was 119)
- **Git repo**: `git init` + `.gitignore` (excludes brain.db, references/{gbrain,hermes-agent,openclaw}/, node_modules, build outputs, env files) + MIT LICENSE + initial commit. Pushed to `github.com/hamza-ali-shahjahan/hamzaish` (private). Existing empty placeholder repo reused — old description preserved per user discretion.
- **`scripts/install-references.sh`** — re-clone the three reference repos after fresh checkout
- **`scripts/sync-product-refs.ts`** — regenerate per-product HAMZAISH.md files

**Why**
- User asked to apply Hamzaish to all real products and create a repo. Real products only (no overreach into "Agents and Skills" or "Best Practices & Learnings" folders that look like internal assets — flagged for user review).
- Global commands needed for the "call hamzaish from any product workspace" use case
- Git repo: private for now per my own recommendation; flip to public after Muakkil's buildathon retro produces the headline story

**Inventory after this pass**
- 14 registered products (11 active, 3 slot-reserved)
- 4 global slash commands working from any directory
- 11 per-product HAMZAISH.md reference files
- 131 documents in the brain
- Git repo at `github.com/hamza-ali-shahjahan/hamzaish` (private)
- 387 files / 20,175 LOC in the initial commit
- References (gbrain/hermes-agent/openclaw) intentionally NOT committed (474MB — re-clone via `scripts/install-references.sh`)

**Recommended next steps for going public**
- Phase B: Muakkil dogfood → real retro evidence
- Genericize product configs into an `examples/` walkthrough (currently personal paths baked in)
- Write `AGENTS.md`, `INSTALL_FOR_AGENTS.md`, `llms.txt`, `CONTRIBUTING.md` (gbrain pattern)
- Strip absolute `/Users/hamza/Claude/` paths from `factory/commands/` — make them relative or env-driven
- Add eval harness in `meta/evals/` with canonical cases per skill
- Flip repo to public

**What to revisit**
- "Agents and Skills" folder at ~/Claude/Agents and Skills — contains an OKR Orchestrator system. Internal asset, sub-product, or product candidate? User decision.
- "Best Practices & Learnings" folder at ~/Claude/Best Practices & Learnings — empty. Migrate to brain/knowledge/ or delete?
- "HTL" folder at ~/Claude/HTL — empty, last modified May 14. Delete?
- Description on the GitHub repo is the old poetic placeholder ("Agent looking for other agent-forms to befriend...") — update via `gh repo edit hamzaish --description "..."` when ready

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
