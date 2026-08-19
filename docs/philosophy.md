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

## How it compares

**Not another AI coding setup.** AI already writes your code — nobody's running
your launch, your pricing, your first hundred customers, or the kill call.

| | build-stage setups<br>(gstack / BMAD / SuperClaude) | AI app builders<br>(Lovable / v0 / Bolt) | agent hosts<br>(Claude Code / DeepSeek Harness) | agent frameworks<br>(AutoGPT / crewAI) | **Hamzaish** |
|---|---|---|---|---|---|
| Scope | build stage only | build + host a prototype | the session and its tools | a framework you assemble | **a product's whole life** |
| The output | code | an app on their platform | a running agent | an agent run | **a live product on your domain** |
| After "code is done" | you're on your own | hosting, then you're on your own | not its job | you're on your own | **launch, sell, scale, kill rails** |
| Memory across projects | per-session | per-project | per-session | per-run | **persistent brain + learnings loop** |
| Measures agent success | no | no | no | no | **eval-gated, and honest that it's early** |
| Runs on | config + tools | their cloud | itself | a Python service | **a folder + whichever host you use** |
| Form | config | closed platform | a runtime | framework | **markdown-first, forkable — yours** |

The row that matters most is *measures agent success*. A 2026-08-16 study of two
serious projects — a from-scratch OS driven entirely by a model, and a
corporate-funded agent host with a 100%-coverage merge gate and 961 test files —
found that **neither ships any way to measure whether its agent succeeds at
tasks.** Both prove their machinery is correct. Neither shows it is good.

That gap is where the judge here lives. It is early — 10 of 78 skills carry eval
cases — and the README says so in its own weaknesses section. But it is the
differentiated bet, and the reason the factory is not just a nicer prompt folder.

**Hamzaish rides a host rather than being one** because the host is the commodity
and the factory is the compounding asset. See
[Running on another host](./host-portability.md) for what that actually costs.
