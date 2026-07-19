# 2026-07-14 — Adopt claude-reflect's automatic capture, not its storage target

**Decision.** From the read-only study of Bayram Annakov's
[claude-reflect](https://github.com/BayramAnnakov/claude-reflect) (MIT) —
`_claude-reflect-study/LEVERAGE-FOR-HAMZAISH.md`, 2026-07-05 — Hamzaish adopts the
**capture mechanism** (a `UserPromptSubmit` hook that detects corrections /
guardrails / explicit "remember" / praise, scores them, and queues them) and
explicitly does **not** adopt claude-reflect's **storage target** (auto-appending
bullets into `CLAUDE.md`). First cut shipped on branch `feat/auto-capture-hook`:
`factory/hooks/capture-learning.ts` (+ tests + README) writing a gitignored
per-project queue under `~/.claude`, and `/reflect` (`factory/commands/reflect.md`)
as the human review gate that hands distilled survivors to the unchanged
`/learn-loop` promotion machinery.

**Why.** Capture was Hamzaish's one weak link: the learning machine (`/learn-loop`
5-axis + fresh-eyes, `/kill-or-keep` outcome-based sunset) is already *better* than
claude-reflect's single 0–1 confidence and blind decay, but it can only score what
got written down — and writing it down was manual (the model had to remember to
append to `brain/learnings/`). Automating capture feeds the machine a complete
inbox without touching the parts Hamzaish does better. Adopting claude-reflect's
*storage* would have fought two existing rules — the 300-line `CLAUDE.md` cap and
the `hand-maintained-facts-drift` anti-pattern — and its raw-message-to-commit path
brushes the conversations-never-in-a-repo invariant. So: borrow the front end, keep
our back end.

**Guardrails honored.** Hook is fail-open (any error → exit 0, no stdout — a
`UserPromptSubmit` hook that printed would inject context; a non-zero exit would
block the prompt). Secret-shaped prompts are dropped before queueing. The queue
holds raw text but lives only in `~/.claude` (gitignored); `/reflect` **distills**
into committed files, never pastes. Capture is automatic; **promotion stays behind
`/learn-loop`'s gate**. Activation is opt-in — the branch ships the hook inert; the
operator wires it into `~/.claude/settings.json` (snippet in `factory/hooks/README.md`).
Nothing auto-enabled, nothing merged, nothing deployed.

**Wrong if.** (a) The queue fills with low-value praise/noise the operator always
skips at `/reflect` — then tighten the detector patterns or drop the `positive`
tier; (b) capture-time confidence starts being treated as promotion authority
instead of inbox triage — that would regress to a weaker signal than the 5-axis
rubric and must be resisted; (c) the regex misses non-English corrections at a
material rate — then add claude-reflect's deferred semantic pass (`claude -p`) as a
`/reflect`-time classifier, which also feeds the separately-tracked semantic-layer
work (`2026-07-03-semantic-layer-is-the-moat`).

**Revisit trigger.** After the first two weeks of the hook being *activated* (not
just merged): review the queue's precision at `/reflect`. Also revisit alongside
the Fable 5 brain upgrade (`hamzaish-fable5-upgrade-proposal.md`), which should
absorb this capture layer as its front end rather than re-inventing one. Related
study follow-ups still open from §3 of the leverage doc: `/brain-dedupe` (semantic
dedup), correction→exact-SKILL.md routing, and a `/discover-skills` detector.
