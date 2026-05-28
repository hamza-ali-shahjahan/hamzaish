# Problem Statement Rubric

A testable hypothesis has four dimensions filled in with specific values, not generic ones.

## The format

> <specific role> at <specific company type / life stage> spend <specific time / $ / effort> on <specific task> because <specific reason / missing capability>. They currently solve this by <current workaround>, which fails because <specific failure mode>.

## The four-dimension rubric

### 1. Who (✅ / ❌)
- ✅ "In-house legal counsel at Series A-C B2B SaaS companies (20-200 people)"
- ❌ "Lawyers"
- ❌ "Tech companies"

### 2. How often (✅ / ❌)
- ✅ "3+ contract reviews per week"
- ✅ "Daily, every weekday morning"
- ❌ "Often"

### 3. How severe (✅ / ❌)
- ✅ "4-8 hours per review, multiplied by 12-15 reviews per month = 60-120 hours / mo / person"
- ✅ "Costs them $5K-$10K/mo in delayed deals"
- ❌ "Time-consuming"

### 4. Current workaround (✅ / ❌)
- ✅ "Email thread between counsel + business stakeholder + outside counsel, with Word docs attached and tracked changes"
- ✅ "Spreadsheet maintained manually with copy-paste from Stripe"
- ❌ "They use various tools"

## Pass / fail

All four dimensions must be ✅ before you proceed to customer discovery. If any are ❌, sharpen with `agents/idea/problem-sharpener/` first.

## Why this matters

You cannot validate a vague problem. "People struggle with X" is unfalsifiable — by the time you've talked to 5 people, you'll find someone who agrees, regardless of whether the problem is real or solvable. A sharpened hypothesis can be killed cleanly: if your 5 interviews with the precise persona don't show the precise behavior at the precise frequency, the hypothesis is wrong, and you learn fast.

## Examples — sharpening in action

### Before (❌)
> "Salespeople waste time on lead enrichment."

### After (✅)
> "AEs at PLG B2B SaaS companies (50-300 people) spend 30-90 minutes per discovery call prepping a prospect because contact data is fragmented across LinkedIn, the CRM, and Apollo, and there's no single brief view. They currently solve this by tab-switching during the prep, often missing context they later realize would have changed how they ran the call."

### Before (❌)
> "Founders waste time on customer interviews."

### After (✅)
> "Pre-PMF B2B SaaS founders (1-3 years in) spend 8-15 hours per validation cycle scheduling, conducting, and synthesizing customer interviews because their notes live across Notion + voice memos + Zoom transcripts with no consistent structure. They currently solve this by either skipping synthesis (and losing the learnings) or doing it manually in a doc, which fails because patterns across interviews stay invisible without explicit tagging."

## Why "current workaround" is the most important dimension

If the problem has no current workaround, it might not actually be a problem — humans are adaptive. People do something about their problems. That something is either acceptable (no opportunity) or unacceptable (your opportunity).

Knowing the workaround tells you:
- What you're competing against (the workaround is your real competition)
- How much they currently pay (in time / $ / pain) — that's your price ceiling
- What "good enough" looks like (you must beat the workaround, not be perfect)

## Source for follow-up

- Companion: `mom-test.md`, `jobs-to-be-done.md`
- Inspired by Y Combinator's "Idea Stage Validation" curriculum and Tony Ulwick's outcome statement format.
