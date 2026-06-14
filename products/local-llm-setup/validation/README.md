# Validation Ledger — local-llm-setup

The momentum-first validation rail, made checkable. `scripts/check-validation.ts <slug>` reads the **State** line below.

**The rail**: before expensive or irreversible bets, aim for ~5 conversations with target-profile users. Cheap, fast, reversible builds are their own validation — the ship is the test.

## Status
- **State**: `validated`  <!-- unvalidated | in-progress | validated | debt-accepted -->
- **Evidence count**: dogfood (the build is the test)

## Evidence
A single-file, free, reversible CLI where the maintainer is squarely in the target profile (wants a private local model as insurance). Per the rail, **the ship is the test** for a build this cheap and reversible — and it was then *actually used*:

### 2026-06-14 — Maintainer (target-profile: developer wanting a local model as cloud-independence insurance)
- Problem in their own words: cloud AI tools can change rules overnight; want to own part of the stack.
- Current workaround / what they pay today: cloud-only; the setup friction is what blocked going local before.
- Reaction to the idea (signal, not politeness): built it, then **ran it end-to-end and got a working 14B coder model at ~25.7 tok/s** — used in earnest, not just installed.
- Would-pay signal: it's free OSS; the "payment" is adoption + sharing (LinkedIn drafted, HN/Reddit candidate).

## Notes
This is a personal-utility / insurance tool, not a revenue product — validation here means "real users (starting with us) get the promised outcome," and the dogfood run confirmed it. Broader external validation will come from public launch (Show HN / r/LocalLLaMA) signal.
