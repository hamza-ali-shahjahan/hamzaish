# 2026-08-16 — The verification ledger + three honesty gates (from the fable-os / deepseek-harness study)

**Decision.** Ship a recorded-verification layer and make three prose disciplines
mechanical, after a code-grounded study of two external repos
(`robiot/fable-os`, `deepseek-ai/deepseek-harness`):

1. **`bun run verify`** — a gate runner that spawns each check as a real process,
   records the true exit code to a hash-chained ledger
   (`meta/telemetry/verification/*.local.jsonl`, gitignored), and renders the
   receipt's *Checked* line from those records. An empty ledger renders
   "nothing was verified"; a broken chain renders "altered". Named
   **tamper-evident, not unforgeable**, in the code and in the README.
2. **`bun run check-limitations`** — every skill declares what it can't do
   (`## Known limits`), as a ratchet: 4 covered, 74 grandfathered.
3. **`bun run check-decisions`** — decision records carry decision · why ·
   alternatives · wrong-if · revisit, as a ratchet: 2 compliant, 28
   grandfathered. AGENTS.md rules #3, #15, #16 updated to match.
4. **`trim-session-leakage`** skill — finds prose written from the authoring
   session's vantage rather than the repo's.
5. **`evidence/`** — dated artifacts behind claims, failures included; seeded with
   this build's own run, in which `check-counts` genuinely failed.
6. **README rewritten** — 4,632 → ~2,100 words of prose, demo before claim,
   install at line 66 (was ~103), catalog collapsed, a visible
   *Known weaknesses* section, comparison table moved to `docs/philosophy.md`.
7. **`docs/host-portability.md`** — what would carry to a second host, explicitly
   marked mapped-not-tested.

**Why.** Both studied repos beat this factory at *inspectable* honesty, in
opposite ways. fable-os enforces an unforgeable kernel trace channel and keeps
26 run artifacts whose index leads with failures; deepseek-harness makes candour
a lint (`verify-package-readme-limitations.ts`) and gates 688 agent-authored
decision records on a mandatory *Alternatives considered* section. Meanwhile the
factory's own honesty was principle-shaped: `check-legibility` lints a receipt's
vocabulary and shape but never its truth, so "Checked: gates pass" was
unfalsifiable narration. The measurement that settled it — running the new gates
on this repo found 26 of 28 decision records missing only *alternatives*, and
`check-counts` failing on a real rule-#12 violation nobody had noticed.

**Alternatives considered.**
- *Rebuild as a plugin architecture like deepseek-harness.* Rejected: that is a
  22-engineer runtime with a forked meta-framework, and markdown-a-human-can-read
  is this factory's differentiator, not a limitation to engineer away. Their own
  docs recommend using an agent to explore their codebase; ours should never need to.
- *A hard limitations/decisions gate instead of a ratchet.* Rejected: 73 of 74
  skills would fail on day one, which floods CI red or tempts aspirational
  one-liners — the exact trap the 2026-07-02 eval-coverage ratchet was created to
  avoid. Precedent followed rather than re-litigated.
- *Claim the ledger is unforgeable.* Rejected as false: a single agent with a
  shell can append a record. Claiming a ring-0-style guarantee we cannot deliver
  would be the precise failure this whole change exists to prevent.
- *Port to DeepSeek Harness now to prove host-independence.* Deferred, not
  rejected: it requires installing a 3-day-old preview that advertises breaking
  changes. Mapped in `docs/host-portability.md` instead, with the trial shape
  written down and the claim explicitly withheld.
- *Copy mechanisms from fable-os directly.* Impossible — it has **no license
  file**, so all rights are reserved. Every idea taken from it was reimplemented
  from a described mechanism, never copied.

**What would prove it wrong.** If the ledger's *Checked* line is routinely
bypassed — receipts still hand-written while `verify` goes unrun — the mechanism
lost to friction and should be moved into the Stop hook or dropped, not left as
decoration. If `check-limitations` produces 70 one-line "limits: none known"
sections, the gate bought compliance instead of thought and should be replaced by
review. If no `evidence/` folder is added by the next `/learn-loop`, the folder is
theatre. If the decisions backlog is still ~28 at the next quarterly, the ratchet
has no climbing force and needs a per-cycle quota instead.

**Revisit.** At the next `/learn-loop`: ledger-usage rate and evidence-folder
count. At the next quarterly `/kill-or-keep` on Hamzaish itself: whether the two
new ratchets moved at all — a ratchet that never advances is a dead instrument
and gets sunset under the same rule as dead telemetry. Watch triggers for the two
studied repos live in `docs/host-portability.md`; neither has entered
`references/` or the credits roll, which stays operator-gated.
