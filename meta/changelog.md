# Hamzaish Changelog

Append-only. Newest first. Each entry: date · version · summary · what changed · why · what to revisit.

---

## 2026-06-02 — v1.9 · License changed MIT → AGPL-3.0 + dual-license path

**What changed**

- **`LICENSE` swapped MIT → AGPL-3.0** (canonical 661-line GNU text, fetched byte-exact from gnu.org — not retyped). GitHub will now detect the repo as AGPL-3.0.
- **README `## License` section added** — plain-English AGPL explanation + the commercial-license offer (maintainer reserves the right to license under other terms).
- **`docs/contributing.md` — "Licensing of contributions" section** — the inbound license grant: contributors license under AGPL AND grant the maintainer the right to relicense (incl. commercial). This is what keeps the dual-licensing model viable; without it, accepting outside PRs would lock the project out of commercial licensing. It's an inbound grant, not a copyright assignment — contributors keep their copyright.

**Why**

The operator asked whether the license protected future monetization. It didn't — **MIT explicitly permits anyone to take Hamzaish, build a closed commercial product or hosted service on it, and owe nothing** beyond keeping a copyright notice in a file. That's the exact "steal it and sell it" case the operator wanted to prevent.

After laying out three options (MIT = max openness/zero protection; AGPL = open + chargeable; BSL = max protection / not-quite-open-source), the operator chose **AGPL** — the balanced middle:
- Solo builders use it freely (the mission)
- Competitors can't quietly turn it into a closed SaaS without either open-sourcing their fork OR buying a commercial license (the protection)
- The maintainer's monetization door = free AGPL community + paid commercial licenses (open-core model)

**No urgency was involved** — the repo is private, so today it's effectively all-rights-reserved regardless of the LICENSE file. The license only "activates" as a grant when the repo flips public. This change just ensures the flip happens on the right license.

**What to revisit**

- Before the public flip: confirm the commercial-license contact path (email is fine for v1; a real commercial-license template only needed once someone actually asks).
- If significant outside code contributions start arriving, consider a lightweight signed CLA or DCO sign-off to make the inbound grant airtight. The contributing.md grant covers it for now.
- Issue #2 (launch-readiness tracker): license item now resolved → AGPL-3.0.

---

## 2026-06-02 — v1.8 · Self-evolution arc captured (vision + plan, no build)

**What changed** (planning only — no code, no structural change)

