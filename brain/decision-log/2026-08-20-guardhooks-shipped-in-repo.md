# 2026-08-20 — Ship the guard hooks in-repo as an opt-in policy layer

**Decision.** Move the four `PreToolUse` guards from operator-local
(`~/.claude/hooks/`) into [`factory/hooks/guardhooks/`](../../factory/hooks/guardhooks/)
as a shipped, opt-in layer:

1. **Four guards, config-driven** — `guard-repo-visibility`, `guard-force-push`,
   `guard-mass-delete`, `guard-secrets-files`. All four were already
   name-neutral and driven by `guardhooks.conf`; this ports them, not rewrites
   them.
2. **`guardhooks.conf.example`** — every knob documented, safe defaults when the
   file is absent.
3. **58 tests** (`factory/hooks/guardhooks/guardhooks.test.ts`) — each guard
   asserts both halves of its contract: it blocks the unrecoverable action, and
   it fails open on ordinary work. Mutation-checked: neutering one guard fails
   exactly its 9 blocking cases.
4. **Consent-gated install** — `bun run setup` step 10, following step 9's
   precedent (`HAMZAISH_REGISTER_GUARDS=yes|no`), idempotent, verified against a
   throwaway `HOME`.
5. **[`docs/agent-governance.md`](../../docs/agent-governance.md)** — the four
   enforcement layers (guards, verification ledger, blind eval judge, brain),
   each with the file it lives in and the command that exercises it, plus an
   explicit *what isn't built* section.

The operator's live `~/.claude/hooks/` configuration was **deliberately not
touched**. Their machine's protection is unchanged; the repo now carries its own
copy.

**Why.** The strongest safety mechanism in this setup was invisible to anyone who
cloned the repo. A factory whose README claims honesty-is-enforced-not-promised,
while its actual enforcement layer lives in one person's home directory, is
making a claim its readers cannot verify — the same defect as a hand-written
*Checked* line, one level up. The 2026-08-16 verification work fixed that for
gate results; this fixes it for policy. The cost was low because two of the four
guards were already fully portable and the other two turned out to be as well
(the personal-looking copies at `~/.claude/hooks/*.sh` are superseded versions
still registered alongside the real ones).

**Alternatives considered.**
- *Write the governance doc without shipping the guards.* Rejected — prose
  describing machinery that isn't in the repo is precisely the unfalsifiable
  narration that `check-legibility` can lint the shape of but never the truth
  of. Documenting an absent mechanism would have been a worse version of the
  problem this repo just spent a cycle fixing.
- *Install the guards by default, no prompt.* Rejected — these hooks can block
  tool calls in **every session on the machine**, not just in this repo.
  Silently installing a blocking hook is a larger consent violation than the one
  the guards defend against. Opt-in with a visible prompt, same shape as step 9.
- *Rewrite them as a Bun/TypeScript hook runner.* Rejected — shell is what can
  run before a tool call with no runtime dependency and no startup cost. A TS
  runner would add a Bun boot to every guarded tool call and buy no safety.
- *Register the hooks pointing at the `~/.claude` copies.* Rejected — the repo
  would still not be the source of truth, and a fresh clone would get nothing.
- *Bundle the brain-over-MCP door into the same cycle.* Deferred, not rejected.
  Three new surfaces at once, and exposing the brain over MCP is its own
  security question — `scripts/check-mcp-config.ts` exists because MCP configs
  are an attack surface. It gets its own slice.
- *Generalise the guards first.* Turned out to be unnecessary work based on
  reading superseded files; see the learning entry. The live set was already
  portable.

**What would prove it wrong.** If the guards throw false positives often enough
that people uninstall them, the fail-open discipline failed and the patterns need
narrowing — one such false positive already surfaced *during this build*
(authoring a script containing a guarded command string reads as performing it;
recorded in the folder's *Known limits*). If nobody who clones ever accepts the
consent prompt, the layer is decoration and should be either default-on or
dropped rather than left as an unused option. If the one-shot override tokens
prove too clumsy in a real approved-exception moment, the escape-hatch design is
wrong and standing env vars win.

**Revisit.** At the next `/learn-loop`: whether any guard fired in anger, and
whether any fired wrongly. At the next quarterly `/kill-or-keep` on Hamzaish
itself: whether anyone outside this machine installed them — an opt-in nobody
opts into is a dead instrument under the same rule that sunsets dead telemetry.
Separately: the operator's machine currently registers **both** the superseded
top-level guards and the `guardhooks/` set, so two copies of two guards fire on
every matching call. Harmless but redundant — worth a cleanup pass, and
deliberately left alone here rather than changed without asking.
