# 0001 — Scaffolded + v0 CLI built (local-only)

- **Date**: 2026-06-23
- **Decision**: Birthed `repolish` via the factory flow — `/write-a-goal` to forge the
  goal (see goal.md), then the `/scaffold` convention for this metadata folder. Built a
  v0 TypeScript CLI (offline, zero-dependency) as the code, registered in the gitignored
  `code-paths.local.json` under slug `repolish`. Code lives **outside** this always-public
  factory repo; nothing pushed to any public remote.
- **Why**: The product is a local-first CLI, not a Next.js web app, so the Next.js
  starter half of `/scaffold` does not apply — followed the *spirit* (metadata + decision
  log + validation ledger + goal) and scaffolded a CLI instead. Kept everything local and
  the name trivially renameable because the public name ("repolish") is not yet locked.
- **What would prove it wrong**: If pattern-based honesty detection misses most real-world
  overclaims (low recall on real READMEs), the differentiator is hollow and v0 needs an
  LLM semantic pass before it's worth shipping.
- **Revisit trigger**: Before buying a domain / creating any public repo (lock the name
  via `/name-product` first), and after running the honesty pass on ≥5 real-world READMEs.

## 2026-06-23 — Validation debt accepted (recorded, not silent)
- v0 is a cheap/fast/reversible local CLI — the build is its own test (Hard Rule #2).
  Validation ledger flipped to `debt-accepted` with the catch-up trigger written in
  validation/README.md. No expensive or irreversible bet has been made.

## 2026-06-23 — Stack: zero-dependency TypeScript on Bun (deviation from default)
- **Decision**: Implement as zero-runtime-dependency TypeScript run directly by Bun
  (`bun run`), not the default Next.js product starter.
- **Why**: It's a local CLI. Zero deps = `bun install` is unnecessary, no build step
  (honors the "avoid full builds" / flaky-shell constraint), and the tool stays offline
  and deterministic — which is itself part of the honesty promise. Per `stack/`, deviation
  from the default stack is allowed with a written reason; this is that reason.
- **What would prove it wrong**: If a needed capability (e.g. demo-GIF recording, richer
  manifest parsing) forces real dependencies, revisit and add them deliberately.
- **Revisit trigger**: When implementing v1 demo-GIF recording (`vhs`).
