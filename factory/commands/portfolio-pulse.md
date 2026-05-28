---
description: Snapshot all products — table + top 3 priorities + on-fire + don't-touch. The "where should I focus today" command.
argument-hint: "[hours-available]"
---

The user invoked: `/portfolio-pulse $ARGUMENTS`

This command works from any cwd. All Hamzaish paths below are absolute.

Run the portfolio-pulse skill (`/Users/hamza/Claude/Hamzaish/factory/skills/portfolio-pulse/SKILL.md`).

Short version:
1. Refresh the brain index so any recent edits to product configs/statuses are visible:
   ```
   bun /Users/hamza/Claude/Hamzaish/brain/ingest.ts
   ```
2. `Read /Users/hamza/Claude/Hamzaish/products/_portfolio.md` for the live snapshot baseline.
3. List products from `/Users/hamza/Claude/Hamzaish/products/*/product.config.json`. Skip any with `status: "killed"`.
4. For each product, read `/Users/hamza/Claude/Hamzaish/products/<slug>/product.config.json` and `/Users/hamza/Claude/Hamzaish/products/<slug>/status.md`. Note stage, sprint, "today's action."
5. Invoke `/Users/hamza/Claude/Hamzaish/factory/agents/portfolio/portfolio-conductor/SKILL.md` for prioritization (read the agent prompt, follow its protocol).
6. If telemetry is wired (PostHog/Sentry/Stripe IDs in config), invoke `/Users/hamza/Claude/Hamzaish/factory/agents/portfolio/telemetry-aggregator/SKILL.md`. If no telemetry IDs are set, skip metrics columns and note "no telemetry connected" for those products.
7. Output the standardized format:

```
## Portfolio — YYYY-MM-DD

### One sentence
Focus on <product> today, specifically <task>, because <reason>.

### Snapshot
| Product | Stage | MRR | 7d Δ | Errors 24h | Today's action |
|---|---|---|---|---|---|

### Top 3 priorities
1. **<product>** — <task> (Xh) — why now
2. **<product>** — <task> (Xh) — why now
3. **<product>** — <task> (Xh) — why now

### On fire
### Don't touch today
```

8. If `$ARGUMENTS` looks like a number of hours (`2`, `4h`, `8`), tune Top-3 to that budget.

9. After producing the snapshot, **update `/Users/hamza/Claude/Hamzaish/products/_portfolio.md`** so the next caller starts from fresh state.

## Output discipline

- Table fits one screen
- Top 3 priorities, max
- On-fire ideally empty
- Don't-touch usually 3-5 entries — that's the discipline working
- Cite product paths so the user can click through
