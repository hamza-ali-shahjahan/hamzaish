# ship-guard — Goal (forged via `/write-a-goal`)

> A goal you can't measure is a wish. This is the measurable, reachable target the
> MVP build is held to. Pursued via the factory's build engine; certifiable by a
> fresh-eyes scan of a known-bad fixture repo.

## Capability statement
Given any local git repo, `ship-guard` runs a local-only safety check that detects
the four ransack vectors (committed secrets, tracked secret files, force-push blast
radius, risky GitHub Actions) and prints a clear pass/fail report — and installs
itself as a pre-push hook with one command — with **no data leaving the machine**.

## The exact metric (Check A — pinned)
**Detection recall on a labelled fixture repo**, computed as
`true_positives / (true_positives + false_negatives)` against a hand-labelled set of
seeded findings, where a finding "matches" if ship-guard reports the correct
**file + check category** at **severity ≥ the label's severity**.
- Measured by: `code/test/run-evals.mjs`, which scans `code/test/fixtures/` (a repo
  with N seeded planted secrets/configs, each labelled) and diffs reported vs.
  expected.
- Split into two numbers so one can't hide the other:
  - **Recall** (caught the bad thing) — primary.
  - **False-positive rate** on a **clean** fixture (`false_positives / files_scanned`)
    — the anti-gaming guard.
- **Robustness clause:** a scanner that flags *everything* would score 100% recall,
  so recall alone is game-able. The clean-fixture false-positive count is the guard:
  the dumbest high-recall output (flag every line) fails it immediately.

## Numeric evals (≥2)
1. **Recall ≥ 0.90** on the bad-fixture repo (seeded: Anthropic key, `sk_live_`
   Clerk/Stripe key, private key block, Supabase `service_role` JWT, Postgres
   connection string w/ password, a tracked `.env`, a `pull_request_target`
   workflow, an unpinned third-party action). Target: catch ≥ 9 of every 10.
2. **False positives = 0** on the clean fixture (a normal repo with `.env.example`
   placeholders, anon/publishable keys, SHA-pinned first-party actions,
   `permissions: contents: read`). Placeholders and publishable keys must NOT trip
   a HIGH/CRITICAL finding.
3. **Install round-trip works:** `ship-guard install` in a throwaway repo writes a
   working `.git/hooks/pre-push` that blocks a push containing a seeded secret and
   allows a clean push. Binary pass/fail.

## Acceptance rule
Done when, on a fresh run: eval 1 ≥ 0.90 **and** eval 2 == 0 **and** eval 3 passes —
confirmed by re-running `code/test/run-evals.mjs` from a clean checkout.

## Non-goals (so we don't gold-plate)
- Not a SaaS, not a dashboard, no telemetry, no network calls. Local-first, full stop.
- Not a full git-history rewriter or secret-rotation tool (it *detects + reports*;
  rotation is the human's job — though it links the audit's rotation steps).
- Not a replacement for gitleaks/trufflehog's exhaustive entropy engine — it's a
  fast, opinionated, zero-dependency check of the specific vectors from the
  2026-06-19 repo audit. Deep entropy scanning is a v1+ lever, not the MVP bar.
- Not server-side branch-protection verification (can't be read from disk — ship-guard
  *reminds* the user to verify it, per the audit checklist).

## Feasibility verdict (Check B)
**Reachable.** All four checks are pattern/structure detection over files ship-guard
can read locally (tracked file list, file contents, workflow YAML, hook scripts,
marker files). The ceiling for recall on *known* patterns is ~100%; 0.90 leaves
headroom for regex edge cases. The lever that would raise the ceiling toward novel/
high-entropy secrets is an entropy + verified-detector engine (gitleaks-class) — out
of MVP scope, named here so effort goes to the known vectors first.
