# Retro — enablement protocol missed the factory repo (2026-08-06)

**Trigger:** operator correction (non-trivial): a fresh session in the Hamzaish
repo produced no plan/receipt bookends; the operator asked whether Hamzaish was
in use at all — the exact invisibility v2.24.0 set out to kill.

**What happened:** the SessionStart hook (`factory/hooks/factory-session-context.sh`)
scopes by the product tendril marker and exits silently everywhere else —
including the factory repo itself. Factory-repo sessions (repo-scout runs,
factory-improving-factory work) are a primary operator surface and got zero
enablement. Compounding lapse in-session: the fresh-session reading list
(changelog included) was skipped, so the 2-day-old protocol wasn't picked up
from prose either — which is precisely why the mechanism must be a hook here too.

**Root cause:** scope enumeration stopped at "product repos" while the defect
being fixed was "the operator can't see the factory working" — which happens
most in the factory repo.

**Fix (proposed, awaiting operator approval):** extend the hook to detect the
factory repo (canonical-path match on `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}`)
and inject a factory-flavored protocol + command catalog; bookends stay gated by
`bun run check-legibility`. Ships as its own PR with this retro.

**Check-ladder:** the hook change IS the check (fires every session, prose-free).
Eval candidate on top: setup step 9's throwaway-HOME test gains a
factory-repo-cwd assertion so the scope can't silently narrow again.
