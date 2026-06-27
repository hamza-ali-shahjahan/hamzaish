---
name: work-on-product
description: Load full product context and enter the product workspace. The canonical entry point when Hamzaish drives a single product.
---

# work-on-product

Used when the user wants to **work on a specific product** end-to-end. Loads everything Hamzaish knows about that product, then enters its code workspace so Claude Code can act on the actual repo.

## Inputs

- `<slug>` — product slug (must match `products/<slug>/product.config.json` → `slug`)

## Outputs

You (Hamzaish) hold full context for the product:
- product manifest, current stage, status, sprint
- recent decisions
- relevant playbook for the current stage
- relevant agents for the current stage
- working directory is the product's code, not the factory root

The user should be able to make any request about the product immediately, and you respond with full context.

## Protocol

1. **Validate the slug.** If `products/<slug>/product.config.json` doesn't exist, list available products from `products/_portfolio.md` and stop.

2. **Refresh the brain index.** Files may have changed:
   ```
   bun ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/brain/ingest.ts
   ```

3. **Load the product manifest.** `Read products/<slug>/product.config.json`. Note: `stage`, `sprint`, `code_path`, `stack`, `analytics` IDs.

4. **Load the product README and status.** `Read products/<slug>/README.md` and `products/<slug>/status.md`.

5. **Load recent decisions.** List `products/<slug>/decisions/` — read the latest 3 by mtime.

6. **Load stage-specific context.** Based on `stage`:
   - **idea** → `Read factory/playbooks/idea-stage/` for relevant playbooks; relevant agents under `factory/agents/idea/`
   - **mvp** → `Read factory/playbooks/mvp-stage/architecture-decisions.md`, `scope-document.md`, `measurement-framework.md`; relevant agents under `factory/agents/mvp/`
   - **launch** → `Read factory/playbooks/launch-stage/`; relevant agents under `factory/agents/launch/`
   - **scale** → `Read factory/playbooks/scale-stage/`; relevant agents under `factory/agents/scale/`

7. **Load the product's own CLAUDE.md** at `products/<slug>-code/CLAUDE.md` if it exists. Note any product-specific conventions or Lovable round-trip rules.

8. **Brain-ask for any open threads.** Run:
   ```
   bun ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/brain/ask.ts --product <slug> --limit 6 "open decisions blockers"
   ```
   Surface unresolved items.

9. **Enter the workspace.** State explicitly:
   > "Working on **<name>** — stage `<stage>`, sprint `<sprint>`. Code at `<code_path>`. Today's action: `<from status.md>`. Ready."

10. **From here, every change to product code goes through `factory/agents/mvp/builder` discipline**: read CLAUDE.md → read scope.md → plan → implement → test → log decision. Cross-product moves get explicit permission.

## Cross-product discipline

When working on product X, do NOT modify product Y's files. If a cross-product change is needed, capture it and surface explicitly: "this touches both X and Y — confirm before proceeding."

## Stop conditions

- The product is `status: "killed"` in its config — don't enter; suggest `/kill-or-keep` instead
- The symlink `products/<slug>-code` is broken — flag and stop

## After the session

Capture what happened:
- Append to `products/<slug>/decisions/sessions.md` (one paragraph)
- If the work taught us something general → append to `brain/learnings/YYYY-MM-DD.md`
- Re-run `bun brain/ingest.ts` so the next session sees the updates

## Example

User: `/work-on muakkil`

You:
1. Validate `products/muakkil/product.config.json` exists ✓
2. `bun brain/ingest.ts` — index refreshed
3. Read manifest: stage=mvp, sprint=buildathon-launch, code_path=../muakkil-code
4. Read README + status.md → current action: "Confirm Lovable Prompt 1 (auth) status. If not run yet: paste it. If run: pull, then start Block 1."
5. List decisions/ → empty (newly registered)
6. Stage=mvp → load architecture-decisions.md, scope-document.md, measurement-framework.md from playbooks
7. Read `~/Claude/Muakkil/CLAUDE.md` → catches Bun, Lovable round-trip rule, .env discipline, etc.
8. brain-ask for muakkil open threads → surface buildathon plan + outstanding API key drop
9. State: "Working on Muakkil — stage mvp, sprint buildathon-launch. Code at ~/Claude/Muakkil. Today's action: confirm Lovable Prompt 1 (auth) status. Ready."
