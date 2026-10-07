# Legal launch traps — six per-unit fines an AI-built app ships by default

> **Fix it:** `/legal-check <slug> --fix` (or `--all --fix` for every product) — scan, refute false positives, patch, re-scan, PR.
> **Scanner:** `bun scripts/check-legal-traps.ts <code_path>` (also runs as `/security-check` § 7a and gates `/ship`).
> Not legal advice — it finds the trigger and checks for the fix's marker. A lawyer decides what *your* app owes.

The danger is the unit. Each of these is assessed **per child, per visitor, per session, per email, per renewal, or per work** — so an app with zero sales and a busy launch day can rack up a six-figure exposure. Every fix below is an afternoon. Each trap only applies when its trigger exists; the scanner reports N/A otherwise.

| # | Trigger | Law (where) | Fix |
|---|---|---|---|
| 1 | Account signup | COPPA (US) | Neutral age gate |
| 2 | Fonts from `fonts.googleapis.com` | GDPR (EU) | Self-host fonts |
| 3 | Session replay / heatmaps | CIPA wiretap (California) | Off, or opt-in + masked |
| 4 | Bulk / marketing email | CAN-SPAM (US) | Unsubscribe + postal address |
| 5 | Subscription checkout | Automatic Renewal Law (California) | Renewal terms beside the button |
| 6 | User file uploads | DMCA § 512(c) (US) | Registered agent + policy page |

## 1 · Age gate on signup
**Fix:** ask for **birth year (or date) without hinting the cut-off** — a "I'm over 13 ☑" checkbox is not neutral. Under `MIN_AGE` (13; use 16 if you target the EU), refuse, **store nothing**, and keep the refusal sticky for the session so the back button can't retry. Record `age_confirmed` on the account. OAuth / magic-link signup counts as signup.
**Done when:** under-age input creates no row anywhere (check the auth table and the analytics `identify`).

## 2 · Self-host fonts
**Fix:** Next.js → `next/font/google` (downloaded at build, served from your domain). Elsewhere → `@fontsource/<family>` or files in `/public/fonts` with `@font-face`. Delete every `fonts.googleapis.com` / `fonts.gstatic.com` link, `@import` and `preconnect`.
**Done when:** the Network tab on a cold load shows zero requests to Google font hosts.

## 3 · Session replay
**Fix (default):** off in code. PostHog → `disable_session_recording: true` in `posthog.init` (don't trust the dashboard toggle). Sentry → `replaysSessionSampleRate: 0`, `replaysOnErrorSampleRate: 0`, no `replayIntegration`. Remove Hotjar/Clarity/FullStory/LogRocket snippets.
**If you need replay:** load it only after explicit opt-in consent, with every input and text node masked (`maskAllInputs`, `maskAllText`), and say so in the privacy policy.

## 4 · Marketing email
Transactional mail (magic links, receipts, "you're on the list") is exempt. **Anything that sells or announces** — the launch email, newsletters, digests, waitlist blasts — needs:
- a working **unsubscribe link** honoured within 10 business days, plus a `List-Unsubscribe` header (and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` for Gmail/Yahoo bulk rules);
- your **physical postal address** (a registered PO box or virtual office works) in the footer — keep it in a `POSTAL_ADDRESS` env var and **refuse to send** when it's empty;
- an honest subject and a "From" that is you.
Hosted ESPs (Mailchimp, Beehiiv, Kit, Loops) add the footer — set the address in their settings.

## 5 · Renewal terms beside the button
**Fix:** directly under every subscribe / upgrade / start-trial button: price, that it **renews automatically every month/year until cancelled**, when the trial converts, and **how to cancel online**. On Stripe Checkout also set `custom_text.submit.message` so the terms sit beside Stripe's Pay button. Send the same terms in the confirmation email; cancellation must be as easy as signup (Stripe customer portal).
**Done when:** a screenshot of the button alone shows the terms. A line in `/terms` does not count.

## 6 · DMCA agent
**Fix:** register a designated agent at **dmca.copyright.gov** ($6, expires after 3 years — calendar the renewal), then publish `/dmca` (or a terms section) with the agent's name, address, email and the takedown/counter-notice steps. Registration is manual; code can only publish the page. Read the agent details from config so the page can't ship with a placeholder (`DMCA_AGENT_*`).

## Applying it to an existing app
Run `/legal-check <slug> --fix`. It verifies each ❌ against the code (the regex raises false alarms on seed data, tool catalogs and CSV imports), fixes on `legal/launch-traps` with one commit per trap, never invents an address or agent, re-scans, and opens a PR with the before/after table and the operator to-dos.

Sources: FTC COPPA Rule (16 CFR 312); LG München I, 3 O 17493/20 (20 Jan 2022); Cal. Penal Code § 631/637.2; 15 U.S.C. § 7704; Cal. Bus. & Prof. Code §§ 17600–17606; 17 U.S.C. § 512(c)(2), 37 CFR 201.38.
