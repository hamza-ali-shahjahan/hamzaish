# 2026-06-07 — Clear the name, not the domain (the Patently miss)

## What happened

The IP-research product (IP Radar) was rebranded to **Patently** and the domain
`patently.legal` was bought and wired live — *before* checking the name. A later
check found **patently.com**: an 8-year-old, 1,500-user AI **patent** platform run
by patent litigators (Spaargaren & McCann). Identical name, identical field. There's
also **Patently-O**, the most-read US patent-law blog since 2005. The `.legal` domain
being free meant nothing — the **brand name** was the landmine.

Ironic twist: the product *itself* is an IP-clearance tool. It should have cleared
its own name.

## The rule (now a guardrail)

**Clear the name, not the domain.** A free/available domain proves nothing. Before
buying a domain or branding anything, run a name-clearance knockout:

1. **Distinctiveness first.** Prefer coined/arbitrary names. Suggestive/descriptive
   names (Patently→patents, "IP Radar"→IP) are a double-trap: legally weak *and*
   almost always already taken in-field.
2. **Same-industry collision** (highest weight) — any same/adjacent-field product
   with the name = kill.
3. **Trademark signal** — USPTO TESS / EUIPO / local, Nice classes 9/42/45.
4. **Famous-crowding / SEO** — is the root owned by a famous incumbent (Patently-O)?
   You'll be invisible.
5. **Domain** across TLDs — last, not first.

Empirical note from the re-run: of ~19 real-word candidates checked, almost all were
taken, many directly in IP/legal/fintech. In crowded categories, **coined words are
often the only reliably-clearable option.** Winner found for the IP product:
**Pediment** (clear in-field, arbitrary→strong mark, on-identity with the column
favicon, pediment.legal/.ai available) — pending a formal attorney knockout.

## What was built

- New skill **`factory/skills/name-clearance/`** (SKILL.md + `check-domains.ts` WHOIS
  helper) and the global `/name-clearance` command.
- Added a **HARD GATE (step 0.5)** before the domain-buy stage in
  `factory/playbooks/ai-native-2026/go-live-provisioning.md` — a RED verdict blocks
  the buy.

## How to apply

Run `/name-clearance "<name(s) or product description>"` whenever naming a product or
before any domain purchase. Never let a future product buy a domain before the name
clears. Treat a finalist as cleared only after a paid attorney knockout.
