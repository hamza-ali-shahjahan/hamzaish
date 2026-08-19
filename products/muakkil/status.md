# Muakkil — Live Status

**Last updated**: 2026-07-02
**Stage**: MVP (venture-agent re-aim — Phase 1 build)
**Sprint**: venture-agent MVP — "speak your idea → launched"

> **Direction change 2026-07-02:** Muakkil is now a venture agent for non-technical founders (build + distribute end-to-end). See `decisions/2026-07-02-venture-agent-pivot.md`. The buildathon assistant scope below is superseded; kept for history. Validation (Mom-Test interviews + paid concierge pilot) runs in parallel with the build — debt recorded in the decision entry.

## North star this sprint

> A non-technical founder speaks an idea to Muakkil and, without touching code, DNS, or a marketing tool, gets a live product at their own domain with a launch executed and first-user data reported back. Metric: ventures reaching ≥10 non-founder users within 30 days.

## Phase 1 slices (each ships with an eval + e2e test)

| # | Slice | Status |
|---|---|---|
| 1 | Auth + Venture object + dashboard + approval queue | ✅ built + live-smoked (self-owned Supabase) |
| 2 | Scribe intake (voice/chat → venture brief, **editable before approve**) | ✅ built |
| 3 | Seeker validation pack (live web search verified) | ✅ built |
| 4 | Maker thin (landing + waitlist live at muakkil.com/v/slug) | ✅ built |
| 5 | Herald-lite (launch kit + welcome email, approval-gated) | ✅ built |
| 6 | Weekly founder report (grounded numbers) | ✅ built |
| — | **Muakkal dance UX**: per-agent progress animation, live polling, auto-advance after approve | ✅ built 2026-07-03 |
| — | Business layer: /pricing (plans single-source), /terms, /privacy, landing→app bridge | ✅ built |
| 7 | Import-and-launch (Lovable/Bolt export → distribution) | ⏳ next build |

**2026-07-03 notes:** canonical domain is **muakkil.com** (every `.app` reference purged). Backend runs on the operator's own Supabase (see decisions). Secrets handling now follows the example+user-copies pattern (machine hook enforces; v2.5.7). Direct competitor identified: **Polsia** (venture-agent category proven at $49/mo + $250M valuation; their failure modes = our differentiators — validation-first, approval gates, no lock-in).

---

## Superseded buildathon status (history)

> Original sprint north star: user speaks a charge, gets a research email within 60s.

## What's done

- [x] Landing page (1465 LOC, ritual animations, scroll-driven curtain, sigil drawing, agent cards)
- [x] Email waitlist (Supabase, RLS-hardened, anon-INSERT only)
- [x] GA4 wired (`G-RYWKGMVS7K`, fires `page_view` on route changes)
- [x] Lovable round-trip sync working
- [x] Tech stack locked (TanStack Start · React 19 · Bun · Supabase · Cloudflare Workers)
- [x] Brand + voice + naming locked (Arabic موكّل + four-muakkal mythos)

## 48h timeline status

| Block | Status | Owner |
|---|---|---|
| 1. Foundation (auth UI, dashboard shell, migrations, env) | ⏳ pending | Lovable + Claude Code |
| 2. Voice + Scribe API (`/api/transcribe` via Groq) | ⏳ pending | Claude Code |
| 3. Orchestrator (`/api/orchestrate`, intent→plan, 10-charge eval) | ⏳ pending | Claude Code |
| 4. Seeker (`/api/seeker` with web search, `/app/seeker` UI) | ⏳ pending | Claude Code |
| 5. Herald — Email + Slack OAuth ⚠️ critical path | ⏳ pending | Claude Code |
| 6. Charge runner + SSE streaming | ⏳ pending | Claude Code |
| 7. Result UX (`/app/charges/:id`, recent charges feed) | ⏳ pending | Claude Code |
| 8. Quotas (middleware + error toast) | ⏳ pending | Claude Code |
| 9. Landing copy tweaks (Scribe role, "platform is live") | ⏳ pending | either |
| 10. Demo prep + submission (video, push, submit) | ⏳ pending | both |

