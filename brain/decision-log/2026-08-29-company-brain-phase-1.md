# 2026-08-29 — Company Brain audit → Phase 1 shipped, one planned piece dropped

**Decision.** Scored Hamzaish's `brain/` against Slite's "Company Brain" research
ebook (9 real memory systems profiled — gbrain, mem0, Letta, Zep/Graphiti, Sylph,
DIY-Claude-Code-git, Pletor, Gorgias Cortex, Slite Agent — decomposed into 4
components: getting signals, remembering, dreaming & pruning, speaking &
searching). Landed two of the three originally-planned Phase 1 items:

1. **`/brain-ask` states its own gaps** — every answer now ends with what the
   search didn't cover (indexed-folder exclusions, plus any `--product`/`--source`
   scope that excluded other docs from that query). Mechanical disclosure, not an
   LLM narrating blind spots — `ask.ts` has no LLM step, so a smaller, honest claim
   beats porting gbrain's version literally.
2. **`bun run check-status-staleness`** — flags a product at stage mvp/launch/scale
   claiming active work whose `status.md` hasn't moved past a threshold (git-log
   based, 21d default, `AUTOPILOT`-verdict products excluded). Report-first, not a
   CI gate.

**Dropped: a review-queue for direct brain-file edits** (the Sylph `_drafts/`
pattern). On inspection, `/learn-loop`'s propose → ratify → promote step is
already that gate for anything that becomes a guardrail, and ad-hoc edits during
an interactive session already have the operator watching plus a git commit
trail. Building a formal queue on top would have been ceremony for a problem
Hamzaish doesn't have — Sylph/GBrain need it because their writers run
autonomously in the background; nothing in Hamzaish does yet.

**Also dropped from the plan as scoped, then rebuilt differently: "drift check via
telemetry."** The original Phase 1 spec proposed flagging when a product's status
contradicts `scripts/telemetry.ts` connector state. Checking real data first: zero
of 23 products have ever wired a Stripe/PostHog/Sentry ID into `product.config.json
→ analytics`. "Telemetry is blind" is a permanent structural constant right now,
not something that drifts — flagging it again would just repeat what
`products/_portfolio.md` already says by hand. Swapped for staleness detection
(item 2 above), which is genuinely new signal from a source (git log) that can't
false-positive on a missing key.

**Why.** The Slite framework is a good audit lens, but "port the pattern" means
checking whether the gap is real in *this* system before building — not
reproducing another system's architecture because it appeared in the same table.

**What would prove this wrong.** The gap-line proves wrong if it never once
changes what someone does after a `/brain-ask` query (i.e., the disclosed gaps are
never the reason a search gets rescoped). The staleness check proves wrong if the
21d threshold produces mostly noise at `/portfolio-pulse` time (right now 7/23
products flag — worth watching, not yet calibrated against real review cadence).

**Revisit trigger.** After `/portfolio-pulse` has run against the staleness check
a few times — if the operator is dismissing most flags as "already knew, not
stale," tighten the threshold or fold verdict-awareness further (e.g. exclude
MAINTAIN-verdict products staged past their gates too, not just AUTOPILOT).
Phase 2 (a shared brain-core extracted for Muakkil's founder-brain use case) and
Phase 3 (the already-spec'd vector/RRF upgrade, `brain/knowledge/2026-06-20-phase-c-brain-design.md`)
remain queued, gated on the roadmap's own Phase B evidence-gathering step.
