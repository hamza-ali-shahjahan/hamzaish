# Tasks: market-xray build (vertical slices; ≤5 files each; dependency-ordered)

- [ ] **T1 — Harvester core: parsers, caps, provenance, hygiene (pure logic)**
  - Acceptance: 5 source parsers (site page, EDGAR full-text, iTunes RSS, Reddit
    .json, HN Algolia) each turn a SYNTHETIC fixture into `SourceDoc[]` with
    url/fetchedAt/source/sha256/text; review-author names stripped; caps stop at N
    and report truncation loudly; robots.txt helper answers allow/deny.
  - Verify: `bun test ./scripts` green; grep proves no `fetch(` in test paths.
  - Files: `scripts/xray-harvest.ts`, `scripts/xray-harvest.test.ts`,
    `scripts/fixtures/xray/*` (synthetic only).

- [ ] **T2 — CLI + on-disk layout + ingest awareness**
  - Acceptance: `bun run xray-harvest --slug copyright --dry-run` prints the plan,
    exits 0, zero network. Real run (smoke caps `--cap-sites 2`) writes
    `products/<slug>/research/corpus/*` + `sources.md` (URL · date · sha256 rows
    matching file hashes) + appends a `runs.md` row (date · caps · counts · duration).
    ≥1s per-domain delay, honest User-Agent. `.gitignore` gains
    `products/*/research/corpus/` (beside the existing meta/research/ precedent).
    `bun run ingest` indexes `research/*.md` + local `corpus/*.md`.
  - Verify: dry-run assertion in tests; manual capped smoke inspected at CP2;
    `git status` shows corpus untracked; ingest doc-count rises.
  - Files: `scripts/xray-harvest.ts`, `.gitignore`, `brain/ingest.ts`.

- [ ] **T3 — The skill: 5-stage orchestration** *(draftable in parallel with T1/T2)*
  - Acceptance: `factory/skills/market-xray/SKILL.md` runs frame → discover →
    harvest → interrogate → attack+handoff with TWO consent gates (frame confirm;
    competitor-list prune before any fetch); stage 2 drives `competitor-research`,
    which now ALSO emits `competitors.csv` beside its compounding `competitors.md`;
    outputs obey cite-or-⚠SPECULATION; stage 5 writes `gtm-hypothesis.md` and the
    5-conversation interview script into the product's validation ledger; user-facing
    bookends pass the legibility gate.
  - Verify: `check-skill-command-collision` + `check-legibility` green; dry
    walkthrough against T1 fixtures produces a cited synthesis.
  - Files: `factory/skills/market-xray/SKILL.md`,
    `factory/skills/competitor-research/SKILL.md`.

- [ ] **T4 — Citation-gate eval (the ratchet counts it)** *(needs T1)*
  - Acceptance: deterministic, agent-blind case in `meta/evals/skills/market-xray/`:
    given the fixture corpus and a canned synthesis (N cited, M uncited claims), the
    gate computes the citation rate and requires uncited claims under ⚠ SPECULATION;
    registered in `coverage.json` — covered entities 9→10, case undeletable.
  - Verify: `bun run eval --no-llm` passes; `bun run check-evals` reports 10.
  - Files: `meta/evals/skills/market-xray/*`, `meta/evals/coverage.json`.

- [ ] **T5 — Dogfood: patently x-ray end-to-end + close the loop** *(last)*
  - Acceptance: spec Success Criteria 4–6 — ≥20 competitor sites harvested (or
    shortfall documented in runs.md), ≥100 reviews/complaints, synthesis ≥90% cited,
    `products/copyright/research/gtm-hypothesis.md` written, validation ledger holds
    the interview script, ≤3 operator-hours wall clock, nothing under corpus/
    tracked by git. Changelog v2.25.0 entry + retro grounded in the run's traces.
  - Verify: runs.md + citation-rate line; full guard battery in clean worktree;
    operator sign-off at CP4; ship PR.
  - Files: `products/copyright/research/*`, `products/copyright/validation/README.md`,
    `meta/changelog.md`, `meta/retros/*`, `docs/versioning.md` + `package.json` (v2.25.0).
