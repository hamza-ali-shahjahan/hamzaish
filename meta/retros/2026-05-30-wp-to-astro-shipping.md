# 2026-05-30 — wp-to-astro · OSS CLI shipped to npm + GitHub; validation sprint begins

> wp-to-astro `0.6.1` is live on npm and public GitHub. 6 build passes shipped end-to-end in 2 sessions. Real-world reality check post-publish surfaced a `slug` reserved-field bug that 138 unit tests missed — patched within the hour. Discipline violation in writing: built before validating. Now in 5-WP-refugee validation sprint.

## Context

- **Sprint goal**: Build the OSS wedge for the AI Native CMS thesis (per `<code>/docs/research-report.md`). The wedge is a clean, opinionated WordPress→Astro+MDX migration CLI that produces output an AI agent can edit by construction.
- **Time budget**: planned ~weekend; actual ~2 sessions over Sat May 30.
- **Stakes**: this is the **wedge** for the AI-native CMS direction. If the CLI doesn't earn real-user signal, the whole strategic frame is suspect.
- **Starting state**: empty directory at `~/Claude/AI Native CMS/`, slot-reserved entry in Hamzaish portfolio from 2026-05-28.

## Timeline (significant events, abridged)

- Pass 1 — WXR adapter + Zod IR + Astro spine emitter
- Pass 2 — Gutenberg block mapping (paragraph, heading, list, quote, code, separator, image)
- Pass 3 — Image pipeline (download, WebP via sharp, MDX rewrite)
- Pass 4 — REST API source adapter (Application Password, content.raw, yoast_head_json)
- Pass 5 — SEO postmeta + Yoast head_json → MDX frontmatter
- Pass 6 — 301 redirects (_redirects + vercel.json) + verify subcommand
- Real-world smoke test #1: canonical WordPress Theme Unit Test Data (58 posts + 21 pages, 44/57 render cleanly)
- Real-world smoke test #2: Docker-hosted live WP via REST (57 posts + 22 pages, same 44/57 render rate)
- `npm publish wp-to-astro@0.6.0` + GitHub Release
- Post-publish reality check: `astro dev` on the migrated output → every page 500s → `ContentSchemaContainsSlugError` (`slug` is reserved in Astro content collections)
- 0.6.1 emergency patch published within the hour
- Side incident: accidentally created **public** `agent-skills` repo (intended Hamzaish all along; flipped to private)
- Factory onboarding: full registration into `products/ai-native-cms/` with the full discipline shape

## What worked

- **Spec-locked-then-build cadence**. Each pass had a spec doc (`docs/spec-pass-{1..6}.md`) before any code. Drift was zero. → Promote to playbook? Already implicit in `factory/playbooks/mvp-stage/ai-native-dev-loop.md`; consider tightening the "spec lock before code" wording there.
- **Versioned Zod IR between source-adapter and emitter**. Architecture decision that pays for itself: future source adapters (Webflow, Ghost) and future emitters (Next.js, Hugo) are additive, not rewrites. Captured in `<code>/docs/decisions.md`.
- **Real-world end-to-end smoke testing post-publish** caught the slug bug. The deepest gate the consumer offers (running `astro dev`, hitting every emitted page) was the right gate. → **Promoted to playbook**: `factory/playbooks/launch-stage/output-validation-for-codegen-tools.md`
- **Honest CHANGELOG with v0.7 known-issues punch list**. Not pretending the output is perfect (13/57 broken pages in real-world test). The CHANGELOG is the first thing a downstream user reads — burying issues there is dishonest.

## What didn't / friction

