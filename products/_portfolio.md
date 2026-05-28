# Portfolio Snapshot

**Last refreshed**: 2026-05-28 · Live state of all products in the factory.

Refresh by running `/portfolio-pulse` — regenerates this file from each product's `product.config.json` + `status.md`.

---

## Active spotlight: **muakkil** (buildathon launch this weekend)

Muakkil is the factory's first proof-of-value. Lovable buildathon submission = beta launch. First 100 sign-ups become the beta cohort. **The Scribe demo (voice → orchestrator → Seeker → Herald → email in <60s) is the demo centerpiece.**

→ See `products/muakkil/status.md` for the 48h timeline and today's recommended action.

---

## All products (14)

| Product | Stage | Status | One-liner |
|---|---|---|---|
| **muakkil** | mvp | active · buildathon | Mystical AI-agent platform — four spirit agents collaborate on cross-agent charges. |
| **scope-intelligence** | mvp | active · vertical-slice-build | Scope enforcement SaaS for small agencies — integrates with ClickUp/Asana/Monday. |
| **dnsdoctor** | mvp | active | Differentiated DNS toolkit — global propagation across 20+ resolvers + AI diagnosis + setup wizard. |
| ventbox | mvp | active | Anonymous vent space — say what's on your mind without identity exposure. |
| linkedup | mvp | active | LinkedIn-native outreach + content tooling for B2B founders. |
| copyright | mvp | active | AI-assisted copyright + IP management for creators and small studios. |
| hamza-health | mvp | active | Personal health intelligence — blood reports + wearables + habits into coaching. |
| hamzaos | mvp | active | Hamza's personal operating system — persona, strategy, calendar, research, content. |
| one-dollar-factory | idea | active | Experimental playbook for generating $1-decision micro-products. |
| ai-growth-engine | idea | active | Systems-agent-driven growth engine for SMB founders. |
| tasfort | idea | active | (placeholder — needs one-liner refresh) |
| **ai-native-cms** | idea | slot_reserved | TBD — folder reserved 2026-05-28; details coming. |
| formpad | idea | slot_reserved | (slot reserved — needs validation before scaffolding) |
| calculatrs | idea | slot_reserved | (slot reserved — needs validation before scaffolding) |

Stages: **idea** (validation phase) · **mvp** (building) · **launch** (shipping to first users) · **scale** (post-PMF growth) · **sunset** (winding down).

---

## Stage distribution

- **MVP**: 8 products (muakkil, scope-intelligence, dnsdoctor, ventbox, linkedup, copyright, hamza-health, hamzaos) — building
- **Idea (active)**: 3 (one-dollar-factory, ai-growth-engine, tasfort) — validating
- **Idea (slot_reserved)**: 3 (ai-native-cms, formpad, calculatrs) — awaiting validation/details

**Discipline check**: 8 products in MVP simultaneously is *a lot* for a solo operator. The factory was designed for **focused parallelism, not maximum parallelism**. Likely action at next `/portfolio-pulse`: confirm which 1-2 of the 8 MVPs are this quarter's bets (Muakkil this weekend is locked; Scope Intelligence has the most depth of work after that); the others go to "background validation" mode (don't ship until they earn it).

---

## Today's recommended actions (per product)

Populated by `/portfolio-pulse` on each invocation.

- **muakkil** → Run Lovable Prompt 1 (auth). Drop API keys into `.env.local`. Then start Block 1. **(THIS WEEKEND)**
- **scope-intelligence** → `/work-on scope-intelligence` to load full context, then identify the current vertical slice and the 5 customers booked for paid validation.
- **dnsdoctor** → `/work-on dnsdoctor` to load full context, verify AI-diagnosis citation post-validator is active.
- **ventbox** → Stage assessment pending — needs review of validation evidence + retention data. Defer until after Muakkil ships.
- **linkedup** → Read-through needed; status unknown to factory.
- **copyright** → Read-through needed; status unknown to factory.
- **hamza-health** → Read-through needed; status unknown to factory.
- **hamzaos** → Read-through needed; status unknown to factory.
- **one-dollar-factory** → Validation conversations before any code.
- **ai-growth-engine** → Validation conversations before any code.
- **tasfort** → Refresh one-liner; classify intent.
- **ai-native-cms** → Awaiting Hamza's brief — populate the one-liner.
- **formpad** → Validate or release slot.
- **calculatrs** → Validate or release slot.

---

## Inventory note

Hamzaish itself (the factory) is in active development. See `meta/changelog.md` — currently at **v1.1**. Next milestone: Muakkil's buildathon retro will drive Phase B (test coverage of the factory's load-bearing skills) and Phase C decisions (full memory layer evolution).

## How to refresh this file

```
/portfolio-pulse
```

Pulls each `product.config.json` + `status.md`, regenerates the table and the recommended-actions section. Should run automatically at the start of each working day; manual invocation otherwise.
