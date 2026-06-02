# Philosophy — the default is momentum

> **Hamzaish isn't a strategy funnel with a build step at the end. It's a build
> accelerator that happens to have strategy rails you pull in when you want them.
> The default is momentum.**

You should *feel* that the moment you arrive. Type `/hamzaish`, and the default
is to **build**. Everything else — scoring an idea, picking a niche, pricing,
go-to-market — is a side door you open on purpose, never a toll you pay to get
in.

## Why build-first

Most "founder OS" tooling fails the same way: it taxes you with analysis before
it lets you make anything. That kills the one thing a solo builder can't get
back — momentum. So Hamzaish inverts the usual order:

- **Express by default.** `/hamzaish` → just build → `/full-cycle` (or `/auto`).
- **Strategy is opt-in.** The rails exist (idea validation, pricing, GTM) and
  they're good — but you choose them; they don't gate you.
- **Skip is first-class.** At every step there's a "skip to build." You never
  have to opt *out* of a process to start working.

The only thing that can stop you is a *fatal* problem, and even that is a
skippable 30-second gut-check (is this legal/consented? is it reversible? do I
have the access I need?). "Could be better" is never a reason to stop.

## When skipping strategy is the *right* call

Skipping isn't laziness — for cheap, reversible work it's the correct move. The
heuristic, baked into the router:

> **Just build** when it's cheap, fast, and reversible — a landing page, a
> prototype, a single vertical skin. The thing you ship *is* the validation.
>
> **Pull in strategy** when it's expensive, slow, or hard to undo — or right
> before you spend real money on ads or sales.

A landing page to test a niche? Ship it — the page is the experiment. A whole new
product, or a paid acquisition push? *That's* when niche-validation and pricing
earn their keep.

## The system gets smarter every ship

Momentum without memory just repeats mistakes faster. So every product carries a
`learnings.md`, and when a mistake generalizes it's promoted to a **guardrail**
inside the relevant `factory/` agent (and logged in `meta/changelog.md`). The
promise is concrete: *the mistake we made last time is encoded into the tool that
runs next time, so you don't repeat it.* See
[Architecture → the learnings loop](./architecture.md#the-learnings--guardrails-loop).

This is the **learning flywheel** in Andrej Karpathy's sense — eval-driven
iteration where each cycle's output (what worked, what broke) becomes the next
cycle's input. Hamzaish applies it to *building products*, not just training
models: ship → capture the lesson → harden the tool → ship faster and safer.