## Critical path risks (from buildathon-plan.md)

1. **Orchestrator misroute** — mitigate with 10-canonical-charge eval before submission
2. **Slack OAuth eats > 4h** — ship email-only Slack v1.5 post-buildathon if needed
3. **Email deliverability** — `muakkil.com` DKIM/SPF v1 + `resend.dev` fallback
4. **LLM rate limits** — Anthropic Tier 1 + Groq free tier; queue-with-toast on 429
5. **DNS doesn't propagate** — `onboarding@resend.dev` for demo if needed

## Today's recommended action

(Updated by Hamzaish on every `/product-pulse muakkil` invocation. Refreshed 2026-07-24 —
the old buildathon-era action ("run Lovable Prompt 1") was stale: auth shipped as slice 1.)

→ **Pay the Phase-0 validation debt first: recruit + run the 5 Mom-Test interviews (gate:
validation, due 2026-08-16). Build lane resumes with slice 7 (import-and-launch) per
FACTORY-ORDERS.**

## Outstanding decisions for Hamza

- [ ] Schedule the 5 Mom-Test interviews (validation gate 2026-08-16; ≥3 must raise the post-build stall unprompted)
- [ ] Green-light slice 7 (import-and-launch) once the build lane reopens

## Explicitly deferred to v2+

- The Maker (real code generation)
- Chrome extension (Whisper-Flow-tier dictation anywhere)
- Tab-audio meeting capture (Granola-tier)
- Herald scheduling (delayed sends)
- SMS / Twilio / Discord
- Speaker diarization, custom vocabulary
- Mobile/iOS/Android native
- Paid tiers + Stripe
- Workspace / team accounts

## Verification gate before submission

End-to-end smoke: open muakkil.com in fresh browser → Google sign-in → "Speak your charge" → say "Research the top 3 AI meeting note apps and email me a summary" → email arrives within 60s. Plus mobile Safari smoke (graceful text-input degrade).

Full checklist at `muakkil-code/docs/buildathon-plan.md` §Verification.

## Active slice — 2026-08-02: standalone repo + muakkil.com cutover

Pinned before building (factory flow §4). Hamza's directive: no link with Lovable.
- [x] New private repo `hamza-ali-shahjahan/muakkil` (full history carried over; local origin repointed; muakkil-arise frozen)
- [x] Strip live Lovable ties (.lovable/, workflow doc, CLAUDE.md refs); vite preset swap pinned as follow-up slice (chip spawned)
- [x] muakkil.app wording neutralized (Hamza owns muakkil.com ONLY — repeated correction, now in memory); tests green
- [x] Deploy pipeline: wrangler (local, verified) + GitHub Action shipped (arms when Hamza adds CLOUDFLARE_API_TOKEN + ACCOUNT_ID secrets)
- [~] muakkil.com custom domain → BLOCKED on Hamza: zone not in his CF account (Namecheap DNS → Lovable A record 185.158.133.1). Steps handed over: add zone to CF account mail-hamza-ali, switch Namecheap nameservers, then rebuild+deploy attaches (config staged in wrangler.jsonc). Guides/llms.txt/sitemap go live at cutover.

