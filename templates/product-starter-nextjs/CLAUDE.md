# CLAUDE.md — scaffolded Hamzaish product

> Seeded by the Hamzaish starter. At registration, replace `SLUG-TBD` with the real slug
> and flesh out product specifics from the factory's `templates/claude-md-template.md`
> (this file carries its two universal blocks so every scaffold is born factory-managed).

## Hamzaish-managed product (the factory contract — keep this section)

This repo is a **Hamzaish factory product** (slug: `SLUG-TBD`). Factory home:
`~/Claude/Hamzaish/products/SLUG-TBD/` — pinned goal, live status, slices, learnings,
decisions, validation ledger. On ANY change request in this repo, do this without being
asked (a follow-up is a new slice, not an exit from the factory):

1. **Re-enter the factory flow** (`/work-on SLUG-TBD` or `/hamzaish` when available);
   read the factory `status.md` first.
2. **Pin the request as a slice** (one measurable "done" line) in `status.md` BEFORE building.
3. **Build with tests** — `bun run test` + `bun run test:e2e` stay green; new features
   ship with new tests; never strip the starter's tests or CI.
4. **Verify end to end** against the really-running app (`bun dev`, HTTP 200) before
   reporting done.
5. **Feed the loop**: mark the slice shipped in `status.md`, add transferable lessons to
   `learnings.md`, and ground the retro (`bun run trace-report`, `bun run friction log`
   from the factory repo).
6. **Make it visible (enablement protocol)** — plain day-1 language, value never
   mechanism, no factory jargon. Open each task response with the 4-line plan (~80 words):
   `🏭 Hamzaish plan` · **Goal:** what "done" looks like · **Steps:** the pieces of this
   task, in order · **Commands:** each `/command` WITH what it does here · **Proof before
   "done":** how it will be verified. Close with the 3-line receipt (max ~50 words):
   `🏭 Hamzaish receipt` · **What you got:** the value added to the user's work ·
   **Checked:** how it was verified (plus anything deliberately not done) · **Try next:**
   ONE `/command` with what it does. Numbers only if the user feels them — test counts
   yes, commit hashes no. Gate both bookends before sending: day-1 words only (no
   insider nouns), exact shapes, caps respected, one Try-next command — `bun run
   check-legibility` in the factory repo lints a bookend for you.

## Session-quality defaults (factory-shipped — apply in every session)

- **Only share links that work.** Before sharing a localhost link, verify a real dev
  server answers HTTP 200 (`curl -s -o /dev/null -w "%{http_code}" http://localhost:PORT/`).
  End build responses with the relevant links — clickable AND in a copyable code block.
- **Anything the user must copy/paste goes in its own fenced code block** — one command
  per block, prose outside the block.
- **Secrets files are user-touched only.** Claude creates/edits only `*.example`
  templates with placeholders (this starter ships `fnox.toml.example` /
  `pitchfork.toml.example` for exactly this reason); the user copies and fills them.
  Verify with non-printing checks (`grep -c`, `test -s`) — never print a secrets file.
