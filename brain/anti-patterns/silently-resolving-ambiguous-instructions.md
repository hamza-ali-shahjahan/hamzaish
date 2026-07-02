# Anti-pattern: silently resolving an ambiguous instruction

**Date:** 2026-07-02 · **Incident:** "go no rerun it"

## What happened

The operator typed **"go no rerun it"** — readable as *"go on, rerun it"* or *"go, no — don't rerun it"*. Two readings, opposite actions. The session picked "go on, rerun it" and executed without flagging the fork. The guess was right (the operator confirmed after), and the action was low-stakes (`bun run setup` is idempotent) — but the *method* was a coin flip on a state-changing command, and nothing about it would have looked different if the guess had been wrong.

## The trap's shape

- Typos and fast phrasing routinely produce instructions with divergent readings; an agent biased toward momentum (correctly, in this factory) will resolve them unconsciously toward "proceed."
- The failure is invisible when the guess is right, which trains the habit that eventually guesses wrong — on a `git reset`, a publish, a send.
- "Ask about everything" is not the fix: constant clarifying questions kill Builder Mode, and the operator's own rules say reversible local actions need no permission. The problem is narrower: **resolution without disclosure**.

## The rule (three tiers)

1. **Stop and ask** when readings diverge into materially different actions AND any of them is destructive, irreversible, external-facing, or contradicts a logged decision/established flow. One question, readings listed, recommended first.
2. **Interpret and declare** for everything else ambiguous: take the momentum-preserving reading, say which reading you took ("reading this as X — say the word if you meant Y"), prefer the reversible path while doubt stands.
3. **Just proceed** when unambiguous or trivially reversible either way.

Guessing is fine; *silent* guessing is not — the same skip-loudly shape as validation debt (`check-validation`) and retro skips (`check-retro`), applied to language instead of files.

## Why this can't be a CI guard (named, not hidden)

No script detects ambiguous English. For judgment behaviors, the strongest wiring available is: this file (recallable via brain-ask + auto-injected recall), the protocol in the always-read `CLAUDE.md`/`AGENTS.md`, and the interpret-and-declare habit making every resolution visible — so a wrong guess surfaces in the same message that made it, while it's still cheap to undo.

## Where it's enforced

`CLAUDE.md` → Operating mode → Ambiguity protocol · `AGENTS.md` hard rule 11 · this file · ledger line in `BEST-PRACTICES.md` (✅ proven, 2026-07-02).
