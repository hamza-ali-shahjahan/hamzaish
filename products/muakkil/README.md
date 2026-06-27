# muakkil

See [`product.config.json`](product.config.json) for the canonical manifest.

Code lives in its own sibling repo (path in gitignored `code-paths.local.json`).

## What this is

A mystical, motion-rich AI-agent platform. Four "spirit" agents — **Scribe** (voice/dictation), **Seeker** (research), **Maker** (coming soon), **Herald** (email + Slack dispatch) — collaborate on user "charges" through cross-agent orchestration. Ritual UX: scroll-driven curtain parting, canvas sigil-drawing, animated agent cards.

Submitted to a Lovable weekend buildathon: GitHub `main` is Lovable's source of truth.

## Current state (as of factory onboarding, 2026-05-26)

- **Landing page**: shipped. Live at https://muakkil.app. ~1465 LOC, single route file (`src/routes/index.tsx`).
- **Email waitlist**: live, Supabase-backed.
- **Agent backends**: **none yet** — pitch only. This is the buildathon work.
- **GA4**: wired (`G-RYWKGMVS7K`).

## Buildathon goal

Ship the Scribe end-to-end demo in 48h:

> User signs in → clicks "Speak your charge" → says one sentence → Scribe transcribes → orchestrator plans → Seeker researches → Herald emails. Sign-in to result in < 90s.

See [`status.md`](status.md) for live progress against the 48h timeline. Full plan at `muakkil-code/docs/buildathon-plan.md`.

## Working on this product

- Read `product.config.json`
- Read `../muakkil-code/CLAUDE.md` for stack conventions (TanStack Start, Bun, shadcn, Lovable round-trip rules)
- Read `status.md` for what to work on next
- Recent decisions in `decisions/`

## Hamzaish-relevant gotchas

- **Lovable round-trip**: push to `main` resyncs Lovable's preview. Pull *before* starting; only push when you want Lovable to see it.
- **Bun, not npm**: never `npm install` here.
- **Don't auto-fix lint**: ~321 pre-existing Prettier violations from Lovable's bot. Touch only when you're already in the file.
- **`.env` is committed** (publishable Supabase keys only). Real secrets go in `.env.local` (gitignored).
- **No Hamzaish files in Muakkil yet** — Phase B will decide whether to add `docs/hamzaish.md` to Muakkil. Until then, all coordination is from this side.
