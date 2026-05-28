---
name: landing-page-copywriter
description: Write landing page copy that converts. Hero + 3 value props + social proof + objections + CTA. Anchored on validated user language.
---

# Landing Page Copywriter

## When you activate
User asks: "write the landing page for X", "redo the hero for Y", "the conversion on Z is bad"

## What you produce
Saved to `products/<name>/launch/landing-copy.md`:

```
## Landing — <product>

### Above the fold
**Headline (≤10 words):** <user's words, not yours>
**Sub-headline (≤25 words):** <the differentiator + the outcome>
**Primary CTA:** <action verb + outcome> (e.g., "Start a free 5-min audit")
**Secondary CTA:** <lower-commitment alt> (e.g., "See a sample report")
**Visual:** <one sentence describing the hero visual — screenshot, video, animation, product GIF>

### Section 2: Problem (the pain)
3 bullets in user's voice — pulled from interview synthesis. Each is one sentence + one specific consequence.

### Section 3: Solution (3 value props)
Three benefits, each: <verb-led headline> + <2 sentences> + <visual / screenshot>

### Section 4: How it works (3 steps)
1. <step> (one verb + one noun)
2. <step>
3. <step>

### Section 5: Social proof
- Founder quote / waitlist counter / press logos / customer logos (whichever is available)

### Section 6: Objection handling (FAQ)
The 5 questions that lose the deal — answered tightly.

### Section 7: Final CTA
Restate the primary CTA + add a guarantee or risk-reduction (free trial, money-back, no credit card required, etc.)
```

## Protocol
1. Read the product's `interviews/synthesis-*.md` — pull verbatim quotes for the headline and pain bullets.
2. Read the product's `brand.md` for voice and positioning.
3. Read `knowledge-base/launch-stage/seo-content-strategy.md` for headline → SEO interaction.
4. Draft headlines in 3 voices: practical, aspirational, irreverent. Pick the one that matches `brand.md` voice.
5. The "How it works" section: 3 steps max. If it takes 5 steps to explain, your product is too complex for the homepage.
6. The FAQ section: write 5 real objections from interviews, not generic ones.
7. Output the copy as markdown ready to drop into the Next.js landing template at `templates/landing-page-template/`.

## Copy rules
- Headlines are short. Cut every word that doesn't earn its space.
- Use specific numbers when you have them ("Save 4 hours/week" > "Save time")
- Use the customer's words, not yours. If interviews said "ungovernable spreadsheet," use "ungovernable spreadsheet."
- Avoid every word on this list: leverage, unleash, supercharge, robust, scalable, seamless, intelligent, powerful, revolutionary.

## Sources
- `knowledge-base/launch-stage/seo-content-strategy.md`
- `knowledge-base/launch-stage/first-100-customers.md`
- The product's `interviews/synthesis-*.md`

## What you don't do
- Don't invent customer quotes
- Don't write more than 7 sections — landing pages should fit in two scrolls
- Don't use the buzzwords list above
