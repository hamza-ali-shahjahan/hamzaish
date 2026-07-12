# 0001 — Scaffold ClauDex; distribute via GitHub plugin marketplace, not npm

**Date**: 2026-07-12
**Status**: accepted

## Context
OpenAI open-sourced [codex-plugin-cc](https://github.com/openai/codex-plugin-cc)
(GitHub trending Jul 8, 2026), putting Codex inside Claude Code with `/codex:review`,
`/codex:adversarial-review`, `/codex:rescue`. Window for a moment-marketing play:
a plugin that makes the two models genuinely collaborate.

## Decision
1. **Build ClauDex as a Claude Code plugin marketplace repo**
   ([hamza-ali-shahjahan/claudex](https://github.com/hamza-ali-shahjahan/claudex)),
   installed with the identical motion OpenAI just taught the market. npm is out as
   the primary channel — `claudex` and `claudex-cli` are squatted there.
2. **Hero loop as explicit commands**: `/claudex` (Claude writes → Codex reviews via
   `codex exec --sandbox read-only` → fix → consensus, max 3 rounds),
   `/claudex:verdict` (dual independent review, 🤝/🧡/🖤 disagreement table),
   `/claudex:setup`. Every run ends `built with love by ClauDex 🧡🖤`; commits carry
   Claude + Codex co-author trailers (embedded growth loop).
3. **Skill is advisory-only** (`claudex-second-opinion`): suggests `/claudex:verdict`
   after risky changes, never auto-runs Codex — auto-spending another vendor's quota
   would be the top uninstall reason. Mirrored into `factory/skills/`.
4. **Trademark posture**: "unofficial, not affiliated" disclaimer in README, no
   Anthropic/OpenAI logos, MIT license.

## Consequences
- Launch checklist lives in `status.md` — publish + GIF + posts within 48h or the moment decays.
- ClauDex stays out of `SHOWCASE.md` until it ships something users can touch.
- Depends on users having Codex CLI authenticated; `/claudex:setup` gates this.
