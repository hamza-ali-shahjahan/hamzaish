# Factory Improving the Factory

The non-negotiable meta-rule: **Hamzaish improves Hamzaish.** Every product cycle leaves the factory more capable than it found it. If it doesn't, we've broken the rule.

## The loop

```
Use the factory on a product   →   Notice friction   →   Capture the learning   →   Update the factory   →   Reuse on next product
       ↑                                                                                                                    │
       └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Each arrow is a discrete action with a home in this repo:

| Arrow | Action | Home |
|---|---|---|
| Use the factory | Invoke a skill or agent | `factory/` |
| Notice friction | Pause when something feels off, repeated, or wrong-shaped | (mental) |
| Capture the learning | Append to today's learning file | `brain/learnings/YYYY-MM-DD.md` |
| Update the factory | Patch a skill, write a new playbook, retire an anti-pattern | `factory/skills/`, `factory/playbooks/`, `brain/anti-patterns/` |
| Reuse | Next invocation uses the improved version | `factory/` |

## What counts as "friction worth capturing"

**High signal — capture immediately:**
- The user corrected you on a non-trivial point ("no, not that — use the symlink, not a copy")
- You re-derived something you've already figured out before
- A skill produced a wrong-shaped output (right intent, wrong format)
- You hit a dead-end and pivoted — record what you ruled out and why
- A pattern *worked surprisingly well* — that's a candidate for a new playbook
- An external assumption turned out wrong (API behaves differently, library moved, repo abandoned)

**Low signal — skip:**
- Typos, one-off tool errors, transient network issues
- Routine work where everything went as expected
- Tangents the user explicitly told you to drop

## Where each kind of learning lives

| Kind of learning | Where it lives | Why |
|---|---|---|
| "When X happens, do Y" (a routing rule) | `CLAUDE.md` (top-level routing table) | Read every session |
| A reusable how-to (Mom Test, Sean Ellis, etc.) | `factory/playbooks/` | Loaded on demand by skills |
| A skill that should be permanent | `factory/skills/<slug>/SKILL.md` | Auto-discovered as `/<slug>` |
| A thing-not-to-do | `brain/anti-patterns/<slug>.md` | Re-read when about to repeat |
| A working preference / user style | `brain/identity/` | Affects voice and decisions |
| A cross-product strategic call | `brain/decision-log/` | Spans products |
| A retro of a sprint/buildathon | `meta/retros/` | Time-stamped reflection |
| Something Hamzaish changed about itself | `meta/changelog.md` | Append-only version log |

## End-of-session checklist

If the session did real work, before ending:

- [ ] Did anything surprise me? → write a `brain/learnings/YYYY-MM-DD.md` entry
- [ ] Did I re-derive anything? → it goes in `factory/playbooks/` or `factory/skills/`
- [ ] Did I get corrected? → check whether it belongs in `brain/anti-patterns/`, `CLAUDE.md`, or `brain/identity/`
- [ ] Did a product move stages, ship, or fail? → write a `meta/retros/` entry
- [ ] Did I change Hamzaish itself? → append to `meta/changelog.md`

## Quarterly: kill-or-keep on Hamzaish itself

`/kill-or-keep` runs on the *factory*, not just products. Every quarter:

- Which skills got invoked? Which never did? Sunset the unused.
- Which playbooks are out of date (last edit > 6 months ago AND irrelevant to recent work)?
- Which anti-patterns no longer apply (we learned the real shape)?
- Which products in the portfolio should be sunset based on traction?

The factory has the same scope discipline as a product. Bloat in `factory/` slows every session.

## Eval harness

`meta/evals/` defines canonical cases per skill and per agent. Run on every significant change. Track regressions. **Adding a skill without an eval is debt; we pay it down before adding the next skill.** (Aspirational in Phase A — formalized in Phase D.)

## The anti-rule

If the factory ever feels like a museum — read but not edited — it has drifted into mere documentation. Hamzaish must be **lived in**. Skills get rewritten. Playbooks get retired. Agents get refactored. The current version of Hamzaish is the one that just helped ship a product, not the one that was perfect when written.
