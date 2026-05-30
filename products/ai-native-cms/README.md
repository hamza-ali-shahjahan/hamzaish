# AI Native CMS — factory entry

Hamzaish factory record for the AI Native CMS product. The actual source code lives at `~/Claude/AI Native CMS/` (symlinked here as `../ai-native-cms-code`).

## What this is

**Surface story:** Open-source CLI that migrates WordPress sites to clean Astro + MDX codebases. Shipped to npm as `wp-to-astro@0.6.1`, public repo at `github.com/hamza-ali-shahjahan/wp-to-astro-cli`.

**Strategic story (not in v1 marketing):** The wedge for an AI-native CMS. Once content is migrated, it lives as discrete MDX files with Zod-validated frontmatter — the substrate AI coding agents can edit directly. WordPress is the prison, wp-to-astro is the door, the AI-native CMS is the city outside.

## Where things live

- **Code**: `~/Claude/AI Native CMS/` (via the `ai-native-cms-code` symlink at the factory root)
- **Spec docs**: `<code>/docs/spec-pass-{1..6}.md` — locked specs per pass
- **ADRs**: `<code>/docs/decisions.md` (source of truth) — `decisions/` here is the factory index
- **Strategic context**: `<code>/docs/research-report.md` (the original Build & Launch plan)
- **CHANGELOG**: `<code>/CHANGELOG.md` (per-version notes, currently through 0.6.1)
- **Live status**: `status.md` (this folder) — what's currently true + today's recommended action
- **Launch assets** (planned): `launch/screencasts/`, `launch/posts/`, `launch/landing-page/`
- **User interviews** (planned): `interviews/<date>-<who>.md` — one per WP-refugee conversation

## Stage + sprint

`mvp · sprint: validation` — the CLI is shipped; the validation phase is 5 WP-refugee conversations + a screencast + iterate before HN launch. See `status.md`.

## Cross-product learnings already filed

The wp-to-astro session surfaced reusable patterns that belong in the brain, not just this product:

- Test the OUTPUT of code-gen tools, not just the tool's own test suite (`brain/learnings/2026-05-30.md` §Output Validation)
- npm bin path normalization + GitHub email privacy + security-key 2FA flow gotchas (`brain/learnings/2026-05-30.md` §OSS Publishing)
- "Astro check is the wrong check for content collections" — `tool check` validator-scope mismatch as a general anti-pattern
- Discipline violation: built 6 passes without 5 user conversations. The pattern to avoid in future products.

These should make future products faster. The factory's job is to make sure they do.
