# Hamzaish Changelog

Append-only. Newest first. Each entry: date · version · summary · what changed · why · what to revisit.

At a major-cycle boundary, the entries accumulated here since the last tag are published as a GitHub Release via **`/release`** (`factory/commands/release.md`) — this log is the source of truth those notes are assembled from.

> **Numbering note (2026-06-14).** Parallel build sessions left the version numbers non-contiguous, and that's fine — **entries are the source of truth; the numbers are advisory labels, not a guaranteed sequence.** `/release` reads entry headings in order and does not require contiguity. Specifics, for the record: some small commits (v1.5, v1.6, v1.12) were folded into a neighbouring entry rather than getting their own block; a few entries (v1.13–v1.16, v1.18, v1.22, v1.23) were committed via the GitHub web UI with non-`vX.Y` messages, so they appear here but not in `git log` version subjects; the duplicate-number collisions from 2026-06-13 (two v1.20s, two v1.21s) were de-duped in commit `4039f09`; and the v1.26 entry below had its header dropped in a rebase (rendering it as part of v1.27) — restored here from commit `6e06696`. Do **not** renumber historical entries: the numbers are mirrored in commit messages and the `v1.0.0` release tag, and renumbering would desync them.

> **Releases vs entries (2026-06-28).** The `vX.Y` labels on entries below are *iteration notes*, **not releases** — full policy in [`docs/versioning.md`](../docs/versioning.md). A release is a semver git tag cut at a milestone via [`/release`](../factory/commands/release.md). **Current version: `2.1.0`** — the self-contained build OS (bundles every entry since the `v1.2.0` tag: the engine consolidation, the count/version guard, the new banner, the reality reconciliation). The version itself lives in the root `package.json` and is CI-guarded against drift — it had been stated four different ways across the repo before this.

---

## 2026-07-12 — v2.14.0 · The ThousandWorlds fold: 12 learnings → 2 anti-patterns, 2 playbooks, 6 practices

**What changed**

