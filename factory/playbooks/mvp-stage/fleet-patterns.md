# Fleet patterns — fan out blind, verify adversarially, synthesize with a judge

The factory's protocols are multi-perspective by design (five validation agents, five review axes, fourteen security categories) but were written for serial execution in one context. When subagent spawning is available (Agent tool, Workflow steps, the headless runtime), the same protocols run as a **fleet** — faster *and* more rigorous, because independence and adversarial verification are things a single context structurally can't give itself.

**Model note:** spawned fleet members get their model from the model policy (`model_tier:` frontmatter via `factory/runtime/model-policy.ts`); verifier/judge roles warrant the top tier — adversarial reasoning is the whole job.

## The canonical shape (three moves, always the same)

1. **Fan out blind.** Spawn N workers, each with ONE lens/category and the shared input — and *no sight of each other's output*. Independence is the point: agreement between blind workers is signal; agreement between workers who read each other is contagion.
2. **Verify adversarially.** Every finding that could block, kill, or gate gets a fresh verifier whose explicit job is to **refute it** ("default to refuted if uncertain"). Only findings that survive refutation reach the report. This kills the plausible-but-wrong findings that erode trust in automated review.
3. **Synthesize with a judge.** One synthesis pass reads everything: where blind workers *agree* (high confidence), where they *disagree* (the real open questions — never average them away), and forces the protocol's verdict (GO/PAUSE/KILL, BLOCK/CLEAR, APPROVE/REQUEST-CHANGES).

## Where each protocol maps

| Protocol | Fan-out (blind) | Verify | Judge output |
|---|---|---|---|
| `/validate` | sharpener · devils-advocate · market · competitors (4 concurrent; discovery-plan follows) | refute the kill case AND the strongest FOR evidence | GO / PAUSE / KILL snapshot |
| `/security-check` + security-reviewer | one worker per category (secrets, actions, backend-reality, RLS…) | each would-be BLOCK finding gets a refuter | BLOCK / CLEAR verdict |
| `/review` (5-axis) | one reviewer per axis: correctness, readability, architecture, security, performance | Critical findings adversarially verified before they gate | APPROVE / REQUEST CHANGES |
| devils-advocate (panel mode) | 3 skeptic lenses: market-timing · moat/copyability · founder-fit | n/a (the panel IS the attack) | agreement = high-confidence kill signals; disagreement = the assumptions to test |
| `/kill-or-double-down` | one analyst per product, blind to siblings (prevents halo) | challenge each DOUBLE-DOWN against the PMF bar | portfolio allocation |

## Rules

- **Serial stays first-class.** Every protocol must still work in one context (headless evals run that way). Fleet mode is an upgrade when spawning is available, never a requirement — the deliverable format is identical either way.
- **Blind means blind.** Workers get the input and their lens, not each other's findings, not the synthesis rubric.
- **Refuters default to refuted.** An unverifiable blocking finding is reported as *unverified*, not silently dropped and not allowed to block.
- **Disagreement is output.** The judge reports splits explicitly ("2 of 3 skeptics call this fatal; the third finds the moat claim credible") — that's where the operator's attention should go.
- **Cost sanity:** fleet mode is for verdicts that gate real decisions (a launch, a kill, a merge). A quick gut check stays one agent, one context.

**Credit (port the idea, never the code):** the fan-out/verify/judge shape is standard multi-agent verification practice — parallel finders + adversarial verification as used in Claude Code's own review workflows; panel-of-judges evaluation from LLM-eval literature (Hamel Husain's eval essays; Anthropic evaluation guidance).
