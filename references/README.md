# references/

Third-party repos cloned for **study**, not runtime use. Do not `import` from these. Do not symlink their code into `factory/`. Mine ideas, copy patterns, port small pieces with attribution.

If you need to update a clone:
```
cd references/<name> && git fetch --depth=1 && git reset --hard origin/HEAD
```

---

## The big realization

These three projects **compose by design**. Garry Tan built gbrain as the brain layer for his own openclaw + hermes-agent deployment.

| Layer | What it does | Project |
|---|---|---|
| **Channels** | Where users talk to the agent (WhatsApp, Telegram, Slack, iMessage, voice, …) | openclaw |
| **Agent runtime** | The thing that thinks, acts, learns, self-improves | hermes-agent |
| **Brain / memory** | Knowledge graph + hybrid retrieval + synthesis with citations | gbrain |

For Hamzaish:
- **Phase A–B**: Claude Code is our agent runtime + channel (terminal). We don't need hermes or openclaw yet.
- **Phase C**: mine gbrain's patterns to build our own brain layer (or wrap gbrain directly if it fits).
- **Phase E**: revisit openclaw when we need cross-channel GTM (Slack/Discord outreach, voice charges, etc.).
- **Hermes**: read its self-improvement loop pattern for our `meta/` layer. Stay Claude-Code-native; don't port the Python.

---

## gbrain — github.com/garrytan/gbrain

**What it is**: A personal/team brain that ingests notes, meetings, emails, tweets, and ideas; auto-extracts entities and typed edges (`works_at`, `attended`, `invested_in`, …); answers questions with synthesized prose + citations and explicit gap analysis. TypeScript, Bun, PGLite by default. **+31.4 P@5 over BM25+vector-only** on its own bench.

**What to mine**:
1. **Graph wiring**: entity extraction + typed-edge creation on every write, zero LLM calls. → `src/`, `docs/`.
2. **Hybrid retrieval**: vector + BM25 + reciprocal-rank fusion (RRF), optional reranking. Steal the RRF formula directly.
3. **Synthesis with citations + gap analysis**: the answer always includes "what the brain doesn't know yet." Apply this to our `/brain ask` skill.
4. **Skill format**: `gbrain/skills/` mirrors Claude Code skill conventions. Lift any skill that matches our needs.
5. **AGENTS.md / CLAUDE.md / llms.txt patterns**: read these — Garry's a careful prompt engineer.
6. **Eval methodology**: `gbrain/evals/` shows how to bench retrieval quality. Adopt for our `meta/evals/`.

**Verdict for Hamzaish**: study deeply in Phase C. Strong candidate to **wrap directly** (we run gbrain as the brain process; Claude Code agents query it via MCP or HTTP) instead of re-implementing.

**Note**: gbrain has `openclaw.plugin.json` — it ships as an openclaw plugin out of the box.

---

## hermes-agent — github.com/nousresearch/hermes-agent

**What it is**: Nous Research's self-improving autonomous agent. Python. Closed learning loop (creates skills from experience, improves them in use, persists knowledge, searches its own past). Model-agnostic (200+ models). Multi-channel gateway. Runs on a $5 VPS or GPU cluster.

**What to mine**:
1. **Self-improvement cycle**: how it decides what to remember, when to extract a new skill, how it nudges itself to persist. → Read `agent/`, `skills/`, `RELEASE_v0.14.0.md`.
2. **Skill creation from experience**: after a complex task, hermes can generate a new skill. We want this in `meta/`.
3. **Session search with FTS5 + LLM summarization**: how it does cross-session recall. → mirror in our `brain/learnings/`.
4. **Trajectory compression**: how it shrinks long sessions for training data. Useful pattern for `meta/retros/`.
5. **AGENTS.md and `hermes-already-has-routines.md`**: read for prompt-engineering conventions.

**Verdict for Hamzaish**: reference-only. Stay Claude-Code-native; we don't run hermes. Adopt the **concepts** (self-improving skills, dialectic user modeling, learning-loop nudges) inside our `meta/` and `brain/` layers.

---

## openclaw — github.com/openclaw/openclaw

**What it is**: Personal AI assistant gateway. Routes between channels (WhatsApp, Telegram, Slack, Discord, iMessage, voice, 20+ more) and your agent runtime. TypeScript monorepo. Has companion apps for macOS/iOS/Android and a Canvas visual workspace.

