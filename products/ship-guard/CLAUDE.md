# ship-guard — Product instructions (Claude Code)

> Read the repo-root `CLAUDE.md` / `AGENTS.md` first. This adds ship-guard specifics.

**What**: A local-first, zero-dependency CLI + git pre-push hook that scans a repo for
the four "ransack" vectors (committed secrets, tracked secret files, force-push blast
radius, risky GitHub Actions). Packaged from `meta/security/REPO-ACCOUNT-SECURITY-AUDIT.md`.

**Where the code is**: a **standalone repo outside this tree** —
`/Users/hamza/Claude/ShipGuard` (registered in gitignored `code-paths.local.json`
under slug `ship-guard`). A single-file Node scanner (`bin/ship-guard`), an
`install.sh`, tests in `test/`. Runs on Node 16+ and Bun. This `products/ship-guard/`
folder holds **metadata only** — never put product code inside the public Hamzaish repo.

**Hard constraints (do not break)**:
- **Local-first, always.** No network calls, no telemetry, no dependencies. If a
  change adds a dependency or a network call, stop and flag it — it violates the core promise.
- **Zero-dep.** `package.json` must have empty (or no) `dependencies`. Standard Node
  built-ins only.
- **HELD LOCAL.** Do not create a public GitHub repo, do not push, do not run
  `/publish-repo` without explicit operator go-ahead. The name is approved to *use*, not publish.
- **The scanner must not flag itself.** Keep the `ship-guard:ignore-file` sentinel in
  `bin/ship-guard` and the fixture/vendored-dir path ignores intact.

**How to run / test** (from `/Users/hamza/Claude/ShipGuard`):
- Ad-hoc scan: `node bin/ship-guard scan [path]`
- Install hook into a repo: `node bin/ship-guard install` (from that repo), or `bash install.sh`
- Evals: `node test/run-evals.mjs` (must hit goal.md's bars: recall ≥ 0.90, clean FP == 0)

**Definition of done**: see `../goal.md`. Verify against evals before claiming done.
