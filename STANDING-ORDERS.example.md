# STANDING ORDERS — permanent operating authority for autonomous programs

> **Template.** `bun run setup` copies this to `STANDING-ORDERS.local.md` (gitignored).
> Every autonomous *program* (a named, recurring unattended activity) is defined here with
> four required parts: **Scope** (authorized to do) · **Triggers** (when it runs) ·
> **Approval gates** (needs the operator) · **Escalation** (when to stop and ask).
> A program not defined here has NO unattended authority. One file, versioned, auditable —
> authority never forks per product. (Pattern source: openclaw standing-orders, ported as doctrine.)

## The iron law (applies to every program)

**Agents research, draft, analyze, monitor. The operator publishes, sends, replies, pays.**
Anything external-facing — a post, an email, a deploy, a payment, a visibility change —
crosses an approval gate, no exceptions, regardless of program.

---

## Program: overnight-build

- **Scope:** feature branches in the ONE product repo named by the current FACTORY-ORDERS
  mandate; `/goal`-scored slices only; tests + evals must accompany code (house rules apply
  unattended too).
- **Triggers:** operator launches `bun run autonomy -- --repo … --max-spend-usd …` (never self-starts).
- **Approval gates:** merge to main · deploy · anything in the iron law · touching a repo
  not named in the mandate.
- **Escalation:** blocked state, spend cap, or a decision the mandate doesn't cover →
  write `ESCALATION.md` + notify + stop. Never guess on an ambiguous mandate.

## Program: gtm-draft

- **Scope:** research + drafting ONLY, into `gtm/queue/` (launch posts, directory
  submissions, ship-notes, outreach drafts, keyword briefs). Reading analytics is in scope.
- **Triggers:** heartbeat checklist item, or an explicit mandate line.
- **Approval gates:** EVERYTHING that leaves the machine. Posting, submitting, sending,
  scheduling — all operator-only, from the queue. No exceptions for "low-risk" posts:
  automated posting is the documented ban/shadow-ban pattern.
- **Escalation:** a channel demands an account action (login, payment, verification) → queue
  a note for the operator; never handle credentials.

## Program: heartbeat

- **Scope:** read-only sweep per `HEARTBEAT.local.md` — gate dashboard, spend ledger,
  product status files, GTM queue depth; write ONE report file; update the FACTORY-ORDERS
  spend line.
- **Triggers:** scheduled (weekly, before the operator's Monday pulse) or run by hand.
- **Approval gates:** none needed — it changes nothing outside its report + the spend line.
- **Escalation:** a product OVERDUE on a gate, spend anomaly, or a silent week (no state
  change anywhere — the silent-failure smell) → flag at the TOP of the report.

---

## Amending these orders

Adding a program or widening a scope is an operator-only edit, made here, dated. An
unattended session may PROPOSE an amendment (in its escalation file) but never apply one.
