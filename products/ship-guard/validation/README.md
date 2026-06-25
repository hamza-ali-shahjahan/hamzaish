# Validation Ledger — ship-guard

The momentum-first validation rail, made checkable.

## Status
- **State**: `debt-accepted`  <!-- unvalidated | in-progress | validated | debt-accepted -->
- **Evidence count**: n/a (building first — the build IS the test)

## Validation debt (we built before formal interviews)
### 2026-06-23 — Building before 5 conversations
- **Why now**: ship-guard packages a security audit run *today* across ~40 of the
  operator's own repos (`meta/security/REPO-ACCOUNT-SECURITY-AUDIT.md`). The pain is
  proven and the operator is the first target user (40 repos, several with live
  secrets on disk). The check set is reverse-engineered from real findings, not
  guessed. The build is cheap, fast, reversible (a local CLI), and held LOCAL —
  exactly the case where "the ship is the test."
- **What would make me stop and validate**: before any *public launch* / paid
  positioning — i.e. before `/publish-repo` or any GTM spend — run ~5 conversations
  with other indie/solo devs to confirm the install ergonomics and check set land.
- **Catch-up trigger**: at the publish gate (currently HELD). Until then, the
  operator's own 40-repo fleet is the live test bed.
