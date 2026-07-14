# Release cadence as a content engine — and incumbent-anchored positioning

Source-of-truth playbook for the two discoverability levers that recur in *every* 30k–200k self-hosted winner. Ported from how immich, AppFlowy, and Plane actually grew — not theory.

> **Principle:** A repo's stars are won by *repeated visible motion + instantly-graspable positioning*, not by one launch. Distribution dominates; cadence compounds it.

---

## Lever 1 — A visible release cadence *is* the content

immich flopped on Hacker News 7+ times (1–6 points each) yet reached 22k+ stars — because it shipped a release roughly **every 7 days**, and each release was a reason to post, tweet, and re-surface. AppFlowy shipped 2–3 releases/month for 4.5 years. SiYuan posts dev builds every 2–3 days.

**What to do:**
- Pick a cadence you can *actually* sustain (weekly is ideal; bi-weekly is fine). Sustained-and-boring beats heroic-and-sporadic.
- Make each release **public-facing**, not just an internal `meta/changelog.md` bump: a short "what changed + why it matters" note a stranger can skim.
- Treat each release as a content atom — the same note feeds the changelog, a Reddit/r/ClaudeAI post, and an X thread.
- **Milestone marketing**: year-in-reviews and "N stars" posts earn *repeated* front pages. Bank them.

**Anti-pattern:** a dead-looking repo. `smol-ai/developer`'s stars froze the moment pushes stopped (see [stars-are-not-pmf](../../../brain/anti-patterns/stars-are-not-pmf.md) for the inverse trap). Abandonment is visible and costly in public.

**Stronger proof (verified 2026-07-08):** stably ai's Orca hit ~12.1k stars in ~110 days with **no launch at all** — no Show HN, no Product Hunt. Measured off the GitHub API: multiple releases per day, ~46 merged PRs/day, 68% issue-close rate. Cadence + community can replace the launch pulse entirely — see [community-flywheel](community-flywheel.md) for the other half of that engine.

> Caveat from the research: cadence *helps* but **distribution dominates** — karpathy's repos kept compounding stars *after* pushes stopped because the distribution was already there. Cadence is the controllable lever for those of us without a famous name yet.

## Lever 2 — Incumbent-anchored positioning *as the literal headline*

Every 300+ point HN hit in the cohort used the same move: the title *is* the comparison. AppFlowy → "open-source Notion alternative" (304-pt HN, 3 days after launch). Plane → "open-source alternative to Jira" (638-pt HN). The reader understands the entire product in 10 seconds because they already know the incumbent.

**What to do:**
- Lead the README and every launch post with one line of the form **"the open-source ___ alternative"** or **"the ___ for ___"** — incumbent-anchored, concrete, no brand-first abstractions.
- Put it *above the fold* — before philosophy, before feature lists.
- Pair it with a **hero demo GIF** (we ship `vhs`; see `scripts/credits.tape` for the pattern) and a **zero-friction trial** (one-line install / clone-and-go) in the first screen.

**Anti-pattern:** brand-led taglines ("Unlock your Builder Mode") that mean nothing to a cold visitor. They read as a poster, not a positioning. Keep the brand line *under* the incumbent-anchored one.

## Where to launch (verified)

HN + Reddit are where this audience congregates. **Product Hunt was irrelevant for all eight winners** in our study. Best HN slot in the dataset: Monday 00:00 UTC. But an HN hit is a *pulse* (half-life ~24h, ~1.4 stars/upvote), not a strategy — the cadence + positioning above are what convert the pulse into compounding growth.

---

**Credit (port the idea, never the code):** immich — https://github.com/immich-app/immich · AppFlowy — https://github.com/AppFlowy-IO/AppFlowy · Plane — https://github.com/makeplane/plane. Distilled via our own road-to-stars research; see [`docs/LEARN-FROM-REPOS.md`](../../../docs/LEARN-FROM-REPOS.md) entries A1/A2/A3.