- **`meta/SELF-EVOLUTION.md`** — the plain-language north-star story. The factory's journey from *improving-by-hand* → *improving-itself* → *many-builders-improving-together*, framed as three movements (Selection → Heredity → Coordination). Written to be re-readable and handed to other builders. This is the map above the build plans.
- **`brain/knowledge/2026-06-02-self-evolving-upgrade-brief.md`** — the operator's external upgrade brief, captured + translated to Hamzaish's actual shape (not implemented verbatim). Searchable in the brain, credited to source.
- **`meta/evals/PLAN.md` upgraded** — Phase D is now explicitly *Movement 1 (Selection)*. Absorbed four ideas from the brief: four-outcome verdict (PASS / FAIL_BUILDABLE / GAP / UNCERTAIN) instead of pass/fail; agent-blind separation (builder can't see its own eval); executable-criterion-or-GAP at authoring time; critic-as-gate-not-oracle. Added the "born inside Muakkil" sequencing (the orchestrator's 10-charge eval is brick #1 of the harness — no Muakkil-vs-Phase-D tradeoff).

**Why**

The operator brought a sharp external brief on self-evolving agentic systems. Rather than force-fit its directory religion or build it now, we (a) captured it, (b) translated its best 5 ideas to Hamzaish's broader shape, (c) wrote the vision story while the framework was fresh. The detailed eval-harness build waits until post-Muakkil; the *arc* is captured now because it guides every future decision.

**The reframe that matters**: Hamzaish already self-evolves — variation (builds/learnings) ✅, heredity (`learnings` → `playbooks`, manual) ⚠️, selection (an honest judge) ❌. The whole journey reduces to one move: replace eyeball-selection with an agent-blind verdict. That verdict is Phase D, born inside Muakkil.

**Key divergences from the brief** (documented in the knowledge doc)
- The brief is codegen-loop-centric; Hamzaish also does strategy/validation/GTM where the gate is a human reading numbers. Mark which lanes auto-gate.
- No full directory overhaul — layer concepts onto `brain/ factory/ products/ meta/`.
- "Run Formpad unattended" → wrong target; first self-evolving product needs a rich scenario corpus (Muakkil post-ship, or Scope Intelligence's 15 slices).
- `vkf` → renamed `frozen/` / goals are `brain/operating-principles.md` (de facto frozen tier).

**What to revisit**
- After Muakkil ships: extract its orchestrator eval into `meta/evals/` as the harness seed (Movement 1 build).
- `/spec` upgrade to emit executable scenarios — the bridge that makes specs the compounding asset. Scope when Movement 1 is real.
- Which lanes of the factory auto-gate vs stay human-judged — decide before Movement 2.

---

## 2026-06-02 — v1.7 · Pre-launch hygiene: PDF removed, community flow live, tracker created

**What changed**

- **Removed `factory/playbooks/founders-playbook-source.pdf`** — Anthropic's
  PDF, not redistributable. Distillation at
  `factory/playbooks/ai-native-2026/founders-playbook-distilled.md` (~165
  lines) keeps the value. One less question to carry into a public flip.
- **`products/_community/` folder created** with a README explaining the
  purpose, the skeleton, and what does/doesn't belong there. Empty for now;
  populated by community PRs once the repo flips public.
- **`docs/contributing.md` extended** with a new section "Add YOUR product as
  a community example" — explains the fork → skeleton → proof-of-shipping →
  PR → maintainer-verifies → merge flow. Covers both full-portfolio and
  anonymized case-study submission patterns + what gets rejected.
- **GitHub issue #2 opened** as the public-launch-readiness tracker. Lives
  on the repo (history, notifications, native to workflow) but NOT in the
  repo (won't accidentally ship as canonical content). Closes at v2.0.

**Why**

User flagged that v1.5 made Hamzaish *technically launchable* but not
*worth launching* (no narrative). After agreeing on the 5 missing gates:

- (1) Proof story — user is updating their portfolio products to credit
  Hamzaish; Muakkil ships soon
- (2) Eval harness — Phase D plan committed, build sprint queued
- (3) First-30-min UX — sub-agent + fresh-clone + actual-stranger
  sequence planned for v1.9
- (4) Community contribution flow — set up TODAY (this entry)
- (5) Pre-flip scrub — PDF removed TODAY; remaining items in the
  tracker issue

The tracker as a GitHub issue (not a repo file) was a user instinct —
prevents the tracker from accidentally surviving the public flip as
clutter. The issue auto-becomes public when the repo flips, which is
fine — it'll be mostly checkboxes ticked at that point, and serves as
a "here's the journey" artifact for the launch post.

**What to revisit**

- Eval harness build sprint — next major sprint after Muakkil's
  buildathon retro
- Sub-agent UX simulation — can do anytime; recommend immediately after
  Phase D ships so we test against the eval-harness-equipped factory
- Community PR format — wait for first PR to surface, then refine the
  template if needed (don't over-design)

---

## 2026-06-02 — v1.4 · Global auto-commit-push + SessionStart auto-pull + opt-out markers

**What changed**

- **`scripts/auto-commit.sh` generalized** — now works in any git repo (discovers cwd's repo via `git rev-parse --show-toplevel`), not Hamzaish-specific. Added `git push --force-with-lease` after commit (was commit-only before). All checks fail-soft.
- **`scripts/auto-pull-rebase.sh` (new)** — SessionStart companion. When Claude Code opens in any repo with an upstream and a clean tree, pulls + rebases so cross-machine workflows stay sane.
- **Global hooks installed** in `~/.claude/settings.json` (preserves existing `theme` + `attribution`):
  - Stop hook → `auto-commit.sh`
  - SessionStart hook → `auto-pull-rebase.sh`
- **Hamzaish-specific Stop hook removed** — `Hamzaish/.claude/settings.json` deleted. Global hook now handles Hamzaish too (and every other repo). No more duplicate firing.
- **Three opt-out markers** documented:
  - `.no-auto-commit` — full opt-out (no commit / no push / no auto-pull)
  - `.no-auto-push` — local commits OK, no push
  - `.no-auto-pull` — commit + push, but skip auto-pull on session start
- **Muakkil opted out** via `.no-auto-commit` marker — Lovable round-trip discipline preserved. Many untracked pending-decision files (`CLAUDE.md`, `.claude/`, `docs/`) protected from `git add -A` clobber. Marker pattern `.no-auto-*` added to Muakkil's `.gitignore` so it stays operator-local.
- **CLAUDE.md updated**: rewrote the "Auto-commit safety net" section to reflect global behavior, added cross-machine rule (SessionStart handles it now, but document the failure mode for awareness), version bumped to v1.4.

**Why**

User asked: "increase the frequency with which you commit to GitHub" + "add it to hamzaish as a core and also general for every session/product we build on this machine."

Two things to do:
1. **Push every commit, not just save locally.** Previous v1.3 system auto-committed but never pushed. Switching machines mid-session = lost work. v1.4 pushes every wip commit immediately. `--force-with-lease` for amend safety.
2. **Make it global.** Previously only Hamzaish had the hook. Now every git repo on this machine has the same safety net, with per-repo opt-out for the edge cases (Lovable, etc.).

**Design choices**

- **`--force-with-lease`** over `--force`: safe push that fails loudly if remote has advanced. Right failure mode.
- **Opt-out by marker file** instead of allowlist: lowest friction. New repos get safety by default; the few exceptions document themselves.
- **Hamzaish owns the scripts** (canonical home in `scripts/`), global settings only points to them. So updates to the script logic are version-controlled in this repo, picked up automatically by every other Claude Code session.
- **Muakkil = `.no-auto-commit`** (full opt-out), not `.no-auto-push`: because Muakkil has untracked pending-decision files. `git add -A` would commit them. Full opt-out preserves the user's explicit-commit discipline there.

**What to revisit**

- After ~1 week of usage: are `wip(auto)` commits actually getting squashed before pushes to public branches? If not, formalize a `/squash-wip` skill that runs `git rebase -i` and auto-marks all wip(auto) commits as fixups.
- Other Lovable-style projects: do any other registered products have similar bidirectional-sync constraints? Audit on next `/portfolio-pulse`.
- SessionStart hook on shared machines: if multiple users ever share this machine, the `git pull --rebase` might surface their commits unexpectedly. Single-user assumption is fine for now.

---

## 2026-05-31 — v1.3 · ai-native-cms registered + cross-product playbooks + auto-commit safety

**What changed**

- **`ai-native-cms` upgraded from `slot_reserved` → `mvp · active · validation`** — full registration following the discipline: `product.config.json`, `README.md`, `status.md` (with north-star + activation + retention + false-positive shape), `scope.md` (what it does AND deliberately doesn't), `decisions/README.md` with 2 ADRs (validation-before-build, OSS-first-defer-hosted). The underlying product `wp-to-astro@0.6.1` is live on npm + public GitHub.
- **`brain/learnings/2026-05-30.md`** filed with 3 cross-product learnings from the wp-to-astro session:
  1. Output validation for code-gen tools (the `astro check` lying / 138 green tests + broken output case)
  2. OSS publishing gotchas (GitHub email privacy, npm `bin` path normalization, 2FA-with-security-key, `pnpm publish` quirk, can't-republish-same-version, post-publish-smoke is mandatory)
  3. Validate-before-build — discipline violation admitted in writing
- **Two playbooks promoted** to `factory/playbooks/launch-stage/` so the next product whose output is code OR that ships to a registry inherits the rules:
  - `output-validation-for-codegen-tools.md`
  - `oss-publishing-checklist.md`
- **`brain/anti-patterns/accidental-public-repo.md`** captures the structural rule from the `agent-skills` incident — check filesystem + existing remotes before creating any new repo of a name that already means something
- **`meta/retros/2026-05-30-wp-to-astro-shipping.md`** — canonical sprint retro from the template. The discipline-violation pattern + the post-publish reality check are the load-bearing surprises.
- **`scripts/sync-product-refs.ts` re-run** — `.claude/HAMZAISH.md` now installed in `~/Claude/AI Native CMS/` (was previously skipped while ai-native-cms was slot_reserved)
- **Auto-commit safety on this machine**:
  - `scripts/auto-commit.sh` — checks for rebase/merge/cherry-pick state, only commits if working tree is actually dirty, tags commits as `wip(auto): YYYY-MM-DDTHH:MM:SS`
  - `.claude/settings.json` — Stop hook wires the script to fire at end of every Claude turn (max 1 commit per turn)
  - `factory/commands/checkpoint.md` — manual `/checkpoint <message>` for named save points
  - CLAUDE.md amended with a "before destructive edits" discipline note
- **Brain re-ingested** — 136 → 145 documents (new playbooks, retro, anti-pattern, ai-native-cms files, this changelog entry)

**Why**
- The wp-to-astro session shipped a real OSS product (npm + GitHub + 138 tests + real-world smoke) but also surfaced 3 high-signal cross-product patterns that would be lost if they stayed in the daily learnings file. Playbooks are where the factory makes them inheritable.
- The `agent-skills` accidental-public-repo near-miss is structural, not a one-off — it belongs in anti-patterns where future Hamzaish reads it before creating any new repo.
- The user has been moving between machines and rewriting history; auto-commit before every destructive edit (via Stop hook) means there's always a recoverable snapshot. Tier 1 is automatic; `/checkpoint` is manual for named milestones.

**What worked**
- The factory ate its own dog food. The discipline-violation rule fired AGAINST the build itself. ai-native-cms is now in validation sprint instead of "another half-built MVP." That's the rule paying its rent.
- Real-world smoke testing twice (canonical test data + Docker live WP) caught the `slug` reserved-field bug that 138 unit tests missed. The playbook that came out of that — "run the output in a real consumer environment, not just lint it" — is the most important post-Phase-A learning.

**What didn't / friction**
- Captured in retro + anti-pattern entries.

**What to revisit**
- Muakkil's buildathon — the `products/muakkil/decisions/` folder is empty and `status.md` was last touched May 26. The buildathon either got displaced by wp-to-astro, or it happened on the Muakkil side and the session log didn't sync back to the factory. Either way, that's the next question to resolve.
- The `agent-skills` repo is private again but exists separately at `github.com/hamza-ali-shahjahan/agent-skills` — either fold its content into Hamzaish or keep it as a separate-but-private cross-project skills lib. Decide before next public push.
- Auto-commit hook generates `wip(auto):` commits — squash before pushing (the changelog's own commits stay clean because we explicitly write a real message; auto-commits cover the in-between work).

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
