# The Founder's Playbook (2026) — Distilled

Source: Anthropic, *The Founder's Playbook: Building an AI-Native Startup* (36 pages, in the root of this folder).

This is the playbook this whole factory enforces. Every agent and every skill is anchored on these stage rules. If you read nothing else, read this.

## The four stages

| Stage | Goal | Exit criterion |
|---|---|---|
| **Idea** | Validate that a real problem exists for real people, before writing production code | Problem-solution fit: you can name who has it / how often / how severely + your solution addresses the validated problem (not the assumed one) + enough qualitative evidence to justify building |
| **MVP** | Translate validated problem into a working product that real users actually use | Genuine PMF pattern: a specific identifiable group returns, pays, or refers, across multiple iteration cycles |
| **Launch** | Turn early traction into a repeatable growth engine + harden the company | Growth is repeatable & channel-driven (CAC/LTV/payback understood) + product handles production workloads + ops run without founder bottlenecks |
| **Scale** | Build a defensible moat + mature the org | Sustainable threshold event: profitability without external capital, IPO-readiness, or acquisition |

## The big shift (why this all matters)

AI has erased the cost of construction but not the cost of being wrong. Validation is now *more* important than ever, not less — because the prototype that gets you to validation in 3 days can also seduce you into 6 months of building the wrong thing.

The founder's job has shifted from individual contributor → **orchestrator of agents** + **judgment caller on what to build and why.**

---

## Stage 1: Idea

### What we're doing
Research and validation. No production code yet (lightweight prototype only as a conversation prop).

### Three failure modes to actively defend against
1. **Mistaking building for validating** — agentic coding lets you ship a prototype in hours; do NOT treat its existence as validation.
2. **Premature scaling** — building execution capacity ahead of validated direction.
3. **Loss of objectivity** — AI will validate whatever you ask it to. Direct it to disprove your idea instead.

### Exit criteria
Answer YES to all three:
1. Is the problem real and specific? (Can you name exactly who has it / how often / how severely / what they currently do?)
2. Does your solution address the actual problem the validation revealed (not the one you assumed)?
3. Do you have enough signal to justify building?

### Tactical sequence
1. **Sharpen the problem statement.** Turn "X is too hard" into a testable hypothesis: "<specific role> at <specific company type> spends <specific time> on <specific task> because <specific reason>."
2. **Make the case AGAINST your idea.** Run devil's advocate. Look for failed competitors, structural obstacles, customer-behavior patterns that contradict.
3. **Map competitors by tier.** Direct, indirect, potential acquirers, adjacent players. Argue why each could win and you couldn't.
4. **Trend check.** Identify 3 regulatory/technological/demographic trends — tailwind or headwind?
5. **Plan customer discovery.** Define the precise target profile (job title + company type + team structure + seniority). Find where they congregate.
6. **Run 5+ discovery interviews.** Ask about past behavior, not future intent. "Tell me about the last time you dealt with X."
7. **Synthesize.** After every 5 interviews, list (a) evidence supporting your hypothesis and (b) evidence challenging it. If list (a) >> list (b), ask if that asymmetry is real or wishful.
8. **Lightweight prototype** as a conversation prop, only once you've earned the right.
9. **Five user reactions** to the prototype determine: keep building, or back to drawing board.

### Agents that work in this stage
`idea/idea-generator`, `idea/problem-sharpener`, `idea/devils-advocate`, `idea/market-researcher`, `idea/competitor-mapper`, `idea/customer-discovery`, `idea/interview-synthesizer`

---

## Stage 2: MVP

### What we're doing
Translating validated problem into a real product. Still evidence-gathering, but now about the solution, not the problem.

### Three failure modes
1. **Agentic technical debt** — without architectural specs, every Claude Code session re-derives foundational decisions. Drift compounds. Eventually unmaintainable.
2. **Falling for false PMF** — launch bursts from friends, investor portfolios, HN spikes look like PMF and aren't.
3. **Zero-friction scope creep** — every additional feature is defensible because it's cheap. Defensible ≠ correct.
4. **Insecure by inexperience** — AI-generated code works; AI-generated code is not inherently secure.

### Exit criterion
A pattern (not a single data point) of: real users returning, paying, referring. Holds across multiple iteration cycles.

### Tactical sequence
1. **Architecture before code.** Sit with Claude (not Claude Code). Define principles, dependencies to avoid, tradeoffs being accepted. Save as `CLAUDE.md`.
2. **Scope document.** What this product does. What it deliberately doesn't. Criteria to amend scope (must require evidence of real-user blockage).
3. **Build with Claude Code in sessions** that start by reading `CLAUDE.md` + `scope.md`, end by appending decisions made.
4. **Security review** before any user touches it: auth/session, data exposure, input validation, dependency CVEs.
5. **Measurement framework BEFORE launch.** Define metrics, retention benchmarks (D7, D30), activation criterion, false-positive shape. Sean Ellis target.
6. **Run user feedback through Claude Cowork** for triage; human-in-loop for nuanced interpretation.
7. **Iterate toward evidence**, not toward completeness.
8. **Sean Ellis test** at ~100 active users: ≥40% "very disappointed if no longer available" = PMF signal.
9. **The effort test**: pre-PMF requires constant founder push; post-PMF the product pulls. Watch for the shift.
10. **Pivot when evidence demands.** Three iteration cycles without movement = run diagnostic: alternative customer segment? positioning vs product problem? what would have to be true?