Receipt 2026-08-02: standalone-repo slice done except DNS cutover (Hamza's registrar step). Factory tendril planted in repo CLAUDE.md — plan/receipt hook now fires in future Muakkil sessions. QM-wave assets from 2026-08-01 (skill pack repo live; 2 guides committed) ship publicly at cutover.
## Capability audit — 2026-08-13 (evidence-checked, not from these notes)

Asked: what can a new user actually DO today? Traced the code and probed the live site.
**Answer: read four pages and leave an email.** The venture engine is written but unreachable.
Three independent hard stops, each fatal on its own:

1. **No sign-in exists anywhere in the codebase.** Zero `signInWithOtp` / `signInWithOAuth` /
   `signInWithPassword` calls. `/app` bounces to `/login`; `/login` is a waitlist form. Nobody —
   including the operator — can reach the engine. Slices 1–6 have never been run end to end.
2. **Production holds 1 of 8 required keys** (`wrangler secret list` → only `INDEXNOW_KEY`).
   Missing: ANTHROPIC, SUPABASE_SERVICE_ROLE, GROQ, RESEND(+FROM), EXA, FIRECRAWL. Every agent
   step would return "not configured" even with a session.
3. **muakkil.com does not run this code.** `dig muakkil.com` → 185.158.133.1 (the Lovable A
   record). The 2026-08-02 DNS cutover is still blocked, so muakkil.com serves the OLD
   buildathon site. Everything built since is invisible there.

Where the current worker actually IS reachable: **www.muakkil.app** — by accident, as an
unclaimed subdomain falling through. `/`, `/guides`, `/login`, `/app`, `/pricing` all 200 there.

Smaller live defects found:
- Unknown venture subdomain → **500**. Root cause traced: `supabaseAdmin` throws on the missing
  `SUPABASE_SERVICE_ROLE_KEY` before `servePublishedPage` can return null, so the error
  middleware renders a branded 500. The code's own 404 path is correct and never reached.
  Fixes itself when key #2 lands — it is stop 2, not a separate bug.
- The sitemap 404s and the stale `llms.txt` are **DNS symptoms, not code defects**. The repo's
  routes are correct and the worker serves them properly at www.muakkil.app. Both resolve at
  cutover; do not "fix" the working code.
- Real leftover: `client.server.ts` still errors with "Connect Supabase in **Lovable Cloud**" —
  contradicts the 2026-07-02 own-Supabase decision and the standalone cutover.

**Engine quality audit (the deeper question — is it worth reaching?):**
- **Approve is the only verb.** Nine server functions; `updateBrief` is the only editor. The
  founder cannot reject, regenerate, or edit the validation report, plan, page copy, launch kit,
  or welcome email. Five of six outputs are take-it-or-leave-it. Biggest trust risk.
- **Grounding is measured but hidden.** `runNextStep` stores `grounded: true/false` on the
  Seeker step; no UI ever reads it. A report built on zero live sources looks identical to one
  built on ten.
- **Nothing verifies the Seeker's competitors or the Herald's target communities exist.**
- **Both live evals measure shape, not truth.** Scribe = fields ≥8 chars; Herald = item count,
  distinct kinds, body >40 chars. A kit naming five fictional subreddits scores 7/7.
- Genuine strengths, worth protecting: state machine is deterministic code (not LLM-routed) and
  unit-tested; weekly report is hard-constrained to own-DB numbers; launch kit forbids
  astroturfing and posts from the founder's own accounts; rendered page has clean SEO/OG/schema
  and escaped output; signup burst damper + idempotent duplicates.

**The reframe:** the gap is not missing features. The state machine, four agents, quotas,
approval gates, publishing, IndexNow, signup + welcome email, and own-DB weekly stats are all
written. The gap is entirely **reachability** — auth, keys, DNS. Muakkil is built and unplugged.
"Built" in the table below means written and unit-tested; it does NOT mean ever executed.

## Active slice — 2026-08-13: validation-gate sprint + churned-builder demand test

Pinned before building (factory flow §4). Trigger: the Lovable $400M/$13.3B raise fired the
pivot decision's own revisit trigger, and the validation gate (2026-08-16) is 3 days out with
**zero** evidence — `check-validation muakkil` errored: no ledger file existed at all.

Operator chose (2026-08-13): conversations **+** demand test. NOT slice 7 — the build lane
stays shut until the gate resolves.

**Goal:** by 2026-08-16, 5 recorded conversations with people who shipped on an AI builder and
stalled after deploy. Pass = ≥3 raise the post-build stall **unprompted** AND ≥1 names a figure
they'd pay to have it handled. (The money clause is new — the old gate only tested listening,
while the 2026-10-17 traction gate needs a paying concierge client and there is no
cost-per-venture number to price against.)

**Shipped 2026-08-13 (operator-approved after the capability audit):**
- [x] **Sign-in exists.** Magic-link (`signInWithOtp`) on `/login`, placed BELOW the waitlist so
  the live demand test's funnel is undisturbed. `shouldCreateUser: false` — a stranger's address
  never becomes a user row. Authenticated visitors forward to `/app`. Tests 39 → 48.
