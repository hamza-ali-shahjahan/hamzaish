---
description: Enter a product workspace with full Hamzaish context loaded — config, status, decisions, stage playbook, and the product's own CLAUDE.md.
argument-hint: <product-slug>
---

The user invoked: `/work-on $ARGUMENTS`

This command works from any cwd. All Hamzaish paths below are absolute.

Follow the protocol in `/Users/hamza/Claude/Hamzaish/factory/workflows/work-on-product.md`.

Short version:
1. Validate `/Users/hamza/Claude/Hamzaish/products/$ARGUMENTS/product.config.json` exists. If not, `Read /Users/hamza/Claude/Hamzaish/products/_portfolio.md` to list available products and stop.
2. Refresh brain index: `bun /Users/hamza/Claude/Hamzaish/brain/ingest.ts`
3. `Read` these in order:
   - `/Users/hamza/Claude/Hamzaish/products/$ARGUMENTS/product.config.json`
   - `/Users/hamza/Claude/Hamzaish/products/$ARGUMENTS/README.md`
   - `/Users/hamza/Claude/Hamzaish/products/$ARGUMENTS/status.md`
4. List + read last 3 entries in `/Users/hamza/Claude/Hamzaish/products/$ARGUMENTS/decisions/`
5. Load stage-specific playbooks from `/Users/hamza/Claude/Hamzaish/factory/playbooks/<stage>-stage/` and note relevant agents under `/Users/hamza/Claude/Hamzaish/factory/agents/<stage>/`
6. Read the product's own `CLAUDE.md` at `/Users/hamza/Claude/Hamzaish/products/$ARGUMENTS-code/CLAUDE.md` (follow the symlink)
7. Surface open threads: `bun /Users/hamza/Claude/Hamzaish/brain/ask.ts --product $ARGUMENTS --limit 6 "open decisions blockers"`
8. Announce: "Working on <name> — stage `<stage>`, sprint `<sprint>`. Code at `<absolute code_path>`. Today's action: `<from status.md>`. Ready."

Then wait for the user's next instruction.

If the user runs `/work-on` with no slug, `Read /Users/hamza/Claude/Hamzaish/products/_portfolio.md` and ask which product.