### Agents that work in this stage
`mvp/architect`, `mvp/scope-guardian`, `mvp/builder`, `mvp/security-reviewer`, `mvp/metric-framework-designer`

---

## Stage 3: Launch

### What we're doing
Turn early traction into a repeatable growth engine. Build the company *around* the product. Stop being in every loop.

### Four failure modes
1. **Technical debt comes due.** MVP shortcuts now compound. Refactor strategically.
2. **Founder becomes the bottleneck.** Decisions that should take an hour now take a week. Telltale sign.
3. **Security & compliance are no longer deferrable.** Enterprise contracts and real users mean real exposure.
4. **Expansion before ready.** New markets/segments introduce new variables that destroy your read on the data.

### Exit criteria
1. Growth is repeatable & channel-driven. CAC, LTV, payback period known.
2. Product handles production workloads. Security/compliance in order.
3. Ops run without founder bottlenecks.

### Tactical sequence
1. **Architectural audit** with Claude Code. Triage with Claude. Sequence remediation: now / next sprint / acceptable ongoing debt.
2. **Document MVP-era decisions** that lived in your head. Get them into `CLAUDE.md`.
3. **Audit founder operational load.** Inventory every recurring task, decision, workflow you personally trigger. Categorize: automate / delegate-to-non-you / actually requires founder judgment.
4. **Design automations** for the first category. Claude Cowork runs them.
5. **Security/compliance review** against the frameworks your target market requires (SOC2 for B2B SaaS, HIPAA for healthcare, GDPR for EU). Treat findings as required, not suggestions.
6. **Build PM operating system**: sprint cadence, spec template, bug triage tree, weekly metrics brief.
7. **Channel-by-channel growth experiments.** PH, HN, SEO content, cold outreach, partnerships, paid (last). Measure CAC + payback per channel.
8. **Pricing playbook.** Use van Westendorp or value-based. Move off free tiers as data justifies.

### Agents that work in this stage
`launch/brand-story-builder`, `launch/landing-page-copywriter`, `launch/seo-strategist`, `launch/keyword-researcher`, `launch/content-marketer`, `launch/launch-strategist`, `launch/cold-outreach`, `launch/pricing-strategist`, `launch/community-builder`

---

## Stage 4: Scale

### What we're doing
Systematic growth + organizational maturation. Public-facing executive work. Moat building.

### Four failure modes
1. **Hard to delegate the operational layer.** Founder identity is wrapped in the work.
2. **Scaling technical operations.** Customers want infrastructure-grade reliability + docs + SLAs.
3. **Scaling organizational functions.** Hiring, payroll, accounting, legal — at scale these can't be founder-time.
4. **Building GTM cold for the first time.** Organic growth hits a ceiling; sales/marketing/analyst functions must exist.

### Exit (threshold) criteria
The company is sustainable even as the founder steps back from day-to-day. Demonstrated:
- Systematic growth, auditable
- Organizational governance + compliance that satisfies external reviewers
- A defensible answer to: "If a well-funded incumbent copied your product today, would your users stay?"

In practice: profitable without external capital, IPO-ready, or acquired.

### Tactical sequence
1. **Bottleneck map.** Every workflow / decision / approval routed through you. Ask: what stalls if I'm unavailable for a week?
2. **Convert institutional knowledge** to written docs, SLAs, support playbooks.
3. **Build GTM function.** Market segmentation, messaging architecture, sales playbooks, analyst relations.
4. **Compound domain expertise.** Encode industry edge cases into product. Each one widens the moat — a generalist AI can't match a specialist's accumulated edge-case library.
5. **Compound user data into a moat.** Identify highest-signal behavioral patterns. Design feedback loops that turn usage into product improvement.
6. **Build workflow lock-in.** More integrations = more surfaces for customers to build on your product. APIs, webhooks, SDKs are the deepest form.

### Agents that work in this stage
`scale/growth-loops`, `scale/retention-analyst`, `scale/pricing-optimizer`, `scale/support-triage`, `scale/compliance-auditor`, `scale/moat-builder`

---

## The three Claude surfaces (when to use which)

| Task | Surface | Why |
|---|---|---|
| Quick question / rewrite / brainstorm | Chat | Fast, no setup |
| Research / analysis / finished document built from your files | Claude Cowork | Folder access, connectors, skills, scheduled runs |
| Writing / testing / shipping software | Claude Code | Codebase access, diffs, git, dev envs |

For this factory, you (the assistant reading this) are running inside **Claude Code**. The factory orchestrates work that would otherwise span all three surfaces by maintaining per-product folders that Claude Code can read directly.

## The orchestration meta-principle

> When Claude Code builds the product, Claude Cowork builds the company around it, and Claude (Chat) operationalizes the knowledge — a small team runs like a company NX its size.

For a solo founder running 10 products in parallel, that "NX" is the only way the math works.