**What to mine**:
1. **Channel adapter pattern**: how it abstracts 20+ messaging platforms behind a single interface. → `packages/`, `apps/`.
2. **Gateway control plane**: sessions, channels, tools, event routing. → `src/`.
3. **Voice Wake + Talk Mode**: voice-first agent interaction. Relevant to Muakkil's Scribe.
4. **Skills marketplace shape**: `skills/` is structured for distribution. Useful when our factory has shareable skills.

**Verdict for Hamzaish**: parking lot. Don't touch in Phases A–D. Revisit in Phase E when we need cross-channel GTM/outbound (cold outreach via Slack/Discord/Telegram, customer support across channels).

---

## Hamzaish's real peer group — spec-driven agent OSes

> Added 2026-07-01. The three clones above (gbrain/hermes/openclaw) are *runtime/brain*
> inspiration. The two below are the **closest systems to Hamzaish itself**: markdown-on-
> Claude-Code, spec-driven, methodology-as-a-product. They solve the same problem —
> turn a coding agent into a disciplined product factory — and are a year-plus ahead on
> some patterns. Study the *prescription*, port ideas per Discipline below; never adopt
> wholesale. See `brain/anti-patterns/hamzaish-is-an-agent-os-not-a-runtime-framework.md`
> for why Hamzaish stays an agent OS, not a runtime framework.

### bmad-method — github.com/bmad-code-org/bmad-method

**What it is**: "Breakthrough Method for Agile AI-Driven Development." Scale-adaptive,
markdown-driven, tool-agnostic (Claude Code / Cursor / Copilot). 12+ specialized agent
personas, structured workflows from brainstorm → architecture → implementation. Ships
markdown **skills** (`src/bmm-skills`, `src/core-skills`) — same shape as ours.

**What to mine**:
1. **Two-phase split: Agentic Planning → Context-Engineered Development** — their core
   idea. Compare against our GOAL→SLICE→SPEC→BUILD cycle; steal sharpening where theirs
   is tighter.
2. **Scale-adaptive planning depth** — adjusts rigor from bug-fix to enterprise. We
   have momentum-vs-strategy rails; see how they gate depth automatically. → `src/`, `docs/`.
3. **Agent persona structure** — how 12+ roles are defined and handed between. Compare
   to `factory/agents/`. → `src/bmm-skills`.
4. **Diátaxis docs** (`docs/` = explanation / how-to / reference / tutorials) — a clean
   docs taxonomy worth mirroring.
5. **`AGENTS.md` conventions** — read for prompt-engineering patterns.

**Verdict for Hamzaish**: study deeply — the closest peer in spirit. Mine the planning
→ build split and scale-adaptive gating. Reference-only; stay Claude-Code-native.

### agent-os — github.com/buildermethods/agent-os

