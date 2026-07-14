# 2026-07-08 — Adopt Orca's growth + orchestration patterns as playbooks/rails, never as runtime

**Decision.** From the study of stablyai/orca (API-verified: ~12.1k stars in ~110 days, zero launches), Hamzaish adopts the *system* layer — community-flywheel playbook, handoff-vs-supervision protocol, community-PR rails, `/release` heartbeat + safety gates, agent-legibility rules, negative routing on skill descriptions — and explicitly does **not** adopt the *runtime* layer (Electron shell, terminal persistence, worktree UI, mobile RPC, an orchestration CLI daemon).

**Why.** The growth mechanics are proven infrastructure any public repo can run, and they serve the mission directly — every adoption is a playbook or rail a builder using Hamzaish inherits for their own products. The runtime layer duplicates what Claude Code already provides, and rebuilding it would drift Hamzaish from agent OS toward runtime framework (see `brain/knowledge/` — the agent-OS identity is settled).

**Wrong if.** (a) The community rails sit unused because Hamzaish's contributor volume never materializes — then they're dead weight to prune at a quarterly kill-or-keep; (b) a real need emerges for supervised multi-agent DAGs beyond what Claude Code's Agent/Workflow tools express — then the "no orchestration daemon" half deserves a rethink, not a silent violation.

**Revisit trigger.** Quarterly kill-or-keep, or the first time a product build genuinely needs cross-session agent coordination that the handoff-vs-supervision playbook + Claude Code primitives can't express.
