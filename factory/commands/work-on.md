---
description: Enter a product workspace with full Hamzaish context loaded — config, status, decisions, stage playbook, and the product's own CLAUDE.md.
argument-hint: <product-slug>
---

The user invoked: `/work-on $ARGUMENTS`

This command works from any cwd. All Hamzaish paths below are absolute.

Follow the protocol in `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/factory/workflows/work-on-product.md`.

Short version:
1. Validate `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/$ARGUMENTS/product.config.json` exists. If not, `Read ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/_portfolio.md` to list available products and stop.
2. Refresh brain index: `bun ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/brain/ingest.ts`
3. `Read` these in order:
   - `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/$ARGUMENTS/product.config.json`
   - `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/$ARGUMENTS/README.md`
   - `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/$ARGUMENTS/status.md`
4. List + read last 3 entries in `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/$ARGUMENTS/decisions/`
5. Load stage-specific playbooks from `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/factory/playbooks/<stage>-stage/` and note relevant agents under `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/factory/agents/<stage>/`
6. Read the product's own `CLAUDE.md` at `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/$ARGUMENTS-code/CLAUDE.md` (follow the symlink)
7. Inject brain recall (two blocks — recall is push, not pull):
   - Open threads: `bun ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/brain/ask.ts --context --product $ARGUMENTS --limit 6 "open decisions blockers risks"`
   - Defenses for this stage: `bun ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/brain/ask.ts --context --source brain/anti-patterns --limit 4 "<stage> <today's action keywords>"`
   Read both blocks; they are point-in-time recall — verify against live files before relying on any line.
8. Announce: "Working on <name> — stage `<stage>`, sprint `<sprint>`. Code at `<absolute code_path>`. Today's action: `<from status.md>`. Ready." Include the top recall hit if it changes today's action.

Then wait for the user's next instruction.

If the user runs `/work-on` with no slug, `Read ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/products/_portfolio.md` and ask which product.