**What it is**: Builder Methods' lightweight standards+spec layer. Works alongside
Claude Code / Cursor / Antigravity. All-markdown. Four moves: **Discover Standards**
(extract conventions from a codebase), **Deploy/Inject Standards** (surface the right
standard for what you're building), **Shape Spec**, **Index Standards**. Tiny (~328K):
`commands/agent-os`, `profiles/default`.

**What to mine**:
1. **Standards injection** — discover standards *from* a codebase, then inject the
   relevant ones at the right moment. Directly relevant to how `brain/` could feed rules
   into a build. → `commands/`, `profiles/`.
2. **Profiles model** (`profiles/default`) — how reusable standard-sets are packaged.
   Compare to our playbooks + `stack/` ADRs.
3. **Spec-shaping commands** — compare to our `/spec`.

**Verdict for Hamzaish**: study the standards-injection mechanic specifically — it's
the one idea here we don't have a clean equivalent for. Small, fast read.

### metaharness — github.com/ruvnet/metaharness

**What it is**: ruvnet's "factory for agent frameworks" — turns any GitHub repo into
its own branded agent harness (CLI, MCP server, memory, security gates, signed
releases) in under a minute. TypeScript + Rust/WASM kernel, 19 vertical templates,
9 host runtimes (Claude Code, Codex, Copilot, …). Structurally the same species as
Hamzaish: a factory that ships factories. Added 2026-07-07 (381★, v0.1.3, CI green).

**What to mine**:
1. **Score-before-scaffold** (`metaharness score`, `harness genome`) — a static,
   no-execution report card *before* committing to a scaffold: fit, build likelihood,
   tool safety, rough **cost-per-run**; inferred commands tagged `trust: inferred ·
   execution: disabled`. The gap in our `/scaffold` ignition. → `docs/USAGE.md`,
   `docs/USERGUIDE.md`.
2. **`mcp-scan` + threat-model** — MCP configs treated as an audited attack surface
   ("npm audit for agent tools"): default-deny, wildcard-permission detection, a
   threat-model artifact reviewable in PRs. Ported into our `/security-check` § 7 +
   `scripts/check-mcp-config.sh` (2026-07-07). → `docs/adrs/INDEX.md` (ADR-022),
   `packages/harness/`.
3. **Darwin Mode retention rule** — the harness mutates its own config in a sandbox,
   benchmarks each variant, and keeps **only measured improvements**; the model stays
   frozen, the harness evolves. The eval-gated version of our learn-loop, applied to
   the factory itself — same spirit as `meta/evals/factory-change-gate.md`.
   → `packages/darwin-mode/LEARNINGS.md`, `packages/darwin-mode/bench/results/RESULTS.md`.
4. **Cost-Pareto leaderboard** — capability-per-dollar as a first-class ranked metric
   (cheap-model→frontier cascades hitting 55.6% SWE-bench Verified at ~1/10 cost).
   The right axis for any product with an LLM bill.
   → `docs/research/cheap-vs-frontier/REPORT.md`, `SUBMISSIONS.md`.
5. **Vertical template packaging** — 19 domain harnesses (sales, legal, trading, …)
   each shipping agents + skills + governance as one installable unit. Compare to our
   stage agents when factory skills become shareable. → `examples-packages/GISTS.md`.

**Verdict for Hamzaish**: peer-group study, like bmad-method. Mine 1–3 now (2 is
already ported); 4–5 are parked levers. **Separately flagged as prior art for
Muakkil's venture-agent pivot** — that evidence lives in the Muakkil Phase 0 research
folder, not here.

### mattpocock-skills — github.com/mattpocock/skills

**What it is**: Matt Pocock's daily-driver agent skills — 18 promoted skills plus a
meta-layer on how to write them. Anti-framework by philosophy (small, composable,
hackable — explicitly contra GSD/BMAD/Spec-Kit owning the process). Ships as both
copy-in skills (skills.sh) and a read-only Claude Code plugin — the same dual-door
pattern as our `factory/plugins/`. Added 2026-07-14 (active, last commit 2026-07-13).

**What to mine**:
1. **`writing-great-skills`** — the skill-authoring science: context load vs
   cognitive load, leading words, the no-op test, completion criteria, six named
   failure modes. → **Ported** to `factory/playbooks/ai-native-2026/skill-authoring.md`
   (decision log 2026-07-14). → `skills/productivity/writing-great-skills/`.
2. **`domain-modeling` + `grill-with-docs`** — per-repo `CONTEXT.md` ubiquitous-language
   glossary with *Avoid:* lists, challenged and updated inline mid-conversation. A
   zero-infrastructure semantic layer — direct prior art for Phase C
   (`brain/knowledge/2026-07-03-semantic-layer-is-the-moat.md`). → `skills/engineering/domain-modeling/`.
3. **`wayfinder`** — multi-session decision maps: decision tickets (resolve a
   *decision*, not a build slice), fog of war ("Not yet specified"), the frontier,
   one-ticket-per-session. The shape we lack for foggy bigger-than-one-session efforts.
   → `skills/engineering/wayfinder/`.
4. **`triage` + `.out-of-scope/`** — issue/PR state machine with durable agent briefs
   (behavioral, no file paths) and a rejected-concepts KB that kills re-litigation.
   Relevant since `community-prs.yml`. → `skills/engineering/triage/`.
5. **Smaller folds** — tight red-capable loop as a debugging gate (`diagnosing-bugs`),
   expand–contract for wide refactors (`to-tickets`), design-it-twice parallel
   subagents (`codebase-design/DESIGN-IT-TWICE.md`), two-axis review separation
   (`code-review`), the relentless one-question-at-a-time grilling primitive.

**Verdict for Hamzaish**: mine 1 (done) and 2–4 as separately-decidable adoptions;
5 folds into existing skills. His invocation-axis discipline (`.agents/invocation.md`)
is the reference for our own user-invoked vs model-invoked audit.

---

## headroom — github.com/headroomlabs-ai/headroom

**What it is**: Context-compression layer for LLM pipelines (Python; ~60k stars, active
2026-07): compresses tool outputs, logs, files, and RAG chunks *before* they reach the
model — claims ~20% token reduction for coding agents and 60–95% for JSON, same answers.
Ships three ways: library, transparent proxy, MCP server. Registered 2026-07-19 (operator
request) — it targets the exact pair of constraints the control plane made first-class:
the hard spend cap (fewer tokens = more work per capped dollar) and context rot (smaller
context = measurably better accuracy; see the Chroma findings in the harness deep-dive).

**What to mine**:
1. **Compression strategies per payload type** — how it treats JSON vs logs vs prose
   differently (the 60–95% JSON number implies structural, not generic, compression).
   Port the *idea* into `factory/runtime/` tool-result handling if traces justify it.
2. **The proxy pattern** — where it sits relative to the agent loop; what it refuses to
   compress (safety-relevant content?); failure semantics when compression breaks meaning.
3. **Their eval method** — "same answers" is a strong claim; how do they verify
   equivalence post-compression? That verification harness is mineable independently.

**Adoption gate (deliberate, per operating principle 15 / the v2.18.0 no-topology-without-
telemetry rule)**: do NOT wire it into sessions yet. First let `bun run trace-report`
accumulate 2+ weeks of tool-call data; if traces show tool-output token bloat as a real
cost driver, run a measured trial (one week of autonomy-loop sessions through the MCP
server/proxy, spend ledger before vs after, spot-check output equivalence) and record the
decision. A compression layer adopted without a measured need is the failure mode the
factory just wrote a principle against.

---

## The 2026-07-30 four-repo assessment

> First run of the `/repo-scout` method (health gates → read-only clone → facts-only
> deep-dive → this grammar). All four verified healthy and analyzed from CODE, not READMEs.
> Adoption sequencing approved by the operator 2026-07-30 — decision log:
> `brain/decision-log/2026-07-30-external-repo-mining-cycle.md`.

### Graft — github.com/NanoNets/Graft

**What it is**: Tree-sitter code-graph indexer + retrieval CLI for coding agents
(TS/JS/Python/Go ONLY — undocumented). Two layers: $0 offline structural graph
(BM25 + personalized PageRank + RRF ranking, type-aware call edges); opt-in LLM
`--deep` prose. Attaches via CLI + hand-rolled MCP server + 5 Claude Code hooks +
skill. Fully local, zero telemetry (grep-verified), MIT. 4 wks old, 2 effective
maintainers, weekly breaking changes; published benchmarks unverifiable (the bench
harness was deliberately deleted in v0.7.0).

**What to mine**:
1. **`callers --depth all`** — transitive blast-radius over precomputed edges with
   type-aware receiver binding (`src/graph/bindings.ts`). The one thing an agent
   can't cheaply fake. → pre-refactor step idea for `/review` / `/code-simplify`.
2. **`skeleton` + `map`** — signatures-only reads and token-budgeted repo
   orientation (`src/graph/map.ts`).
3. **Freshness engineering** — 3ms stat probe → $0 incremental rebuild proven
   byte-identical, signal-safe locking (`src/graph/refresh.ts`) → prior art for
   `/brain-ingest`.

**Verdict**: the only near-term third-party **adoption candidate** — as a
**measured pull-mode trial** in ONE TS product repo: MCP tools only
(callers/skeleton/map), version PINNED in `.mcp.json` (never `npx -y …@latest` —
supply-chain hole), config through `/security-check`'s MCP audit. Explicitly NOT
the hooks (per-prompt latency + a self-promo nudge injected into every retrieval,
no opt-out) and NOT `--deep`. **Adoption gate (headroom precedent)**: one sprint,
`trace-report` + spend ledger before/after — keep only on measured drop. **Watch**:
breaking-change cadence settling; real external users.

### Adrian — github.com/secureagentics/Adrian

**What it is**: Runtime LLM-judge monitor for agent tool calls — Claude Code
PreToolUse hook ships tool input + prompts + thinking blocks over WS to a Go
backend, a judge (self-host: quantized Gemma on CUDA; or their cloud) maps a
severity code to allow/ask/deny, client enforces. The remit idea (judge actions
against declared purpose, 16-turn window) is real and right; the engineering
around it isn't ready: zero in-repo detection evals, no CI on the enforcement
path, benign-biased verdict parser (first M-code anywhere → *"not M0"* parses as
M0/allow), inert `fail_closed` flag, and the CC integration ships transcripts
**unredacted** to a cloud marked "(Recommended)". Apache-2.0, open-core.

**What to mine**:
1. **UUID-tagged untrusted boundaries** for judge prompts (`policy.go:82`) —
   **PORTED 2026-07-30** into `meta/evals/lib/judge.ts` (`wrapUntrusted` +
   boundary tests). One fix covers every factory judge (evals + `/goal` loop).
2. **Remit-relative judging** — STANDING-ORDERS as machine-readable remit for a
   future native alert-mode PreToolUse second opinion. **Gated**: build only when
   `bun run defect report` shows misses the deterministic guards can't express.
3. **Failure catalog** → anti-pattern material for our own LLM-judge features
   (first-match parsing, fail-open drift, dead security flags).

**Verdict**: reference-only. Deterministic guard hooks stay the hard deny layer;
a probabilistic judge never fronts them. **Watch**: published detection evals +
backend CI + tagged releases → revisit self-hosted alert-mode.

### AgentENV — github.com/kvcache-ai/AgentENV

**What it is**: Firecracker-microVM fleet substrate from the Mooncake/KTransformers
group (built for Kimi agentic-RL training): rootfs AND guest memory as ublk devices
over a from-scratch Rust overlaybd (48k LOC, heavily tested), sub-second resume,
fork-a-live-VM-to-100, E2B-compatible API. Linux x86_64 + KVM + kernel 6.8+ ONLY
(server cannot run on macOS), **no real auth** (any non-empty key passes — literal
TODO), scheduler self-labeled prototype, RL harness in the README not the code.
MIT (Apache-attribution question open on ported code). 1 wk public, single-org.

**What to mine**:
1. **E2B-API-compatibility as distribution** — adopt the incumbent's API, inherit
   its SDK ecosystem. → `factory/playbooks/launch-stage/api-compatibility-as-distribution.md`.
2. **Fork-to-explore** — N divergent attempts from one snapshot; our cheap version
   is git worktrees + parallel subagents (already house pattern).
3. **Prior-art flag for Muakkil's venture-agent pivot** — if it ever needs VM-grade
   sandboxing at scale: wrap or rent (E2B/Daytona), never build.

**Verdict**: parking lot (premature scaling incarnate for a solo-Mac factory).
**Watch**: real auth + ARM support + a hosted offering.

### OpenSpace — github.com/HKUDS/OpenSpace

**What it is**: NOT a management layer — a standalone 186k-LOC Python agent
harness (a Python port of Claude Code's TS internals, 59 preserved `.ts`
citations, MIT-relicensed — provenance unresolved) + a skill-lifecycle subsystem
behind a 6-tool MCP server. Delegation model: evidence only from tasks run in ITS
loop. Safety gate is theater (one literal-string blocking rule; skill markdown
executes shell on load, cloud-imported skills included); flagship self-evolution
inert at stock settings (`passed: False` hardcoded); ~2% tests, zero CI. Cloud
(open-space.cloud) genuinely opt-in/off-by-default. Its committed output corpus —
203 auto-generated skills, ~53% harness-workarounds, `-enhanced-enhanced-enhanced`
chains — is the field's best **control group** for ungoverned auto-capture.

**What to mine**:
1. **Skill-outcome telemetry** (`skill_engine/store.py`: listed→selected→applied→
   completed + provisional→trusted on 2 independent successes) — **PORTED
   2026-07-30** as `bun run skill-report` on the existing trace substrate.
2. **The landfill as control group** → `brain/anti-patterns/auto-captured-skill-landfill.md`.
   Hard evidence our MECE gate + curator + eval ratchet are load-bearing.
3. **Two-stage retrieval** (BM25 → embedding rerank, budgeted listing,
   `skill_ranker.py`) — parked until the skill library nears ~100; pairs with
   gbrain RRF notes for Phase C `/brain-ask`.
4. **Redaction policy design** (`cloud/redaction.py`: allowlist + blocklist +
   hashed paths, fail-closed) — reference for any future telemetry that leaves a
   machine.

**Verdict**: peer study, strip-for-parts; never point it at a curated skill
library (it writes `.skill_id` sidecars + rewrites frontmatter on scan). **Watch**:
CI + tests + a working replay gate + skill signing → re-look.

---

## Discipline

- **Never `import` from `references/`** into anything in `factory/`, `brain/`, or `products/`.
- **Never symlink** their internal modules into our tree.
- If a pattern is worth porting, **port the idea, not the file**. Write our own in `factory/` and link back here in a comment.
- If we end up running gbrain as a process (Phase C), it goes alongside Hamzaish as a sibling system, not inside it. References stays read-only.
