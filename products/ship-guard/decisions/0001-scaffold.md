## 2026-06-23 — Scaffolded ship-guard

**Decision**: Birth a new product, `ship-guard`, via the factory flow
(`/write-a-goal` → `/scaffold` convention → `/build`). It packages the
2026-06-19 repo/account security audit into a reusable, local-first CLI + git
pre-push hook.

**Why**: The audit (`meta/security/REPO-ACCOUNT-SECURITY-AUDIT.md`) was high-value
but one-off and manual. The same four checks — committed secrets, tracked secret
files, force-push blast radius, risky Actions — recur on every repo and every
push. A droppable hook turns a one-time audit into a standing guard.

**Stack deviation**: NOT the default Next.js starter. ship-guard is a CLI/git-hook,
so `code/` is a **single-file, zero-dependency Node script** (runs on Node 16+ and
Bun) instead of a web app. Rationale: a security tool must be trivially droppable
into any repo with no install footprint and no supply chain; one vendored file +
a shell hook is the smallest trustworthy surface. Recorded here per stack rule 7.

**What would prove it wrong**: if the zero-dep regex approach has unacceptable
false positives/negatives vs. a real entropy engine, or if Node-everywhere is a bad
assumption for the target user — then pivot to a gitleaks wrapper or a static binary.

**Revisit trigger**: at the publish gate, or if eval recall < 0.90 / clean-fixture
false positives > 0.

**Hold**: HELD LOCAL by operator instruction — no public GitHub repo, nothing
pushed. Name `ship-guard` is operator-approved to *use*, but publish/name-clearance
is pending explicit go-ahead.
