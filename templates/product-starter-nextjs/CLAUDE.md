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
6. **Make it visible (enablement protocol)**: open each task response with a one-line
   Factory Flight Plan (lane · slice · the factory doors this task will use, named as
   their real slash commands) and close with a Factory Receipt (doors that ran, factory
   artifacts updated, and the next doors the user can type themselves). The user must
   always be able to SEE what Hamzaish did — silent competence is not enablement.

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
