# Multi-agent builds in one repo — fences, one integrator, staged foundations

Companion to [`handoff-vs-supervision.md`](handoff-vs-supervision.md). That one covers *how to dispatch one agent*; this one covers *running several at once in the same repo without them trampling each other*.

> **Principle:** Parallel agents in a shared worktree are safe exactly when three things are explicit — **who owns which files, who owns git (exactly one agent), and what was committed before the fan-out.** Everything else is a race.

**Verified case (2026-07-12, ThousandWorlds sprint):** two multi-agent Explorer workflows, seven feature agents plus one committing integrator in a single shared worktree — zero ownership violations, zero index races, reviewable history.

## 1. File-ownership fences — one load-bearing sentence

Every feature agent's brief contains: **"You own files X, Y. No other files."** New files wherever possible; shared pages/styles belong to the integrator alone. This held perfectly across both 2026-07-12 workflows — agent reports even listed sibling agents' files they had seen in `git status` and left untouched. The fence works because it is explicit, not because agents are cautious by default.

## 2. Feature agents never commit — one integrator owns git

Per-agent commits in a shared repo race on the index and sweep or orphan sibling files. The pattern that ran cleanly: feature agents write files and return a report; a single integration agent then

- inventories `git status` against the agents' reports **1:1** — every unexplained path is a finding,
- commits in logical chunks with **explicit paths, never `git add -A`**,
- alone touches shared surfaces (page shell, styles, routing).

On 2026-07-12: three parallel feature agents, three clean logical commits, nothing stray caught in the inventory.

## 3. The orchestrator commits shared assets BEFORE the fan-out

Any data asset or foundation library the agents will import must already be in git when they start. The working sequence: foundation agent (shared libs) → commit → parallel panel agents importing the committed foundation → integrator. Skip the pre-commit and the agents' adds race — files get swept into the wrong commit or orphaned entirely.

## 4. Two repos sharing copied code: stage 1 is sync-and-verify

The Explorer's `emulator.ts` was a generation behind its private-repo sibling. Making "port + prove self-consistency over all 1,659 training sims" its own verified stage (median residual 4.95 K — the model's intrinsic fit error) meant three downstream feature agents built on a proven engine instead of triple-discovering the drift. Rule: copied code carries a header comment naming its sibling, and any feature touching it starts with sync-and-verify.

## Brief-quality gates — what makes the fan-out trustworthy

- **A numeric self-consistency check in every numeric-pipeline brief.** "Feed a real training sim back through; land within ~3 K or your unit mapping is wrong." The foundation agent's A/B (median 5 K residual with unit conversions vs 131 K without) turned silent wrongness into a one-line proof — and it pushed back, with evidence, that ~5 K is the model's intrinsic fit error, not a bug. Invite agents to challenge the threshold **with evidence**.
- **Determinism as a testable spec.** "Same dataset + same day window ⇒ byte-identical output." Given that sentence, the World-of-the-Day agent pinned the RSS `lastBuildDate` to the window start instead of `now()`, proved identity across two runs, and documented the one allowed-to-differ field. `Date.now()`-shaped nondeterminism gets designed out only when the brief demands the byte-level test.
- **Cross-verify agent-reported numbers in the real UI.** The validation panel's browser metrics (RMSE 7.14 K / ACC 0.984) matched the agent's offline Node+ONNX run digit-for-digit — same pipeline, two runtimes, the strongest integration test available, for the cost of one `preview_eval`.

## Anti-patterns

- **Per-agent commits** — index races, swept files, unreviewable history.
- **`git add -A` by anyone** — the integrator commits explicit paths, or the 1:1 inventory step is theater.
- **Fan-out before the foundation is committed** — agents importing files that are not in git yet.
- **Building on drifted copies** — when two repos share code, drift gets discovered once, up front, not N times downstream.
