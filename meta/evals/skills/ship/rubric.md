# Eval rubric — /ship (contract pins)

/ship is a command (markdown protocol), so its eval is a **contract pin**, honestly
labeled: it asserts the command file still carries its load-bearing gates, not that a
model followed them (that behavioral layer is the /pr + CI flow itself). What it protects:
an edit that drops the security gate, the wip(auto) exclusion, or the production-branch
model would today change deploy behavior with zero test turning red — after this, one does.

## Assertions (all: the command file contains the line class)

| # | Pinned contract line |
|---|---|
| A1 | The `/security-check` gate (BLOCK verdict stops the ship) |
| A2 | `wip(auto)` snapshots never reach production |
| A3 | The `production` branch is the deploy target |
