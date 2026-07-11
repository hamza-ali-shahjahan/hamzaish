---
description: Sweep Anthropic/Claude Code news since last check and draft same-day ride-the-wave content (repo announcement/Discussion, X thread, r/ClaudeAI post) for wave-worthy items. Use /release instead to publish Hamzaish's own releases; use /web-launch instead for launching a product.
argument-hint: "[force] — re-sweep even if last run was <24h ago"
---

The user invoked: `/news-wave $ARGUMENTS`

This is the **attention-wave tracker** of the factory's distribution engine. Every Anthropic release (new Claude Code capability, SDK feature, model) opens a ~48-hour window where "how Hamzaish uses the new X" content rides borrowed attention instead of building its own. This command detects those windows and drafts the content while they're open. It is the news-driven counterpart of `/release` (which turns *our* shipping into content — see `factory/playbooks/launch-stage/release-cadence-as-content.md`).

**Division of labor:** Claude detects, verifies, and drafts. The operator reviews and posts. Nothing is ever auto-published.

## When to run

- At the start of any session where `meta/marketing/news-watch.json` shows `last_run` ≥ 24h ago (cheap: one state read decides).
- On demand, any time the operator hears of an Anthropic announcement.
- `$ARGUMENTS` = `force` re-sweeps regardless of last_run.

## State

`meta/marketing/news-watch.json` — the tracker's memory. Schema:

```json
{
  "last_run": "YYYY-MM-DDTHH:MMZ",
  "sources": {
    "claude-code-releases": { "last_seen": "vX.Y.Z" },
    "anthropic-news": { "seen_slugs": ["..."] }
  },
  "items": [
    { "id": "claude-code-vX.Y.Z", "date": "YYYY-MM-DD", "verdict": "WAVE|RIPPLE|SKIP",
      "draft": "meta/marketing/news-waves/YYYY-MM-DD-slug.md", "posted": false }
  ]
}
```

Update it every run. It is committed (it's factory telemetry, not secrets).

## Steps

1. **Read state.** If `last_run` < 24h ago and not `force`, report "checked Nh ago, nothing to do" and stop.
2. **Sweep the sources** (network ops in background so a hung fetch can't wedge the turn):
   - **Claude Code releases** — `gh api repos/anthropics/claude-code/releases?per_page=10` (fallback: raw `CHANGELOG.md`). New versions since `last_seen`.
   - **Anthropic news** — fetch `https://www.anthropic.com/news`; diff post slugs against `seen_slugs`.
   - **Docs release notes** — fetch the Claude Code release-notes page on the docs site for feature detail on anything the changelog names tersely.
3. **Classify each new item** — state the verdict and the one-line why:
   - **WAVE** — a new *capability* Hamzaish uses or could visibly use: hooks, skills/plugins, agents/SDK features, MCP, memory, new models, pricing changes that affect builders. These get full drafts.
   - **RIPPLE** — noteworthy but not integration-shaped (an interview, a minor model bump). One tweet draft at most.
   - **SKIP** — bugfixes, internal notes. Recorded in state so they're never re-evaluated, nothing drafted.
4. **Truth gate (before any draft).** For each WAVE item, grep `factory/` and `CLAUDE.md` to establish Hamzaish's *actual* relationship to the feature:
   - **Already used** → the draft is "how Hamzaish uses X" with real file paths as proof.
   - **Not yet used but should be** → the draft is "we're integrating X — here's the design," AND propose the integration as a concrete task (integration-first: the post must be true when posted). Honest copy (operating principle #13) applies to wave content exactly as it does to release notes — never imply usage that doesn't exist.
   - **Not relevant to Hamzaish** → downgrade to RIPPLE or SKIP; riding a wave with no genuine angle reads as spam and burns channel credibility.
5. **Draft the content atoms** to `meta/marketing/news-waves/YYYY-MM-DD-<slug>.md`, one file per WAVE item, each section ready-to-paste:
   - **(a) Repo announcement** — a GitHub Discussion/announcement post for the Hamzaish repo: what shipped upstream, how Hamzaish uses it, what changes for adopters.
   - **(b) X thread** — first post standalone and <280 chars, plain voice per `meta/voice.md`, repo link in the final post only.
   - **(c) r/ClaudeAI post** — title + body, subreddit-native: lead with the useful insight about the upstream feature, Hamzaish mentioned as the working example, zero marketing language.
   - Stamp each draft with a **window status**: `HOT` (item <48h old — post today), `WARM` (48–72h — post now, angle on depth not speed), `COLD` (>72h — skip the news frame; salvage as evergreen content or drop).
6. **Update state** (`last_run`, `last_seen`, `seen_slugs`, `items[]`) and append one line per WAVE to `meta/marketing/channels-ledger.md` with status `drafted`. When the operator later confirms a post went up, update that ledger line with the URL and outcome — the ledger is how we learn which channels/angles actually move stars.
7. **Report.** A short table — item · verdict · window · draft path — then the single recommended action ("post (b) to r/ClaudeAI today; the window closes ~tomorrow"). If nothing new: say so in one line.

## Notes

- **The window is the whole point.** A HOT draft delivered in tomorrow's session is a COLD draft. When a WAVE is found, say so at the top of the turn, not buried in a summary.
- **Cadence composes:** `/news-wave` rides *their* releases; `/release` step 8 rides *ours*. Both feed the same ledger.
- This command lives at `factory/commands/news-wave.md` (canonical home); Claude Code auto-discovers it as `/news-wave` via the `.claude/commands` symlink.
