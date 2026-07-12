# ClauDex — Scope

## In scope (v0.1 — launch)
- Plugin marketplace repo, installable via `/plugin marketplace add hamza-ali-shahjahan/claudex`
- `/claudex [task]` — write → Codex review → fix loop, consensus-gated, max 3 rounds
- `/claudex:verdict [focus]` — two independent reviews, 🤝/🧡/🖤 disagreement table, SHIP / FIX FIRST / REDESIGN
- `/claudex:setup` — Codex CLI / auth / git preflight
- `claudex-second-opinion` advisory skill (suggests, never auto-runs)
- README as marketing surface: badge, co-author trailers, disclaimer

## Out of scope (v0.1) — roadmap
- `/claudex:debate` (architecture arbitration)
- Stop-hook consensus gate (block commits until both models sign off)
- GitHub Action posting verdicts on PRs
- Agreement-rate stats
- `@hamzaish/claudex` scoped npx installer

## Non-goals
- Reimplementing what codex-plugin-cc already does (delegation, threads, job management) — compose with it, don't compete
- Any auto-invocation of Codex without an explicit user command
