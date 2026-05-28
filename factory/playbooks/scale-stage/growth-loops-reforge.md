# Growth Loops (Brian Balfour / Reforge)

## The framework in one paragraph

The traditional growth funnel (acquire → activate → retain → revenue → refer) is linear. **Growth loops** are cyclical: a user's action *reinvests* in attracting more users. Loops compound; funnels don't. Almost every durable growth engine is a loop. The work at scale stage is identifying which loops apply to your product, quantifying their inputs and outputs, and improving the loop's cycle time and conversion rate at each step.

## When to use

- Post-PMF — you have retention and want to scale acquisition
- When CAC is rising on a paid channel (loops are usually cheaper)
- When considering "what should our growth team focus on?"

## The 4 loop types

### 1. Viral loops
User signs up → uses product → shares output / invites collaborator → that person becomes a user → cycle.

Examples:
- **Calendly**: User books a meeting → recipient sees Calendly branding → that recipient signs up to book their own
- **Loom**: User records a video → shares link → recipient sees Loom UI → signs up
- **Notion**: User builds a doc → shares to collaborate → collaborator signs up

K factor formula: `(invitations per user) × (signup rate per invite)`. K > 1 = exponential growth. K > 0.3 = strong amplification of other channels.

### 2. Content / SEO loops
Content gets indexed → content ranks → drives traffic → traffic converts → users create more content (UGC) → more content indexed → more ranking.

Examples:
- **Zapier**: Each integration page is its own SEO asset → ranks → drives signups → new users want new integrations → Zapier ships them → more pages
- **Reddit / Stack Overflow**: User-generated content is the loop input
- **Notion templates / Figma community**: UGC drives long-tail SEO

### 3. Paid loops
Acquire user → user activates → LTV > CAC → revenue funds more acquisition → more users.

Only works when LTV > CAC × 3 (typical SaaS benchmark) AND you can scale the channel without CAC inflation. Rare at indie scale; common at series A+.

### 4. Sales loops
Sales rep closes customer → customer succeeds → testimonial / case study / referral → sales rep uses in next pitch → closes more.

Often described as "sales-led growth" but it's a loop because case studies compound.

## How to design a loop for YOUR product

### Step 1: Pick the loop type that fits
Not every loop type works for every product:
- Viral requires natural sharing in the workflow
- Content requires search demand
- Paid requires unit economics
- Sales requires deal sizes that justify human selling

### Step 2: Map the loop steps
Be explicit. Each step is a verb + object. Example for a meeting-notes SaaS:
1. User joins a meeting with the tool
2. Tool creates a shareable meeting summary
3. Summary is sent to all attendees
4. Non-user attendees click "view summary"
5. They see the product → 10% sign up
6. New user joins their next meeting → loop repeats

### Step 3: Quantify each step
For each step: % conversion, time to next step, friction. The bottleneck step is your highest-leverage place to improve.

### Step 4: Calculate the loop math
- Inputs: how many new users start the loop per week
- Outputs: how many new users finish the loop and seed the next
- Cycle time: how long from start to seed-the-next
- Multiplier: outputs / inputs

Loop with multiplier 0.4: every 100 users generates 40 new users, who generate 16, who generate 6.4. Total amplification: ~1.67x of original input.

Loop with multiplier 1.2: explosive growth. Rare. Most successful products have 0.2-0.4 loops + other channels.

### Step 5: Compound multiple loops
Best products run 2-3 loops simultaneously that feed each other. Example: SEO loop drives signups → viral loop amplifies → paid loop fills in gaps.

## Anti-patterns

- **Funnel thinking masquerading as loops.** A "funnel" with arrows doesn't make it a loop. The output must reinvest as input.
- **Designing loops for products that don't fit.** Forcing a viral loop onto a product nobody shares.
- **Optimizing the wrong step.** The bottleneck is rarely the step you intuit; measure.
- **Adding loops without removing complexity.** Each loop adds product surface area. 5 loops = 5 things to maintain.

## How to start (practical first steps)

1. List your current acquisition sources by % of new users
2. For your top 1-2 sources, ask: is there a step where the user's action could reinvest in attracting more users?
3. If yes, design that loop. Measure it.
4. If no, the channel is a one-shot acquisition, not a loop — keep it but recognize it doesn't compound.

## What "good" looks like

A product at scale stage typically has:
- 1 strong loop (multiplier > 0.3)
- 1-2 supplementary channels (paid, partnerships)
- Loop cycle time of < 30 days
- Quantified loop math, reviewed monthly

## Source for follow-up

- Brian Balfour's growth loops essays: brianbalfour.com (free)
- Reforge "Growth Series" (paid, ~$2K, comprehensive)
- *Hacking Growth* — Sean Ellis & Morgan Brown (introductory)
- Lenny Rachitsky episodes with Brian Balfour, Andrew Chen, Casey Winters