- **Anti-patterns** — `brain/anti-patterns/fire-and-forget-supabase-builder.md` (`void insert(...)` sends nothing — lazy thenables; ThousandWorlds' client analytics were dead code from day one) and `brain/anti-patterns/trusting-gz-extension-over-magic-bytes.md` (vite serves `.gz` Content-Encoding'd, Vercel serves it raw — sniff 0x1f 0x8b, verify on both).
- **Playbooks** — `factory/playbooks/ai-native-2026/multi-agent-one-repo.md` (file-ownership fences, no-commit agents + one git-owning integrator, pre-fan-out asset commits, sync-and-verify for cross-repo copies, numeric brief gates) and `factory/playbooks/idea-stage/landscape-research-before-roadmap.md` (fan-out sweeps + local audit + adversarial critic + measure-don't-estimate spikes).
- **6 practice lines** across 🏗️/🤖/⚙️ (all ✅ proven, dated 2026-07-12) incl. the GitHub-Actions trio: `secrets` invisible in `if:`, GITHUB_TOKEN PRs never trigger CI, auto-merge needs enabling.
- **Sprint retro** — `meta/retros/2026-07-12-thousandworlds-phases-0-4.md` (phases 0–4 shipped in a day; v0.9.0 live; 18 learnings captured, Tier 1+2 promoted here).

**Why**

The ThousandWorlds sprint's learnings log (18 entries) was reviewed by Hamza; Tiers 1+2 (incident-proven + twice-used method) promoted same-day so the next build inherits them. Tier 3 (squash-release mechanics, honest-defaults design, curated-data pattern) stays local until a second product confirms.

**What to revisit**

- Route the two new playbooks from CLAUDE.md's playbook table — deferred because CLAUDE.md currently carries another session's uncommitted WIP.
- Tier 3 entries live in the product's learnings log; promote on second confirmation.

**Retro:** [meta/retros/2026-07-12-thousandworlds-phases-0-4.md](retros/2026-07-12-thousandworlds-phases-0-4.md)

---

## 2026-07-12 — v2.13.0 · Paste-contents rule (user-relay files go into chat whole)

**What changed**

- **AGENTS.md hard rule 13** — anything the user must relay to an external surface (SQL editor, dashboard, web form) is pasted into chat as the FULL file contents in a fenced block; a path is never a substitute. Secrets-file exception stands (`.example` + user-copies).
- **New anti-pattern** — `brain/anti-patterns/file-path-instead-of-paste-contents.md` (the ThousandWorlds 2026-07-12 schema.sql lapse: a copyable *path* where the SQL belonged).
- **BEST-PRACTICES.md** — one-liner in ⚙️ Run the factory, linked to the anti-pattern.

**Why**

Hamza had twice universalized "anything I copy goes in a copyable block"; the release wrap-up still shipped a path. For the agent, file ≡ contents; for the user they're a path lookup apart. Encoded so the tool remembers what the sessions forgot.

**What to revisit**

- ThousandWorlds' full 18-entry learnings log is pending Hamza's review — several more entries (supabase lazy-thenable inserts, gz magic-byte sniffing, Actions secrets-in-`if`, no-commit-feature-agents orchestration) are candidates for the same promotion path.

**Retro:** skipped — bounded single-session rule promotion (one lapse → one anti-pattern + hard rule 13 + practice line); evidence lives in this entry + `brain/anti-patterns/file-path-instead-of-paste-contents.md`; the ThousandWorlds sprint itself gets its retro when the 18-entry learnings review lands.

---

## 2026-07-08 — v2.12.0 · The Orca distillation: community flywheel + orchestration discipline

**What changed**

- **Two new playbooks** — `factory/playbooks/launch-stage/community-flywheel.md` (trust as the moat: ride-the-wave positioning, effortless contribution rails, build-in-public, GitHub-as-distribution — anchored to the verified Orca case: ~12.1k stars in ~110 days with zero launches) and `factory/playbooks/ai-native-2026/handoff-vs-supervision.md` (the two modes of dispatching an agent, the 4-part completion contract, the 3-failure circuit breaker). Both routed from `CLAUDE.md`'s playbook table; `release-cadence-as-content.md` amended with the Orca proof point instead of duplicating its lever.
- **Community rails in `.github/`** — `community-prs.yml` labels + welcomes every external PR on open (no-checkout `pull_request_target`, plain `gh`, idempotent comment); the PR template gains an optional contributor-shoutout field and a reviewed-before-opening checklist line.
- **`/release` hardened** — a heartbeat trigger (unreleased entries + 7 days since last tag = a boundary), a never-publish-≤-latest gate, and recover-don't-re-cut for tags that lost their Release mid-cut.
- **Agent-legibility rule 12 in `AGENTS.md`** (+ starter template convention) — concrete file names (never `utils`/`helpers`/`common`), why-only comments.
- **Routing hygiene** — new meta-rule in `meta/factory-improving-factory.md`: every skill description carries negative routing (name the nearest neighbor and when to use it instead). Applied to `/ship`, `/auto`, `/full-cycle`, `/goal`.

**Why**

stablyai/orca proved (API-verified, not just claimed) that repo growth without launches is a *system*: release heartbeat + community automation + build-in-public. The factory already had the cadence lever; this fills in the community flywheel and imports the one protocol idea their agents run on — handoff vs. supervision stated as routing, not vibes. Everything adopted is a playbook or rail any builder can reuse; the runtime (Electron, terminals, mobile) stayed out deliberately — Claude Code is that layer, and Hamzaish stays the agent OS that keeps builders in builder-mode.

**Revisit**

- First external PR: does `community-prs.yml` fire correctly (label + single comment, no re-comment on reopen)?
- Next `/release`: do the heartbeat trigger and safety gates read naturally in practice, or over-constrain?

**Retro:** skipped — a study-and-distill session (no product moved stages, no sprint closed); evidence lives in this entry + the 2026-07-08 learning + `brain/decision-log/2026-07-08-adopt-orca-patterns.md`.

---

## 2026-07-08 — v2.11.0 · Live Path M1: the live gate — /go-live closes on a scorecard, not a claim

**What changed**

- **`scripts/verify-live.ts` (new)** — the A1–A10 go-live eval harness from `factory/playbooks/ai-native-2026/go-live-provisioning.md`, finally runnable: DNS apex+www (A1), TLS on both (A2), `/api/health` ok (A3) + buildSha match (A4) + db probe (A6), auth gate 401s (A5), `pk_live_`-not-dev-mode (A7), cron gated (A9), no server-secret patterns in the served HTML/bundles (A10). Per-assertion **PASS/FAIL/PENDING/MANUAL/SKIP** with remediation, an `EVAL: n/N` scorecard line (never a bare "done"), exit 1 on any FAIL. A7b (throwaway signup) stays honestly MANUAL — automated signups pollute prod data.
- **`/go-live` gains the blocking live gate** — new section in `factory/skills/go-live/SKILL.md` + step 6 in the command: after `/ship` deploys, the harness runs against the production URL and `/go-live` closes **only** on its scorecard; FAILs are appended to `brain/learnings/` (assertion id + cause + fix). Also scrubbed the command doc's stale pre-fnox "write to `.env.local`" wording (contradicted the hook-enforced user-touched-secrets rule).
- **Starter template ships `/api/health`** — `ok` / `buildSha` (from `VERCEL_GIT_COMMIT_SHA`) / `probes.db` (head-count on `waitlist`, `off` in local mode), so A3/A4/A6 are assertable on every product scaffolded from now on. Pre-convention products report those three as PENDING, never as false FAILs (found live: ventbox.co serves a 200 catch-all at `/api/health` — the harness reads that as "predates the convention," not "broken").
- **Eval floor 14 → 16 cases** — `--self-test good` (healthy mock → exit 0, `EVAL: 7/9`, LIVE-PENDING) and `--self-test bad` (five seeded failures → exit 1, NOT LIVE) run deterministically in CI with no external network.
- **`meta/goals/live-path.md` M1 marked done** — E2's 10/10 against a fresh deploy lands with the next real ship (M3 measures E1/E3).

**Why**

The Live Path goal's own words: highest leverage, smallest build. `/go-live` previously ended at "keys present and well-formed" — provisioning proof, not liveness proof; the gap between *declared* live and *provably* live is where the patently.legal www-cert miss and the IP-Radar dev-instance trap lived. The harness turns each of those scars into a permanent assertion, and the self-test mocks mean the gate itself is regression-guarded like everything else on the eval floor.

**Revisit**

- First real 10/10: run the gate on the next `/ship` of any product (E2). If an assertion false-FAILs on a real product shape the mocks didn't anticipate, fix the harness and add the shape to the self-test.
- A8 automation (Resend polling) and the provisioning MCPs are M2 — the harness's `--resend-domain` flag is ready for it.

**Retro:** skipped — a bounded milestone inside the already-retro'd Live Path goal arc (decision log `brain/decision-log/2026-07-05-live-path-goal.md`); evidence lives in the goal file's M1 note + this entry + the 2026-07-08 learning.

---

## 2026-07-08 — v2.10.0 · Story-first front door + the Live Path goal (shipped 2026-07-05, PR #37; entry recorded at release)

**What changed**

- **`README.md` rebuilt story-first** — promise before inventory: negation hero ("Not another AI coding setup"), demo directly after the hero, the 11pm thesis promoted to position 3 with a verb-hammer opener ("Most AI tools stop when the code is done. Builders' problems start there."), three true vignettes (the 11:04pm scaffold · BLOCK→CLEAR→live-URL launch morning · the 138-tests lesson becoming a guardrail), one 6-row what's-inside table with the full 35-agent/66-command/42-playbook catalog preserved verbatim in `<details>` collapses, the comparison table moved up and extended with an AI-app-builders (Lovable-class) column and an "output" row ("a live product on your domain"), a two-doors quickstart (terminal / never-used-a-terminal as equals), and a closing CTA. Framing rule shipped with it: **"Localhost is where products are born, not where they live"** — local-first is the on-ramp, never the destination.
- **`meta/goals/live-path.md` (new, ACTIVE)** — the factory's next structural goal: set up accounts once → any scaffolded product reaches a *verified* live URL in minutes. Named metrics (`time_to_live`, `manual_dashboard_actions`, `live_assertions_passed`); evals E1 (≤15 min human time, ≤5 dashboard actions), E2 (10/10 A1–A10 assertions against the deployed URL — domain, HTTPS, production-mode auth, verified email, analytics + Sentry events, live signup), E3 (three consecutive ships with zero account-level re-setup); milestones M1 wire-the-eval-harness → M2 kill the four manual dead-ends (registrar/DNS, Neon, Clerk, Resend) → M3 account-aware ledger fast path → M4 scaffold the kill switch. Decision log: `brain/decision-log/2026-07-05-live-path-goal.md`.
- **`stack/README.md` honesty fix** — the "product #2, #3, #10 in ~5 minutes" claim softened to measured reality (account signups are skipped; per-product wiring still ≈25 min), linked to the goal whose E3 earns the bold claim back with ledger receipts.
- **`brain/learnings/2026-07-05.md` (new)** — three distilled rules from the positioning cycle: counts are receipts, not pitches; audit adjacent docs' quantitative claims whenever positioning copy is rewritten; never let the free-and-instant on-ramp read as the product.

**Why**

A same-day audit of the go-live pipeline against the operator's vision (real, shareable, traffic-ready products — not localhost prototypes) found the machinery ahead of the copy: the `/go-live` → `/security-check` → `/ship` chain and the set-up-once stack doctrine were real and proven on live ships, while the README sold the local on-ramp as the destination and one stack claim had drifted into present-tense aspiration. The rebuild fixes the story order; the goal contract turns the vision's gap (guided provisioning, declared-not-verified "live", product #2 repeating product #1's wiring) into measurable, agent-runnable targets.

**Revisit**

- M1 (A1–A10 assertions wired into `/go-live` as a blocking verify) is the next build; E1+E2 on two products (one Supabase-path, one Neon+Clerk-path) + E3 across three ships marks the goal achieved and restores the stack README's minutes claim.
- If two real ships through M1–M3 still exceed the E1 bar, the bottleneck is the service dashboards themselves — reset the bar, keep the direction (per the decision log's falsifier).

**Retro:** skipped — bounded positioning + goal-setting cycle; evidence lives in the goal contract, the decision-log entry, and the 2026-07-05 learnings.

**/release v2.10.0** (2026-07-08): cut from 2 changelog entries since v2.8.0 (this one + v2.9.0) — [releases/tag/v2.10.0](https://github.com/hamza-ali-shahjahan/hamzaish/releases/tag/v2.10.0).

---

## 2026-07-07 — v2.9.0 · MetaHarness ingestion: MCP-config scanning lands in /security-check; score-before-scaffold + Darwin retention captured as candidates

**What changed**

- **`scripts/check-mcp-config.ts` (new)** — deterministic MCP-config scanner: flags inline credentials in `mcpServers` env/headers blocks (masked, never printed), over-broad permission allowlists (`"*"`, bare `"Bash"`, `"mcp__*"`), `bypassPermissions`, plaintext `http://` remote servers (FAIL), and moving-tag server pulls like `@latest` (WARN). Exit 1 on any FAIL. Idea ported from metaharness's `mcp-scan` ("npm audit for agent tools") — idea only, implementation ours.
- **`/security-check` § 6 (new dimension)** — runs the scanner against the product's code repo; inline credential / wildcard allowlist in an MCP config is now a BLOCK-class FAIL. `docs/security.md` § 2 and the CLAUDE.md command table updated to match.
- **Eval floor grew by the true-positive/false-positive pair** — `meta/evals/skills/security-check/cases/` (seeded fixture must flag 5 FAILs + exit 1; clean fixture must produce 0 findings + exit 0), both PASS and recorded in `baseline.json` (12 → 14 cases).
- **`references/metaharness/` (new clone) + mining guide** — added to the spec-driven-peer-group section of `references/README.md` (5 mine-items, paths verified). Study-only, per references discipline.
- **`brain/knowledge/2026-07-07-metaharness-factory-for-harnesses.md` (new)** — three patterns captured as factory-change-gate *candidates*: score-before-scaffold (a static pre-ignition report card for `/scaffold`), the Darwin retention rule (the factory keeps only *measured* improvements — extends our admission gate with a demotion rule), and capability-per-dollar as a first-class metric (cheap→frontier cascades; Muakkil unit economics).
- **Goal contract** — `meta/goals/metaharness-ingestion.md`: 4 named metrics, 4 evals (E1 mining paths resolve, E2 knowledge retrievable via the brain, E3 scanner passes both fixtures + no eval regressions, E4 Muakkil prior-art note with sourced facts), executed same-day, pending operator review.

**Why**

MetaHarness is the closest thing to Hamzaish's own species — a factory that ships factories — and it treats MCP configs as an audited attack surface, which `/security-check` didn't. That gap was the one behavior change worth making immediately (harness-adjacent surfaces are a live risk class here — the 2026-07-03 key leak was exactly that shape). The other three patterns are deliberately *captured, not built*: per the factory-change gate they're candidates until a bench or a real product proves them. A separate prior-art note for Muakkil's venture-agent pivot went to the Phase 0 research folder (outside this repo, per sprint rules).

**Revisit**

- Score-before-scaffold: at the next `/scaffold` run — if a pre-ignition report card would have changed nothing twice in a row, kill the idea.
- Cost-per-dollar/cascades: when any product's monthly LLM spend crosses ~$50.
- Scanner scope: add publisher-trust checks if/when MCP server marketplaces mature.

**Retro:** skipped — bounded single-session ingestion following the established learn-from-repos pattern (nanoGPT/D1 precedent); evidence lives in the goal contract + this entry + the 2026-07-07 learning.

---

## 2026-07-05 — v2.8.0 · Phase 3 (autonomy) harness hardening: the manager loop enforces the floor + escalates actively

**What changed**

- **`scripts/autonomy-loop.ts`** — the existing unattended `/goal` manager loop gained two things before it dispatches:
  - **A floor precondition gate** (`checkFloorPreconditions()`): if the target repo uses fnox, `fnox check` must pass (config valid / required secrets defined) — a **hard gate**; a pitchfork daemon is **noted** (not asserted live — `pitchfork status` exits 0 for a merely *defined* daemon, so it can't prove liveness); and a **loud spend-visibility (#6) warning** fires when no `.autonomy-spend-ok` marker is present (an unattended loop caps *sessions*, not tokens — the cost-runaway the abuse-and-cost-controls playbook guards against).
  - **Active escalation** (`escalate()`): on `blocked` or budget-spent, the loop now writes a durable `.goal/<slug>/ESCALATION.md` **and** fires a desktop notification (macOS `osascript`, fail-soft) — instead of only printing to a console nobody's watching unattended.

**Why**

Phase 3 of the autonomy arc is "prove one `/goal` runs unattended on the safe floor and escalates only when stuck." The manager loop already existed (opt-in `.autonomy-ok`, STOP switch, session budget) and model routing already existed (`factory/model-policy.ts`), so Phase 3 wasn't a new build — it was wiring the new v2.7.0 floor (fnox/pitchfork) into the loop and upgrading its passive console "blocked" into an active escalation. The gate makes the contract's hard preconditions **self-enforcing**: the loop refuses to run silently without safe secrets or spend visibility. The live pilot on a real product still waits on **#6 spend visibility** (efficiency session) and a **registered product** (`code-paths.local.json` is empty). Verified via `--dry-run` on a throwaway pilot; caught + fixed two of my own overclaiming checks (`fnox check` verifies *defined*, not *decrypts*; `pitchfork status` ≠ liveness) — the same "passes without verifying what it claims" class this arc keeps surfacing.

**Retro:** skipped — a bounded increment on the same jdx-floor/autonomy arc already captured in `meta/retros/2026-07-04-jdx-toolchain-floor-fnox-pitchfork.md` + the 2026-07-04 learning; the dry-run evidence and the two self-caught bugs are recorded in this entry and the learning.

---

## 2026-07-04 — v2.7.0 · pitchfork adopted as the supervised dev-server floor (jdx toolchain Phase 2)

**What changed**

- **Product starter** (`templates/product-starter-nextjs/`): new **schema-validated** `pitchfork.toml.example` (a `web` daemon: `run = "bun dev"`, `auto = ["start"]`, `ready_output = "Ready"`), and pitchfork added to `.mcp.json.example` alongside fnox (so an agent can `pitchfork_start/status/stop` servers).
- **`/go-live` skill**: the "Verify, then hand off" step now **verifies a server is actually up (via pitchfork) before emitting any localhost link** — mechanizing the global "never hand over a dead localhost link" rule.
- **SETUP.md**: new "Running it supervised" section (start-once, survives sessions, `fnox exec -- bun dev` to combine with secrets, distinct-port rule for parallel products).
- **Decision log** `brain/decision-log/2026-07-04-pitchfork-dev-server-supervision.md`: the decision + full pilot evidence table + honest limits.

**Why**

Ad-hoc `bun dev` orphans on ^C, collides on ports, and dies between sessions — against the operator's "never share a dead localhost link" rule and unworkable across multiple parallel products. pitchfork supervises (start-once, ready-checks, cross-session persistence, MCP-drivable). It's also the process-supervision half of the "safe unattended runs" floor (with fnox the secrets half) that the autonomy grading names as prerequisite to the orchestration rung. Piloted in scratchpad (no showcase repos touched — `code-paths.local.json` is empty, so all products are showcase): verified start-once, persistence, crash detection, and the MCP tools; **found and documented a real gotcha** — an HTTP ready-check false-positives to "running" when another process already answers the port (readiness ≠ liveness), mitigated by `ready_output` + distinct ports. Config-schema validated against the README (a guessed `ready={http=…}` field is silently ignored — same discipline as Phase 1's `_comment` catch).

**What to revisit**

Opt-in and pilot-only by design; no fleet rollout, no production supervision, `pitchfork proxy` (CA/hosts) left escalation-gated. pitchfork is the least-adopted jdx tool (~550 stars) — revisit if supervision proves flaky in real multi-product use or cadence stalls > 3 months. hk/aube remain not-adopted.

**Retro:** `meta/retros/2026-07-04-jdx-toolchain-floor-fnox-pitchfork.md` (covers both v2.6.0 + v2.7.0 — one cohesive ship).

---

## 2026-07-04 — v2.6.0 · fnox adopted as the recommended secrets backend for go-live (root-cause fix + red-team gate)

**What changed**

- **`/go-live` skill** (`factory/skills/go-live/SKILL.md`): new "Secrets backend — fnox (recommended) vs `.env.local` (fallback)" section. fnox stores only ciphertext / provider references in a committable `fnox.toml`; agents reach secrets solely through `fnox mcp` in **exec-only** mode (redacts resolved values from output). Ships the **honest, red-teamed threat model** and the mandatory confinement conditions.
- **Product starter** (`templates/product-starter-nextjs/`): new `fnox.toml.example` (age + remote-provider options, `[mcp] tools=["exec"]`), `.mcp.json.example` (exec-only fnox MCP server), `.claude/settings.json` (Bash **deny-rule** blocking **all** `fnox` at the agent's shell — `Bash(fnox)` + `Bash(fnox:*)`), `.gitignore` updates (commit `fnox.toml` ciphertext; never the `*.key` or the go-live ledger), and a new SETUP.md "Step 0 — pick your secrets backend".
- **Anti-pattern** `brain/anti-patterns/claude-touched-secrets-file.md`: added the root-cause fix (no plaintext file at all, via fnox) with its red-teamed caveat.
- **Decision log** `brain/decision-log/2026-07-04-fnox-secrets-backend.md`: the decision + full red-team evidence table + revisit triggers.

**Why**

The 2026-07-03 watcher-echo leak was closed at the *symptom* by `guard-secrets-files.sh` (Claude can't touch the file). fnox closes it at the *root*: there is no plaintext secrets file for the harness to watch. Piloted with a throwaway age key + fake secret and red-teamed against the exec-only MCP config: it **closes the accidental-leak class** (`printenv`/`echo` → `[REDACTED]`, `get_secret` blocked) but **not adversarial exfiltration** (base64/reverse/write-to-file, and CLI `fnox get`/`export` all recover the value). So it's shipped **conditional on confinement** — Bash deny-rules + key-out-of-agent-reach + the guard hook as defense-in-depth. Phase 1 of the jdx/en.dev toolchain evaluation; hk/aube not adopted, pitchfork is Phase 2.

**What to revisit**

Next quarterly toolchain review, or the first product that runs an unattended/autonomous go-live (where adversarial confinement stops being hypothetical). fnox is young (~1.9k stars) — revisit if release cadence stalls > 3 months.

**Retro:** `meta/retros/2026-07-04-jdx-toolchain-floor-fnox-pitchfork.md` (covers both v2.6.0 + v2.7.0 — one cohesive ship).

---

## 2026-07-03 — v2.5.7 · Guardrail: Claude never touches secrets files (the watcher-echo leak, closed)

**What changed**

- **New machine-wide PreToolUse hook `~/.claude/hooks/guard-secrets-files.sh`** (wired in `~/.claude/settings.json` for `Read|Write|Edit|NotebookEdit` and `Bash`): hard-blocks Claude's access to real-secrets files (`.env.local`, `.env.*.local`, `.dev.vars`, `id_rsa*`, `*.pem`, `credentials.json`, `secrets.*`) and Bash commands that would print them (`cat`/`head`/`sed`/plain `grep`); non-printing checks (`grep -q/-c`, `test`, `wc -l`) stay allowed; `.example` templates always allowed; override only via explicit in-chat approval token. 14-case unit test passed.
- **New anti-pattern** `brain/anti-patterns/claude-touched-secrets-file.md` — the pattern, the incident, the example+user-copies fix.
- **go-live skill redesigned** (`factory/skills/go-live/SKILL.md`): guided-loop steps 3–5 now user-pastes-keys-themselves + Claude verifies with non-printing checks; it previously instructed Claude to write keys into `.env.local` (the same latent bug).
- **New standing guardrail** in `factory/commands/hamzaish.md`: secrets files are user-touched only.
- **Global `~/.claude/CLAUDE.md`**: new hard-rule section "Never touch real-secrets files" (machine-wide).

**Why**

Incident 2026-07-03 (Muakkil go-live): Claude created `.env.local` with blank keys and told the user to fill it in himself so values never touch chat. Because Claude had written the file, it was harness-watched — the moment the user pasted his real Supabase service-role + Anthropic keys, the harness echoed the full file contents into the chat transcript. Both keys rotated. The behavioral rule was followed by both parties and still failed: **policy without enforcement fails at the tool layer**, so the fix is a hook, not a reminder.

**What to revisit**

- After a week of real sessions: any false blocks (legit `.example` work caught, patterns to loosen/tighten)?
- Product starters: ship `.env.local.example` by default (Muakkil now has one; add to `templates/product-starter-nextjs`).
- `bun run setup` refresh of `~/.claude/commands/` copies so the updated go-live/hamzaish text propagates outside the repo.

**Retro:** skipped — incident, root cause, and every enforcement layer fully captured in `brain/anti-patterns/claude-touched-secrets-file.md` + the 2026-07-03 learning entry + this entry; the hook shipped with an 18-case test suite and was verified live in-session (it blocked its own author twice).

---

## 2026-07-03 — v2.5.6 · Gate: security-posture documents can never reach a public tree

**What changed**

- **New CI + on-demand guard `check-sensitive-docs`** (`scripts/check-sensitive-docs.ts`,
  wired into `package.json` + `ci.yml`): fails if any TRACKED path looks like a
  security-posture document — `meta/security/`, security audits (`(?!or)` spares the
  security-auditor agent), secret inventories/exposure lists, rotation logs, pentest
  findings. Tested both ways: clean tree passes 733 paths; a `git add -f`'d audit is
  caught with exit 1.
- **Layer 1**: `.gitignore` gains `meta/security/` + audit-name patterns (here AND in
  `templates/product-starter-nextjs`, so every scaffolded product is born protected).
- **Layer 3**: `repo-go-public-checklist.md` Step 2 now scans for posture DOCUMENTS,
  not just secrets — including a history sweep — with the incident recorded.

**Why**

- 2026-07-03: a stray `meta/security/REPO-ACCOUNT-SECURITY-AUDIT.md` (which repos had
  exposed secrets + rotation status) sat untracked beside three committable stray docs —
  one habitual `git add -A` from publishing an attacker's shopping list in this
  always-public repo. An audit holds no keys, but it maps the weaknesses. Ignore lines
  alone are bypassable; the guard makes the tracked tree itself fail loudly.

**Retro:** skipped — single-guard addition in the existing check-* pattern; the incident,
fix, and both-ways test are fully documented in this entry; no process pivot.

---

## 2026-07-03 — v2.5.5 · Showcase catches up with reality: rotscan + repolish join the table, formpad honestly placed

**What changed**

- **Two verified additions to [`products/SHOWCASE.md`](../products/SHOWCASE.md):** **rotscan** ([`@hamzaish/rotscan` 0.1.0 live on npm](https://www.npmjs.com/package/@hamzaish/rotscan) — the repo-rot scanner behind `/tidy`) and **Repolish** (public GitHub since 2026-06-23, factory-scaffolded → factory-launched with both decisions on record). Every claim verified live before listing (registry lookup, repo visibility API, site probes).
- **Formpad placed honestly:** [formpad.app](https://formpad.app) is live (verified 2026-07-03) — but its own config records it as a **pre-factory Lovable build onboarded into the portfolio**, so it appears on a clearly-labeled "onboarded, not factory-built" line rather than the built-with table. The showcase claims only what the factory built.
- **Formpad metadata drift fixed:** the portfolio had `stage: mvp`, `prod_url: null`, status "idea/slot_reserved" while the site served real traffic. Reconciled (stage → launch, prod_url filled, status rewritten with the real next step: wire analytics IDs so telemetry can see it). A live product the factory couldn't see is exactly the blindness `bun run telemetry` exists to end.
- **Repolish metadata folder committed** (was untracked from a parallel session — reviewed + secret-scanned before inclusion, per the stowaway rule). README headline updated: "7 products with public artifacts" replaces the stale "4 live products and an npm package."
- **Not added, on purpose:** scope-intelligence (MVP, nothing publicly touchable — the showcase's own bar) and ThousandWorlds Explorer (not yet registered in the portfolio; joins once its URL + story are on record).

**Why**

The operator spotted the showcase underselling the portfolio. Both directions of drift violate honest-copy — the fix adds what's real *and* refuses what isn't provable (formpad's table exclusion is the same "no overclaims" pass Repolish performs on READMEs).

**Retro:** skipped — docs/metadata reconciliation; every verification recorded in this entry.

## 2026-07-03 — v2.5.4 · Identity guardrails: your commits can never again wear a stranger's face

**What changed**

- **The wound (same morning):** the repo's front page showed a commit by "noreply" (profile: China) — indistinguishable from an intrusion. Investigation proved it was us: a repo-local `user.email = noreply@users.noreply.github.com` override + one direct push. GitHub maps that placeholder email to the real, unrelated GitHub account named `noreply`. Full diagnosis path (reflog → push activity → email mapping) preserved in the anti-pattern.
- **Fixed at the source, then baked in three layers deep:**
  - **`bun run setup` step 2 (new)** — every fresh clone now gets a git-identity check: placeholder/unset emails (`noreply@github.com`, `noreply@users.noreply.github.com`, empty, `you@example.com`) are flagged with the exact personalized fix (pulled live from `gh api user` when available), including detection of the sneaky repo-**local** override shadowing a healthy global. Setup never edits your config silently — it tells you precisely what to run.
  - **`scripts/auto-commit.sh`** — warns on placeholder identity at commit time (local restore-points still happen; losing work is worse), and **hard-refuses auto-push** under one: a misattributed commit can no longer leave the machine automatically.
  - **`/pr` pre-flight** — identity check before anything is staged.
- **Repo hardening from the same incident:** the require-PR ruleset's **admin bypass is removed** — direct pushes to main are now closed for everyone including the owner; every change goes through PR + guards. (The misattributed commit reached main via that bypass.) The already-pushed commit was rewritten in place with correct authorship (`644fb55`) under a 10-second rules lift, protections restored and verified.
- **Distilled:** anti-pattern `brain/anti-patterns/misattributed-commits-placeholder-email.md` (with the diagnose-before-panicking checklist); ledger line (practices 138 → **139**, proven 36 → **37**); learning in `brain/learnings/2026-07-03.md`.

**Why**

The operator's instruction after the scare: make sure this can't happen again — for us and for every new Hamzaish user. New users are the real beneficiaries: a fresh machine with an unset git email is exactly who hits this, on their first ever push, with no way to know the stranger on their repo is an email-mapping artifact.

**Retro:** skipped — incident, diagnosis, and every enforcement layer captured in the anti-pattern + this entry.

## 2026-07-03 — v2.5.3 · Guardrail: multi-repo sessions address repos, never navigate to them

**What changed**

- **New Express-Lane standing guardrail** (`factory/commands/hamzaish.md`, serves `/hamzaish` +
  `/builder-mode`): shell cwd does not reliably persist across tool calls, and a compound
  `cd X && …` silently runs against the wrong repo when the cd is skipped/reset. Always
  `git -C <abs-path>` for git; absolute paths for output-writing commands (`curl -o`,
  redirects); never `git add -A`/commit without a just-run `git -C <path> status` on the
  intended repo.

**Why**

- Incident 2026-07-02 (ThousandWorlds emulator build, two repos in one session): a build-stage
  `cd X && git add -A && git commit` ran in the *other* repo after a cwd reset — sweeping that
  repo's unrelated uncommitted files into a mislabeled commit on the user's feature branch.
  Caught on a routine state check and reverted with `git reset --mixed HEAD~1`; nothing lost.
  `/ship` already ran all its git through `git -C <code_path>` — the gap was ad-hoc build-stage
  git. Same failure family as the hermes `curl -o` CWD-drift incident in `references/`.

**What to revisit**

- Whether a PreToolUse hook should flag `git add -A`/`git commit` in Bash commands that don't
  carry an explicit `-C <path>` when the session has touched more than one repo.

**Retro:** skipped — single-guardrail entry from a parallel session; incident + revert fully described above. (Line added retroactively by the v2.5.4 ship: this entry predates its author-session learning that `check-retro` now enforces the skip-loudly rule.)

---

## 2026-07-02 — v2.5.2 · Ambiguity protocol: never resolve an unclear instruction silently

**What changed**

- **New always-read protocol** (`CLAUDE.md` → Operating mode; tool-agnostic twin as `AGENTS.md` hard rule 11), three tiers: **stop-and-ask** when readings diverge into materially different actions and any is destructive / irreversible / external-facing / contradicts a logged decision (readings listed, recommended first) · **interpret-and-declare** for everything else ambiguous — take the momentum-preserving reading but *say which reading you took*, preferring the reversible path · **just proceed** when unambiguous or trivially reversible. Tier 2 is the load-bearing one: guessing is fine, silent guessing is not.
- **Distilled:** anti-pattern `brain/anti-patterns/silently-resolving-ambiguous-instructions.md`; ledger line (practices 137 → **138**, proven 35 → **36**); learning in `brain/learnings/2026-07-02.md`.
- **Honest limit, named:** no CI guard detects ambiguous English — for judgment behaviors the strongest wiring is always-read placement + recallable anti-pattern + the declare habit making every resolution visible while it's still cheap to undo.

**Why**

Real incident, same day: "go no rerun it" reads as *go on, rerun it* or *go, no — don't rerun it*. The session coin-flipped (correctly) on a state-changing command without flagging the fork. The operator caught the method, not the outcome: on a `git reset` instead of an idempotent script, that's an incident. Momentum stays the default — the protocol only adds disclosure, and asks only when stakes are real.

**Retro:** skipped — single-protocol patch; incident + design fully captured in the anti-pattern and learning.

## 2026-07-02 — v2.5.1 · Global command copies can't rot anymore: manifest-tracked refresh in setup

**What changed**

- **The wound:** `~/.claude/commands/` held June-25 copies of 22 commands after the v2.1→v2.5 upgrade day — anyone invoking `/work-on` or `/portfolio-pulse` from outside the Hamzaish folder silently got pre-upgrade behavior. Worse, old setup couldn't fix it: "the copy differs" made it refuse ("left as-is"), because it couldn't distinguish *the factory moved ahead* from *you customized the file*.
- **The fix — the conffile pattern:** setup now records what it installed in `~/.claude/commands/.hamzaish-installed.json`. Copy == manifest → the factory moved ahead → **auto-refresh**. Copy ≠ manifest → you edited it → **never clobbered** (explicit `bun run setup --refresh-commands` to override). Identical pre-manifest copies get adopted into the manifest on first run, so existing installs migrate for free.
- **Scope widened honestly:** setup managed only 6 hardcoded commands; now **every** `~/.claude/commands/*.md` with a `factory/commands/` counterpart is refresh-managed (having the file there is the opt-in). Foreign files and foreign symlinks stay untouched.
- **Tested:** decision logic isolated in `scripts/lib/command-refresh.ts` with a 7-case suite; all three live branches verified end-to-end (upgrade→refresh, edit→protected, force→overwrite).
- **`/pr` step 9 addition:** a merge touching `factory/commands/` ends with "run `bun run setup`" so the refresh actually happens at the moment it's needed.

**Why**

The operator asked "are we running the new Hamzaish?" and the honest answer was "only from inside the folder." Learning + enforcement trail: `brain/learnings/2026-07-02.md`.

**Retro:** skipped — single-mechanism patch, same-day follow-through on a logged learning.

## 2026-07-02 — v2.5 · The portfolio gets senses: real Stripe / PostHog / Sentry connectors + `bun run telemetry`

**What changed**

- **Three of the four dashboard connectors are now real** (fetch-based, zero new dependencies, injectable fetch for tests): **Stripe** (active-subscription MRR normalized to monthly incl. year/week/day intervals and seat quantities, distinct paying customers, pagination, connected-account header, metered prices excluded rather than guessed) · **PostHog** (one HogQL query → 7d actives, 7d signups with configurable event name, WAU/MAU retention *proxy* — labeled as such) · **Sentry** (24h event pressure). **GSC stays honestly stubbed** — it needs OAuth, a scope boundary rather than a TODO.
- **The lie is dead.** The v1 stubs returned `status: 'connected'` with hardcoded zeros — a keyed product read as "live, $0 MRR, 0 users." The honesty contract is now tested (11-test suite): no key → `not_connected`; API failure → `error` with nulls; `connected` means the numbers came from the API.
- **`bun run telemetry [--json]`** (`scripts/telemetry.ts`) — the whole portfolio in one table from the factory CLI, runnable with zero installed dependencies. Verified live in the keyless state: renders every product with ⚪ not_connected and a one-line key hint.
- **`/portfolio-pulse` step 6 now pulls it** — the snapshot's MRR / actives / errors columns come from data, with honest `—` for missing values. This is audit upgrade #4 ("the five most decision-heavy agents are the five blindest") closed at the data-source level; conductor and kill-or-double-down inherit it through the pulse.

**Why**

Portfolio decisions (focus, kill-or-double-down, pricing reviews) were running on a hand-updated markdown snapshot last touched 2026-06-07. A factory that enforces evidence everywhere else shouldn't allocate the operator's hours on stale prose.

**Retro:** [meta/retros/2026-07-02-factory-telemetry-connectors.md](retros/2026-07-02-factory-telemetry-connectors.md)

**What to revisit**

- First keyed run: eyeball the computed MRR against the Stripe dashboard once before trusting it in reviews.
- GSC connector (OAuth) and per-stage health_score weights — next telemetry increments.

## 2026-07-02 — v2.4.1 · /learn-loop "audit roadmap executed (v2.1→v2.4)": scored 5, promoted 2 — first run of the dual-scoring + ratification gate

**What changed**

- **First real `/learn-loop` under the v2.3 protocol — and the gate bit.** Five candidates scored twice independently (main session + a fresh-context subagent, blind to each other's numbers); the fresh scorer filtered 4 live candidates to **2**; the operator batch-ratified before anything was written. One 6-point disagreement logged as signal (the "mechanical triggers" lesson — skeptic correctly noted its gain is unobserved and its guardrail already exists).
- **Promoted (both dual-cleared ≥24/35, operator-ratified):**
  - *Fan-out report claims are leads, not facts* (30 + 27) → new anti-pattern `brain/anti-patterns/trusting-fanout-reports-over-artifacts.md`, a lead-verification line in `planning-and-task-breakdown` Step 1, ☠️ ledger line. Two dated instances from today's audit.
  - *Read the subsystem's constitution before planning its extension* (28 + 27) → constitution-first read in `planning-and-task-breakdown` Step 1, ⚙️ ledger line.
- **Logged, not promoted:** "mechanical triggers beat wording" (26 vs 20 — dual gate failed) · "ratchet over big-bang" (28 vs 23 — one instance; re-eligible on recurrence). The PR-stowaway lesson, promoted same-day at incident time, got its `[SCORED]` block for the audit trail (30/35).
- **Ledger:** practices 135 → **137**, proven 33 → **35**. All `[SCORED]` blocks with predicted gains + 2026-10-02 feedback checks: `brain/learnings/2026-07-02.md`. `/kill-or-keep` re-verifies in October.
- **Release:** this boundary is cut as the **v2.4.1 GitHub Release** (marked latest) — the external half of the cycle, per `/release`.

**Retro:** skipped — scoring pass over an already-retroed cycle (four phase retros filed today cover the substance).

## 2026-07-02 — v2.4 · Phase 4: the heavy protocols go fleet-native — fan out blind, verify adversarially, synthesize with a judge

**What changed**

- **New playbook `factory/playbooks/mvp-stage/fleet-patterns.md`** (playbooks 41 → **42**) — the canonical multi-agent shape, written once: (1) fan out blind workers (independence is the signal — agreement between workers who read each other is contagion); (2) every blocking/killing/gating finding faces a refuter that defaults to *refuted* (unverifiable findings are reported as unverified, never silently dropped, never allowed to block); (3) a judge synthesizes, reporting **disagreement as output** rather than averaging it away. Verifiers/judges run on the top model tier via the wired policy.
- **Wired into the five gate-holding protocols:** `/validate` (4 idea agents fan out blind on the raw idea; kill case AND strongest FOR evidence each get a refuter; snapshot carries the agreement/disagreement map) · `/security-check` (blind per-category workers; a FAIL must survive refutation to BLOCK) · `code-review-and-quality` (five axes as five blind reviewers; Criticals adversarially verified before gating) · `devils-advocate` **panel mode** (three blind skeptic lenses — market-timing / moat-copyability / founder-fit; splits reported, never averaged) · `kill-or-double-down` (one analyst per product, blind to siblings — anti-halo; DOUBLE-DOWN challenged against the PMF hard rule).
- **Serial stays first-class:** every protocol still runs in one context with identical deliverables — fleet mode activates when subagent spawning is available and the verdict gates something real. The devils-advocate eval was re-run after the change: **PASS** (the solo contract is untouched).
- **Phase-3 carryover:** `/full-cycle` Step 0 now injects the brain-recall block (defenses first) before pinning the goal.

**Why**

Phase 4 (final) of the 2026-07-02 audit roadmap. Adversarial verification and independent perspectives are the two rigor upgrades a single context structurally cannot give itself; with the model policy wired (v2.2) and recall push-based (v2.3), the fleet shape is the natural execution substrate for every verdict that gates a launch, a merge, or a kill.

**Retro:** [meta/retros/2026-07-02-factory-phase4-fleet-patterns.md](retros/2026-07-02-factory-phase4-fleet-patterns.md)

**What to revisit**

- A `Task[]` fan-out helper in `factory/runtime/` so the headless loop can run fleets, not just single tasks (after the first real interactive fleet run).
- Run `/learn-loop` v2 on this whole four-phase cycle — it's a textbook major-cycle boundary.

## 2026-07-02 — v2.3 · Phase 3: recall becomes push — the brain injects itself, the learning loop gets a second scorer and a ratification gate

**What changed**

- **`bun brain/ask.ts --context`** — a ready-to-inject session briefing block: **anti-patterns lead** (defenses beat context), then learnings/decisions, then the rest, with a verify-before-relying footer. New deterministic eval case `brain-ask/context-recall-block` — verified live PASS, baselined (brain-ask: 4 cases).
- **`/work-on` injects recall automatically** (command + workflow step 7): two `--context` blocks at session start — the product's open threads, and the anti-patterns most relevant to today's action. Recall was pull (operator must remember to `/brain-ask`); now it's push — forgetting is impossible.
- **Product learnings joined the brain.** `brain/ingest.ts` now indexes `products/*/learnings/` and `products/*/validation/` — closing the audit's cross-product-synthesis gap: lessons captured inside one product were invisible to the factory. (+5 documents on first re-ingest.)
- **`/learn-loop` v2 — Movement 2 shape:** gathers product learnings as candidates (same problem in 2+ products = automatic strong Recurrence) · **dual independent scoring** (a fresh-context subagent scores blind to the first scorer's numbers; both composites must clear ≥24/35; disagreements ≥6 points are logged as signal, not smoothed over) · **propose → operator batch-ratification → promote** replaces score-and-write-in-one-pass. The loop proposes; the operator ratifies; nothing auto-promotes.
- **Deliberately not attempted:** vector embeddings. Zero-dependency principle + no local embedder = FTS5 is the honest ceiling; `--context` extracts more from the index that exists rather than faking semantics. Revisit trigger recorded in the retro.

**Why**

Phase 3 of the audit roadmap ("compound the brain"). The factory's core promise is that product #2 starts smarter than product #1 — that only compounds if recall reaches the session without being asked for, and if lessons flow up from products into guardrails through an honest gate.

**Retro:** [meta/retros/2026-07-02-factory-phase3-brain-recall.md](retros/2026-07-02-factory-phase3-brain-recall.md)

**What to revisit**

- Calibrate the dual-scoring disagreement threshold (≥6) after 2-3 real `/learn-loop` cycles.
- Extend the two-block recall injection to `/builder-mode` and `/full-cycle` kickoffs (Phase 4 candidate).

## 2026-07-02 — v2.2 · Phase 2: the model policy is wired — right model for the right job, executed

**What changed**

- **Every spawnable agent now carries `model_tier:` frontmatter** — all 34 (15 opus / 15 sonnet / 4 haiku), per the policy tables plus three new engineering rows (code-reviewer + security-auditor → opus, test-engineer → sonnet). `_orchestrator` stays untiered by design: it IS the main loop.
- **New `factory/runtime/model-policy.ts`** — the wiring: `modelForAgent()` resolves a model from the agent's frontmatter (Tier-B fallback, never a crash); `escalate()` applies the Phase-2 stakes rule, **active and up-only** (auth / payments / migrations / RLS / data-deletion → top tier regardless of role; de-escalation stays manual judgment — a "trivial" auth tweak is the classic trap); `stakesFromPrompt()` as belt-and-suspenders. Tested: `model-policy.test.ts` resolves real agents and asserts *every agent on disk has a valid tier* — 18/18 across the runtime suite.
- **The headless runtime picks its model from the policy.** `Task` gained `agent` + `stakes`; resolution order: explicit override → frontmatter tier → default, then escalation. The demo task now resolves `idea-generator → sonnet` from frontmatter instead of hardcoding.
- **`factory/model-policy.md` ships** (was untracked) — status updated from "Phase 1, not yet wired" to Phase 2 wired, with the frontmatter-wins drift rule written down. Orchestrator step 5 now distinguishes in-context execution (session model) from delegated execution (pin from frontmatter + escalate); `mvp/builder` carries the stakes-escalation discipline (high-stakes changes also get a `security-reviewer` pass).
- **Correction for the record:** the 2026-07-02 audit reported `loop.ts` as unfinished ("TODO: wire orchestrator"). Direct read: no TODOs — the loop, router, and tests were complete; the genuine gap was model-policy resolution, which is what this entry ships. Second confirmed case of "audit inventories are leads, not facts."

**Why**

Phase 2 of the audit roadmap ("wire the declared machinery"). The policy was the highest-value declared-but-unwired artifact: it named the right model for all 31 lifecycle agents and nothing read it. Now the tier travels with the agent, the resolver is tested code, and stakes beat role automatically — in the up direction only.

**Retro:** [meta/retros/2026-07-02-factory-phase2-model-policy-wired.md](retros/2026-07-02-factory-phase2-model-policy-wired.md)

**What to revisit**

- Tuning loop needs a data pipeline (log tier × outcome per runtime run; re-tier on evidence).
- Fable-tier verification for brand/creative work (the policy's "unverified" row).

## 2026-07-02 — v2.1.1 · Guardrail: a PR can never again publish a stowaway local commit

**What changed**

- **`/pr` step 2 rewritten:** branch from `origin/main` explicitly (`git fetch origin && git switch -c change/<slug> origin/main`), never bare `git switch -c` off local `main` — on this machine, local main being ahead (auto-commit hooks, parallel sessions) is normal, and branching off it smuggles unpushed commits into the squash-merge.
- **`/pr` step 4 added — pre-push scope check:** the reviewed list is `git diff origin/main --stat` (the *publish* set), not the staged list; plus the mirror completeness check (the v2.1 ship forgot to stage its own two guard scripts and went red in CI — both failure directions now have a step).
- **Distilled:** new anti-pattern `brain/anti-patterns/pr-branch-from-ahead-local-main.md`; ledger line in BEST-PRACTICES.md (practices 134 → **135**, proven 32 → **33**); learning appended to `brain/learnings/2026-07-02.md`.

**Why**

During the v2.1 ship (PR #21), an unpushed `decisions(muakkil)` commit from a parallel session rode inside the squash and was published without an explicit decision. Content was benign (public-by-design product metadata) — the mechanism was not: the same path would publish a private note or a secret just as silently. The operator's instruction: make sure this can't happen again.

**Retro:** skipped — five-file guardrail patch; context covered by today's [trust-loop retro](retros/2026-07-02-factory-trust-loop-phase1.md).

## 2026-07-02 — v2.1 · The trust loop, phase 1: eval ratchet, typed handoffs, enforced disciplines

The first execution phase of the full-factory audit (the "close the trust loop" roadmap). Theme: convert declared discipline into enforced machinery — every one of these existed as a written rule; none had a mechanism.

**What changed**

- **Eval coverage is now a CI-enforced ratchet.** New guard `scripts/check-evals.ts` (+ `bun run check-evals`, wired into CI): a structural floor (every agent/skill SKILL.md must carry frontmatter name/description, orphaned playbook references warned), plus the debt rule from `meta/evals/README.md` made real — a **new** agent or skill cannot ship without an eval case; a **covered** entity that loses its cases is a blocked regression. Everything pre-existing is grandfathered *by name* in `meta/evals/coverage.json` (72 entries — the visible debt backlog; coverage % prints on every run). Why a ratchet and not a big bang: the harness's own rules (honest-green floors, LLM cost ceiling) forbid mass backfill — `brain/decision-log/2026-07-02-eval-coverage-ratchet.md`.
- **Two new behavioral eval cases** — the first *agent* (vs. skill) evals: `problem-sharpener` (exact-format floor + specificity/no-solutioneering judge) and `devils-advocate` (template floor incl. ≥3 numbered assumptions + forced KILL/PIVOT/PROCEED verdict + structural-attack judge). Eval-covered entities: 3 → **5**.
- **The six core agent handoffs are now typed contracts.** `factory/playbooks/mvp-stage/agent-handoff-contracts.md` — written 2026-06, applied to zero agents until today — now lives in 11 agent SKILL.mds as Contract blocks (Produces / Shape / Preconditions / Postconditions / On-gap): problem-sharpener → customer-discovery → interview-synthesizer · architect → builder · keyword-researcher → seo-strategist · pricing-strategist → pricing-optimizer · brand-story-builder → landing-page-copywriter. Highlights: the synthesizer refuses batches <5; the builder refuses to build from chat context alone; the keyword brief bans invented volumes; the pricing strategist must name the signals the optimizer will need a quarter later.
- **Retro discipline is mechanical.** New guard `scripts/check-retro.ts` (+ CI): every changelog entry dated on/after 2026-07-02 must link a `meta/retros/` file (that exists) or carry an explicit `**Retro:** skipped — <reason>` line. Skipping stays legal; skipping silently doesn't. (Audit finding: 1 retro filed against a year with four launches.)
- **Decision capture is a checklist item, not a virtue.** `meta/factory-improving-factory.md`'s end-of-session checklist and `/checkpoint` now ask the forced question — "did I make a call a future session could second-guess?" → `brain/decision-log/` (date · decision · why · wrong-if · revisit-trigger). (Audit finding: 1 logged decision against 15 products.)

**Why**

The 2026-07-02 audit's core diagnosis: Hamzaish's architecture is sound but ~60% of its promised value sat in a declared-but-not-wired state, and its two record-keeping disciplines ran on good intentions. Phase 1 targets the trust half: what the factory claims about itself (evals, handoffs, retros, decisions) is now checked by machinery, not memory.

**Retro:** [meta/retros/2026-07-02-factory-trust-loop-phase1.md](retros/2026-07-02-factory-trust-loop-phase1.md) · Learnings: `brain/learnings/2026-07-02.md`

**What to revisit**

- Pay down the grandfathered eval debt in `/learn-loop`-boundary batches (next: the forced-verdict agents — scope-guardian, security-reviewer, interview-synthesizer — cheapest to floor deterministically).
- Phase 2 of the roadmap: wire `factory/model-policy.md` into real agent spawning + finish `factory/runtime/loop.ts`.

## 2026-06-30 — v1.34 · Site audits, for first-timers: the factory now catches the "looks static, but it's live" trap

The factory's **site-audit capability set** is now complete enough to name as one thing. If you point Hamzaish at a website and ask "is this safe to ship, and will it hold up?", you get a real audit — not a vibe check — and the newest piece closes the gap that's easiest for a beginner to fall into.

**The headline: an env-gated backend is still a backend.** A site can *look* fully static — no backend, no database, "scales trivially" — when its data/auth client only switches on if environment variables are present, and quietly falls back to local-only when they're absent. Read the code without the keys and you'll swear there's no backend. There is; it's just live in production, where the keys exist. The factory now refuses to call a site "static / no backend" from a keyless code read, and says so in plain language:

> **If the site has a sign-in button, a save/share feature, or an admin page, it HAS a backend — even if the code looks like it runs without one. Open the .env file and check.**

**What a builder gets for free when they audit a site now — one connected set:**

- **`/security-check` — the pre-deploy gate.** A fast, mechanical pass that ends in a forced **BLOCK / CLEAR-WITH-CAVEATS / CLEAR** verdict. It now runs the **backend-reality check first** and BLOCKs ship on a "claimed static but env-gated backend" finding — alongside its existing checks for tracked secrets, unpinned/vulnerable GitHub Actions, over-broad workflow permissions, untrusted-input triggers, and RLS.
- **`mvp-stage/security-checklist.md` — the source of truth (70 checks).** The deep list `/security-check` is built on. It now **opens** with the *Backend reality check* (read `.env*` + trace the gating · grep deps/src for backend SDKs used conditionally · check hosting rewrites/proxies to other deployments · separate build-time vs runtime calls · audit the scale ceilings) — placed before the auth/RLS sections, which only make sense once you've confirmed a backend exists.
- **web-launch `launch-workbook` — the tracked launch checklist.** The 14-phase, sign-off-gated workbook now carries the backend-reality check as a **P0 item in Phase 2 (Technical Architecture)**, flagged for `hybrid` / `content-site` profiles — so it's a row someone has to *verify*, not just a thing to remember.
- **`launch-gotchas` — the "here's what burned us" library.** Now includes *Env-gated backend read as "fully static"* (what happened · root cause · prevent), built from the real case, so the next builder recognizes the trap before paying for it.
- **`scale-stage` production-operations & abuse/cost playbooks — the "will it hold" half.** Once a backend is confirmed, the scale tail is explicit: **auth-email/SMTP rate limits** (free magic-link SMTP is the classic *first* failure under load), **DB tier caps / connection limits / auto-pause**, and **RLS / anon-key authorization** that gets probed at scale.

**Why this matters for the mission.** Democratizing builder mode means a first-timer shouldn't have to already know the traps to be protected from them. The "it looks static, so it scales for free" mistake is one an expert avoids by reflex and a beginner can't see coming. Baking it into the gate, the checklist, the launch workbook, and the gotcha library means the factory carries that reflex *for* the builder — by default, no expertise required.

**What changed in this entry**

- **web-launch `launch-workbook.md`:** new Phase-2 P0 item — *Backend reality check (a "static" site can have an env-gated backend)* — for `hybrid` / `content-site` launches (completes the "what to revisit" noted in v1.33).
- **This release note:** the first consolidated statement of the site-audit capability set, with the env-gated-backend check as its headline.

**What to revisit**

- If the site-audit set keeps growing, promote it from a changelog showcase to a standing `docs/` capability page (and a `/release` GitHub Release at the next major-cycle boundary).

## 2026-06-29 — v1.33 · Audit guard: an env-gated backend is still a backend

**What changed**

- **New required audit step — the "Backend reality check."** `factory/playbooks/mvp-stage/security-checklist.md` now opens with a backend-reality section (5 checks: read `.env*` + trace gating, grep deps/src for backend SDKs used conditionally, check hosting rewrites/proxies, separate build-time vs runtime calls, audit SMTP/DB-tier/RLS scale ceilings) plus a first-timer heuristic. It runs *before* the auth/RLS sections, which assume a backend already exists. Security checks 65 → **70**.
- **Enforced in the gate.** `/security-check` (`factory/commands/security-check.md`) runs the backend-reality check first and BLOCKs on a "claimed static but env-gated backend" finding.
- **Distilled.** New anti-pattern `brain/anti-patterns/concluding-no-backend-from-code-alone.md`; new *Never do this* ledger line (practices 133 → **134**, proven 31 → **32**); a matching `launch-gotchas` entry; learning `brain/learnings/2026-06-29.md`.

**Why**

A site/scale audit of Thousand Worlds Explorer read the keyless/dev state and wrongly called it "fully static, no backend, scales trivially" — it actually had a live env-gated Supabase backend (auth, CRUD, telemetry, admin) plus a `/emulator` route proxying a separate app. "Static" is a delivery claim, not a code-only property: the same bundle is backend-driven in prod purely because env vars are set. The fix makes "prove the negative from env + deployment state, never a keyless code read" a required, enforced step — and frames it simply so a first-timer is protected by default.

**What to revisit**

- If products start declaring a `static`/`content-site` profile, fold the backend-reality check into `web-launch`'s launch-workbook so it's a tracked workbook item, not only a security-gate step.

## 2026-06-28 — v1.32 · Goal-first, eval-gated build flow (GOAL → SLICE → spec → build)

**What changed**

- **`/full-cycle` now opens with a GOAL and a SLICE gate.** Kickoff pins what "done" means in one measurable line (escalate to `/write-a-goal` for fuzzy or ambitious targets). A new **SLICE** gate (the new `feature-slicing` skill) cuts the goal into vertical feature slices — each must declare an **eval + an end-to-end test**, and a slice you can't prove doesn't get selected. The spec is then written *for the selected slices*, and their evals/e2e tests become the per-task TDD gate. New sequence: **GOAL → SETUP → SLICE → SPEC → PLAN → TEST·BUILD·REVIEW → SHIP**.
- **`/goal` shipped into the repo + elevated to a first-class mode.** It was global-only (`~/.claude/commands/goal.md`) — the router pointed at it but a fresh clone lacked it (the same provenance gap consolidation just closed). Now in `factory/commands/goal.md`; the `/builder-mode` router offers it as the autonomous, self-verifying path (rubric + fresh-eyes verification, resumable run-log) alongside gated `/full-cycle` and open-ended `/auto`.
- **New skill `feature-slicing`**; counts reconciled (the guard caught every site): skills 40 → **41**, commands 23 → **24**, skills+commands → **65**.

**Why**

Specs are a result of the right goal, and a feature you can't evaluate or end-to-end test is a guess. This makes the cycle eval-driven *at the feature level* — operationalizing the eval-driven-development playbook so the system only commits to work it can prove. Momentum is preserved: the goal is one line by default, the slice gate is skippable, and the full `/write-a-goal` forge is the opt-in escalation, not a strategy toll.

**What to revisit**

- Folded into the **v2.0.0** release (still unpublished) — the goal-first, eval-gated flow is part of the v2.0 story, so the `v2.0.0` tag is re-cut at the HEAD that includes it.

## 2026-06-28 — v1.31 · Consolidated the agent-skills engineering engine into Hamzaish (front door now self-contained)

**What changed**

- **Folded the operator's `agent-skills` build engine into Hamzaish** so `/builder-mode` works on a fresh clone with nothing else installed. Brought **21 engineering skills** (spec-driven-development, planning-and-task-breakdown, incremental-implementation, test-driven-development, debugging-and-error-recovery, code-review-and-quality, security-and-hardening, performance-optimization, frontend-ui-engineering, api-and-interface-design, browser-testing-with-devtools, ci-cd-and-automation, documentation-and-adrs, git-workflow-and-versioning, source-driven-development, context-engineering, deprecation-and-migration, code-simplification, shipping-and-launch, idea-refine, auto-orchestrator), **9 commands** (`/full-cycle`, `/spec`, `/plan`, `/build`, `/test`, `/review`, `/setup`, `/code-simplify`, and a new `/auto`), and **3 engineering subagents** (code-reviewer, security-auditor, test-engineer → `factory/agents/engineering/`). All `agent-skills:` namespace refs and retired `~/.claude/agent-skills/…` paths were rewritten to Hamzaish's layout.
- **Resolved the two name collisions**: kept Hamzaish's `/hamzaish` router and `/ship` (product-production deploy) as canonical; dropped agent-skills' duplicates. `/full-cycle`'s SHIP gate now points at Hamzaish's `/ship`.
- **Fixed the dangling `/auto` reference** (`builder-mode.md`/`hamzaish.md` routed to it but no command existed) — `/auto` now invokes the `auto-orchestrator` skill.
- **Counts reconciled** (the new `check-counts` guard caught every site): agents 32 → **35**, skills 19 → **40**, commands 14 → **23**, skills+commands → **63**. README gained an engineering-cycle section + an engineering-subagents table.
- **Corrected the v1.30 provenance error** (those commands were mislabeled Claude Code built-ins; they were the operator's own repo). New anti-pattern: `brain/anti-patterns/assuming-provenance-of-a-resolving-command.md`.

**Why**

The front door (`/builder-mode` → `/full-cycle`) depended on a *separate* repo (`agent-skills`, installed globally on the maintainer's machine) that a fresh cloner wouldn't have — so the headline "clone → first build" journey silently broke off-machine. Consolidating makes Hamzaish self-contained, lets `agent-skills` be retired, and removes an undeclared cross-repo dependency.

**What to revisit**

- **Skipped intentionally:** `using-agent-skills` (meta-doc about the old repo) and agent-skills' `hooks/` (simplify-ignore tooling + a session-start hook — runtime config that could collide with Hamzaish's hooks; migrate deliberately if the code-simplification ignore feature is wired in).
- `agent-skills` is untouched and still public — retire/archive at the operator's discretion (per the hard rule, its visibility is never changed without explicit double-confirmation).

## 2026-06-28 — v1.30 · "Every count real" made self-enforcing — count/path/code_path CI guard + reality reconciliation

**What changed**

- **New guard `scripts/check-counts.ts`** (wired into `.github/workflows/ci.yml`) — derives agents/skills/commands/playbooks/practices/security-checks from the filesystem and fails CI if any README/ledger/`hero.ts` headline number drifts, if a tracked file leaks a real `/Users/hamza` path, or if any `products/*/product.config.json` has a non-null `code_path`. One guard closes the three faces of one root cause: facts hand-maintained in many places with nothing deriving them.
- **Reconciled every drifted number to disk** across `README.md`, `BEST-PRACTICES.md`, `scripts/hero.ts`: practices 128/130 → **133** (✅31/🟡3/⏳99), playbooks 39 → **41**, skills + commands 29 (17+12) → **33** (19+14), security checks 59 / "80+" → **65**. Added the missing items to the README tables (`/pr`, `tidy`, `write-a-goal`; the `agent-handoff-contracts`, `release-cadence-as-content`, `repo-go-public-checklist` playbooks) and moved the section anchors to match.
- **Fixed the High finding**: `products/copyright/product.config.json` `code_path` `/Users/hamza/…` → **`null`** (the real path lives in gitignored `code-paths.local.json`); it was the only non-null of 19 and was passing CI green.
- **Closed 10 `/Users/hamza` path leaks** across product docs, a playbook, and a workflow (`~` / sibling-repo phrasing).
- **Reconciliation quick wins**: `code-paths.example.json` no longer preloads the maintainer's 12 slugs (a fresh clone starts with its own empty factory); `pnpm` → `bun` in `factory/commands/hamzaish.md`; dropped the 404 `ip-radar` GitHub link from `SHOWCASE.md` and the copyright config.
- **Learnings (this session)**: `brain/learnings/2026-06-28.md` (recompose-don't-regenerate; surgical staging; the drift realization), `brain/learnings/2026-06-28-thousandworlds-ml.md` (23 ML / benchmark-contribution / client-side-inference lessons mined from ThousandWorlds + the emulator), new anti-pattern `brain/anti-patterns/hand-maintained-facts-drift.md`, and the anti-pattern index completed (was 4 of 8).

**Why**

An ultracode review found nearly every "every count real" headline had drifted and the no-`/Users/` rule was breached and green in CI — the same root cause three times over (and independently in the ThousandWorlds repos: `n_folds` 3-vs-5, caveats-as-prose). For a repo whose whole pitch is "the counts are the filesystem, not the marketing," believability is the moat; this makes it self-enforcing instead of a recurring manual recount.

**What to revisit**

- `products/_portfolio.md` is still stale ("All products (15)"; 18 real) — **deferred**: it needs a `/portfolio-pulse` regen over live product state, its own task; a half-refresh would just re-drift.
- ~~The front-door build commands are Claude Code built-ins~~ — **correction:** `/full-cycle`, `/spec`, `/plan`, `/build` etc. were **never** Claude Code built-ins; they came from the operator's own [`agent-skills`](https://github.com/hamza-ali-shahjahan/agent-skills) repo, installed globally — so a fresh Hamzaish-only clone was missing them. **Resolved in v1.31** by consolidating the engine into this repo. The mislabel is itself logged as `brain/anti-patterns/assuming-provenance-of-a-resolving-command.md`.

## 2026-06-28 — v1.29 · Builder Mode banner rebuilt — full meditation figure, half-height strip

**What changed**

- **`docs/assets/builder-mode.png` rebuilt** from the original full-body meditation illustration: the whole figure (head → crossed legs → prayer rug, golden orbs included) is now shown. The previous cover cropped the operator at the waist behind a "Fable 5" card. New canvas is a wide **1920×540** strip — **half** the old 1080 height, so it's far less of a vertical wall in the README — and ~**573KB** (down from 1.7MB).
- **`docs/assets/hamza-meditation.png`** (new) — the clean source illustration, committed so the banner is reproducible.
- **`scripts/build-banner.py`** (new) — deterministic compositor (`rsvg-convert`): the full art is feathered into a navy canvas (`#080b16`, matching the art's own background so there's no rectangular seam), text on the left, thin gold frame. Re-run to regenerate. Same file feeds both the README hero and `docs/builder-mode.md`.

**Why**

The cover is the first thing a visitor sees; the figure cut in half looked broken. Rebuilding from the original art (recomposing, not re-illustrating) keeps the exact illustration while fixing the composition, and the half-height strip stops the README opening from being a vertical wall.

**What to revisit**

- The v1.28-era note still describes this asset as "16:9 / 521KB" — left as-is (append-only log); this entry supersedes it.
- If a "Fable 5 / latest model" callout is wanted again, add it as a small corner tag that does **not** overlap the figure.

## 2026-06-26 — v1.28 · Two go-live guardrails baked in from real incidents (apex+www TLS, finish-with-links)

**What changed**

- **Apex **and** www TLS guardrail** — `factory/playbooks/ai-native-2026/go-live-provisioning.md`: stage 1 (domain) now attaches **both** the apex and `www` as Vercel project domains (+ `www → apex` 308 redirect), and assertion **A2** now verifies a valid cert on the apex **and** `www`. A2 was apex-only — which is exactly how a missing-www cert slips through, since A1 already checked DNS for both. New learning: `brain/learnings/2026-06-26-vercel-www-cert.md`.
- **Finish every response with the live + localhost links** — global `~/.claude/CLAUDE.md` + `BEST-PRACTICES.md` (*Run the factory*): any response involving a localhost or deployed/live URL ends with those links, labeled, as a required step. Learning: `brain/learnings/2026-06-26.md`.

**Why**

Both are end-moment footguns that look fine during the build and bite at/after launch — same shape as the auth-go-live lesson (2026-06-09). The trigger for the TLS one was a real `patently.legal` block: `www` resolved to Vercel and 307-redirected to the apex, but **no cert covered `www`** (Vercel only issues certs for names attached to the project), so browsers/NordVPN threw "This connection isn't private." One-command fix (`vercel domains add www.<domain>`). A portfolio sweep found the same gap on `theresasystemforthat.xyz` — both now serve valid certs on apex + www. Promoting each miss into a playbook assertion is the factory's own rule ("recurring failures get promoted into the playbook as a pre-check").

**What to revisit**

- A2 lives in the design-spec playbook (not yet built automation) — wire the apex+www cert assertion into the eval harness when `/go-live` graduates from spec to code.
- This log was behind: several factory items since v1.27 (`/tidy` 06-20, `repolish` + `ship-guard` 06-23, local vision model 06-21) aren't yet logged — backfill as their own entries.

---

## 2026-06-14 — v1.27 · `/go-live` — the 25-min account setup becomes a guided, resumable flow

**What changed**

- **New `/go-live <slug>`** — command (`factory/commands/go-live.md`) + skill (`factory/skills/go-live/SKILL.md`). Walks production-stack provisioning **service by service**: explains each, opens the signup deep-link, asks for the key, **validates its format** (Supabase JWT, `sk_/whsec_/pk_`, `re_`, `phc_`, Sentry DSN, …) before writing it to `.env.local`, and **marks it in a resumable ledger** (`.hamzaish-go-live.json`, gitignored) so you can stop and pick up later. Automates the post-signup steps (Vercel `env add`, `gh secret set`, Cloudflare DNS) with confirmation. Ends by handing off to `/security-check` → `/ship`.
- **It composes, doesn't duplicate**: `/builder-mode` (build local) → `/go-live` (wire stack) → `/security-check` (gate) → `/ship` (deploy) → `/web-launch` (verify). `/go-live` provisions; `/ship` still owns deploy.
- **Honest-copy unlock**: now that `/go-live` exists, the README quickstart, `SETUP.md`, and CLAUDE.md name it. `SETUP.md` stays as the manual fallback/reference; `/go-live` is the walked path.
- **Counts updated honestly**: 27 → **29 skills & commands** (17 skills + 12 commands) — recomputed from the filesystem (aliases like `/builder-mode` not double-counted).

**Why**

v1.25 made the *first run* zero-account; v1.26 made *getting there* one command. The remaining friction was the other end — the 25-min, 11-service manual `SETUP.md` when you finally go to production. `/go-live` turns that static checklist into a walked, validated, resumable flow, and finally lets Builder Mode's "ship when you're ready" point at a real command (held back until now per the honest-copy rule — naming a command that didn't exist was off-limits).

**What to revisit**

- It's a markdown skill (the session executes it), not a binary — provisioning quality depends on the session following the catalog. First real `/go-live` on a product is the live test; tighten the catalog/regexes from what that surfaces.
- Account *creation* stays manual (can't be automated); the speed win is in guidance + validation + post-signup CLI + resume. Measure the real before/after on the next product to confirm the ~25→~8 min estimate.

---

## 2026-06-14 — v1.26 · 🪄 One command from a bare machine to a running factory

> ## 🪄 `curl … | sh` → Bun installed, Hamzaish cloned, factory ready
> **The other half of the 100×: getting *to* the zero-config first run is now one line.**

```sh
curl -fsSL https://raw.githubusercontent.com/hamza-ali-shahjahan/hamzaish/main/install.sh | sh
```

**What changed**

- **`install.sh`** (new, repo root) — a POSIX-`sh` bootstrap: checks git, **installs Bun if it's missing** (official bun.sh installer), clones Hamzaish (or fast-forwards an existing clone), runs `bun run setup`, checks for Claude Code, and prints the first command (`/builder-mode …`). Idempotent and safe to re-run; `HAMZAISH_DIR` overrides the target. Parses clean under `sh -n`.
- **README quickstart leads with the one-liner**; the manual `git clone` path is preserved in a `<details>` fold. The installer is linked inline ("read it first") — security-conscious users can inspect before piping.

**Why**

v1.25 made the *first run* zero-config; a newcomer still had to install Bun, install Claude Code, clone, and run setup by hand — 4 steps with bounce points. Now it's one paste from a bare machine. Combined with local-first, the path from "saw the repo" to "a product running on my screen" is a single command plus `/builder-mode`. Claude Code is *checked, not auto-installed* (its install varies by platform; honest guidance beats a guess).

**What to revisit**

- `curl … | sh` is the standard install pattern but inherently asks for trust — the inline "read it first" link + the script's own header mitigate it. Consider an alias `hamzaish.com/install` → this raw URL (cleaner to share; lives in the landing-page repo, not here).
- The script can't auto-install Claude Code reliably; if a common platform path emerges, add an opt-in prompt.

---

## 2026-06-14 — v1.25 · ⚡️ Builder Mode is now 100× FASTER to start 🚀

> # ⚡️ ZERO → RUNNING PRODUCT IN ~60 SECONDS ⚡️
> ## 🏭 No accounts. No config. No signups. Just build.
>
> **Local-first by default.** `/builder-mode <idea>` → `bun dev` → a real, running product on your screen — *before* you create a single account. 🎉

This is the biggest first-run speed jump yet: the starter now boots **completely local**. You build first and wire your stack (Stripe, Resend, Supabase…) only when *you* decide to.

### 🏎️ What changed — and how it speeds up your first run

- **🟢 Boots with ZERO env vars.** `src/lib/env.ts` defaults the app vars and makes Supabase optional, so the app no longer needs a database connection just to run. → **Impact:** a brand-new builder goes straight from clone to a running app — the account-setup detour is gone from the critical path.
- **🧩 A local dev stub** (`src/lib/supabase/stub.ts`) stands in for Supabase in local mode — `auth.getUser`, `from().insert`, etc. Landing, pricing, dashboard, settings all render; `/login` greets you as a local dev user; the waitlist accepts input. → **Impact:** every page *works* on the first `bun dev`, so you're building features in minute one instead of provisioning services.
- **📋 Accounts moved off the starting line.** `SETUP.md` is now the **go-live checklist** (wire it when you ship), `.env.example` says "you need NONE of these to start," and `/scaffold` prints the zero-config promise. → **Impact:** the ~25-min account setup becomes a *later, opt-in* step — not step zero.

### 🧭 Why

Builder Mode is **momentum-first**: the fastest possible first run is local. Build now, add capability the moment you need it, ship when you're ready. Previously the starter expected a Supabase connection to run — instant if your tools are already set up (it's why a seasoned builder gets a win in ~5 minutes), but a first-timer had to provision accounts before that first `bun dev`. Now **everyone** gets the instant local first run, and reaches for the stack on their own schedule. The second a builder adds Supabase, the real client takes over automatically — the stub is never touched.

### ⏱️ First-run, before vs after

- **Before:** install → clone → setup → *create Supabase (+ friends), fill env* → run
- **After:** install → clone → setup → **run.** ✅ (accounts become a later, opt-in step)

**What to revisit**

- Runtime-verify on a real `/scaffold` (`bun install && bun dev`, empty env) — the template can't be booted in-repo (placeholders + no node_modules); the next scaffold is the live test.
- `LOCAL_MODE` persistence is a no-op (stub logs, doesn't store). A real SQLite/JSON local store for the waitlist is a nice next touch, deliberately omitted — products customize the data layer anyway.
- Next: **#1** (one-command bootstrap installer) so getting *to* the zero-config first run is also one line — the rest of the 100×.

---

## 2026-06-13 — v1.24 · Movement 1, brick #3: the headless runtime (generate → harness → route)

**What changed**

- **`factory/runtime/`** — the headless runtime: a program that calls Claude as a subroutine, runs the harness's verdict on the output, and **routes on that verdict without a human in the loop**. This is the runtime `meta/SELF-EVOLUTION.md` reaches for and `brain/knowledge/2026-06-04-interactive-vs-headless-self-evolving.md` describes ("the loop has to live in a script that calls Claude").
  - **`loop.ts`** — `runTask()`: the generate → verdict → route loop with a four-way router (PASS → keep · FAIL_BUILDABLE → feed the failed criteria back and regenerate ≤ `maxAttempts` · GAP → write a proposal stub, never guess · UNCERTAIN → escalate). It is a **composer**: it imports `runInvocation`, `runChecks` (`meta/evals/lib/checks.ts`) and `llmJudge` (`meta/evals/lib/judge.ts`) as a library — no primitive reimplemented, `run.ts` untouched. Generate + judge are injectable seams so every route is force-testable.
  - **`loop.test.ts`** — 9 force-tests driving every route with fakes (no Claude calls): PASS, FAIL_BUILDABLE→regen→PASS, give-up-after-maxAttempts, judge-demotes-green (gate-not-oracle), judge-UNSURE→UNCERTAIN, judge-unavailable→UNCERTAIN, GAP→proposal, generator-fail→UNCERTAIN, no-judge-path.
  - **`run-task.ts`** — hand-runnable CLI carrying the `/ideate` demo task; prints the trace. **`proposals/`** — the Movement 2 inbox (GAP proposals land here; generated files gitignored, README tracked). **`README.md`** — the bench-vs-loop distinction, the routing table, why the runtime is *not* agent-blind, the named OUT list.
- **Live evidence**: 1 demonstration run + a **5-sample reliability pass** — 5/5 final PASS, all via attempt-1 FAIL_BUILDABLE → fed-back criterion → attempt-2 PASS (regen recovered 5/5), mean 5.2 min/run. The feedback loop genuinely bites and recovers; zero flakes, judge never spuriously blocked.

**Why**

Selection (the judge) was something a *human* invokes against frozen fixtures. The runtime is the surface where the verdict drives the next move on its own — the bridge from "Closed" to "Self-cranking" on the rung ladder. The load-bearing design call: the runtime is the **opposite** of the eval bench. The bench is agent-blind (the SUT must never see its test); the runtime *deliberately feeds the criteria back* to steer regeneration, because here the criteria **are the spec** (the `/spec`-with-executable-scenarios idea). So it lives in `factory/` (HOW YOU ACT), not `meta/evals/` — the wall between bench and loop stays clean.

**What to revisit**

- The 5/5 sample proves recovery on **one** failure mode (a well-specified deterministic criterion) on **one** skill. It does *not* yet prove **live judge discrimination** (the judge ran 5/5 but never on output it should reject), nor **GAP/UNCERTAIN live** (force-tested with fakes only). Next sampling pass: a deliberately judge-failing task + a live GAP trigger.
- Generalize beyond `/ideate` to arbitrary skills/specs once the shape is confirmed in use.
- The GAP → proposal path is a **stub** (writes a proposal, stops); auto-promotion into a guardrail is **Movement 2**, which stays last by design. `proposals/` is its inbox.
- Transport is `claude -p`; swap to the Agent SDK when streaming / richer tool-use is needed — no change to `runTask`'s shape.

---

## 2026-06-13 — v1.23 · `/builder-mode` — the front door now enacts the mission

**What changed**

- **New command `/builder-mode`** — `factory/commands/builder-mode.md` is a symlink to `hamzaish.md` (the repo's own alias idiom, same as the web-launch plugin). Both names load the identical momentum router; `.claude/commands/` is a symlink to `factory/commands/`, so it auto-discovers. Zero drift, zero duplicate logic.
- **Docs lead with `/builder-mode`, keep `/hamzaish` working**: README quickstart (`/builder-mode a tip calculator…`), README commands table, `docs/the-momentum-router.md` (retitled, alias noted), `docs/builder-mode.md` closing CTA (`Type /builder-mode <your idea>`), and the CLAUDE.md command row. The ~33 internal `/hamzaish` references are left intact — they still resolve.

**Why**

The entry point should *enact* the mission, not just sit next to it. A new user's literal first action is now `/builder-mode <idea>` — they enter Builder Mode by typing it. Aliased rather than renamed: `/hamzaish` carries the brand namespace and is referenced everywhere; the alias captures the full narrative win at near-zero blast radius.

**What to revisit**

- Committed symlinks materialize as text files on Windows checkouts (no symlink support) — same caveat that already applies to the web-launch plugin symlinks. Fine for the Bun/macOS-first audience; revisit if a Windows contributor hits it.

---

## 2026-06-13 — v1.22 · The Mission: Builder Mode (the front-door story)

**What changed**

- **`docs/builder-mode.md`** (new) — the mission piece: why strategy-first kills builders, the flipped calculus (building is now cheap, fast, reversible — the ship is the test), Builder Mode defined (build aggressively with instinct, validate iteratively, scale with strategy), what it looks like as a working system, and the invitation. Doubles as the operator's LinkedIn article.
- **`docs/assets/builder-mode.png`** (new) — the Builder Mode cover art (16:9, optimized 2.3MB→521KB), used in both the article and the README.
- **README "Welcome to Builder Mode" rewritten as one mission arc** — the 11pm moment → the flip → the mission (operator's words verbatim) → the system. The dangling "Why though?" and the in-section competitor comparison removed (that contrast lives in the "How it's different" table). Cover art embedded, clickable into the full mission.

**Why**

The operator's hand-written mission deserved more than a paragraph squeezed between badges and the quickstart. The mission now has a home (the article), a face (the cover), and a coherent front-door summary — and the README finally tells one story top to bottom instead of three stitched ones.

**What to revisit**

- **Version-number collisions from parallel sessions**: today's log has two v1.20 entries (eval harness + community-standards) and originally two v1.21s (the LLM judge kept v1.21; this entry bumped to v1.22 on rebase). `/release` assembles notes from these headings — de-duplicate the numbering, or switch to date-only headings, before cutting the next release.

---

## 2026-06-13 — v1.21 · Movement 1, brick #2: the judge seam filled — 9 cases, LLM judge live

**What changed**

- **The LLM judge is real** — `meta/evals/lib/judge.ts`. Transport: `claude -p --model haiku` (zero deps, no API key, rides the subscription; missing binary → SKIP). Per-criterion structured verdicts (`PASS`/`FAIL`/`UNSURE` + evidence); **gate-not-oracle enforced by the return type** — no judge value can turn a failing case green. Runs only after every deterministic check passes; any criterion FAIL → `FAIL_BUILDABLE` naming the criterion; UNSURE or judge-unreachable → `UNCERTAIN`. A case whose only check is `llm_judge` is rejected as `GAP` at load time — the judge gates a deterministic floor, never replaces one.
- **9 cases, 3 skills** — the PLAN.md seed target. New: `meta/evals/skills/ideate/cases/` (×3: themed structure+distinctness, kill-criteria discipline, portfolio grounding) and `meta/evals/skills/validate/cases/` (×3: weak-validation fixture with planted gaps must be flagged; strong-validation fixture must be engaged honestly, not reflexively killed; problem-sharpener falsifiability). Every expectation verified against live `claude -p` output before authoring (honest-green floor).
- **Runner upgrades** (`run.ts` + `lib/checks.ts`): new check types `llm_judge` + `stdout_count_min`; `preflight.commands` (missing binary → SKIP); `--no-llm` flag (LLM cases → SKIP — the fast, free gate); concurrency 3; LLM cases get one retry on a non-PASS first attempt; default LLM-case timeout 240s.
- **Regression rule refined**: only `FAIL_BUILDABLE` blocks (exit 1). A baseline-PASS case going `UNCERTAIN`/`GAP`/`SKIP` is a **floor warning** — printed loudly, exit 0. LLM cases are nondeterministic; a judge hiccup must never read as a regression.
- **Real catch during the build**: running cases concurrently exposed `brain/ask.ts` dying with `database is locked` under parallel readers — fixed at the root with `PRAGMA busy_timeout` (readonly readers now wait out transient locks instead of erroring). Parallel sessions hitting the brain simultaneously would have tripped this eventually anyway.
- **Operating principle #13 restored** — "Honest copy — we never claim what isn't true" was recorded in the v1.15 changelog and referenced by the public PR template, but the principle was missing from `brain/operating-principles.md` on every ref (the edit never landed; likely lost between main's rewrites and the v1.19 port). Reconstructed verbatim from the v1.15 entry, operator-approved.

**Why**

This is the second brick of Movement 1 (`meta/SELF-EVOLUTION.md` — Selection): brick #1 proved the harness shape on deterministic retrieval; brick #2 extends the honest judge to the skills that *generate* (ideate, validate), which no deterministic check can grade alone. The judge had to stay a gate — "looks good" reduces nothing; only named criteria with evidence do. The #13 restoration is the honesty system applied to itself: a public template pointed contributors at a principle that didn't exist.

**What to revisit**

- Judge stability over time: if floor warnings from judge `UNSURE` verdicts recur on the same criterion, the criterion is too vague — sharpen it (that's the "waste" loop from SELF-EVOLUTION.md, driving UNCERTAIN to zero).
- Wall time: full 9-case run target < 5 min (PLAN.md trigger). If ideate-case generation grows past it, lower SUT `--max-turns` or trim to 2 ideate cases.
- The headless runtime (`claude -p` loop calling the harness and routing by verdict) is the next arc — the harness now returns everything it needs.
- Changelog-claims-vs-file-reality: the lost #13 means a changelog entry is not proof the edit survives. Spot-check claimed file changes when auditing history (added to learnings).

---

## 2026-06-13 — v1.20 · Movement 1, brick #1: the eval harness exists (Selection is seeded)

**What changed**

- **`meta/evals/run.ts` + `lib/checks.ts`** — the agent-blind eval runner (zero deps; native `Bun.YAML`). Each case gets a **four-outcome verdict**: PASS / FAIL_BUILDABLE / GAP / UNCERTAIN (+ SKIP for missing environment). Executable-criterion-or-GAP enforced at load time; the LLM judge is a stubbed seam with the gate-not-oracle contract documented. `bun run eval`.
- **Regression floor** — `meta/evals/baseline.json` (committed) records the PASS set; a previously-passing case that stops passing exits 1. New failures explain, regressions block. Run reports land in `meta/evals/runs/` (gitignored — derived state).
- **First 3 cases**: `/brain-ask` known-fact retrieval, each expectation verified against the live brain before authoring (honest-green floor). All verdict paths self-tested by forcing them: wrong expectation → FAIL_BUILDABLE, no criteria → GAP, missing env → SKIP, sabotaged baseline case → exit 1.
- **Blindness enforced in code** — `brain/ingest.ts` gains path-prefix SKIP_PATHS excluding `meta/evals/skills` + `meta/evals/runs` from the brain index: the judged system cannot retrieve its own fixtures, rubrics, or verdicts. The first audit caught a real leak (an already-indexed eval rubric) — purged.
- **Two real catches on day one**: the rubric leak, and the harness flagging its own new README as a retrieval regression (the README displaced PLAN.md in BM25 rankings for the verdict query) — criterion refined, lesson recorded in `brain/learnings/2026-06-13.md`.

**Why**

This is Movement 1 of `meta/SELF-EVOLUTION.md` — Selection, the missing third ingredient. Until now "it worked" meant *the builder said it worked*. The maturity ladder now reads: variation ✅ · heredity ✅ (scored via /learn-loop) · **selection ✅ (seeded)**. Approved as the next 10× bet 2026-06-02; built as the de-risking slice from `meta/evals/PLAN.md`'s gate.

**What to revisit**

- Scale to ~9 cases (`/ideate`, `/validate` per PLAN) — requires filling the LLM-judge seam (judge model, rubric format, cost ceiling). Judge must remain a gate, never an oracle.
- Retrieval criteria over a living corpus must expect fact migration — when a red floor means "the corpus improved," widen `any_of` deliberately, never reflexively.
- The headless runtime (`claude -p` loop calling `harness.run()`) is the arc after the 9 cases.

---

## 2026-06-13 — v1.19 · Community-standards pass — GitHub community profile at 100%

**What changed**

- **Code of conduct** — `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1, contact: maintainer email) via GitHub's built-in flow.
- **Issue templates** — `.github/ISSUE_TEMPLATE/`: `bug_report.yml` + `feature_request.yml` (modern YAML issue forms — required fields, no-secrets pre-flight checkbox, lifecycle-stage dropdown) and `config.yml` (blank issues allowed; security reports routed to private vulnerability reporting, never public issues).
- **Pull request template** — `.github/pull_request_template.md`: what-&-why plus a four-line checklist encoding the factory's own discipline (honest copy per operating principle #13, no secrets in the diff, README/ledger counts still match the filesystem, changelog entry for factory-behavior changes).

**Why**

GitHub's Insights → Community Standards checklist showed three gaps after the v1.0.0 public release. A public, forkable repo gets judged on its community profile before its content; the templates also pre-structure incoming reports (repro info up front, secrets warned about, security reports kept private) so triage starts higher-signal. All eight checks now green. Committed by the operator via the GitHub web UI.

**What to revisit**

- If low-quality blank issues appear, flip `blank_issues_enabled` to `false` so the forms are the only door.
- When contribution volume warrants it, add a `CONTRIBUTING.md` section on using the issue forms + PR checklist.

**What changed**

- **The web-launch plugin ported from `feat/web-launch-plugin` to main** — `factory/plugins/web-launch/` (verification-gated launch system: `/web-launch` command, `web-launch` + `launch-gotchas` + `pseo-at-scale` skills, the 411-line launch workbook template), with the skills/command symlinks and `.claude-plugin/marketplace.json` exposure. Plus its decision record (`brain/decision-log/2026-06-09-plugins-vs-operating-skills.md`).
- **Patently launch artifacts** — `products/copyright/launch/launch-checklist.md` (the stamped public-launch checklist from the web-launch dry-run), `competitors.md`, and three decision entries.
- **Momentum-first wording synced** where main had lagged: `brain/operating-principles.md` §1, `AGENTS.md` rule 2, `scripts/check-validation.ts`, `products/_template/validation/README.md`.
- **Template hardening from the branch**: CI `permissions: contents: read` (least privilege) and SHA-pinned third-party actions in `secret-scan.yml`. Plus the Clerk-production-instance hardening in `go-live-provisioning.md`.
- **README inventory updated honestly**: 22 → 27 skills & commands (16 skills + 11 commands); `/web-launch`, `/release`, `launch-gotchas`, `pseo-at-scale` rows added.
- **`feat/web-launch-plugin` retired** after the port — it was a diverged duplicate lineage of main; everything of value now lives on main.

**Why**

The branch held ~820 lines of real, additive work (the launch system) stranded on a stale lineage that generated merge-conflict risk and "Create PR" noise. Porting the additive files directly — instead of merging — captured all the value with zero conflicts, and updating the README counts in the same commit keeps the "every count real" promise intact.

---

## 2026-06-12 — v1.18 · First public release (v1.0.0) + `/release` factory step

**What changed**

- **Cut the flagship [v1.0.0 GitHub Release](https://github.com/hamza-ali-shahjahan/hamzaish/releases/tag/v1.0.0)** — the first *public* release, AGPL-3.0, marked latest. Annotated tag at `main`'s public HEAD; notes assembled from this changelog + the README (momentum-first build, compounding brain, secure-by-default, the impact-scored learning loop; the five live products built through the factory).
- **New `/release` command** (`factory/commands/release.md`) — the public-release step of the factory cycle. At a major-cycle boundary it picks the next semver tag, assembles structured notes from this changelog, tags `origin/main`'s public HEAD, and creates a GitHub Release marked `--latest`. Documented in `meta/factory-improving-factory.md` (new "Publishing the cut" section + checklist item) and this header.

**Why**

The factory had an internal compounding loop (`/learn-loop`) but no external surface for what each cycle shipped. `/release` is the other half of a major-cycle boundary: `/learn-loop` promotes what the cycle *taught*; `/release` publishes what the cycle *shipped* — both fire on the same triggers, neither every session.

**What to revisit**

- When `/release` runs next, confirm the bump heuristic (factory-behavior → minor, fixes/docs → patch) matches how the changelog actually reads; adjust the command if a cycle's scope is consistently mis-sized.

## 2026-06-11 — v1.17 · The depth, surfaced — practices ledger + inventory README

**What changed**

- **README rearchitected around "What's inside"** — the hero now leads with the real counts (128 practices · 32 agents · 22 skills & commands · 39 playbooks, bold, centered), and a new inventory spine catalogs every agent (5 stage tables), every skill/command, and every playbook by name with links. "How it's different" moved after the inventory (comparison after evidence). The products table moved out of the README to `products/SHOWCASE.md` — the page sells the value inside the repo, not the maintainer's portfolio. Counts are computed from the filesystem (the inflated "80+ checks" claim was corrected to the verified 59).

- **`BEST-PRACTICES.md`** (new, repo root) — 128 practices for *shipping products* with Claude Code, distilled from all 39 playbooks + 3 incident-backed anti-patterns + the learnings corpus. Every line: one-sentence tip · honest badge (✅ 26 proven by real ships/incidents · 🟡 3 partial · ⏳ 99 research-baked) · exact source · link to the deep file. Anti-patterns lead ("each one cost us something real"); sections follow the lifecycle (Ideate → MVP → AI-native → Launch → Sell/Scale → Founder's wisdom → Factory ops); closes with the honesty system that enforces the badges.
- **README** — practices-ledger line added under the hero proof line.
- **`factory/commands/learn-loop.md`** — promotion step now also adds the promoted practice's one-liner to the ledger (keeps it living, not a snapshot).
- **`brain/anti-patterns/README.md`** — new anti-patterns also get a ledger one-liner; stale "none yet" seed list replaced with the 3 real entries.

**Why**

Studying shanraisshan/claude-code-best-practice (57k★ in 7.5 months) showed the mechanics of *felt* depth: scroll density, per-tip attribution, implemented-or-not markers. Hamzaish had the substance (39 sourced playbooks, dated incidents, a stricter honesty system) but zero surface — cloners never open the folders. The ledger is that surface, in the unclaimed lane ("shipping products" vs Shayan's "using Claude Code" — credited and linked, not competed with). Counts computed honestly; 5 cross-folder duplicate tips deduped; nothing marked proven without a named ship or dated incident.

**What to revisit**

- The ledger is hand-curated v1; if drift appears between it and the playbooks, build the regeneration script the page's footer implies.
- When ⏳ practices graduate via /kill-or-keep, re-badge them here (the learn-loop step covers new promotions; graduations are manual until scripted).

---

## 2026-06-09 — v1.16 · Hardened global hooks + impact-scored learning loop

**What changed**

- **Global hooks hardened (root-cause fix for session hangs).** `scripts/auto-commit.sh` (Stop) and `scripts/auto-pull-rebase.sh` (SessionStart) now: (1) wrap every blocking git op in a portable `run_with_timeout` shim — `gtimeout`/`timeout` if present, else a pure-bash watchdog — at commit ≤10s, push/pull ≤20s; (2) **fail open** — any timeout/error prints one stderr line and `exit 0`, so a hung network call can never wedge a turn; (3) **scope to Hamzaish-managed repos** via a new `is_hamzaish_managed` gate (the Hamzaish repo itself / a path registered in `code-paths.local.json` / a `.hamzaish-managed` marker), so the hooks no longer fire in every unrelated repo on the machine. Opt-in push + secret scan preserved. New committed `.hamzaish-managed` marker self-identifies the repo + documents the marker. Both scripts pass `bash -n`. Docs updated in `CLAUDE.md` §"Auto-commit + auto-push safety net" and `AGENTS.md`.
- **Impact-scored, self-evolving learning loop added.** New rubric `meta/learning-loop-rubric.md` (major-cycle triggers; 5 axes — Speed ×2, Build-quality ×2, Recurrence, Generalizability, Confidence → composite /35; promote top ~3 at ≥24/35; promotion targets; `/kill-or-keep` feedback step; scored-entry format). New `/learn-loop` command (`factory/commands/learn-loop.md`) runs the pass at a major-cycle boundary. Wired into the README "Self-improvement loop" section and `meta/factory-improving-factory.md` (new scored-pass section + quarterly feedback bullet).
- **`/learn-loop` (seed cycle — factory-change trigger): scored 1 candidate, promoted 1** (→ `brain/anti-patterns/unbounded-git-in-global-hooks.md` + the hardened hook scripts). Seeded scored entry: `brain/learnings/2026-06-09-hook-hang.md` (Composite 33/35, PROMOTED).

**Why**

Unbounded git/network ops in the always-on global hooks caused repeated multi-minute session hangs during a heavy build session — a convenience safety-net was wedging the work, in repos it didn't even manage. Fixing it at the source (timeouts + fail-open + scope) removes the failure class. Separately, the existing learning loop captured everything but had no forcing function for *what to promote*; the scored loop turns "we wrote it down" into "the factory got measurably harder to break," and `/kill-or-keep` now prunes promotions that didn't pay off so the guardrail set can't ossify.

**What to revisit**

- 2026-09 `/kill-or-keep`: re-check the seeded hook-hang promotion (no recurrence? scope gate not suppressing wanted commits?) → VALIDATED or revisit limits/scope rule. Generally, run the feedback pass on all PROMOTED entries whose feedback-check date has passed.
- Tune the timeout limits (10s/20s) if real remotes need more headroom; tune the ≥24/35 threshold once a few cycles of data exist.
- `CLAUDE.md`'s footer version line still reads v1.4 (stale vs. this changelog); fold into a future docs pass.

---

## 2026-06-07 — v1.15 · Honest-copy principle (#13) added to the don't-violate list

**What changed**

- **New operating principle #13 — "Honest copy — we never claim what isn't true"** in [`brain/operating-principles.md`](../brain/operating-principles.md). All outward-facing copy (landing pages, OG/social cards, ads, emails, in-app text) must be true and verifiable the moment it ships: no invented stats, no "full/every" coverage we don't have, no implied-but-unbuilt capabilities. Aspiration is allowed only when labelled ("coming soon", "in beta"). Includes a ship-gate (link the source of truth or cut the claim) and the originating catch.
- **README "The discipline (don't violate)" gains item #6** mirroring the principle, plus a one-line statement of the build ethos (ethical, high-standard, passion/energy; under-claim and over-deliver) so anyone visiting the repo sees the bar.
- **Patently OG card corrected** — `products/copyright-code/src/app/_og/render.tsx` footer changed from "9M+ opinions · full patent record · 22M+ registrations" (data not live; "full" overstated) to "Research · Clearance · Daily digests" (what the product genuinely does).

**Why**

The operator caught the Patently OG card asserting dataset counts and "full patent record" before that data was live — a present-tense claim a user could disprove. Trust is the entire moat for a decision-support tool; an inflated claim poisons every true one. We already keep an honest ledger internally (proven vs. research-baked); this extends the same standard to outward copy and encodes the catch as a rule the next session can't miss.

**What to revisit**

- The Patently homepage (`products/copyright-code/src/app/page.tsx`) still shows "9M+ / 1976→ / 22M+" framed as dataset coverage with source attribution. If that data isn't actually ingested/live, those need the same treatment (label as coverage of the *source* datasets, or cut). Flagged to operator.
- Consider a lightweight `bun run check-copy` lint that flags un-cited numerals/"full|every|all" in marketing components, the way `check-validation` enforces principle #1.

---

## 2026-06-07 — v1.14 · Starter→Bun, two live products on the proof list

**What changed**

- **Product-starter template converted to Bun** — resolves the v1.13 "what to revisit" item. `.github/workflows/ci.yml` (now `oven-sh/setup-bun` + `bun install --frozen-lockfile` + `bun run …` + `bunx playwright`), `playwright.config.ts` webServer (`bun run dev`), `package.json` (dropped `packageManager: pnpm`, added `engines.bun`), and `SETUP.md` Tests/CI docs all on Bun. Scaffolded products now match the documented Bun default end-to-end.
- **Ventbox + TASFORT added to README "Products built with Hamzaish"** — both verified live via WebFetch (2026-06-07): [ventbox.co](https://ventbox.co) (anonymous employee-feedback platform, pricing free→$49/mo) and [theresasystemforthat.xyz](https://theresasystemforthat.xyz) (systems-of-remarkable-people discovery product). Their `product.config.json` files updated with real one-liners, `prod_url`, stage `idea/mvp`→`launch`, and verified notes.
- **IP Radar → Patently** — renamed across README proof list + `products/copyright/` (config name/aliases/links, status.md). Verified live in private beta at [patently.legal](https://patently.legal) (tagline "Ship without blindsiding yourself on IP."); the previously-open "pick a domain" task is now resolved. `_portfolio.md` rows + stage counts hand-updated for all three live products (Ventbox, Patently, TASFORT now under a new "Launch (live)" group).
- **`.no-auto-commit` marker added** (gitignored) — operator set "auto mode, but no commits without approval"; the marker disables this repo's global auto-commit/push Stop hook. Remove it to re-enable.

**Why**

The v1.11 last-mile work shipped the template's test/CI scaffolding in pnpm while v1.13 made Bun the canonical default — leaving the scaffold inconsistent with the docs. Converted it (CI touched, so verified the YAML, not a blind sweep). Separately, the operator corrected the record: Ventbox and TASFORT aren't pre-ship — they're live, so they earn the proof list.

**What to revisit**

- CI uses `bun install --frozen-lockfile`, which needs a committed `bun.lockb`; a freshly-scaffolded product must `bun install` + commit the lockfile before its first green CI run.
- Ventbox/TASFORT analytics IDs still null — backfill PostHog/GA/etc. so they surface in `/portfolio-pulse` telemetry.

---

## 2026-06-07 — v1.13 · Stack reconciled to a single source of truth + "set up once" front door

**What changed**

- **`stack/README.md`** (new) — the missing front door: *"Your stack & accounts — set up once."* Lists the sign-up-once accounts (reused across every product), and — the part that was missing — **what each service unlocks *beyond the obvious*** (Vercel = provisioning marketplace + v0, PostHog = 5 tools in one, Neon = git-style DB branching, etc.). Plus a noob-friendly "what is Bun / a package manager / runs-TS" explainer. Wires to `setup.ts` + `SETUP.md`.
- **`stack/tech-stack.md`** — bumped Next.js 15→16; added **Bun** as the canonical runtime/pkg-manager row; documented the **Neon + Clerk** multi-tenant-B2B scale path as the #1 deviation (proven on IP Radar + Scope Intelligence); refreshed the "default =" line.
- **`stack/stack-selection.md`** + **`stack/analytics-stack.md`** + **`templates/.../SETUP.md`** — pnpm → Bun in the canonical-default references.
- **`brain/identity/operator.local.md`** — reconciled stack defaults to what actually ships: TanStack Start → Next.js 16 (TanStack noted as the Lovable-driven deviation), Cloudflare Workers → Vercel (CF noted as edge-first deviation). Bun/Supabase/Resend kept (already matched).

**Why**

Operator asked whether the factory documents the stack + the one-time account setup a new user needs. It did — but auditing surfaced **drift across three sources**: the documented default (Supabase/Next 15/pnpm), what products actually ship (IP Radar = Neon/Clerk/Next 16; both serious SaaS use Clerk), and the operator-identity file (TanStack/Bun/Cloudflare). **Neon — a service in active production use — wasn't documented anywhere.** Reconciled to one canonical default chosen by *revealed preference* (what ships) + the "set up once, beginner-friendly" goal: **Next.js 16 · Bun · Tailwind v4/shadcn · Supabase · Stripe · Resend · Vercel · Claude**, with **Neon + Clerk** as the documented scale path. Bun over pnpm chosen deliberately (operator preference + the factory's own runtime + one-tool simplicity); Next.js over the operator's stated TanStack preference (revealed preference + Vercel-native + biggest LLM corpus → Claude writes it best).

**What to revisit**

- **The product-starter template is still pnpm-wired end-to-end** (`package.json` packageManager, `.github/workflows/ci.yml`, `playwright.config.ts`, vitest, README). The docs now say Bun; the scaffold still emits pnpm. Convert the template to Bun as a focused follow-up (touches CI — needs verification, not a blind sweep) so scaffolded products match the documented default.
- If the operator later decides TanStack/Bun/Cloudflare *is* a real forward conviction (not stale preference), flip the default and mark current Next.js/Vercel products as the deviations instead.

---

## 2026-06-07 — v1.11 · Closing the last-mile gap (tests, CI, prod-ops, validation enforcement)

**What changed**

- **Test scaffolding in the starter** — `templates/product-starter-nextjs/` now ships Vitest (unit + component, jsdom) and Playwright (e2e smoke), with example tests (`src/lib/utils.test.ts`, `src/__tests__/smoke.test.tsx`, `e2e/smoke.spec.ts`), `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, new `test*` scripts + devDeps, and `.gitignore` entries. The "testing" milestone is no longer left to the user.
- **CI/CD template** — `.github/workflows/ci.yml`: typecheck → lint → test → build → e2e on every push/PR, with throwaway placeholder env for the build (real secrets stay in Vercel). Replaces the all-manual deploy story.
- **Production-ops playbooks** — `factory/playbooks/scale-stage/production-operations.md` (severity ladder, incident loop, DB-down runbook, backup/DR) and `abuse-and-cost-controls.md` (rate limiting, bot defense, LLM/scan-billed cost caps, kill switch). Routed in `CLAUDE.md` + `SETUP.md`.
- **Validation enforcement** — convention → speed bump. New `scripts/check-validation.ts` + `bun run check-validation <slug>`, a per-product `validation/` ledger (`products/_template/validation/README.md`), wired into `/scaffold` and `/hamzaish` guardrails. Building unvalidated is allowed; building unvalidated *silently* is not.
- **`meta/RESEARCH-BAKED-PRACTICES.md`** (new) — the honest ledger separating *proven scar tissue* from *research-baked* (best-practice-but-unproven-here) guardrails. README's "What you inherit" boundary now points to it.
- **README** — discipline rule #1 now cites the enforcement; the honest-boundary line reflects the filled gaps as research-baked.

**Why**

A gap audit (prompted by the "impressive prototype vs. real product" curve) found Hamzaish strong at 0→MVP but thin on the unglamorous last mile: no test harness in the starter, no production-ops layer, no CI, and "validate before build" enforced only by convention (and self-violated on wp-to-astro). These changes close those gaps — honestly labelled as research-baked until a real ship proves each one.

**What to revisit**

- The CI placeholder env / pnpm version may need per-product tuning — first real push will tell.
- Every row in `RESEARCH-BAKED-PRACTICES.md` graduates (or gets corrected) on first real-world contact. Move graduated rows + update playbook provenance when that happens.

## 2026-06-04 — v1.10 · One-command setup (makes "set up for you" actually true)

**What changed**

- **`scripts/setup.ts`** — the onboarding script. `bun run setup` turns a fresh clone into a working factory: confirms Bun, creates `code-paths.local.json` + `brain/identity/operator.local.md` from templates (skip-if-exists), wires the 4 global slash commands into `~/.claude/commands/` (skip-if-already-linked), builds the brain index, prints next steps. Idempotent; **never overwrites existing `.local` files or existing command symlinks.**
- **`package.json`** (new, minimal) — `bun run setup` / `ingest` / `ask` / `sync-refs` aliases. Zero runtime dependencies; no `bun install` needed.
- **README `## Quickstart`** — clone → `bun run setup` → done, ≈2 min. Placed up top so it's the first thing a stranger sees.

**Why**

Reality-check on the landing page: the claim **"Everything, set up for you / no wrestling with tools or configs"** was *false for a first-time cloner* — they'd have had to install Bun, hand-copy two `.example`→`.local` files, symlink commands, run ingest, and learn the structure. The setup script collapses all of that to one command. That's the difference between "Hamza's personal thing" and "a thing a stranger can actually start with" — directly serves the democratize-it mission.

**Tested on the maintainer's own machine** (the hard case): it correctly created the missing `code-paths.local.json`, **skipped** the existing `operator.local.md` and all 4 command symlinks (zero clobber of real data), and re-ingested. Proves idempotency + non-destructiveness in one run. (This is the output-validation-for-codegen-tools playbook applied to our own script — test the real run, not just the logic.)

**Landing-page reality scorecard after this** (from the same session):
- ① "Everything set up for you" — was ❌, now ✅ (one command)
- ② "Momentum over research" — ✅ (momentum router, already shipped)
- ③ "A builder's brain, shared" — 🟡 (you inherit accumulated lessons today; auto-getting-smarter is the self-evolution arc; cross-builder sharing is Movement 3)

**On MCP** (operator asked): decided NOT to build an MCP server now. It doesn't solve onboarding — the hard part is the *corpus* (your products + learnings), not the *interface*. An MCP server connected to an empty Hamzaish is empty. MCP IS the right *eventual* cross-agent interface (one server > N tool-specific files for Codex/Cursor/etc.), but post-Muakkil. Captured for later.

**What to revisit**
- Optional interactive prompts in setup (ask name/email/stack and pre-fill operator.local.md) — deferred; v1 keeps it robust + non-interactive (testable). Add `--interactive` later if the manual edit step is friction in the stranger test.
- The stranger UX test (gate #3) should run *through* `bun run setup` now — it's the real first-30-min path.
- `npx hamzaish init` (vs `bun run setup`) needs the package published — a post-flip nicety.

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
