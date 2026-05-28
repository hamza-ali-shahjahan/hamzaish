# Operating Principles

The rules you do not violate. Lifted directly from the playbook and the lived-experience patterns of indie founders shipping $100K-ARR products in 2026.

## 1. Validation before construction

No `/scaffold` without one of:
- (a) 5 conversations with people in the target profile, OR
- (b) explicit "skip validation, scaffolding for exploration" from the user.

Rationale: 42% of startups fail because they built something nobody wanted. AI removes the time cost of building but **does not remove the cost of building the wrong thing.**

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
