<div align="center">

# 🏭 Hamzaish

**Claude Code setup that builds, launches, and learns.**
Your AI writes the code. Hamzaish runs the company.

[![🌱 Beginner-Friendly](https://img.shields.io/badge/%F0%9F%8C%B1_Beginner--Friendly-8957e5.svg)](docs/start-here.md)
[![Secure by default](https://img.shields.io/badge/Secure-by%20default-success.svg)](docs/security.md)
[![License AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![version](https://img.shields.io/github/package-json/v/hamza-ali-shahjahan/hamzaish?label=version&color=8957e5)](meta/changelog.md)
[![guards](https://github.com/hamza-ali-shahjahan/hamzaish/actions/workflows/ci.yml/badge.svg)](https://github.com/hamza-ali-shahjahan/hamzaish/actions/workflows/ci.yml)

<img src="https://img.shields.io/badge/35-stage_agents-8957e5.svg" alt="35 stage agents">
<img src="https://img.shields.io/badge/67-skills_%26_commands-d97757.svg" alt="67 skills & commands (44 skills, 23 commands)">
<img src="https://img.shields.io/badge/51-playbooks-blue.svg" alt="51 playbooks">
<img src="https://img.shields.io/badge/70-security_checks-success.svg" alt="70 security checks">

[![works with Claude Code, Cursor, Codex, Windsurf](https://img.shields.io/badge/works_with-Claude_Code,_Cursor,_Codex,_Windsurf-d97757.svg)](AGENTS.md)
[![AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)

**[Install](#install) · [What you get](#what-you-get--what-you-bring) · [What's inside](#whats-inside) · [Philosophy](docs/philosophy.md) · [Docs](docs/)**

</div>

## See it work

<p align="center">
  <img src="docs/assets/hamzaish-hero-card.gif" alt="Hamzaish — unlock your Builder Mode, with a live eval run as proof" width="820">
</p>

<p align="center"><b>Unlock your Builder Mode.</b></p>

Point Hamzaish at an idea — and run the whole company around the code your agent writes: **idea → MVP → launch → sell → scale**, with a brain that remembers every lesson and a judge that refuses to let "looks done" pass for "done."

**The honesty is enforced, not promised → [watch the guards run on every commit](https://github.com/hamza-ali-shahjahan/hamzaish/actions/workflows/ci.yml).**

## What this is

**Hamzaish is an open-source agent OS for Claude Code that puts you in Builder Mode — and keeps you there for the whole life of a product.** Your agent supplies the hands — the model, the sessions, the code. Hamzaish supplies everything that makes those hands a company: **a brain** that carries every ship's lessons into the next one, **a factory** of stage agents and playbooks for the whole product life — **Ideate → MVP → Launch → Sell → Scale → Kill-or-double-down** — and **a judge**: mechanical verification gates, walled off from the builder, that refuse to let "looks done" pass for "done." That last part is the line between Builder Mode and vibe coding, and it's the part the factory is evolving hardest: an honest, automated, blind judge for everything it builds.

**Unlock your Builder Mode.**

</div>

## What it looks like

Every task opens with a plan in plain words and closes with a receipt. The
receipt's **Checked** line is not written by the session — it's rendered from
recorded exit codes, so it can report a failure the narration would have glossed.

Here is a real run from this repo:

```
🏭 Hamzaish plan
- Goal: prove the honesty gates work on the factory's own code
- Steps: run every gate · record what really happened · render the receipt
- Commands: /checkpoint — a named save-point before anything changes
- Proof before done: the gates' own exit codes, not my summary of them
```

```console
$ bun run verify --all
✓ check-evals                    (exit 0, 18ms) → recorded
✓ check-model-independence       (exit 0, 16ms) → recorded
✓ check-product-layout           (exit 0, 18ms) → recorded
✓ check-skill-command-collision  (exit 0, 14ms) → recorded
✓ check-limitations              (exit 0, 17ms) → recorded
✓ check-decisions                (exit 0, 19ms) → recorded
✗ check-counts                   (exit 1, 63ms) → recorded

Checked: check-decisions, check-evals, check-limitations, check-model-independence,
check-product-layout, check-skill-command-collision were run and passed;
check-counts was run and FAILED
```

That failure was real: a product config carried a machine path where the rules
require none, and five numbers in this README had gone stale. **A hand-written
receipt would have said "gates pass."** The whole run — including the failing
gate's output — is kept in [`evidence/`](evidence/2026-08-16-verification-ledger/).

Honest about the ceiling: the ledger is **tamper-evident, not unforgeable**. The
records hash-chain, so an edit is detectable and an empty ledger reads *"nothing
was verified"* instead of reading as success. A session with a shell can still
append a lie — that's the real limit of a single-agent design, and the code says
so where it lives.

## Quick start

You need [Claude Code](https://claude.ai/code) on a paid plan, [Bun](https://bun.sh),
and the [GitHub CLI](https://cli.github.com) for the git-facing skills.

```bash
curl -fsSL https://raw.githubusercontent.com/hamza-ali-shahjahan/hamzaish/main/install.sh | sh
```

<details><summary>…or set it up by hand</summary>

```bash
git clone https://github.com/hamza-ali-shahjahan/hamzaish.git
cd hamzaish
bun run setup        # idempotent — creates YOUR factory, never touches existing data
```
</details>

Watch it check itself before you build anything with it:

```bash
bun run verify --all
```

Then open Claude Code in the folder and type:

```
/builder-mode <your idea>
```

You get a **local-first product running in 60 seconds.** Local is mile one:
**`/go-live`** wires the accounts you set up once, **`/security-check`** gates it,
and **`/ship`** puts it on a URL you can share.
([The 10-minute guided version →](docs/your-first-product.md) · [never used a terminal? →](docs/start-here.md))

**Just want the pieces?** `claude plugin marketplace add hamza-ali-shahjahan/hamzaish`
installs `repo-scout` or `web-launch` into your own repo.

## What it is

**An open-source agent OS that puts you in Builder Mode and keeps you there for
the whole life of a product.** Your agent supplies the hands. Hamzaish supplies
what makes those hands a company:

- **A brain** — learnings, decisions, and anti-patterns in markdown, SQLite-indexed,
  searchable from any session. When a mistake generalizes it becomes a guardrail
  the next build inherits, so your second product starts smarter than your first.
- **A factory** — 35 stage agents and 44 skills + 23 commands across
  Ideate → MVP → Launch → Sell → Scale → Kill-or-double-down. Most AI tools stop
  when the code is done; solo projects die *after* that — in the security review,
  the launch, the pricing call, the kill decision.
- **A judge** — mechanical gates, walled off from the builder, that refuse to let
  "looks done" pass for "done." That line is the difference between Builder Mode
  and vibe coding, and it's the part evolving hardest.

**Build is the default.** The old advice — plan, size the market, twenty
interviews *before* you build — was written for when building was expensive.
Building is cheap and reversible now, so the thing you ship *is* the test.
Strategy is a rail you pull in when you want it, never a toll you pay to start.

**One deliberate choice:** Hamzaish ships no agent loop and no model of its own.
It rides an agent host — Claude Code today. That's the design, not a gap. Hosts
get replaced; your brain, your guardrails, and your judge shouldn't be.
([why →](docs/philosophy.md) · [running on other hosts →](docs/host-portability.md))

## What's verified, and how

The honesty is enforced, not promised. Every claim below has a command you can run.

| Claim | How it's checked | Run it |
|---|---|---|
| Headline numbers match the filesystem | every count in this README is derived from disk; drift fails the build | `bun run check-counts` |
| Skills behave as specified | deterministic, agent-blind eval cases (no model or key needed) | `bun run eval --no-llm` |
| New skills carry evals | coverage ratchet — it can only go up, deleting a case fails CI | `bun run check-evals` |
| New skills state their limits | every new skill declares what it can't do | `bun run check-limitations` |
| Decisions record what they beat | decision · why · alternatives · wrong-if · revisit | `bun run check-decisions` |
| A deployed product is really live | read-only assertions against the real URL — DNS, TLS, authz, build-SHA | `bun scripts/verify-live.ts <url>` |
| Nothing ships unreviewed | 70-check security review with a forced BLOCK/CLEAR verdict | `/security-check` |
| What was actually checked | exit codes recorded to a hash-chained ledger, rendered into the receipt | `bun run verify --show` |

Green looks like `✓ all headline counts match disk`, an eval summary of
`PASS=17 SKIP=9`, and silent exit-0 from each guard.

## Known weaknesses

Stated plainly here rather than buried, because a factory that hides its edges
teaches you to trust the wrong things.

- **The judge covers a handful of skills, not every build.** 10 of 78 skills and
  agents carry eval cases; the other 68 are a visible, grandfathered backlog.
  The ratchet means coverage only rises — but today it's thin.
- **The same is true of the new honesty gates.** 4 of 78 skills declare their
  limits; 3 of 31 decision records carry all five elements. Both are backlogs in
  the open, not finished work.
- **The verification ledger is tamper-evident, not unforgeable.** See above. A
  ring-0 boundary is not available to a single agent with a shell.
- **Other hosts are context-level only.** Cursor, Codex, and Windsurf read
  [`AGENTS.md`](AGENTS.md) and follow it. No slash-command ergonomics or
  auto-discovery outside Claude Code yet.
- **`/full-cycle` is gated but not autonomous-safe.** `/auto` still pauses for
  anything irreversible or outward-facing, by design.
- **Evidence is young.** [`evidence/`](evidence/) holds one artifact. Most
  "proven" badges still rest on the ledger of ships, not on files you can open.

## What's inside
## What's inside

| | | |
|---|---|---|
| 🧠 **A brain that remembers** | learnings, decisions, and anti-patterns — SQLite-indexed, searchable from any session via `/brain-ask` | [`brain/`](brain/) |
| 🏭 **A factory that acts** | 35 agents + 67 skills & commands across the lifecycle — idea validation, architecture, scope-guarding, landing copy, SEO, cold outreach, retention, kill-or-double-down | [`factory/`](factory/) |
| 📖 **Playbooks with receipts** | 51 playbooks · 146 practices — each badged ✅ proven by a real ship / 🟡 partial / ⏳ research-baked | [BEST-PRACTICES.md](BEST-PRACTICES.md) |
| 🔒 **A gate that blocks** | 70-check pre-launch security review (backend-reality, auth, authz, data exposure, secrets) with a forced BLOCK/CLEAR verdict | [security checklist](factory/playbooks/mvp-stage/security-checklist.md) |
| 🧪 **An engine that proves** | eval-gated build cycle — a feature slice without a named eval + an end-to-end test doesn't get built | [`/full-cycle`](factory/commands/full-cycle.md) |
| 📡 **Senses that record** | four local-only instruments from your first session (gitignored, nothing leaves your machine): session traces (`bun run trace-report`), friction (`bun run friction`), the defect registry (`bun run defect`), and per-skill trust states (`bun run skill-report`) — retros ground in what happened, not what you remember | [`scripts/trace-report.ts`](scripts/trace-report.ts) |
| 🔭 **A scout that studies** | `/repo-scout` — health-gated, read-only, facts-only assessment of any external repo into a human-reviewed backlog; five hard gates keep the agent unswayed by what it reads. Also ships standalone (MIT): [repo-scout](https://github.com/hamza-ali-shahjahan/repo-scout) | [`factory/skills/repo-scout/`](factory/skills/repo-scout/SKILL.md) |
| 🔌 **A stack you set up once** | Vercel, Supabase, Stripe, Resend, PostHog, Sentry, your domain — sign up once, free-tier-first, pre-wired in every scaffold; every product after plugs into the same accounts | [`stack/`](stack/README.md) |
| 🗂️ **Portfolio discipline** | `/portfolio-pulse` across everything you run; quarterly kill-or-double-down so zombie projects don't eat your year | [`/kill-or-keep`](factory/skills/kill-or-keep/SKILL.md) |

**Every count real, every item linked, every claim badged.** The full catalog, expanded:
<details><summary><b>🤖 The agents (35) — lifecycle + engineering</b></summary>

One router + 31 lifecycle-stage agents + 3 engineering subagents under [`factory/agents/`](factory/agents/). Each is a markdown SKILL.md your session invokes by intent — the routing table lives in [`CLAUDE.md`](CLAUDE.md).

### 💡 Idea stage (7)

| Agent | What it does |
|---|---|
| [idea-generator](factory/agents/idea/idea-generator/SKILL.md) | Generate startup ideas grounded in your patterns, current trends, and validated demand signals |
| [problem-sharpener](factory/agents/idea/problem-sharpener/SKILL.md) | Turn vague observations into testable hypotheses with specific who/when/severity/workaround |
| [devils-advocate](factory/agents/idea/devils-advocate/SKILL.md) | Build the strongest case AGAINST an idea; hunt disconfirming evidence |
| [market-researcher](factory/agents/idea/market-researcher/SKILL.md) | TAM/SAM/SOM, trends, buyer landscape — anchored in citable public data, not vibes |
| [competitor-mapper](factory/agents/idea/competitor-mapper/SKILL.md) | Map the landscape by tier (direct/indirect/acquirer/adjacent) and argue why each could win |
| [customer-discovery](factory/agents/idea/customer-discovery/SKILL.md) | Target profile, prospect list, interview script, outreach setup |
| [interview-synthesizer](factory/agents/idea/interview-synthesizer/SKILL.md) | Synthesize interview batches into evidence-for vs evidence-against |

### 🏗️ MVP stage (5)

| Agent | What it does |
|---|---|
| [architect](factory/agents/mvp/architect/SKILL.md) | Define the architecture BEFORE a line is written — CLAUDE.md, scope.md, 1-page ADR |
| [builder](factory/agents/mvp/builder/SKILL.md) | Drive build sessions with enforced discipline: read context first, one topic per session |
| [scope-guardian](factory/agents/mvp/scope-guardian/SKILL.md) | Block scope creep — every feature ask pressure-tested against scope.md |
| [security-reviewer](factory/agents/mvp/security-reviewer/SKILL.md) | Pre-launch review: auth, data exposure, input validation, dependency vulns |
| [metric-framework-designer](factory/agents/mvp/metric-framework-designer/SKILL.md) | North star, activation, retention targets, Sean Ellis — defined BEFORE launch |

### 🚀 Launch stage (9)

| Agent | What it does |
|---|---|
| [brand-story-builder](factory/agents/launch/brand-story-builder/SKILL.md) | Positioning, story, voice, naming, visual primitives |
| [landing-page-copywriter](factory/agents/launch/landing-page-copywriter/SKILL.md) | Hero + value props + social proof + objections + CTA, anchored on validated pain |
| [seo-strategist](factory/agents/launch/seo-strategist/SKILL.md) | Content hubs, target keywords, internal linking, schema, technical baseline |
| [keyword-researcher](factory/agents/launch/keyword-researcher/SKILL.md) | Real keyword data from GSC + Ahrefs Webmaster + DataForSEO |
| [content-marketer](factory/agents/launch/content-marketer/SKILL.md) | Content calendars and drafts — blog, social, LinkedIn, threads |
| [launch-strategist](factory/agents/launch/launch-strategist/SKILL.md) | Product Hunt, Hacker News, X, LinkedIn, newsletters — sequenced for compounding signal |
| [cold-outreach](factory/agents/launch/cold-outreach/SKILL.md) | First 100 customers by hand: sourcing → personalized messages → cadence → tracking |
| [pricing-strategist](factory/agents/launch/pricing-strategist/SKILL.md) | Packaging, tiers, anchor, monthly vs annual, free vs trial |
| [community-builder](factory/agents/launch/community-builder/SKILL.md) | Discord/Slack/forum, waitlist nurture, early-user comms |

### 📈 Scale stage (6)

| Agent | What it does |
|---|---|
| [growth-loops](factory/agents/scale/growth-loops/SKILL.md) | Design acquisition/monetization/engagement loops (Reforge framework) |
| [retention-analyst](factory/agents/scale/retention-analyst/SKILL.md) | Retention curves, churn drivers, leaky-bucket vs activation-problem diagnosis |
| [pricing-optimizer](factory/agents/scale/pricing-optimizer/SKILL.md) | Post-PMF pricing iteration from real willingness-to-pay data |
| [support-triage](factory/agents/scale/support-triage/SKILL.md) | Categorize, prioritize, draft responses; bug vs user-error vs feature-request |
| [moat-builder](factory/agents/scale/moat-builder/SKILL.md) | Workflow lock-in, data network effects, domain depth, integration depth |
| [compliance-auditor](factory/agents/scale/compliance-auditor/SKILL.md) | SOC2 / GDPR / HIPAA / CCPA gap analysis with prioritized remediation |

### 🗂️ Portfolio (4) + the router

| Agent | What it does |
|---|---|
| [portfolio-conductor](factory/agents/portfolio/portfolio-conductor/SKILL.md) | Where attention goes today — "if you had 4 hours, spend them here" |
| [telemetry-aggregator](factory/agents/portfolio/telemetry-aggregator/SKILL.md) | Metrics across all products in a single view |
| [cross-product-learner](factory/agents/portfolio/cross-product-learner/SKILL.md) | What's working that should propagate; what's failing in similar ways |
| [kill-or-double-down](factory/agents/portfolio/kill-or-double-down/SKILL.md) | Quarterly hard calls: kill, maintain, or double down — forced verdicts |
| [_orchestrator](factory/agents/_orchestrator/SKILL.md) | The routing brain that picks the right agent for the request |

### 🔧 Engineering subagents (3)

| Agent | What it does |
|---|---|
| [code-reviewer](factory/agents/engineering/code-reviewer/SKILL.md) | Deep multi-axis review of a change before merge |
| [security-auditor](factory/agents/engineering/security-auditor/SKILL.md) | Hunts injection, authz gaps, secret exposure, unsafe deserialization |
| [test-engineer](factory/agents/engineering/test-engineer/SKILL.md) | Designs and fills test coverage; reproduces bugs as failing tests |

</details>

<details><summary><b>🛠️ The skills & commands (67)</b></summary>

44 skills + 23 commands under [`factory/skills/`](factory/skills/) and [`factory/commands/`](factory/commands/) — auto-discovered by Claude Code after `bun run setup`. Every `/name` has exactly one home — a skill folder or a command file, never both (same-name pairs double-load into session context; CI enforces it).

| Invoke | What it does |
|---|---|
| `/builder-mode` | **The front door** — enter Builder Mode: default is *just build*; strategy rails are opt-in, skip anytime. (Alias: `/hamzaish` — same engine.) |
| `/scaffold` | One-shot a new product: folders, starter, config, CLAUDE.md, scope, PRD skeleton |
| `/validate` | Full validation pass: sharpening, devil's advocate, market sizing, competitor map, discovery plan |
| `/ideate` | Generate ideas grounded in your portfolio patterns + current trends |
| `/work-on` | Enter a product workspace with full context loaded |
| `/portfolio-pulse` | All products: one table, top 3 priorities, on-fire, don't-touch |
| `/product-pulse` | One product: metrics, stage, blockers, the #1 action today |
| `/kill-or-keep` | Quarterly review with forced verdicts for every product |
| `/launch-plan` | Full launch playbook: PH, HN, X, LinkedIn, email warm-up, outreach, pricing, brand assets |
| `/web-launch` | Verification-gated website launch: per-project workbook, refuse-to-launch sign-off gate, post-launch monitoring |
| *(skill)* `launch-gotchas` | Library of real launch failure modes — indexation, redirects, analytics undercounting — with the fix for each |
| *(skill)* `pseo-at-scale` | Programmatic-SEO discipline for 100s–10,000s of templated pages: thin-content prevention, indexation ramp |
| `/release` | Cut a polished GitHub Release from the changelog at a major-cycle boundary |
| `/keyword-research` | Clustered keyword brief from GSC + Ahrefs Webmaster + DataForSEO |
| `/seo-aeo-bootstrap` | Ship the SEO + AEO foundation: llms.txt, AI-bot robots.txt, JSON-LD, sitemap, meta block |
| `/name-product` | End-to-end naming pipeline: brief → competitors → generate → clear → select → lock |
| `/name-clearance` | Clear a name BEFORE buying the domain: collision, trademark signal, availability |
| `/competitor-research` | Map the competitive landscape; persists per-product so it compounds |
| `/go-live` | Guided, stateful stack provisioning — deep-links, key validation, `.env.local` writes, resumable; then hands to `/security-check` → `/ship` |
| `/security-check` | Fast security baseline: tracked secrets, vulnerable Actions, workflow permissions |
| `/ship` | The single deploy action — gates on `/security-check`, promotes reviewed commits to production |
| `/checkpoint` | Named save-point commit between auto-commits |
| `/brain-ask` | Search every learning, decision, playbook, and product doc — ranked citations |
| `/brain-ingest` | Refresh the brain's SQLite FTS5 index |
| `/learn-loop` | Impact-score the cycle's learnings; promote only the top few into guardrails |
| `/pr` | One-command **repo** ship: branch → commit → PR → wait for CI → squash-merge → sync local |
| *(skill)* `tidy` | The cleanup stage: scan a repo — or 100+ at once — for rot, see the extent, then clean with confirmation |
| *(skill)* `write-a-goal` | Turn a rough ambition into a measurable, reachable goal — capability + named metric + ≥2 numeric evals + acceptance rule |
| *(skills)* `product-pulse` · `seo-aeo-bootstrap` | Skills without a command wrapper yet — invoke by name in Claude Code |

### 🔧 The engineering cycle — `/full-cycle` and its phases

Consolidated into Hamzaish so the build engine ships **with** the repo (no separate install). `/builder-mode` routes here for real builds — starting from a **goal**, slicing it into features that can each be *proven* (an eval + an end-to-end test), and only then spec'ing and building. Features you can't evaluate or test don't make the cut.

| Invoke | What it does |
|---|---|
| `/full-cycle` | The gated engine: GOAL → SETUP → SLICE → SPEC → PLAN → TEST → BUILD → REVIEW → SHIP, pausing for approval at each gate |
| `/goal` | Pursue a measurable objective autonomously — rubric + fresh-eyes verification, iterate to the bar, resumable run-log (sibling of `/builder-mode`) |
| `/auto` | The same cycle run autonomously end-to-end — no per-gate stops; still pauses for irreversible/outward actions |
| *(skill)* `feature-slicing` | Slice a goal into provable feature slices — keep only the ones that come with an eval + an end-to-end test |
| *(skill)* `write-a-goal` | Forge a fuzzy ambition into a measurable, reachable goal — metric + evals + acceptance + non-goals |
| `/spec` | Write a structured spec before any code (for the selected slices) |
| `/plan` | Break the spec into small, ordered, verifiable tasks |
| `/build` | Implement the next task incrementally (TDD: red → green → refactor → commit) |
| `/test` | Drive behavior with tests; browser-test real UIs via DevTools |
| `/review` | Five-axis code review — correctness, readability, architecture, security, performance |
| `/code-simplify` | Reduce complexity for clarity without changing behavior |
| `/setup` | Bootstrap a project's Claude Code context (CLAUDE.md, rules, a starter command) |

Backed by **22 engineering skills** under [`factory/skills/`](factory/skills/) — feature-slicing, spec-driven-development, planning-and-task-breakdown, incremental-implementation, test-driven-development, debugging-and-error-recovery, code-review-and-quality, security-and-hardening, performance-optimization, frontend-ui-engineering, api-and-interface-design, browser-testing-with-devtools, ci-cd-and-automation, documentation-and-adrs, git-workflow-and-versioning, source-driven-development, context-engineering, deprecation-and-migration, code-simplification, shipping-and-launch, idea-refine, auto-orchestrator — invoked by name as the cycle runs.

</details>

<details><summary><b>📖 The playbooks (51) + the practices ledger (146)</b></summary>

**[BEST-PRACTICES.md](BEST-PRACTICES.md)** — 146 practices for shipping products with Claude Code: **44 ✅ proven** by real ships and dated incidents · **3 🟡 partially proven** · **99 ⏳ research-baked** from named sources. Anti-patterns lead — each one cost us something real. Every line links to its deep-dive playbook and its source.

Playbooks are short (300–800 words), sourced, stage-gated:

| Stage | Playbooks |
|---|---|
| **💡 Idea (6)** | [The Mom Test](factory/playbooks/idea-stage/mom-test.md) · [Jobs-to-be-Done](factory/playbooks/idea-stage/jobs-to-be-done.md) · [Problem-Statement Rubric](factory/playbooks/idea-stage/problem-statement-rubric.md) · [TAM/SAM/SOM](factory/playbooks/idea-stage/tam-sam-som-templates.md) · [YC Startup School notes](factory/playbooks/idea-stage/yc-startup-school-notes.md) · [Landscape Research Before Roadmap](factory/playbooks/idea-stage/landscape-research-before-roadmap.md) |
| **🏗️ MVP (8)** | [Security Checklist — 70 checks](factory/playbooks/mvp-stage/security-checklist.md) · [Architecture Decisions](factory/playbooks/mvp-stage/architecture-decisions.md) · [AI-Native Dev Loop](factory/playbooks/mvp-stage/ai-native-dev-loop.md) · [Scope Document](factory/playbooks/mvp-stage/scope-document.md) · [Measurement Framework](factory/playbooks/mvp-stage/measurement-framework.md) · [Sean Ellis Survey](factory/playbooks/mvp-stage/sean-ellis-survey.md) · [Agent Handoff Contracts](factory/playbooks/mvp-stage/agent-handoff-contracts.md) · [Fleet Patterns](factory/playbooks/mvp-stage/fleet-patterns.md) |
| **🚀 Launch (13)** | [First 100 Customers](factory/playbooks/launch-stage/first-100-customers.md) · [Hacker News Launch](factory/playbooks/launch-stage/hacker-news-launch.md) · [Product Hunt Launch](factory/playbooks/launch-stage/product-hunt-launch.md) · [Pricing](factory/playbooks/launch-stage/pricing-playbook.md) · [Cold Outreach Templates](factory/playbooks/launch-stage/cold-outreach-templates.md) · [SEO+AEO Foundation](factory/playbooks/launch-stage/seo-aeo-foundation.md) · [SEO Content Strategy](factory/playbooks/launch-stage/seo-content-strategy.md) · [OSS Publishing Checklist](factory/playbooks/launch-stage/oss-publishing-checklist.md) · [Output Validation for Code-Gen Tools](factory/playbooks/launch-stage/output-validation-for-codegen-tools.md) · [Lenny's Frameworks Distilled](factory/playbooks/launch-stage/lenny-newsletter-distilled.md) · [Release Cadence as Content](factory/playbooks/launch-stage/release-cadence-as-content.md) · [Repo Go-Public Checklist](factory/playbooks/launch-stage/repo-go-public-checklist.md) · [Community Flywheel](factory/playbooks/launch-stage/community-flywheel.md) |
| **📈 Scale (8)** | [100→1000 Customers](factory/playbooks/scale-stage/100-to-1000-customers.md) · [Production Operations](factory/playbooks/scale-stage/production-operations.md) · [Abuse & Cost Controls](factory/playbooks/scale-stage/abuse-and-cost-controls.md) · [Churn Reduction](factory/playbooks/scale-stage/churn-reduction.md) · [Growth Loops (Reforge)](factory/playbooks/scale-stage/growth-loops-reforge.md) · [Moat Building](factory/playbooks/scale-stage/moat-building.md) · [Enterprise Readiness](factory/playbooks/scale-stage/enterprise-readiness.md) · [Security at Scale](factory/playbooks/scale-stage/security-at-scale.md) |
| **🧭 Founder's wisdom (4)** | [$100K ARR Tactics](factory/playbooks/founders-wisdom/100k-arr-tactics.md) · [Gary Tan / YC era advice](factory/playbooks/founders-wisdom/gary-tan-yc-advice.md) · [Paul Graham essays](factory/playbooks/founders-wisdom/paul-graham-essays.md) · [Solopreneur Stack 2026](factory/playbooks/founders-wisdom/solopreneur-stack.md) |
| **🤖 AI-native (10)** | [Eval-Driven Development](factory/playbooks/ai-native-2026/eval-driven-development.md) · [Cost-to-Outcome & Model-Independence](factory/playbooks/ai-native-2026/cost-to-outcome-and-model-independence.md) · [Founder's Playbook distilled](factory/playbooks/ai-native-2026/founders-playbook-distilled.md) · [Auth Go-Live](factory/playbooks/ai-native-2026/auth-go-live.md) · [Go-Live Provisioning](factory/playbooks/ai-native-2026/go-live-provisioning.md) · [MCP Servers per Product](factory/playbooks/ai-native-2026/mcp-servers.md) · [Hermes & Fallback Models](factory/playbooks/ai-native-2026/hermes-and-fallback-models.md) · [Skill Authoring](factory/playbooks/ai-native-2026/skill-authoring.md) · [Handoff vs Supervision](factory/playbooks/ai-native-2026/handoff-vs-supervision.md) · [Multi-Agent, One Repo](factory/playbooks/ai-native-2026/multi-agent-one-repo.md) |

</details>
## Architecture

```
brain/        — identity, principles, learnings, anti-patterns, decisions, ingested knowledge
factory/      — agents (idea/ mvp/ launch/ scale/ portfolio/), skills, commands, playbooks
products/     — one folder per product: metadata + learnings ONLY (code stays in private repos)
evidence/     — dated artifacts behind the claims, failures included
meta/         — changelog, retros, evals, the self-improvement loop
stack/        — tech defaults + the set-up-once accounts guide
templates/    — Next.js starter + doc templates
```

Product **code is never in this repo** — only metadata and learnings. Your code
(the moat) stays private; locations are wired via a git-ignored
`code-paths.local.json`, so the repo is safe to share without exposing anyone's
secret sauce. ([the public/private boundary →](docs/architecture.md#the-publicprivate-boundary--protecting-your-secret-sauce))

## The discipline

1. **Build is the default — validate before irreversible bets.** Cheap, reversible
   ships *are* validation. Before expensive moves: ~5 target-profile conversations.
   Never skip it *silently* — `bun run check-validation <slug>` records the debt.
2. **Scope is the moat.** Every product's `scope.md` says what it does AND deliberately doesn't.
3. **Persistent context.** Every product gets a `CLAUDE.md`; every decision logged in `decisions/`.
4. **Measurement before launch.** North-star, activation, retention — defined before the first user.
5. **The factory is a product.** If it can't ship product #1 through, fix the factory before adding slots.
6. **Honest copy.** Every outward-facing word is true when it ships; aspiration is
   labelled, never present-tense. ([the honest ledger](meta/RESEARCH-BAKED-PRACTICES.md))

## The self-improvement loop

Every working session appends learnings to [`brain/learnings/`](brain/learnings/).
At cycle boundaries `/learn-loop` scores candidates on five axes and promotes only
the top few into load-bearing guardrails — a skill rule, a playbook step, an
anti-pattern, a ledger line. Quarterly, `/kill-or-keep` runs on Hamzaish itself and
re-checks each guardrail: deliver the predicted gain, or get sunset.

**The ladder matters more than the lesson:** a hook, then a CI guard, then an eval
case — and only then prose. A lesson that can be a check becomes a check.

## Go deeper

[Start here — total beginner](docs/start-here.md) · [Your first product in 10 minutes](docs/your-first-product.md) · [FAQ](docs/FAQ.md) · [Architecture](docs/architecture.md) · [Philosophy](docs/philosophy.md) · [How it compares](docs/philosophy.md#how-it-compares) · [Running on other hosts](docs/host-portability.md) · [Where it's heading](meta/SELF-EVOLUTION.md) · [Security model](docs/security.md) · [Contributing](docs/contributing.md) · [Changelog](meta/changelog.md)

---

<div align="center">

### 💛 Built on a thousand generosities

[![Hamzaish — the credits roll](docs/assets/hamzaish-credits.gif)](ACKNOWLEDGMENTS.md)

*We stand on giants, and we're loud about it.*
**[Read the full credits →](ACKNOWLEDGMENTS.md)**

</div>

The backbone is hard-won venture experience — the Business-SWAT roles, opportunities, and mentors that came with years at **[Disrupt.com](https://disrupt.com)**, taking things from zero to one before AI made building cheap. On that foundation, the patterns studied and credited — Addy Osmani's spec→ship discipline, Karpathy's eval-driven flywheel, gbrain (knowledge graph), Anthropic's *Founder's Playbook* (lifecycle framing), hermes-agent (self-improving skills), openclaw (multi-channel gateway), and ponytail (multi-agent portability) — sharpened that instinct and 10×'d the AI and agentic-building learning on top of it. The 2026-07 four-repo study — [Graft](https://github.com/NanoNets/Graft) (NanoNets), [Adrian](https://github.com/secureagentics/Adrian) (Secure Agentics), [AgentENV](https://github.com/kvcache-ai/AgentENV) (kvcache-ai), and [OpenSpace](https://github.com/HKUDS/OpenSpace) (HKUDS) — continued the pattern: two of its ideas became `bun run skill-report` and the eval judge's untrusted-output boundary, credited in [`references/README.md`](references/README.md) and [ACKNOWLEDGMENTS.md](ACKNOWLEDGMENTS.md). Study material lives in `references/`, never imported.

## License

**TL;DR — free for builders. Don't take it closed-source and sell it.**

In plain English: use, study, modify, and self-host freely. If you run a *modified* version as a network service, your source must be AGPL too — your work stays open for solo builders and teams; nobody quietly turns it into a closed product.

**AGPL-3.0** — clean, no added clauses; see [`LICENSE`](LICENSE).

---

<div align="center">

### It's 11pm somewhere.

**`/builder-mode <your idea>` — get into yours.**

*Built in public by [Hamza Ali](https://github.com/hamza-ali-shahjahan). The factory's repo runs on the factory's own discipline.*

</div>
