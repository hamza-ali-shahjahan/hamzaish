# Where Hamzaish Is Going — The Self-Evolution Story

> The plain-language north star. Read this to understand *where the factory is headed and why*. If you're a builder picking up Hamzaish, start here. Detailed build plans live in `meta/evals/PLAN.md` and the changelog; this is the map above them.

## The one idea

**Hamzaish already improves itself — but by hand. The whole journey is about making that automatic, then shared.**

Right now, when a build teaches us something (a pattern that worked, a mistake to never repeat), a human-or-Claude *notices* it, writes it down in `brain/learnings/`, and *decides* whether it's worth promoting into a permanent rule (`factory/playbooks/` or `brain/anti-patterns/`). That noticing-and-deciding is the factory evolving. It works. But it depends on someone paying attention every time.

Self-evolution means: **the factory notices, tests, and keeps the good lessons on its own** — with the human moving *up* to owning the goals and ratifying the big calls, never *out* of the loop.

## How evolution actually works (and where we stand)

Real evolution needs three things. Here's where each one is in Hamzaish today:

| Ingredient | Plain meaning | Hamzaish status |
|---|---|---|
| **Variation** | Try lots of things | ✅ **Strong.** Every product build, every learning, every retro is a new attempt. |
| **Heredity** | Keep what survives, pass it on | ⚠️ **Exists, but manual.** Learnings → playbooks → guardrails, hand-carried by whoever's paying attention. |
| **Selection** | An honest judge of what actually worked | ❌ **Missing.** Today the "judge" is a human eyeballing. That's not selection — it's opinion. |

**The entire path to self-evolution reduces to one move: replace eyeball-selection with an honest, automated judge.** Everything else is detail.

## Why the judge has to be "blind"

The single most important rule, and the least obvious one:

> **The thing being judged must not be able to see or change the test.**

If the builder can edit the test, it will (consciously or not) make the test pass instead of making the work good. A system that grades its own homework drifts into self-congratulation. So the eval harness — the judge — is walled off. The builder gets the task; a separate, frozen judge decides if it's done. **Trust comes from separation, not from re-checking.**

This is counter-intuitive: the way to need *fewer* humans watching is *more* rigor and *more* separation, not less.

## The two reasons the factory asks for help — only one is a problem

When the factory gets stuck and pings a human, it's for one of two reasons. Telling them apart is the whole game:

- **"I'm not sure I did this right."** → This is **waste.** It means our tests aren't sharp enough. We fix it by writing better tests. Goal: drive this to zero.
- **"You never told me what to do here."** → This is **signal.** The spec was silent. The factory should *never guess* — it should flag the gap, batch it, and wait for you to decide. Guessing on gaps is how vibe-coding sneaks back in.

A healthy factory has the first kind trending to zero and the second kind staying alive and informative. **If the factory stops flagging gaps entirely, be suspicious — it's probably guessing instead of asking.**

## The three movements

### Movement 1 — Give the factory an honest judge (Selection)
*Turn eyeball-selection into an automated, blind verdict.*

This is the keystone. It's what we already call **Phase D (the eval harness)**. The upgrade from the brief: the verdict isn't just pass/fail — it's four outcomes (done / broken-but-clear / gap / unsure), and the judge is walled off from the builder.

**The elegant part:** we don't build this as a separate project competing with shipping products. Muakkil's buildathon *already needs* a 10-charge eval for its orchestrator. **That eval is the first brick of the judge.** Build it inside Muakkil; extract the reusable pattern afterward. The first product pays for the judge; every future product inherits it.

### Movement 2 — Close the lesson loop (Heredity, automated)
*Stop hand-carrying lessons into rules.*

Today a human promotes a learning into a guardrail. Movement 2 automates it: when the factory hits a genuine gap, it writes a **proposal** (instead of guessing). You ratify proposals in a batch — not a stream of interruptions. Ratified proposals become permanent rules the next build inherits automatically.

