# Enterprise Readiness

## The framework in one paragraph

Selling to enterprise (>1000 employees) requires more than a working product. It requires the **procurement-approved set**: SSO, audit logs, SOC2, DPA, security questionnaires answered, MSA template, defined SLA, dedicated support contact. Most of this is paperwork + process + a few specific features. Done in the right order, it unlocks deals 10-100x larger than SMB. Done out of order, it eats months without revenue.

## The "enterprise minimum set" — what's required

### Authentication
- [ ] SAML SSO (Okta, Entra/Azure AD, Google Workspace)
- [ ] SCIM provisioning (auto user creation/removal on HR changes)
- [ ] MFA enforcement options
- [ ] Per-user audit log of auth events

### Authorization
- [ ] Role-based access control (RBAC) — Admin, Editor, Viewer at minimum
- [ ] Org-level isolation (multi-tenant data separation, RLS or equivalent)
- [ ] Permission scopes per resource if applicable

### Audit & compliance
- [ ] Audit log of all data changes, exportable
- [ ] Audit log retention 1+ year
- [ ] User activity log (login times, IP, action types)
- [ ] Right-to-deletion implementation (GDPR / CCPA)
- [ ] Data export (full account data, in machine-readable format)

### Security
- [ ] SOC 2 Type I (minimum) or Type II (preferred)
- [ ] Encryption at rest (DB) + in transit (TLS 1.2+)
- [ ] Vulnerability disclosure policy (security.txt)
- [ ] Penetration test report (annual)
- [ ] Bug bounty program (optional but signals maturity)

### Legal
- [ ] MSA template
- [ ] DPA template (data processing agreement)
- [ ] Sub-processor list, public, kept current
- [ ] Insurance: cyber liability ($1M+ recommended)
- [ ] Standard SLA: uptime guarantee + remedy

### Operational
- [ ] Status page (StatusPage.io / Atlassian)
- [ ] Incident response runbook
- [ ] Dedicated CSM contact for accounts over $X ARR
- [ ] Quarterly business reviews (QBR) cadence

### Documentation
- [ ] Public security overview page
- [ ] API docs (if relevant)
- [ ] Admin guide for IT
- [ ] User guide
- [ ] Onboarding guide

## What enterprise prospects will send

Within 2 weeks of "we're interested", expect:
1. **Security questionnaire** (200-500 questions; SIG Lite or CAIQ format common)
2. **Vendor risk assessment** form
3. **Data processing addendum** for legal review
4. **Compliance documentation request** (SOC2 report, pen test summary)
5. **Architecture review** call

Have answers ready. The first 5-10 enterprise deals teach you what questionnaires you'll face — automate the answers via a tool like Loopio or a maintained internal doc.

## When to start enterprise prep

- **Pre-Launch**: ignore. Don't enterprise-prep before PMF.
- **Launch (after first inbound enterprise interest)**: start. SOC 2 Type I is the first investment.
- **Scale**: relentlessly automate. By Series A scale, security review should take 1-2 weeks not 2 months.

## SOC 2 — the most common enterprise gate

### Type I vs Type II
- **Type I**: snapshot in time, takes 1-2 months, costs $5K-$20K with Vanta/Drata
- **Type II**: covers a period (3, 6, 12 months), takes 12+ months total, costs $20K-$50K
- **Most enterprise buyers accept**: Type I with active Type II underway (the "audit window")

### How to get there
1. Pick a tooling platform — **Vanta** or **Drata** are the standards (~$8K-$15K/yr for SMB-tier)
2. They give you a checklist of ~100 controls
3. You implement controls (MFA, access reviews, vendor management, etc.)
4. Auditor reviews + issues report
5. Refresh annually

Don't try to do SOC 2 manually. The tools are worth the cost — they save 100s of hours.

## Pricing for enterprise

- **Don't publish enterprise pricing on your site.** "Talk to us."
- Anchor on **3-10x your published Pro tier**
- Negotiate up from there based on seats, SLA, support tier
- Annual contracts only (quarterly OK; monthly is a sign of mistrust)
- Multi-year contracts get 5-15% discount

## When NOT to chase enterprise

- You're solo and your product's median customer is $30/mo. Enterprise will consume founder time at 10x SMB without proportional revenue.
- Your product is consumer-grade UX and the enterprise version would require a full rebuild.
- Your differentiation is "fast and indie" — enterprise expects "thorough and stable."
- You have < 50 SMB customers yet — wrong stage.

## Pitfalls

- **One enterprise customer becomes the product roadmap.** They demand custom features that don't help other customers. Mitigate: charge enough that custom dev is profitable, OR refuse and lose the deal.
- **Long sales cycles eat runway.** Enterprise deals can take 6-18 months. Plan cash for the cycle.
- **Procurement says no in month 5.** Always possible, even with strong champion. Reduce risk by validating budget + executive sponsor early.

## Source for follow-up

- Vanta and Drata both have excellent free SOC 2 prep content
- "Enterprise Ready" newsletter from WorkOS (free, very practical)
- *Founding Sales* — Pete Kazanjy
- Tomasz Tunguz blog (a16z venture partner) for enterprise sales cycle data
