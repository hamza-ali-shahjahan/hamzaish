# rotscan — Live Status

**Last updated**: 2026-06-21
**Stage**: Launch (shipped to npm + announced)
**Sprint**: Post-launch — gather first real-user feedback

## North star this sprint

> Real developers run `rotscan` on their own repos and it finds rot they care about. The signal that matters is **issues, PRs, and "it caught X" replies** — not stars. A star from someone who never ran it is vanity.

## What's done

- [x] Public MIT repo: [github.com/hamza-ali-shahjahan/rotscan](https://github.com/hamza-ali-shahjahan/rotscan)
- [x] Published to npm: `@hamzaish/rotscan@0.1.0` — verified `bunx @hamzaish/rotscan` runs end-to-end
- [x] Four scanners working: 🔗 links (broken / wrong-case / gitignored) · 🔑 secrets (review-grade patterns) · 🗑 dead files · 📦 npm-unresolvable deps
- [x] `--all <dir>` multi-repo sweep (ranked by rot) and `--fix` (plan-then-`--apply`, de-link only)
- [x] Hero GIF + three step GIFs + narrated "How it works" README; reproducible `demo/` harness
- [x] `check-npm-bin` guard added factory-side after the bin-strip bug (publish-breaking bin caught pre-publish)
- [x] Scans **its own repo clean** (self-consistency proof)
- [x] Launch announcement live on the repo's Discussions

## Open next (post-launch)

- [ ] First-user feedback: who ran it, what it found, what broke
- [ ] Node-native distribution so `npx` works without Bun (currently Bun-only)
- [ ] Deeper scanners (more secret patterns; smarter dead-file heuristics; non-JS dep ecosystems)
- [ ] Decide whether to keep the npm scope or pursue an unscoped/renamed distribution later

## How people leverage it

- `bunx @hamzaish/rotscan --all ~/code` — audit every side project at once
- `bunx @hamzaish/rotscan` in one repo before a release or before sharing it publicly
- `bun add -g @hamzaish/rotscan` then `rotscan` for repeat use; or wire into a pre-commit / CI step

## Discipline check (Hamzaish rules)

- [x] **Cheap, fast, reversible build** — the ship was the test (free OSS CLI; no expensive/irreversible bet)
- [x] **Decisions logged** — see `decisions/`
- [x] **Security** — zero-dependency; reads only git-tracked files; its own secret scanner stays clean on its repo
- [x] **No vanity metrics** — north star is real-use signal (issues/PRs/"it caught X"), not stars

## Today's recommended action

Watch the repo's Discussions/issues for first-run reports; triage anything that breaks on a real repo. Node-native distribution is the highest-leverage next build once there's a reason (a non-Bun user who wants it).
