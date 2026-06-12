# Session Handoff — the pattern (template)

> The real handoff prompt is **operator-local**: `meta/HANDOFF.local.md` (gitignored, per the repo's `.local`/`.example` convention). This committed file is the template — copy it to `HANDOFF.local.md`, fill in your own state, and update it at the end of any major session so the next one starts clean.

Why local: a good handoff names your current focus, your gates, and your unshipped plans — operator-specific context that doesn't belong in a public repo.

---

## Template

```
Continue building Hamzaish — my AI Co-builder & Startup OS at <your clone path>.

ORIENT FIRST (read in order, then summarize back what you understand):
1. AGENTS.md + CLAUDE.md — operating instructions + hard rules
2. meta/changelog.md (top 3 entries) — recent state + current version
3. meta/SELF-EVOLUTION.md — the north-star arc
4. brain/operating-principles.md — the rules you don't violate
5. brain/identity/operator.local.md — how you work
6. brain/learnings/<latest>.md — the freshest lessons

CURRENT STATE:
- <repo visibility, version, what shipped recently>
- <what's mid-flight, what's parked>
- <anything a cold session would get wrong without being told>

HARD GATES:
- <your commit/push approval rules>
- <what must never enter the repo>
- <any multi-session coordination caveats>

WHAT'S NEXT (propose, let me pick):
1. <option>
2. <option>

HOW I WORK: <your working-style line>

Start by orienting, confirm state back to me, then propose what we tackle first.
```
