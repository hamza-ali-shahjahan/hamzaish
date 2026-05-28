# meta/evals/

Eval harness for Hamzaish's skills and agents. **Aspirational in Phase A; formalized in Phase D.**

The idea: every skill and agent that ships gets a small set of canonical cases (5–10) that prove it does what it claims. Re-run on every significant change. A regression breaks the build, not the user.

## Layout (planned)

```
evals/
├── skills/
│   ├── ideate/
│   │   ├── cases/
│   │   │   ├── 01-saas-tool-ideation.yaml
│   │   │   └── ...
│   │   └── rubric.md
│   ├── validate/
│   │   └── cases/
│   └── ...
├── agents/
│   ├── idea-generator/
│   ├── devils-advocate/
│   └── ...
└── runners/
    └── eval.ts            # the harness that loads cases and checks outputs
```

## Patterns to borrow

- **gbrain/evals/** — see how Garry Tan benches his retrieval (P@5, R@5, BrainBench). Adapt structure for our skill evals.
- **hermes-agent/** — its self-improvement loop nudges the agent to extract skills from completed work. Use that pattern when promoting a session into a permanent skill.

## Don't ship in Phase A

This folder is intentionally empty for v1.0. Adding ~80 case files now is busywork before we've used the factory enough to know which skills matter. Populate in Phase D after Muakkil's buildathon retro identifies the load-bearing skills.

## When you finally do populate

Adding a skill without an eval is **debt**. Pay it down before adding the next skill.
