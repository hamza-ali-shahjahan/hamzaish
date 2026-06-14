# Parallel Sessions Protocol — many agents, one product, no chaos

> When more than one session (you, an agent, a teammate) works the **same product** at the same time, shared mutable state with no coordination produces races: stale reads, lost work, duplicated effort. This codifies how to run >1 session on a product without the confusion.

**The failure it prevents** (`local-llm-setup`, 2026-06-14): two sessions ran on the same repo. One built the native Windows port and pushed `v1.1.0`; the other was still operating on its `v1.0.1` mental model and kept *re-checking* "is Windows done yet?" — learning the repo had moved only from incidental file-change notices, never by looking. Wasted effort, contradictory state, near-misses clobbering each other.

## Default: one active session per product

Parallelize **across** products, not **within** one. One session on the LLM tool, another on a *different* product. This deletes the entire race class for free and is right ~90% of the time. Reach for parallelism on a single product only when the work genuinely splits into independent slices.

## When you must parallelize one product

1. **Isolate — one git worktree + one branch per session.** Never two sessions in the same working directory. `git worktree add ../<slug>-<task> <branch>` (or the agent's worktree isolation). They cannot clobber each other's uncommitted work.
2. **Partition — explicit, written ownership.** Session A owns Windows; Session B owns docs/CI. No shared files. If two sessions need the same file, that's the signal to serialize, not parallelize.
3. **One atomic ledger.** A GitHub tracking issue / project board with checkboxes is best — external to local file state, so no stale-read problem. Lightweight alternative: the product's `status.md` **Active sessions** lock (commit + pull religiously). Every session reads it first and updates it on claim/finish.
4. **Serialize integration to `main` via PRs + CI.** No parallel direct pushes to `main` — that is exactly what split `v1.0.1` from `v1.1.0`. Branch → PR → CI gate → merge.
5. **One owner for long-running stateful jobs** (downloads, services, migrations). Others treat them read-only and never duplicate.

## The 30-second protocol (every session)

- **Start:** `git fetch && git pull --rebase` → read the ledger → claim your slice → load product context (`/work-on <slug>`).
- **Before any commit:** `git pull --rebase` → commit small → push immediately.
- **End:** update the ledger (done / handoff) → push → leave nothing uncommitted.

> The one rule if you remember nothing else: **pull-before-act, branch-per-session.** Most confusion is a session acting on stale state; that habit kills it.

## Composes with
- The **Active sessions** lock block in `products/<slug>/status.md` (the template carries it).
- [`admission-policy.md`](admission-policy.md) — same "keep the system trustworthy" spirit, applied to coordination instead of content.

## Provenance
Set as a norm 2026-06-14 after two sessions on `local-llm-setup` diverged (one shipped the Windows port + `v1.1.0` while another re-checked already-done work on a stale `v1.0.1` model).
