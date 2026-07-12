# ClauDex — Live Status

**Stage**: mvp
**Status**: active · pre-launch

## North star this sprint
> Launch while the codex-plugin-cc wave is still warm (trended Jul 8; every day of delay decays the moment). Repo public + demo GIF + launch posts within 48h.

## Active sessions (lock — update when you start/stop work)
_Avoid two sessions on the same files. See [`meta/parallel-sessions-protocol.md`](../../meta/parallel-sessions-protocol.md)._

| Session / branch | Scope (files/area owned) | Status | As of |
|---|---|---|---|
| ClauDex scaffold session | ~/ClauDex (plugin repo) + this product slot | MVP built, awaiting publish go | 2026-07-12 |

## Open immediately
- ~~Eval-verify the factory skill mirror~~ — superseded by decision 0002: the mirror is removed; ClauDex is invocation-only, no default collab in hamzaish
- Publish `hamza-ali-shahjahan/claudex` (repo name confirmed free)
- Test install from GitHub: `/plugin marketplace add hamza-ali-shahjahan/claudex` → `/claudex:setup`
- Record 30s GIF of `/claudex:verdict` catching a real disagreement
- Launch: X thread quoting OpenAI's announcement, Show HN, PRs to awesome-claude-code lists
- Run `/portfolio-pulse` to pick this product up in `_portfolio.md`

## Shipped
- 2026-07-12 — MVP scaffolded: marketplace + plugin, commands `/claudex` (write→review→consensus loop), `/claudex:verdict` (dual-review disagreement table), `/claudex:setup`, plus advisory `claudex-second-opinion` skill (suggests, never auto-runs Codex)
