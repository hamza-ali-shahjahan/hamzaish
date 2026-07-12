# Channels Ledger — every distribution shot, logged

Append-only. One line per shot (a post, a launch, a submission). This is the factory's memory of **what actually moves stars/traffic** — `/news-wave` and `/release` step 8 both write here, and the operator closes the loop by recording the outcome. Review it before choosing where to spend the next launch: the pattern in this file beats any playbook's prior.

**Outcome, measured cheaply:** stars delta over the following ~48h (GitHub traffic panel or `gh api repos/{owner}/{repo} --jq .stargazers_count` before/after), plus anything notable (comments, PRs, issues from strangers).

| Date | Trigger | Channel | Content | URL | Outcome |
|---|---|---|---|---|---|
| 2026-07-12 | wedge-launch: guardhooks v0.1 (+ ship-guard as sibling) | r/ClaudeAI | draft delivered in chat (postmortem angle: leaked keys → 4 fail-open guards) | _pending — operator posting_ | _record 48h star delta for both repos_ |

**Trigger** = what earned the shot: `news-wave: <item>`, `release: <version>`, or `milestone: <what>`.
**Channel** = show-hn · r/ClaudeAI · x · repo-discussion · other (name it).
**Content** = path to the draft used (`meta/marketing/news-waves/...`) so angle → outcome stays traceable.
