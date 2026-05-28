# Cross-Product Memory Index

This is the **index** for cross-product learnings — patterns that emerged from running multiple products through the factory.

Per-product memory lives in each product's `products/<name>/decisions/`. This file only captures what generalizes.

## Format

Each entry: `- [Title](file.md) — one-line hook` (under 150 chars). Files live alongside this one or in subfolders organized by theme.

## Entries

*(seeded empty — entries get added as patterns emerge across products)*

<!-- Example future entries:
- [Stripe webhook signature gotcha](stripe-webhook-gotcha.md) — Next.js bodyParser breaks Stripe sigs unless raw body is preserved
- [PostHog autocapture overhead](posthog-autocapture-cost.md) — turning autocapture off halved Plausible-equivalent event volume across products
- [Cold email subject line winner](cold-outreach-winning-subjects.md) — "<noun> question" beat all other tested patterns by 3x reply rate
-->

## Memory hygiene

When you add an entry:
- One file per memory, frontmatter with `name` / `description` / `type` (user|feedback|project|reference)
- Update this index with the link
- Don't duplicate something already in a knowledge-base file — link to it instead

When stale:
- Remove the entry and the file. Stale memory is worse than no memory.
