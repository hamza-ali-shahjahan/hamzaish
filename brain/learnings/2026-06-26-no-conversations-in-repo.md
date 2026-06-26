# 2026-06-26 — Keep conversations/strategy OUT of product repos (+ defensive ignore nets)

**Setting**: ThousandWorlds Explorer. Operator's hard standing rule: never commit our
conversations (current or past), strategy, or discussion notes to a product repo — *ever*.
A product repo is app code, not a notebook; that context lives in **local memory**
(`~/.claude/…`), which is not part of any repo.

## What we did
- **Audited the repo** for leaked conversation/email/strategy content across the CURRENT
  tree AND full history — not just the tip:
  - `git grep -nI -iE "<email|name|phrase>" -- . ':!package-lock.json'` (current tree)
  - `git grep -nI -iE "<pat>" $(git rev-list --all)` (every commit blob)
  - `git log --all -S "<secret string>"` (when a string was introduced/removed)
  Result was clean: the only "user" hit was an app code comment; author-name hits were
  legit academic citations. **Always verify history, never assume clean.**
- **Added a defensive `.gitignore` net** to the repo as belt-and-suspenders, verified with
  `git check-ignore -v <name>` (catches notes/transcripts) and a sanity check that real app
  files are NOT ignored.

## The footgun that shaped the pattern design
macOS is **case-insensitive** (`core.ignorecase=true`), so a bare glob like `conversation*`
or `notes/` will silently stop tracking real source files — `Conversation.tsx`, a `notes/`
component dir — in any chat/messaging product. That's the "passes locally, breaks for
everyone / file mysteriously untracked" class (see [[2026-06-20]]). **Fix:** the *machine-wide*
and *starter* nets use only prose-anchored patterns (`*.conversation.md`, `transcript.md`,
`*.transcript.txt`, `CHATLOG.md`, …) that end in `.md`/`.txt`, so they can't shadow source.
A project-local repo (where you know there's no such component) can be broader.

## Three layers shipped
1. **Per-repo** — defensive `.gitignore` block in the product repo (ThousandWorlds).
2. **Hamzaish-wide (users auto-protected)** — the same block baked into
   `templates/product-starter-nextjs/.gitignore`, plus a "Conversations gitignored" check in
   the `scaffold` SKILL's secure-by-default list, so every scaffolded product is born
   protected without anyone remembering to add it.
3. **Machine-wide (all sessions, human or Claude)** — appended the prose-anchored block to
   git's XDG default `~/.config/git/ignore` (already active; no `core.excludesFile` needed),
   so every repo on the machine auto-ignores conversation/notes files. Backed by a HARD rule
   in global `~/.claude/CLAUDE.md`: never write a conversation/strategy/discussion file into
   any repo; scan tree+history on request.

## The rule
The ignore nets are a **safety net, not the guarantee** — the guarantee is behavioral: never
write conversation content into a repo file in the first place; keep it in local memory.
Private context (emails, names, strategy) stays out of git, always.

## Decision
Standing default for every Hamzaish-driven product and every repo on this machine. Turn the
lesson into a guard, not just a doc (scaffold checklist + global ignore + CLAUDE.md rule).
Related: [[2026-06-20]] (git check-ignore / what's-committed-vs-on-disk).