- [x] Lovable-Cloud error strings removed from both Supabase clients (contradicted the
  own-Supabase decision; also the message behind the branded 500).
- **NOT verified**: no magic link has ever completed a round trip. Needs Supabase email/SMTP
  configured + `/login` allowlisted as a redirect URL + the operator's own user row created
  (`shouldCreateUser: false` means self-signup won't make one). Written ≠ works — same bar
  applied to this work as to slices 1–6.

**P0 trust fixes shipped 2026-08-13 (the "is it worth reaching" answer, operator-approved):**
- [x] **Reject + regenerate on every step.** `rejectStep` returns a step to `pending` (which is
  what `nextStepTemplate` already looked for) and stores the founder's reason in
  `input.retry_note`; every generator now takes that note and is told not to repeat the
  rejected approach. Attempt counter surfaces in the UI. Approved steps refuse rejection —
  they are already public.
- [x] **Found and fixed a dead end while wiring it:** the brief is written inline by
  `createVenture` and had no case in the run switch, so a rejected brief would have failed with
  "No runner for scribe:brief". Added, with a test that asserts every stage template has a runner.
- [x] **Editable outward-facing outputs**: page copy (also written through to `venture_pages`,
  or the founder previews copy they already changed), launch-kit item text, welcome email.
  Email is edited as plain text and the HTML rebuilt server-side — never accept founder markup
  into a message sent in their name.
- [x] **Grounding surfaced.** The Seeker now reports "checked against N live sources" or, when
  Exa returned nothing, "no live sources were found — a starting point to check, not a finding."
  The flag existed since slice 3 and no screen had ever read it.
- Tests 48 → 60. Typecheck clean, build clean.
- **NOT verified**: none of these screens has been rendered. `/app/*` correctly redirects to
  `/login` without a session, so the venture flow cannot be reached until keys + a seat exist.
  Contract-level tests only.

## Active slice — 2026-08-15: the Seeker reads 30 competitors, not 3

Pinned before building (factory flow §4). First two items of the SPEC.md build order, chosen
because they need no new keys: `EXA_API_KEY` and `FIRECRAWL_API_KEY` are already in the
environment.

- **`exaFindSimilar`** — seed a competitor URL, get semantically similar companies. Exa's
  purpose-built competitor-discovery primitive; the one thing its rivals don't have. On its own
  it takes the Seeker from ~3 competitors to ~30. Highest value per line in the whole spec.
- **`cache_control` in `claude()`** — the deep read asks several questions over one stable
  corpus, the canonical cache-hit shape. Reads cost ~0.1× and writes 1.25×, so a 150k-token
  corpus across 3 passes costs ~$0.66 cached vs ~$1.35 uncached — and the saving grows with
  each question added. Without this the deep read is unaffordable, so it is a prerequisite, not
  an optimisation.

## DIRECTION CHANGE — 2026-08-14: the Maker builds real apps (spec written, NOT built)

Pinned before building (factory flow §4). Spec at `docs/maker-app-spec.md`.

Operator's call, made against a stated recommendation and reaffirmed: **Muakkil is end-to-end
and builds the product itself — no routing the build to Lovable/Bolt/v0.** The recommendation on
record was to commoditise codegen (hand the founder a builder prompt, then import the result via
slice 7) and keep Muakkil on the defensible half. Operator overruled; recorded so the trade
stays legible. `docs/venture-agent-spec.md` deferred "full app builds" and CLAUDE.md lists "The
Maker (real code generation)" under v2 — both are now superseded on this point.

**The architectural fork, and the call made:** generate *code* and run it (Lovable's shape —
build pipeline, container isolation, untrusted execution, 146 engineers) versus generate a
*specification* and interpret it (no untrusted code ever runs). Chose the second, because Muakkil
is already doing it: `page-serve.ts` reads `venture_pages.content` as JSON and renders it
deterministically at the venture's own URL. The Maker needs a richer spec, not a new platform.

**The safety argument is the moat argument.** The security study found >10% of vibe-coded apps
shipped with critical RLS holes — because each generated app gets its own generated data layer,
each wrong in its own way. A spec-interpreted runtime has ONE data layer, written once, reviewed
once; every venture inherits the same enforced isolation. You cannot generate a broken policy if
you never generate policies. Structurally safer than the incumbent at the exact thing the
incumbent is failing at.

**It also protects this week's work.** Editable outputs, reject-with-a-reason, breakable seals
and preserved originals all operate on structured artifacts. A generated codebase would discard
every one of them; a generated spec inherits them all.

**PHASE 1 BUILT 2026-08-14.** Tests 110 → 130. Typecheck + build clean; all public routes still
200. Rendered a real generated booking app end-to-end and inspected it — proper field types,
select, date picker, help text, required markers, themed.
- `src/lib/app-spec.ts` — types + validator. **Rejects, never repairs**: unknown field types,
  duplicate keys, unknown entity refs, over-limit counts, non-snake_case keys, an ai action
  writing to a nonexistent field, and an app with no public form all fail visibly so the founder
  can send the Maker back with a reason (machinery that already existed).
- `src/server/app-render.ts` — pure renderer, sibling of `page-render.ts`. **Nothing reaches the
  output without `esc()`.** Tests prove a `<script>` field label and an `<img onerror>` visitor
  value both render inert.
- `supabase/migrations/20260814120000_venture_records.sql` — the ONE shared data layer. Anon
  INSERT only on a published venture (mirrors the reviewed `venture_signups` policy); **no anon
  SELECT at all** — a booking form being open does not make the bookings open.
- `src/server/app-records.ts` — submissions validated against the SAVED spec, never the client.
  Undeclared fields dropped, required enforced, selects must match an option, lengths capped.
  Found and fixed while writing it: the founder-notification email interpolated visitor input
  into HTML unescaped.
- `makerDecideKind` — the Maker chooses page vs app and says why. **A page stays a real and
  frequent answer**; an unnecessary app wastes the founder's only advantage. Old ventures with
  page content render exactly as before (discriminated by `kind`).

Phases: (1) one entity + public form + founder list + one AI action + one email action — already
covers booking pages, directories, intake forms, trackers; (2) relations, detail/edit, search,
dashboard; (3) accounts for the venture's own end users; (4) escape hatch — constrained code
slots, or Cloudflare **Workers for Platforms** (built for running users' code isolated, on
infrastructure already in use) if full codegen is ever wanted.

**Flagged to operator, on record:** this is the largest item on the roadmap — a second product,
not a slice — and it consumes the weeks currently pointed at validation, IP clearance, domains
and the deep read. Hosting founder apps also imports an abuse surface (phishing, spam, unlawful
content) that needs a takedown path before opening, not after.

## Active slice — 2026-08-14: breakable seals

Pinned before building (factory flow §4).

**Goal:** any sealed step can be reopened; the confirmation states truthfully what will NOT
un-happen; work built on a reopened step is marked rather than deleted; the venture does not
rewind; and all 83 existing checks still pass.

Approving different steps changes different amounts of the world, so one blanket rule was wrong.
`rejectStep` refused all sealed steps with "already public" — true for the page, kit and email,
false for the market check, plan and brief.

- Nothing outward: `validation_report`, `venture_plan`, `weekly_report` → reopen freely.
- Reach without outward effect: `brief` → everything downstream was written from it.
- Genuinely irreversible: `launch_kit` (posts already made), `welcome_email` (already sent),
  `landing_page` (live, may have visitors) → the seal still breaks; the confirmation names what
  stays done.
- **Revisit, not rewind** — the venture keeps its furthest stage; the reopened step becomes
  actionable in place. Rewinding would hide launch work and read as punishment for editing.
- **Staleness is derived, not stored** — the machine already declares step order and
  `venture_steps.updated_at` already exists, so "built from an earlier version" is a pure
  function over data we have. No migration, and it cannot drift out of sync.

**Operator question answered (prompt/learning log):** `venture_steps.input` already keeps the
founder's raw words, and the reject work stores `retry_note` + `attempts` — rejections with
reasons are literally labelled training data and already accumulate. Two gaps: (1) no record of
the actual model call (prompt, response, model, tokens, cost, latency) and (2) `updateBrief` and
the new editors **overwrite** the agent's original output, destroying the richest signal there
is — the diff between what the muakkal wrote and what the founder changed it to. Fixed (2) in
this slice by preserving `output.original` on first edit; (1) needs an `agent_runs` table + an
operator-gated view (Patently's `/admin` is the pattern). Privacy: founders' ideas are their IP —
logging is fine as their own data, but any training use needs explicit disclosure in
`/privacy` and consent. Not a nicety.

## Spec extended — 2026-08-14: the deep read (NOT built)

Pinned before building (factory flow §4). Operator asked how to bring the YC-style
compress-a-month-of-GTM-research method into Muakkil. Added to `SPEC.md` as a fourth capability
— it belongs in the same spec because it answers the same spec's first question ("is this worth
doing?") properly, at the same moment in the journey, under the same on-demand cost pattern.

- **The value is the corpus, not the prompt.** Today's Seeker reads ~12KB (3 Exa searches × 4
  results, capped at 10 chunks). The method assumes ~150k tokens. Not a shallow version of the
  same activity — a different activity.
- **Half the corpus is already paid for.** Exa's `findSimilar` (seed a competitor URL → get
  semantically similar companies) is the purpose-built competitor-discovery primitive and the
  key is already wired; Firecrawl gives depth. Both already keyless-degrade in `research.ts`.
