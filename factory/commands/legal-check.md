---
description: Find and fix the six legal launch traps in a product — signup with no age gate (COPPA), Google-hosted fonts (GDPR), session replay (CIPA), marketing email without unsubscribe + postal address (CAN-SPAM), subscribe buttons without renewal terms (California ARL), user uploads without a DMCA agent. Scan only by default; --fix opens a reviewed PR; --all runs every product you've registered. Not legal advice.
argument-hint: <product-slug | path> [--fix] | --all [--fix]
---

The user invoked: `/legal-check $ARGUMENTS`

Six legal traps ship by default in AI-built apps, each fined **per** child, visitor,
session, email, renewal or work — how zero sales becomes a six-figure exposure. This
command finds them, separates real ones from regex noise, and (with `--fix`) fixes the
real ones on a branch and opens a PR. Knowledge: `factory/playbooks/launch-stage/legal-launch-traps.md`
(read it first — it holds each fix and its "done when" test). Detection only, with
no fixing, also runs inside `/security-check` § 7a and blocks `/ship`.

## Resolve the target(s)

- `<slug>` → `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/code-paths.local.json` → the product's code path.
- A path → use it directly (works on any repo, Hamzaish-built or not).
- `--all` → every product in `code-paths.local.json`. Several products? Run one worker
  per product in parallel when subagents are available, each with only its own repo
  (`factory/playbooks/mvp-stage/fleet-patterns.md`); serial is fine otherwise.
- Nothing given → ask which product.

## 1 · Scan

```bash
bun ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/scripts/check-legal-traps.ts <code_path>
```

Exit 1 only means a FAIL was found.

## 2 · Verify every FAIL and WARN — the scanner is regex, you are the judge

Open each evidence file:line and decide if the trap is real. Common false calls:
seed/demo data and tool catalogs that merely *name* Hotjar or "newsletter"; a pricing
mock with no real checkout; a file input that only reads a CSV in the browser; a
"Sign up" link to a page that doesn't exist. Common misses: signup through server
actions or custom email-code auth, a font URL built in JS, a replay snippet in
`index.html`, a subscription via a payment link.

Also note what the repo **is**: a deployed product, a prototype, a CLI, a skills-only
repo, or a game. And whether it could be **directed at children**: an age gate does
not satisfy COPPA for a child-directed service, so flag that for the operator, don't
"fix" it.

A FAIL you refuted goes in `legal-traps.json` at the repo root, with the reason
(`{"accept": {"<id>": "<why it doesn't apply>"}}`), so the next scan and `/ship` don't
re-raise it. That file is part of the PR, so the operator sees each acceptance.

Without `--fix`: report a table (trap · verdict · evidence · fix) and stop.

## 3 · Fix (`--fix`) — confirmed traps only, smallest change, repo's own style

Branch `legal/launch-traps`, one commit per trap. House defaults:

- **Age gate:** a neutral birth-year field (never a checkbox that names the cut-off),
  with `MIN_AGE = 13` in one legal config module (16 for EU audiences). Under age:
  refuse, don't call auth or analytics, and keep the refusal for the session. Gate
  **every** button that can create an account, including "Continue with Google" on the
  login page, because OAuth creates the user on first round-trip. Record
  `age_confirmed` on the account where the auth API allows it.
- **Fonts:** `next/font/google` in Next.js; `@fontsource/<family>` elsewhere; vendored
  woff2 + `@font-face` for plain HTML. Same family names, all Google links removed.
- **Session replay:** PostHog `disable_session_recording: true`; Sentry replay rates
  0 and no `replayIntegration`; remove third-party recorders.
- **Marketing email:** unsubscribe link + `List-Unsubscribe` and
  `List-Unsubscribe-Post` headers + a footer address from `POSTAL_ADDRESS`. The
  sender throws if `POSTAL_ADDRESS` is empty. Add an HMAC-signed unsubscribe endpoint
  and skip unsubscribed contacts. Transactional mail needs nothing.
- **Renewal terms:** directly under every subscribe, upgrade or trial button: the
  price, "renews automatically every <period> until you cancel", and where to cancel.
  On Stripe Checkout, also set `custom_text.submit.message`. The cancel path you name
  must actually work.
- **DMCA:** a `/dmca` page (or terms section) with takedown and counter-notice steps,
  reading agent details from one config object with clearly-marked TODO values.

**Never invent** a postal address, company name, DMCA agent or registration number.
Wire config or env and list each one as an operator to-do.

## 4 · Prove it, then PR

1. Run the repo's own fast checks: typecheck, lint on changed files, tests, and the
   build when it's cheap. If lint or CI is already red on the base branch, compare
   problem counts base vs branch: your change must not add any.
2. Re-scan the branch. Every trap you fixed is PASS/N/A, or WARN with the reason.
3. Push and open a PR, never to the default branch, never merged. The body has: a
   before → after table, an **Operator to-do** checklist (fill `POSTAL_ADDRESS` /
   `UNSUBSCRIBE_SECRET`, register a DMCA agent at dmca.copyright.gov ($6, renew every
   3 years), run any migration before deploy, check the replay toggle in the analytics
   dashboard: only the items that apply), and "Heuristic scan + manual review, not
   legal advice."

## Report

One row per product: what it is · traps confirmed · fixed · PR · operator to-dos ·
false positives refuted. Then a short list of what needs the operator's judgement:
child-directed apps, minimum age vs the product's terms, existing accounts with no
age on record, live apps to merge first.
