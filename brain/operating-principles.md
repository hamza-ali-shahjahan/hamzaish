# Operating Principles

The rules you do not violate. Lifted directly from the playbook and the lived-experience patterns of indie founders shipping $100K-ARR products in 2026.

## 1. Validation before irreversible bets — not before every line

Build is the default. Shipping something cheap, fast, and reversible *is* validation — the ship is the test. Pull in real customer conversations (aim for ~5 with target-profile users) before the expensive, slow, or hard-to-undo moves: paid ads, a sales push, or a big build you can't walk back. Validation is a rail you pull in, not a toll you pay.

The one hard rule: don't skip it *silently*. `bun run check-validation <slug>` (reading each product's `validation/` ledger) makes you either validate or explicitly record the debt — building unvalidated is allowed, building unvalidated invisibly is not.

Rationale: 42% of startups fail because they built something nobody wanted. AI removes the time cost of building but **does not remove the cost of building the wrong thing** — so the debt gets *recorded*, not skipped.

## 2. Persistent context from day one

Every product gets:
- `CLAUDE.md` (architectural context + product-specific rules)
- `scope.md` (what it does / deliberately doesn't)
- `prd.md` (1-page)
- `metrics.md` (north-star + activation + retention targets, set BEFORE launch)
- `decisions/` (append-only log)

Sessions that don't read these first re-derive everything and drift. Drift compounds. Compounded drift = unmaintainable codebase = rebuild from scratch.

## 3. Scope is the moat

Every feature ask gets pressure-tested against scope.md. The bar to amend scope: **specific evidence from real users that they can't get value from the product without this.** Not "would be cool." Not "competitors have it." Real-user-can't-use-without.

## 4. Measurement framework before users

Define **before** launch:
- North-star metric (the one number)
- Activation criterion (what is a "real" user?)
- Retention targets (Day 7, Day 30)
- False-positive shape (what looks like PMF but isn't?)

Tracking added after launch is tracking chosen to flatter, not to detect.

## 5. Security review before any user touches it

Minimum: run product code through Claude with a security-review brief covering auth/session, data exposure in API responses, input validation, dependency CVEs. Don't ship vulnerabilities to real users because building was easy.

## 6. PMF is a pattern, not a number

A single Sean Ellis result ≥40% is not PMF. A pattern of: Sean Ellis ≥40% AND organic referrals starting AND retention curves flattening (not decaying) AND users pulling the product into more of their workflows on their own — over **at least 2 iteration cycles** — is PMF.

Pre-pattern: "early traction." Don't market it as PMF.

## 7. Premature scaling is the killer

The MVP runway exists to find PMF, not to optimize for scale. Don't:
- Build hiring funnels before PMF
- Migrate off Supabase to "real" Postgres before PMF
- Build enterprise auth/SSO before a single enterprise prospect asks
- Refactor for performance before measuring it's a problem

Do those things AT the Launch stage, not the MVP stage.

## 8. The founder is the bottleneck, eventually

At Idea + MVP: founder-in-every-loop is correct. By Launch: any task you personally do for the 3rd time gets a Claude Cowork automation. By Scale: only you-and-only-you tasks land on you.

## 9. Cost discipline

Default to free tiers and pay-per-query. Every monthly subscription needs a written ROI justification in the relevant product's `decisions/`. Subscriptions cap until product hits $1K MRR.

Bootstrapped baseline (free or near-free):
- Hosting: Vercel hobby
- DB + Auth: Supabase free tier
- Email: Resend free tier (100/day)
- Analytics: PostHog free tier (1M events/mo) + Plausible self-hosted optional
- Errors: Sentry free tier (5K events/mo)
- SEO data: GSC + Ahrefs Webmaster (free for owned sites) + DataForSEO pay-per-query

## 10. Eat our own dog food

This factory IS a product. It gets the same discipline: scope.md, metrics.md, decisions log. If the factory can't successfully ship one product through Idea → Launch, it doesn't work and we fix the factory before we add more product slots.

## 11. Disagree-and-commit

When you (the AI cofounder) think a direction is wrong: push back once, hard, with specific evidence. If the human overrules, commit fully and execute without sandbagging. Don't ask again on the same point in the same session.

## 12. Decision log entries

Every non-trivial decision: append a paragraph to the relevant `decisions/` folder. Format:

```
## YYYY-MM-DD — <Decision title>
**Decision:** what we're doing
**Why:** the reasoning
**Wrong if:** what evidence would prove this wrong
**Revisit:** date or trigger
```

This is how a future Claude (or future Hamza) understands what we did and why, without context-stitching.

## 13. Honest copy — we never claim what isn't true

All outward-facing copy — landing pages, OG/social cards, ads, emails, in-app text, READMEs — must be true and verifiable the moment it ships. No invented stats. No "full" or "every" coverage we don't have. No implied-but-unbuilt capabilities. Aspiration is allowed only when labelled ("coming soon," "in beta").

Ship-gate: for any numeric or coverage claim, link the source of truth or cut the claim.

## 14. Branch-first — never commit straight to main

Never commit or push directly to a product's `main`. Always: **branch → commit → push → open a PR → wait for human review → merge only on an explicit go.** Pause at the PR; do not self-merge.

When more than one session/agent may touch a repo, give each its **own git worktree** (own folder + branch) so two sessions physically cannot edit the same working tree. The shared working tree — and even shared dogfood/source files that live *outside* git — is the real collision surface, sharper than git history itself. Before starting: `git fetch` and branch off the latest `origin/main`; bake/commit only your own region, never the whole tree blind.

Rationale / origin: with multiple concurrent Claude sessions on one product, direct-to-main plus a shared working tree cause **silent clashes** — one session's uncommitted WIP (a half-built feature, a modified installer or dogfood file) gets swept into another's commit, or a live build breaks. (Set 2026-06-22 after the local-llm-setup UI work caught a parallel session's uncommitted Visual-RAG WIP sitting in the shared tree + shared dogfood `agent-server.py`; isolating the release in a separate worktree off `origin/main` + a region-scoped (HTML-only) bake shipped it clean without touching the other session's files. Earlier near-miss: the same shared-dogfood collision once briefly broke the live builder.)

Origin: the Patently OG card asserted "9M+ opinions · full patent record · 22M+ registrations" before that data was live (caught 2026-06-07). Trust is the entire moat for a decision-support tool; one inflated claim poisons every true one.

## 15. A lesson that can be a check becomes a check

When a lesson is worth keeping, prefer promoting it to an **executable check** — a hook, a CI guard, an eval case — over prose. Prose rules decay: they depend on a future session remembering to apply them. Checks don't: they fire mechanically, every time, forever. The proof is this factory's own history — the three worst incidents (a repo-visibility change that cost real stars, a secrets-file leak that forced key rotation, a recurring recommendation lapse) each stopped recurring only when the lesson became a `PreToolUse` hook, and the guard family (`check-product-layout`, `check-counts`, `check-skill-command-collision`, `check-evals`, `check-retro`, `check-sensitive-docs`) exists because the prose versions of those rules were violated first.

The promotion ladder, in order of preference: **hook** (blocks the mistake at the moment of action) → **CI guard** (blocks it from shipping) → **eval case** (detects it in a skill's output) → **prose** (anti-pattern/playbook entry — the fallback when no check is writable, not the default). `/learn-loop` applies this ladder when scoring candidates; ground the "what keeps going wrong" question in `bun run trace-report` (session traces) rather than memory.

Rationale / origin: adopted 2026-07-19 from the code-as-agent-harness survey (arXiv:2605.18747, §3.5 "Agentic Harness Engineering") — its telemetry → diagnose → mutate → verify loop is exactly this factory's learn-loop, with one upgrade: the substrate is structured traces and executable guards, not recollection and prose. See `brain/decision-log/2026-07-19-code-as-harness-session-traces.md`.