- **DO NOT integrate Reddit.** Free tier (100 QPM) is non-commercial only; the Responsible
  Builder Policy (2026-06-05) requires approval, and commercial use is $0.24/1k with the
  commercial tier reportedly ~$12k/mo. Muakkil is commercial. **Route through Exa** — licensing
  that content is Exa's business, and we are its customer rather than a party scraping a platform.
- **Earnings calls mostly don't apply** to this ICP (no public incumbents for a dog-grooming
  booking page). Better free substitute: **10-K Item 1A Risk Factors via SEC EDGAR** — where
  companies are legally obliged to write down what they fear. Closest public document to "what
  every player understands that customers never say out loud".
- **Prompt caching is the architectural fit**: several questions over one stable corpus is the
  canonical cache-hit shape, so economics improve as questions are added — the opposite of usual.
- **The risk that outranks the feature**: this method makes output MORE convincing. A
  deep-research Seeker that hallucinates is worse than a shallow one because the founder acts on
  it. Same rule as the IP citations — no claim without its source, corpus size always visible.
- **Output is hypotheses, not findings.** The method's own last step is "go have real customer
  conversations". Pass 3 emits the questions to ask, which points straight at the 08-16 gate.

## Spec written — 2026-08-14: ideate, clear, claim (NOT built)

