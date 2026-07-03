# Repolish — Scope

> **Working name** — not locked. Concept: "readme-up". Held local-only until the name is chosen.

A one-command, local-first CLI that makes any code repo's first impression look
premium **and honest**. The wedge is the honesty pass: every other README
generator optimizes for polish, which slides into hype. Repolish polishes *and*
refuses to let the polish lie.

## Does (v0 MVP — built this session)
- Take a path to a local repo and **scan what it actually is** (manifest, language,
  install/run commands, tests, CI, license, existing README).
- **Generate a tailored README draft**: centered hero, tagline, *verifiable* badges
  only, an honest comparison table (pre-filled with TODO cells the user fills
  truthfully), and a real quick-start derived from the repo's manifest.
- **Run a no-BS honesty pass** over the repo's existing README: flag unverified /
  overclaimed statements (e.g. "production-ready" with no tests, "tested on Windows"
  with no CI evidence, fabricated benchmarks, "100% coverage" with no tests,
  "zero dependencies" when deps exist) with severity + an honest-rewrite suggestion.
- Offline + deterministic. Zero network, zero LLM calls, zero accounts.

## Does NOT (deliberately, for v0)
- **No demo-GIF recording yet** — the real `vhs`/terminal capture is the headline
  v1 feature, but it's heavy; it's a fast follow, not v0.
- **No network / no LLM calls** — keeps it deterministic, private, and game-able-proof.
- **Does not edit the repo's real README in place** — it writes a `*.draft.md`; the
  human stays in the loop on what ships.
- **No web UI**, no hosted service, no publishing/pushing anything public.
- Honesty pass catches *known overclaim shapes*, not novel semantic lies (that
  ceiling is raised later by an optional LLM pass — out of scope for v0).
