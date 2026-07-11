---
description: Cut the next public release at a major-cycle boundary — pick the next semver tag, assemble notes from meta/changelog.md, create an annotated tag + GitHub Release, and mark it latest.
argument-hint: "[bump: major|minor|patch, or an explicit version like v1.1.0] (optional)"
---

The user invoked: `/release $ARGUMENTS`

This is the **public-release step** of the factory cycle. It turns the internal `meta/changelog.md` history into a polished GitHub Release that strangers see. It runs at the **same major-cycle boundary** the learning loop does — `/learn-loop` promotes what the cycle taught; `/release` publishes what the cycle shipped. Run `/learn-loop` first if the boundary also produced promotable learnings, so the changelog is current before you cut.

## When to run

Only at a **major-cycle boundary** — the same triggers as the learning loop (`meta/learning-loop-rubric.md` §1):

- A product crosses a stage gate, ships, or is killed.
- A session/sprint closed with a notable win or notable friction worth marking.
- The factory itself changed in a way worth surfacing to the public (new skill/agent/command/hook/playbook, a hardening pass, a docs rearchitecture).

If none of those fired since the last release, say so and stop — every-session releases are noise. Most cycles append a changelog line and move on; only boundaries that meaningfully change what a stranger gets warrant a tag.

## Steps

1. **Confirm the boundary.** State which trigger fired (use `$ARGUMENTS` as the cycle label if it reads like one). If it isn't a boundary, stop and tell the user.
2. **Find the public tip.** This repo's published HEAD is `origin/main`. Releases tag *that* commit, never a feature branch. Fetch first: `git fetch origin main`. If the current checkout is on a feature branch, do all git work from a `main` worktree (`git worktree add --detach /tmp/hamzaish-rel origin/main`) so the checkout is undisturbed; tag `origin/main`'s SHA.
3. **Pick the next version.** Read the last tag (`git describe --tags --abbrev=0` / `gh release list`) and the current factory version line in `meta/changelog.md`. Default the bump from the cycle: factory-behavior change → **minor**, fixes/docs only → **patch**, breaking/contract change → **major**. `$ARGUMENTS` overrides (a bump word or an explicit `vX.Y.Z`). State the chosen version and why.
4. **Assemble the notes from `meta/changelog.md`.** First run `bun run check-changelog` — it fails if any shipped version (`vX.Y` in a commit subject) is missing its changelog header (a header dropped in a rebase would silently omit a shipped feature from the public notes). Fix any miss before assembling. Then collect every changelog entry added since the last released tag (newest first). Fold their **What changed / Why** bullets into a polished, structured markdown release body — a one-line what-it-is, a **Highlights** section (the few changes that matter to a reader), a **What's inside / changed** section, and **Get started** + **License** footers. Base it ONLY on what's on `origin/main`; no unreleased feature-branch work, no invented features. Honest copy (operating principle #13) applies to release notes too. Write it to a temp notes file.
5. **Cut the tag + Release** (background any network op so a hung remote can't wedge the turn):
   - Annotated tag at the public SHA: `git tag -a <version> <sha> -m "<version> — <headline>"`
   - Push it: `git push origin <version>` (background).
   - Create the Release: `gh release create <version> --title "<version> — <headline>" --latest --notes-file <notes>` (background).
6. **Verify.** `gh release view <version>` / `gh release list` — confirm it published, isn't a draft, and is marked **Latest**. Report the URL.
7. **Record it.** Append a one-line changelog entry under the dated heading: `/release <version>: cut from <N> changelog entries since <prev>.` Bump the factory version line if it lagged.
8. **Distribution shots.** A release nobody hears about is a changelog entry with extra steps — each release is a content atom (`factory/playbooks/launch-stage/release-cadence-as-content.md`). Tier the shot by the bump, **draft — never post** (the operator posts), and log every draft as a `drafted` line in `meta/marketing/channels-ledger.md`:
   - **Patch** → no shot. The release feed itself is the signal.
   - **Minor** → turn the release notes into one content atom at `meta/marketing/news-waves/YYYY-MM-DD-release-<version>.md`: an X thread + an r/ClaudeAI post (subreddit-native: lead with the useful change, not the project). Recommend which one to actually post, and why.
   - **Major** → run the **Show HN gate** below. Pass → say "this release qualifies for Show HN" and generate the full kit per `factory/playbooks/launch-stage/hacker-news-launch.md`: title (`Show HN: … – …`, en-dash, <80 chars), 150–300-word first comment, and the Tue–Thu 06:00–09:00 PT slot recommendation. Fail → name the failing criteria out loud — that list is the pre-launch work list — and fall back to the minor-tier drafts.

   **Show HN gate — recommend the shot only when ALL four hold** (this is the "are we at that level?" check, stated once so it isn't re-litigated every release):
   1. The README converts a cold visitor: pain-naming one-liner above the fold, quickstart *actually verified* under 5 minutes, alternatives section present.
   2. At least one real shipped product in `products/SHOWCASE.md` a stranger can click — proof, not promises.
   3. The release gives a *stranger* a capability stateable in one sentence with no Hamzaish vocabulary.
   4. ≥30 days since this repo's last Show HN, or it has meaningfully changed since (HN repost etiquette).

## Notes

- **Tag the public tip, not your branch.** The whole point is that the Release reflects what's actually published. Tagging an unpushed or feature-branch commit makes a Release GitHub can't resolve.
- **Background the push and `gh release create`** — they're the network ops most likely to hang. If one stalls, the tag may still have gone through; re-check with `gh release list` before retrying.
- `/learn-loop` (promote learnings) and `/release` (publish the cut) are the two halves of a boundary: internal compounding + external surface. Neither runs every session.
- Step 8 rides *our* releases; `/news-wave` rides *Anthropic's*. Both draft-only, both log to `meta/marketing/channels-ledger.md` — the ledger, not a playbook, is the memory of which channels actually convert.
- This command lives at `factory/commands/release.md` (canonical home); `.claude/commands/` symlinks there so Claude Code auto-discovers it as `/release`.
