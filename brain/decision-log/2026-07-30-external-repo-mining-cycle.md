# 2026-07-30 — The external-repo mining cycle (four-repo assessment → ports, gates, /repo-scout)

**Decision:** Assessed four external repos with code-grounded deep-dives (Graft,
Adrian, AgentENV, OpenSpace — full studies in `references/README.md`). Adopted a
port-ideas-not-frameworks outcome, operator-approved:

1. **Ported now:** OpenSpace's skill-outcome telemetry → `bun run skill-report`
   on the existing trace substrate; Adrian's UUID untrusted boundaries →
   `meta/evals/lib/judge.ts`.
2. **Trial, gated:** Graft in ONE TS product repo — pull-mode MCP tools only
   (`callers`/`skeleton`/`map`), version PINNED in `.mcp.json` (never
   `npx -y …@latest`), config through `/security-check`'s MCP audit, explicitly
   no hooks and no `--deep`. Keep only if one sprint's `trace-report` + spend
   ledger show a real drop (the headroom precedent: no adoption without a
   measured need). Operator names the repo when the build lane resumes.
3. **Deferred, evidence-gated:** a native semantic-judge second opinion
   (Adrian's remit idea; STANDING-ORDERS as machine-readable remit, Haiku via
   `claude -p`, alert-mode only, deterministic guard hooks stay the hard deny
   layer). Build trigger: `bun run defect report` showing misses the
   deterministic guards can't express. Not before.
4. **Method promoted to capability:** `/repo-scout` skill + STANDING-ORDERS
   program (health gates → read-only clone → facts-only subagent → grammar →
   operator-gated backlog). MECE overlap check recorded: nearest neighbor is
   `competitor-research` (market landscape for a product); repo-scout is a
   different class (code-grounded study of a single external repo for the
   factory) — no existing skill covered it.
5. **Not adopted:** Adrian the product (unredacted cloud egress; GPU stack; no
   CI on the enforcement path; benign-biased parser), AgentENV the infra (Linux
   x86_64/KVM only; no auth; prototype control plane), OpenSpace the harness
   (Claude Code port provenance; safety theater; mutates skill dirs it scans).

**Why:** The factory's leverage is its compounding loop (instruments → guards →
evals), not framework surface. Each repo's genuinely good part was either
portable as a small mechanism (telemetry rows, boundary tags), already covered
by house discipline (worktrees vs VM forking), or premature at our scale. The
one missing capability the exercise exposed was the assessment method itself —
so it shipped as a skill with the same gates it was born from.

**Wrong if:** skill-report rows stay empty/unused by the first `/learn-loop`
after 2026-10-01 (remove the instrument, per the dead-telemetry precedent);
Graft's trial shows no measurable drop but gets kept anyway (adoption theater);
the defect registry shows semantic-class misses and the second opinion still
isn't built (gate became an excuse); the scout backlog accumulates >5 stale
drafts (review loop broken — fix or stop scouting).

**Revisit:** Graft trial at build-lane resumption (operator names the repo) ·
semantic judge on defect-registry evidence · scout cadence after the first
manual trending sweep · watch triggers per repo in `references/README.md` ·
credits 10x-tier promotion only on measured post-adoption evidence.
