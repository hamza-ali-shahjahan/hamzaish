# 0004 — Pricing badge → "Best value"; planted the factory contract in the code repo

**Date:** 2026-08-16

**Decision (two parts):**

1. **Pricing badge copy + icon.** The Builder card's badge changed from
   `✨ Most popular` to `🏷 Best value`, on both pricing surfaces —
   `src/components/billing/PricingTable.tsx` (the `/pricing` cards) and the pricing
   section inside `src/components/marketing/home/HomeLanding.tsx` (homepage).
2. **Planted `CLAUDE.md` in the code repo** and wired `copyright` →
   `~/Claude/CopyRight` in `code-paths.local.json`.

**Why (1 — the badge):** "Most popular" is a social-proof claim, and in private beta with
a handful of users it isn't one we can substantiate — it's a claim about other customers
that no customer data supports yet. "Best value" is a claim about the offer itself, which
we control and can defend from the price ladder alone ($0 → $29/mo → $19 one-off).
Separately, the Sparkles glyph is the default "AI product" icon across the industry and
reads as generative-magic — precisely the wrong signal for a product whose entire pitch is
*cited, verifiable, not-hallucinated*. A plain price-tag carries the value semantics with
no AI connotation.

**Alternatives considered:** `Gem`/`Award` (luxury/trophy — "best value" is
smart-spend, not premium), `TrendingUp` (growth, not value), `Star` (implies a rating we
don't have), `BadgeCheck` (good credibility signal, but visually collides with the four
feature checkmarks directly below it).

**Why (2 — the tendril):** This is the load-bearing half. The badge change was originally
made as a plain coding task that never entered the factory — no slice pinned, no decision
logged, no learning fed back. The operator noticed and asked why. Root cause was
mechanical, not human: the repo had **no `CLAUDE.md`**, so a session opened there had no
way to know it was a factory-managed product; and `code-paths.local.json` still held the
scaffold placeholder `"/absolute/path/to/your/copyright-code"`, so the factory didn't know
where the code lived either. Rich metadata existed in `products/copyright/` with nothing
linking it to the actual repo.

**What would prove it wrong:**
- *Badge:* conversion on the Builder tier drops after the change, or beta users read
  "Best value" as cheap/entry-level rather than the right default pick. Also wrong if we
  reach enough volume that "Most popular" becomes a *true* claim — social proof beats an
  offer claim once it's real.
- *Tendril:* if sessions opened in the repo still skip the factory flow despite `CLAUDE.md`
  being present, then the file isn't the mechanism and something upstream is.

**Revisit trigger:**
- *Badge:* at public launch, or once ≥50 paying users make a popularity claim defensible.
- *Tendril:* next session opened directly in `~/Claude/CopyRight` — check
  whether it re-enters the factory unprompted.

**Verification done:** `pnpm typecheck` clean; `/pricing` and `/` both HTTP 200 with the
new badge rendering and zero remaining "Most popular"; change visually confirmed in a
browser against the running app. Pushed as `chore/pricing-best-value-badge`; **PR #16** is
open against `main` and Vercel's preview build went green. **Not deployed** — the merge is
the operator's action, and the slice isn't done until the live badge is verified.

**Note:** Also surfaced but deliberately NOT fixed here — the repo uses `src/middleware.ts`
on Next 16, where the factory guardrail is `proxy.ts`. Recorded in the repo's `CLAUDE.md`
under known drift; migrate when auth routing is next touched, not in an unrelated change.

---

**Addendum (same day) — `/ship copyright` does not deploy this product.**

Noted for a later fix, per operator instruction. Vercel's production branch for `ip-radar`
is **`main`**: every production deployment is a merge commit on `main` (PRs #6–#15), and
patently.legal serves whatever `main` last built. The factory's `/ship` command promotes to
a **`production` git branch**, which this project has but Vercel never reads. Running
`/ship copyright` would therefore push to a branch nothing deploys and record a "shipped"
state that isn't true.

The real ship path for this product is the repo's existing flow: feature branch → PR →
merge to `main` → Vercel auto-deploys.

*(Correction worth keeping: this was first diagnosed as "main and production are both 75
commits stale." That was wrong — the local `main` ref was simply 88 commits behind
`origin/main` because it had never been fetched. `origin/main` was current the whole time.
Fetch before comparing branch state; a stale local ref reads exactly like a broken pipeline.)*

**Fix options for later:** either point `/ship` at `main` for this product, or set the
Vercel project's production branch to `production`. Not decided here.

---

**Addendum 2 (same day) — private beta → public beta in marketing copy.**

**Decision:** The nav pill, its hover-card, and the two homepage marketing mentions now read
"public beta". Legal copy (`/terms`, `/privacy`, `LegalPage`) deliberately still says
private beta.

**Why:** Operator instruction. The supporting fact is that `BetaGate` turned out to be a
feedback / fair-usage prompt, **not an access wall** — anyone who signs up already gets in.
So the label was lagging reality rather than opening a door. Scope went past the literal ask
("the main nav bar") because changing only the nav left the homepage reading "Public Beta"
in the header and "Private beta" in the hero on the same screen.

**Tension flagged at the time, and overridden by the operator:** decision `0003` says "DO NOT
public-launch yet" with credential rotation as the top unmet P0, and FACTORY-ORDERS repeats
it. A "public beta" label is a launch signal. The concern was stated before the change was
made; the operator's instruction stands. **The beta-outreach hold is unaffected and still
applies** — labelling the beta public is not the same as driving users to it, and rotation
is still unverified.

**What would prove it wrong:** signups rise on the relabel while rotation is still unverified,
i.e. the label alone functions as outreach. That would mean the label *is* the door.

**Revisit trigger:** immediately once credential rotation is verified (the hold lifts), or
sooner if traffic climbs. Legal-copy alignment is a separate, still-open decision.