- **Validate-before-build was violated**. 6 build passes + a patch shipped before a SINGLE conversation with a WordPress refugee. The v0.7 punch list of 4 items is currently guesswork — we don't know which item matters most because no real user has told us. → **Captured in `brain/anti-patterns/`**? Already captured as a learning; the pattern is the existing operating-principle rule 1 ("validate before construction"), not a new one. The violation itself is the lesson, and the recovery plan (validation sprint) is the demonstration.
- **OSS publishing tuition paid in real time**: GitHub email privacy, npm bin path normalization, security-key 2FA flow, pnpm publish quirks, no-republish-same-version, post-publish reality check. → **Promoted to playbook**: `factory/playbooks/launch-stage/oss-publishing-checklist.md`
- **Accidental public `agent-skills` repo**. Subagent misread the request. Flipped to private within the hour but real reputational risk in the window. → **Promoted to anti-pattern**: `brain/anti-patterns/accidental-public-repo.md`
- **`astro check` lied** — reported 0 errors when there were 57 broken pages in the emitted output. Reason: astro check only parses `.astro` files; the output had none at check time. Specific instance of a general pattern (codegen tools' check commands can be vacuously green). → Encoded in the output-validation playbook.

## Decisions made

Cross-product / factory-level:
- → `meta/changelog.md` v1.3 entry: ai-native-cms registered, playbooks promoted, anti-pattern filed, auto-commit safety installed.

Product-specific (ai-native-cms):
- → `products/ai-native-cms/decisions/README.md` 2026-05-30 entries:
  - **Validation phase before further build** — 5 WP-refugee migrations + ≥3 unprompted price signals + screencast + dev.to draft before any v0.7 polish or HN launch.
  - **Stay OSS-CLI-first; defer hosted service** — don't build the dashboard until 100+ GitHub stars or 10+ unsolicited paid expressions of interest.

Source-repo ADRs (in product's own code repo):
- → `<code>/docs/decisions.md` — 5 entries covering license choice (Apache-2.0), package manager (pnpm), WXR-first vs REST-first sequencing, Pass 3/4 reordering, "stop at Pass 6 for v1" cutoff.

## Updates to Hamzaish itself

- **New playbooks**:
  - `factory/playbooks/launch-stage/output-validation-for-codegen-tools.md` — when product output IS code, run it in the real consumer environment, not just lint it
  - `factory/playbooks/launch-stage/oss-publishing-checklist.md` — 6 gotchas + pre/post checklists for any npm/PyPI/crates/RubyGems publish
- **New anti-pattern**:
  - `brain/anti-patterns/accidental-public-repo.md` — 3-step existence check before any new repo creation
- **New safety**:
  - `scripts/auto-commit.sh` + Stop hook in `.claude/settings.json` — auto-commit wip snapshot at end of each Claude turn
  - `factory/commands/checkpoint.md` — manual `/checkpoint <msg>` slash command
- **Hamzaish version**: → `meta/changelog.md` v1.3

## Metrics moved

| Metric | Before | After | Δ |
|---|---|---|---|
| Active products | 13 (post v1.2) | 14 (ai-native-cms upgraded from slot_reserved → mvp) | +1 |
| MVP-stage products | 8 | 9 | +1 |
| Brain documents indexed | 132 (post Phase 0) | ~145 (post this retro) | +13 |
| Cross-product playbooks | 0 (in launch-stage/) | 2 | +2 |
| Anti-patterns | 0 | 1 | +1 |
| Retros | 0 | 1 (this one) | +1 |
| OSS products shipped | 0 | 1 (wp-to-astro@0.6.1 on npm) | +1 |
| WP-refugee conversations | 0 | 0 (the violation) | 0 |

The last row is the load-bearing one. Validation sprint exits when this row reads `5`.

## Surprises

- **`astro check` returning 0 errors with the output being completely broken**. Conceptual frame-shift: a tool's check command is scoped to *the tool's input file types*, not to *the tool's effect on a consumer's project*. Generalizable. → Encoded in output-validation playbook.
- **`pnpm publish --auth-type=web` silently doesn't pass through to npm's auth flow**. Lost ~20 min on this before switching to `npm publish` directly. The fix is one word; the discovery cost was real.
- **GitHub email privacy blocking the first push**, *after* having configured a working name + email already. Privacy setting is per-account on GitHub, not local. → Encoded in oss-publishing-checklist.

## Open questions / things to revisit

- **The `agent-skills` repo** is private again, but it exists separately from Hamzaish at `github.com/<user>/agent-skills`. Fold its content into `factory/playbooks/` (and delete) OR keep it as a separate cross-project skills lib? → Revisit: before next public push of Hamzaish.
- **Muakkil's buildathon status**. The buildathon was scheduled for this same weekend (Sat May 30 + Sun May 31). `products/muakkil/decisions/` is empty; `status.md` mtime is May 26. The wp-to-astro work may have displaced it, OR the session log lives only in the Muakkil cwd. → Revisit: ask Hamza directly. **This is the most important open thread.**
- **AI-rewrite layer for wp-to-astro (Pass 7+)** — out of v1 scope, deferred. Real-user signal will decide priority vs other v0.7 punch items. → Revisit: at end of validation sprint.
- **Validation sprint exit criteria**: 5 WP-refugee migrations, ≥3 unprompted price signals, screencast, dev.to draft. If `<2 weeks` produces zero responses, reconsider wedge framing. → Revisit: weekly during sprint.

## Next

→ **Record the 90-second screencast** (Hamza filming, factory supplying script if needed). Cheapest first artifact; visual asset for every downstream conversation. Then post in r/selfhosted offering 5 free migrations.

---

## Closing the loop checklist

- [x] `brain/learnings/2026-05-30.md` captures the surprises (filed before this retro)
- [x] "What worked" promoted to `factory/playbooks/launch-stage/output-validation-for-codegen-tools.md` and `oss-publishing-checklist.md`
- [x] Structural friction captured in `brain/anti-patterns/accidental-public-repo.md` (the agent-skills incident)
- [x] Decisions logged in `products/ai-native-cms/decisions/README.md` (factory-level) and `<code>/docs/decisions.md` (codebase-level)
- [x] `meta/changelog.md` updated with v1.3 entry
- [x] `bun brain/ingest.ts` run to refresh the index
- [x] Product stage moved `slot_reserved → mvp · active · validation`; `products/_portfolio.md` updated
