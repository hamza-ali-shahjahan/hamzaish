# 0001 — Factory stickiness gap: sessions drop out of the flow after the first invocation

**Date:** 2026-08-01 · **Status:** proposed (fix spec below; needs a Hamzaish-rooted session or explicit operator confirmation to implement) · **Source:** live evidence from the mini-minecraft build day.

## The defect

`/hamzaish` was invoked on the FIRST build request and worked (goal pinned, product registered,
validation bump run, guardrails applied). Both follow-up build requests in the same session
("bigger world + nether", "mobs + The End") did NOT re-enter the factory flow — the session
kept the *practices* voluntarily but nothing enforced them, and the retro grounding steps
(`trace-report`, `friction log`) were silently skipped. For a new user (no private CLAUDE.md
rules, no habits), the drop-off would be total: after message #1 the factory effectively
disappears. New users need Hamzaish leveraged BY DEFAULT.

## Root causes

1. The slash command fires once; hamzaish.md has **no session-continuation contract** for
   follow-up requests on the same product.
2. Registration writes into the factory but **plants nothing in the product's code repo** —
   the next session (or user) opening the code folder starts factory-blind.
3. The loop steps (feed learnings, trace-report, friction) are **prose, not checks** — the
   factory's own doctrine ("distill it up the check ladder") applied to itself.
4. Several session-quality rules live in the operator's PRIVATE global CLAUDE.md
   (verify-localhost-200 before sharing links, copyable code blocks, secrets pattern) —
   invisible to new users; they belong in factory-shipped defaults.

## Fix spec (exact changes, all additive)

1. **`factory/commands/hamzaish.md`** — add a "Session continuation" block to the Express
   Lane: *once a session routes through this command, EVERY later build request on the same
   product re-enters the flow — new request = new slice → pin in status.md → build → feed
   the loop; dropping out silently is a defect, not a shortcut.* Also add to the
   registration guardrail: *scaffold the product-repo tendril — copy
   `products/_template/PRODUCT-CLAUDE.md` to `<code_path>/CLAUDE.md`, filling in the slug.*
2. **`products/_template/PRODUCT-CLAUDE.md`** — NEW template: a product-repo CLAUDE.md that
   declares the repo factory-managed and spells out the default workflow (re-enter flow →
   pin slice → tests → e2e verify → feed loop) plus run/test commands. (Reference
   implementation already live at `~/Minecraft Game/CLAUDE.md`.)
3. **`scripts/check-product-layout.ts`** (or a new `check-tendrils`) — for every slug in
   `code-paths.local.json` whose path exists, WARN when `<path>/CLAUDE.md` is missing the
   "Hamzaish factory product" marker. Encodes fix #2 into the check ladder.
4. **Starter defaults** — port the operator-private session rules into the starter/factory
   CLAUDE.md so new users inherit them: verify-localhost-serves-200 before sharing a link;
   commands/copy-paste content in fenced blocks; secrets-files-are-user-touched-only.

## Evidence this pays off

The one factory artifact that DID reach the code repo today (the `__game` test-handle
pattern, via the product CLAUDE.md written after the fact) is exactly what let three builds
be e2e-verified. Tendrils in the code repo are how the factory survives session boundaries.
