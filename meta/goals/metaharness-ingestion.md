# Goal: MetaHarness ingestion — mine the factory-for-harnesses into the factory-for-products

> Status: **EXECUTED + FRESH-EYES VERIFIED, PENDING OPERATOR REVIEW** — contract drafted and pursued 2026-07-07 under the operator's "complete this on your own" go-ahead. A fresh-eyes agent (files-only, no chat context) confirmed all four evals at target the same day: E1 5 mine-items / 8-of-8 cited paths resolve, E2 3/3 ideas + #1 brain citation, E3 2/2 fixtures + 14-case eval floor green, E4 4 sourced facts + threat + white-space. Two cosmetic flags it raised (a `.sh`→`.ts` filename drift in this contract; one citation pointing at `SUBMISSIONS.md` instead of `docs/research/cheap-vs-frontier/REPORT.md`) were fixed post-verification. Everything is local (no push) until the operator reviews this contract and the artifacts. Source repo: https://github.com/ruvnet/metaharness (verified 2026-07-07: 381★, v0.1.3 June 2026, MIT, CI green).

## Capability statement

Given MetaHarness — a factory that turns any GitHub repo into its own agent harness — Hamzaish absorbs its four transferable patterns as **verifiable artifacts**, not vibes: a mined reference clone, a cited knowledge note (score-before-scaffold, Darwin measured-retention, cost-per-dollar), a `/security-check` that mechanically detects over-broad MCP configs, and a competitor-evidence note for Muakkil's Phase 0 validation sprint.

## Named metrics

- **`mining_items_resolving`** — count of "what to mine" items in `references/README.md` § metaharness whose referenced path exists in the clone (`test -e` on each; target 4/4). Kills stub mine-items.
- **`ideas_with_application`** — count of the 3 ingested ideas whose knowledge-note section names (a) the specific MetaHarness mechanism with a doc path or URL, (b) a concrete Hamzaish application, and (c) a what-would-prove-it-wrong / revisit trigger (target 3/3). Kills hollow notes.
- **`mcp_scan_detection`** — `scripts/check-mcp-config.ts` run on two fixtures: seeded-bad flags with exit 1, clean passes with exit 0 (target 2/2). Kills a scanner that flags everything or nothing.
- **`recall_hit`** — after `bun run ingest`, `bun brain/ask.ts "score before scaffold"` returns the new knowledge note in the top 3 citations (target: hit). Kills unindexed/misfiled knowledge.

## Evals (numeric, agent-runnable)

- **E1 — Reference mined, not just cloned:** `references/metaharness/.git` exists (shallow clone) AND `references/README.md` has a metaharness section with ≥4 mine-items; `mining_items_resolving = 4/4`.
- **E2 — Knowledge ingested, not stubbed:** `ideas_with_application = 3/3` AND `recall_hit` passes.
- **E3 — Security check has teeth:** `factory/commands/security-check.md` contains the MCP-config dimension wired to `scripts/check-mcp-config.ts`, AND `mcp_scan_detection = 2/2`, AND `bun run eval --no-llm` shows the new security-check cases PASS with zero regressions against `baseline.json`.
- **E4 — Muakkil flag landed:** `~/Claude/muakkil-research/phase0/competitor-metaharness.md` exists with ≥3 verifiable MetaHarness facts (each with a URL) plus one explicit *threat* paragraph and one *white-space* paragraph.

## Acceptance rule

All four evals at target on a fresh run, confirmed by a **fresh-eyes agent reading only this contract and the files** (never the chat); self-improvement loop closed (learnings entry + `meta/changelog.md` entry + brain re-ingested). Operator review of this contract is the final gate before any push.

## Non-goals (explicit, so scope can't creep)

- **Not** importing or running MetaHarness code — references discipline holds (study only, port ideas with credit).
- **Not** building our own score/genome, Darwin loop, or cost leaderboard now — the notes name them as future levers; per `meta/evals/factory-change-gate.md` these ideas enter as **candidates**, promoted only by bench or product proof.
- **Not** adopting witness signing / SBOM / SLSA / IPFS — wrong stage for us; revisit when a Hamzaish product publishes packages.
- **Not** adding MetaHarness to `docs/LEARN-FROM-REPOS.md` — that syllabus is a closed set of 200 with counted tables; `references/README.md` is the canonical mining home.
- **Not** touching Muakkil's product code or working directory — exactly one markdown evidence note in the research folder.
- **Not** pushing anything — local work only until operator review (git approval gate).

## Feasibility check

- All artifacts are static writing plus one small bash scanner — no ceiling risk. The only executable piece (E3) is deterministic grep-level analysis, the same class as the existing section-1/2 checks.
- Anti-gaming is structural: E1 fails on paths that don't resolve, E2 fails on notes the brain can't retrieve, E3 requires both a true-positive *and* a true-negative, E4 requires URLs a verifier can open.
- The eval harness, factory-change gate, and references discipline already exist — this goal *uses* rails rather than building them.
