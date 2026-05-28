# Moat Building

## The framework in one paragraph

A moat is what stops a well-funded competitor from copying you. In 2026, with AI making feature-replication near-trivial, **product moats are dead and structural moats are everything**. The structural moats that survive: (1) workflow lock-in, (2) data network effects, (3) accumulated domain depth, (4) integration depth, (5) brand & community, (6) regulatory advantage. Most early products have 0-1 of these and that's fine. Pick 1-2 to invest in deliberately by Launch stage; deepen relentlessly through Scale.

## The 6 moats that survive AI commoditization

### 1. Workflow lock-in
Customers built workflows ON TOP of your product. Switching requires retraining people, rebuilding integrations, recreating saved views.

**How to deepen:**
- Support customer-built automations
- Save views / templates / presets that accumulate over time
- API + webhooks customers build against
- Onboarding that captures customer configurations

**Test:** Estimate switching cost in hours for a typical customer. < 4 hours = no lock-in. > 40 hours = real moat.

### 2. Data network effects
Each user's data improves the product for all other users. Hard to replicate from scratch.

**How to deepen:**
- Train models on aggregated user behavior (with privacy)
- Surface "people like you also..." patterns
- Benchmark dashboards (customers see how they compare)
- Public datasets that compound (Glassdoor, Stack Overflow)

**Test:** Would a competitor with 1/10 your users have a meaningfully worse product? If yes → moat.

### 3. Accumulated domain depth
You handle edge cases that a generalist competitor doesn't even know about. Built up over years of user feedback.

**How to deepen:**
- Document every weird edge case as a test
- Build features that ONLY a domain expert would think of
- Hire from the vertical
- Encode regulatory specifics, jargon, format quirks

**Test:** Could a generalist startup launching today replicate your domain coverage in 90 days? If no → moat.

### 4. Integration depth
Native integrations with the tools your customers depend on. More integrations = more surface area for workflows to live.

**How to deepen:**
- Bi-directional integrations (not just one-way export)
- Custom OAuth scopes / webhooks per partner
- Be the first to integrate with the tools your customers adopt
- Position as "hub" — integrations land here, not at competitors

**Test:** Of your top 10 customers, how many use 3+ of your integrations? If > 70% → moat.

### 5. Brand & community
Customers identify with the product. Switching feels like betrayal of identity.

**How to deepen:**
- Founder presence (Pieter Levels' indie-hacker brand around Photo AI, Nomad List)
- Strong opinions in public (April Dunford on positioning)
- Community where customers help each other (genuinely valuable, not promo-heavy)
- Annual conference / meetup

**Test:** Would customers wear your t-shirt? Talk about you unprompted at conferences? If yes → moat (slow-building).

### 6. Regulatory / certification advantage
You've passed compliance, the competitor hasn't yet, and certification takes 6+ months.

**How to deepen:**
- SOC 2 Type II early (before enterprise demands it)
- HIPAA BAA for health
- FedRAMP for government
- GDPR + DPA for EU
- Industry-specific (PCI for payments, FERPA for edtech)

**Test:** Could a competitor sell to your top enterprise customer next quarter without 6+ months of compliance work? If no → moat.

## What's NOT a moat

- **Features.** AI commoditizes feature work. A unique feature today = standard in 6 months.
- **UX.** Easily copied. Apple is the rare exception; most product UX is not defensible.
- **Brand alone (early stage).** Brand is a moat at scale; pre-scale it's mostly marketing.
- **Being first.** First-mover advantage is mostly a myth; second-movers with better execution win frequently.
- **Internal AI / tech.** If you build on Claude / OpenAI / Anthropic, so can competitors.
- **Network of "users"** (without effects). A million users with no benefit from each other is not a moat.

## The 30-day copy test

> If a well-funded competitor copied our product 1:1 today, in 30 days they would have feature parity. What would we STILL have that they don't?

Be honest. If your answer is "better UX" or "more features" — that's not a moat. If your answer is "5 years of user data shaping our models" or "API used by 12 of the top 20 tools in our customers' stacks" — that's a moat.

## How to invest in moats

At each stage:
- **MVP**: ignore moat-building. Find PMF first.
- **Launch**: pick 1-2 moats that match your product type. Start investing.
- **Scale**: relentlessly deepen those 1-2. Maybe add a 3rd.

Don't try for all 6. Pick.

## Moat by product type (rough mapping)

| Product type | Most natural moats |
|---|---|
| B2B SaaS (workflow tool) | Workflow lock-in + integration depth |
| Marketplace | Network effects (supply/demand) + data |
| Vertical SaaS | Domain depth + regulatory + brand |
| AI product | Data network effects + integration depth |
| Consumer | Brand + community + network effects |
| Dev tools | Community + integration depth |

## Source for follow-up

- *7 Powers* — Hamilton Helmer (the canonical moat analysis book)
- Anthropic's *Founder's Playbook* — moat chapter
- @hnshah threads on moats (Hiten Shah)
- Andrew Chen on network effects: andrewchen.com