This isn't a new capability. It's the heredity Hamzaish *already does by hand*, cranked faster.

### Movement 3 — Many builders, shared lessons (Coordination)
*One factory that learns becomes many factories that learn together.*

The end state: lots of builders each running their own Hamzaish, each generating lessons, with the *verified* lessons flowing into a shared library everyone inherits. One person's hard-won "don't do X" becomes everyone's guardrail.

**We've already planted this seed.** The `products/_community/` folder and the maintainer-verification flow (shipped v1.7) are the embryo of the shared tier. Community contributions aren't separate from self-evolution — they *are* self-coordination in its earliest form.

This movement stays last. You don't coordinate many loops until one loop reliably self-evolves — otherwise you're just multiplying mess.

## Where `/spec` fits — the thing that compounds

The deepest reframe: **the spec is the product; the code is a regenerable byproduct** (true for most products; less so where the design itself is the moat).

We have a `/spec` skill already. The upgrade that turns it into the engine of evolution: **`/spec` writes specs *with executable scenarios*** — scenarios that are simultaneously the contract *and* the test the judge runs. Spec and test, fused.

That fusion is the bridge from "spec-driven development" (what `/spec` does now) to "self-evolving" (specs that get better under an honest judge). When a build can't satisfy a scenario because the spec was silent → that's a gap → it routes up → the spec improves → the next build inherits the better spec. **The corpus of specs and scenarios is the asset that compounds. Code is just this week's rendering of it.**

## What stays frozen (so the system can't cheat)

A few things are **off-limits to every automated loop** — only the human edits them:
- **Goals** — what we're trying to achieve (today: `brain/operating-principles.md`)
- **Verified knowledge** — ground truth the factory can propose changes to, but never silently rewrite

This is the line between a factory that *evolves* and one that *deceives itself*. If the factory could rewrite its own goals, it would eventually redefine "success" to mean "whatever I just did." The frozen tier is the fixed star it steers by.

## The rungs, in order (don't skip)

```
Open  →  Closed  →  Self-cranking  →  Self-evolving  →  Self-coordinating
                     (Movement 1        (Movement 2)      (Movement 3)
                      builds toward)
 ↑ we're here (Closed): we have verify gates, but selection is still eyeball
```

Each rung must be solid before the next. We earn self-coordination by first making one product's loop genuinely self-evolve.

## Humans don't leave — they move up

The point is **not** to remove the builder. It's to move them up the stack:
- From writing every line → to **owning the goals**
- From reviewing every diff → to **ratifying the gaps**
- From hoping it's right → to **deciding what "right" means**, once, in a way the factory then enforces forever

The thinking is amplified, never outsourced. This is the opposite of "let the AI figure it out." It's "make the standards so explicit that the AI must obey them — and make obedience checkable."

## What's deliberately NOT happening yet

- No multi-VM fleet, no control plane, no cross-product coordination engine. (Movement 3's machinery — premature until Movement 1 + 2 are real.)
- No directory-structure overhaul. We *layer* these ideas onto `brain/ factory/ products/ meta/`, not rename everything. We restructured once already; we're not doing it again without a reason that earns it.
- No building any of this until Muakkil ships. Muakkil is the proof story; the judge is born inside it.

## The sequence, in one breath

> Ship Muakkil → its orchestrator eval becomes the first brick of an honest, blind judge → extract that judge into the factory (Movement 1) → automate the gap-to-guardrail lesson loop the factory already runs by hand (Movement 2) → let many builders share verified lessons through the community tier we already seeded (Movement 3). Specs fused with scenarios are the thing that compounds. Goals stay frozen so the system can't cheat. Humans move up, never out.

---

*Companion docs: the brief this was distilled from lives at `brain/knowledge/2026-06-02-self-evolving-upgrade-brief.md`; the concrete build plan for Movement 1 is `meta/evals/PLAN.md`; the maturity-ladder rule and the factory-improving-the-factory loop are in `meta/factory-improving-factory.md`.*
