# GetHired — Learnings

## 2026-08-25 — Mechanics round

### Worked

- **The operator reading his own UI caught the biggest error.** "We keep it all right?" —
  the bid bar had been claiming a 10% cut of a payment with no second party for the whole
  build, straight through my own review. A number that renders is worth more scrutiny than
  a number in a spec; nobody had read that sentence as a customer would.
- **Pricing the fee table before choosing a floor.** Writing out what a $1 bid actually
  nets after 2.9% + 30c (67c) turned a design opinion into an arithmetic answer.
- **Refusing the literal feature request and saying why.** "Free for the first 100, then
  bidding starts" would have shipped a counter that counts down to nothing, because bidding
  already started at $1. Founding badges give the same urgency and the counter is true.

### Pitfall + fix

- **A client component imported a server module and only the BUILD caught it.** Adding
  `MIN_PAID_BID` to the bid bar from `lib/bids` dragged `lib/db` and the Postgres driver
  into the browser bundle. Typecheck passed. All 74 tests passed. `next build` died on
  `Can't resolve 'fs'`. **Fix:** `lib/auction-rules.ts` imports nothing and is what client
  components use — plus a test that reads the file and asserts it has zero import lines,
  because the next person to add a constant will reach for `lib/bids` again.
  **The general lesson: tests and typecheck do not see bundle boundaries. Run the build.**
- **Deleting `.next` while the dev server was running** left it serving 500s and looking
  like a code regression. Restart the server after clearing its build output.

### For next time

- Every user-visible number should be traceable to something real before it ships. The two
  found this round — a fee split that did not exist and a scarcity counter that would not
  have run out — were both invented numbers on a product whose pitch is that its numbers
  are real. Worth a standing check at review: *is this figure true, and what makes it true?*

## 2026-08-24 — Re-home, Postgres, payments, mobile

### Worked

- **Standing up a real Postgres in Docker before writing a line of migration code.** The
  first `npm run db:seed` failed instantly on `current_role` being a reserved word. That is
  a bug that would have shipped straight to a Neon deploy and looked like a mystery 500.
  A throwaway container costs one command; guessing costs a debugging session.
- **Auditing mobile in a browser at 375px instead of reading the classes.** The code *had*
  73 responsive utilities and looked "done". Actually rendering it showed names truncating
  mid-word, a headline squeezed into a two-word ribbon, and a textarea that would zoom iOS
  and never zoom back. None of that is visible from reading Tailwind classes.
- **Writing the invariant tests against the real database.** The concurrency test (two bids
  racing the same profile, exactly one wins) is the one that proves the advisory lock, and
  it could not have been written against a mock.
- **Letting the validation gate stop me.** It caught an unregistered product about to get
  production work, and forced an honest `debt-accepted` with a real catch-up trigger rather
  than a silent skip.

### Pitfall + fix

- **Reordering object properties silently changed the seeded market.** The PRNG is one
  stream, so the *order of draws* is part of the seed. Moving `created_at` into an object
  literal changed 87 documented candidates into 96. **Fix:** the draws are pulled into named
  consts in a fixed order, with a comment saying why. Determinism you cannot see is
  determinism you will break.
- **A CSS rule inside `@layer base` loses to Tailwind utilities.** The 16px input floor was
  written in `@layer base`, the audit still reported a 12px textarea, and it would have
  shipped as "fixed". **Fix:** the rule is unlayered at the bottom of `globals.css` —
  unlayered beats every layered rule regardless of source order. Verified after the change,
  not assumed by it.
- **Postgres returns `bigint` and `COUNT(*)` as strings.** Every timestamp and count in a
  SQLite→Postgres port is a silent-corruption site: `"1756070000000" + 1` is a string.
  **Fix:** one `num()` coercion in the row mappers, applied everywhere, including counts.
- **The SSRF guard checked the URL and then followed redirects.** Validating what the user
  typed is worthless if a public host can 302 to `169.254.169.254`. **Fix:** follow
  redirects by hand, re-check each hop, cap at 3. Found by actually running the security
  checklist rather than ticking it.
- **Verifying a localhost port without checking which server answered.** Port 3000 was held
  by another project's Next server; nine routes reported 404 and looked like real breakage.
  **Fix:** read the dev-server log for the port it actually bound before trusting any curl.

### For next time

- When a migration changes what a doc asserts (counts, stack, storage), fix the doc in the
  same commit. `CLAUDE.md` described a SQLite app with no auth and no payments right up
  until it was rewritten — a future session would have trusted it.
- A deploy blocked on operator secrets is not a failed deploy. Build everything up to the
  wall, verify the build passes with *no* env vars so the first real deploy goes green, and
  hand over exact steps.
