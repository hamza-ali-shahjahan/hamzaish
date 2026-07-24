# ship-guard — Live Status

**Stage**: launch
**Status**: LIVE — [public on GitHub](https://github.com/hamza-ali-shahjahan/ship-guard) (2026-06-25, MIT, CI green). Code repo: `~/Claude/ShipGuard`. Name kept after clearance (RED was npm/brand-only; repo name free). Not on npm (distributed via clone / `npx github:`).

## North star this sprint
> A `git push` that would leak a live secret, ship a tracked `.env`, arm a history-wipe,
> or merge a fork-exploitable workflow gets **blocked locally before it leaves the machine** —
> with one command to install and zero config.

## Active sessions (lock)
| Session / branch | Scope (files/area owned) | Status | As of |
|---|---|---|---|
| main (this session) | products/ship-guard/** | building MVP | 2026-06-23 |

## Open immediately
- v1 hardening (see README "Left for v1"): scan the actual push commit-range in hook
  mode; `.shipguardignore` support; full YAML parse for Actions; optional gitleaks
  hand-off; entropy detector.

<!-- Stale "Hold — do NOT publish" block removed 2026-07-24: it predated the 2026-06-25
     publish decision (decisions/0002) and contradicted the LIVE state above. ->