`/spec` run at operator's request. Spec at `SPEC.md` in the Muakkil repo. Nothing built.

Answers three questions before a founder commits: is it worth doing (exists), **am I free to
build it** (Patently, whitelabelled), **what is it called and what can I own** (name candidates
+ domain table). Operator confirmed Patently-side work happens inside Patently's own repo.

Key design calls recorded in the spec:
- **Clearance is on-demand, never automatic** — Patently allows 50 memos/24h against a 100-founder
  beta cap, and it is the same owner's budget on both sides. Per-founder cap of 2/day.
- **RDAP for availability, registrars for price only.** Free, registry-authoritative, no API key,
  no IP allowlist — which dissolves the Namecheap blocker, since Workers have no stable egress
  IPv4 and Namecheap was only ever needed for availability. Cloudflare default (at-cost, already
  our vendor) but **sells no Arabic/Cyrillic/Chinese-script domains** — a pointed gap for a
  product called موكّل.
- **Whitelabel the mechanism, attribute the evidence.** Muakkil's voice and UI; every finding
  cites its registry and ID; the deep memo opens on patently.legal (which also gives Patently a
  funnel from Muakkil's founders, and vice versa at the moment before they commit to a name).
- **Muakkil never buys a domain in v1** — hand-off only. Buying makes it registrant of record for
  a stranger's brand and contradicts "your accounts, your code, no revenue share".
- **Citations re-validated on Muakkil's side**, not trusted from the wire. A legal-looking claim
  without a resolving link is worse than no claim — it borrows authority it hasn't earned.
- Two new steps only (`seeker:ip_clearance` in validation, `scribe:name_candidates` in plan) —
  both skippable, no new stage, no change to the journey rail.
- Found while specifying: **the venture name is `brief.what.split()` — the first four words.** The
  founder never chooses it, and the existing `name_check` "clears" a name nobody picked.

**Moat, honestly stated:** the data is public (Google Patents BigQuery, the registries). What is
defensible is (a) a pay-per-build competitor structurally cannot ship the most expensive "no" in
software, (b) owning both sides — no vendor to be repriced or acquired away, and (c) the
compounding record of idea → clearance outcome → launch outcome, which only this pairing generates.

**Sequenced after the gates.** Muakkil and Patently share the 2026-08-16 gate, both at zero.

## ICP decision — 2026-08-13: serve both, one engine

Audit found Muakkil was addressing **four different people in four places**: the front page sold
the superseded buildathon assistant ("legion of AI agents… Arriving soon", never naming an
audience), llms.txt and /pricing sold the venture agent to non-technical founders, /login (the
live demand test) targeted churned AI-builder founders, and the engine itself was built for
someone with only an idea — the Maker makes them a page from scratch.

Operator's call: **serve both arrivals through one engine.** Recommendation on record was to
narrow to churned builders (findable, dated pain, already invested, Lovable structurally can't
serve them); operator chose breadth. Making it sharp rather than vague:

- [x] **Two entry points, one journey.** `skipStep` exposes the `skipped` status the machine has
  understood since slice 1 but nothing could ever set — so every founder was walked through
  every stage whether it applied. A founder with an app already built can now decline the page,
  the plan, the market check, the kit, the welcome email.
- [x] **Brief and weekly report are NOT skippable** — every later muakkal reads the brief, and
  the report is the only thing that ever tells the founder the truth about what happened.
- [x] **Front page repositioned.** "Arriving soon" and the legion-of-agents copy gone (six weeks
  stale). Names both arrivals explicitly — "an idea, or an app nobody has found yet" — rather
  than abstracting up to "founders", which is how serving two people becomes serving neither.
- Tests 60 → 69. Typecheck + build clean. Front page verified in the browser.

**The finding that outranks the feature list:** Muakkil currently *drafts*; it does not *do*.
The launch kit produces 5–8 posts the founder posts themselves from their own accounts. The
welcome email is the only thing the product actually sends. So the pivot's differentiator —
"we run the post-build half" — is presently a briefcase of homework. A stalled founder's problem
was never a shortage of drafts. Tier-3 work (submissions actually submitted, indexing actually
done, outreach list actually built) is where the paid value is, and it is exactly where
smallness beats Lovable: at 8M users the abuse surface makes it impossible for them.

**Still open from the audit (P1/P2, not built):** nothing verifies the Seeker's competitors or
the Herald's target communities actually exist; both live evals still measure shape, not truth
(Scribe = fields ≥8 chars, Herald = counts) so a kit naming fictional communities scores 7/7.

- [ ] Ledger seeded at `validation/README.md`; `bun run check-validation muakkil` passes
- [ ] 5 conversations logged, each with the question that preceded the stall mention
- [ ] Demand test live: waitlist page repointed at churned builders, signups attributable by source
- [ ] Decision entry recording pass/fail and what happens next

- [x] SURPRISE WIN 2026-08-02: muakkil.app is Hamza's after all (Active CF zone, forgotten purchase, 1.45k uniques hitting a 522). Lit up: worker routes attached, PAGES_DOMAIN=muakkil.app + public Supabase vars set → apex 301s to muakkil.com, wildcard serves. Follow-up: unknown/reserved venture slugs (test.*, www.*) currently fall through to the main site (200) — should 301 or branded-404; verify venture lookup path end-to-end when beta work resumes. Also: confirm muakkil.app registrar/expiry/auto-renew (purchase origin unknown).
