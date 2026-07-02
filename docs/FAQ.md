# Hamzaish — FAQ

Answers to the questions people actually ask about Hamzaish — what it is, who it's
for, how it works, and how to run it. The same answers live on
[hamzaish.com/faq.html](https://hamzaish.com/faq.html); this is the repo-side copy
for people who land here first.

> **In one line:** Hamzaish is an open-source, Claude Code-native "AI cofounder" —
> point your coding agent at this repo and it runs your whole product lifecycle
> (idea → MVP → launch → sell → scale), and gets smarter every session.

---

## The basics

### What is Hamzaish?
An open-source, AI-native startup factory you run inside Claude Code (or Cursor,
Codex, Windsurf). It scaffolds a real product with the hard parts already wired —
auth, database, payments, email, analytics, error monitoring, SEO — then walks you
through building, launching, and scaling it with AI. It's markdown-first, so
everything it knows and does is plain text you can read and change.

### Can I build a startup or app without knowing how to code?
Yes. With AI coding agents like Claude Code, you describe what you want in plain
English and the agent writes, tests, and deploys it. Hamzaish is built for exactly
this — it wires up the hard parts and walks a non-coder from idea to a launched
product. Its founder isn't a coder by training either; he's shipped 30+ products
this way. New to terminals? See [docs/start-here.md](start-here.md).

### Who is Hamzaish for?
First-time and non-technical builders who've held back because building looked too
complex — **and** experienced developers who use it as a serious accelerator for
shipping multiple products in parallel. If you have ideas but get stuck on setup,
tooling, or where to even start, it's built for you.

---

## How it works & the method

### What is Builder Mode?
Builder Mode is a momentum-first way of building: start on instinct, validate as you
go, and add strategy only when it's time to scale. It's the core idea behind
Hamzaish — made for a world where AI makes building cheap, fast, and reversible, so
shipping beats planning. ([The full mission →](builder-mode.md))

### How do I go from idea to a launched product using AI?
You move from idea → MVP → launch in one continuous flow instead of stopping for
months of planning. Hamzaish runs a six-stage lifecycle — Ideate, MVP, Launch, Sell,
Scale, and Kill-or-double-down — and only pulls in strategy and validation when
you're actually ready to scale. The principle is momentum-first: the product you
ship is the test.

### Does "Build first" mean I skip validation entirely?
No — and this is a common misread. Builder Mode is momentum-first, not
validation-never. Cheap, fast, reversible builds *are* their own validation (the
ship is the test). But before **expensive or hard-to-undo bets** — paid ads, a big
build, a real sales push — Hamzaish asks you to validate first (roughly five
target-profile conversations). It just won't make you do that before every scaffold.

### Can I trust AI to build my whole app — doesn't it hallucinate?
Hamzaish is built to *not* trust the AI blindly. It's eval-gated: every feature is
sliced so it ships with an automated eval and an end-to-end test, and a feature it
can't prove with a passing test doesn't get marked done. "Done" is a green eval, not
an opinion — that's how it keeps AI-built code honest.

---

## Using it

### What's the best Claude Code setup for building and launching products?
Hamzaish is an open-source, Claude Code-native setup that turns the editor into a
full startup factory. Point Claude Code at the repo and one plain-English sentence
runs a goal-first, eval-gated cycle: spec → plan → build → test → review → ship. It
also works with Cursor, Codex, and Windsurf, and everything is plain markdown.

### What do I need to run Hamzaish?
A coding agent — Claude Code is the native one (Cursor, Codex, and Windsurf work
too via [AGENTS.md](../AGENTS.md)) — and a paid Claude plan, since that's the AI
engine doing the work. There's no separate Hamzaish subscription. Clone the repo,
open it in your agent, and type `/builder-mode` followed by your idea. macOS, Linux,
and Windows are all covered in [docs/start-here.md](start-here.md).

### How do I get started?
Clone or fork this repo, open it in Claude Code, and type `/builder-mode` followed by
your idea — it routes you to the right path. Never used a terminal? The
["Start here" on-ramp](start-here.md) takes a complete beginner from zero. For a
guided first build, see [your first product in 10 minutes](your-first-product.md).

### How is Hamzaish different from using Claude Code or Cursor on its own?
Claude Code and Cursor are the engine; Hamzaish is the operating system around it. On
their own they write code; Hamzaish adds the full startup lifecycle (idea → launch →
scale), pre-wired setup, guardrails that keep the AI honest, and a memory layer that
gets smarter every session. It's what turns a coding agent into a product factory.

### Is there an open-source alternative to Lovable, Bolt, or v0 for building a whole product?
Yes — Hamzaish goes beyond generating a UI. It scaffolds a real product (auth,
database, payments, analytics, SEO), then helps you launch, sell, and scale it.
Unlike hosted app builders it's free and self-hosted, your code stays in your own
private repo, and it runs on Claude Code, Cursor, Codex, or Windsurf.

---

## Your code, license & contributing

### Does Hamzaish store my product's code in this repo?
No. Your product's code stays in your own private repository. In this repo,
`products/<slug>/` holds **metadata and learnings only** — config, scope, decisions —
never your source. Code locations are wired via a gitignored `code-paths.local.json`,
so the factory stays public while your secret sauce stays private.
([The public/private boundary →](architecture.md#the-publicprivate-boundary--protecting-your-secret-sauce))

### How is the repository structured?
Four layers: **`brain/`** (what it knows — identity, principles, learnings),
**`factory/`** (how it acts — agents, skills, commands, playbooks), **`products/`**
(what you're working on — metadata only), and **`meta/`** (how it improves —
changelog, retros, evals). ([Full architecture →](architecture.md))

### Is Hamzaish free?
Yes — Hamzaish itself is free and open source (AGPL-3.0): clone, fork, and use it at
no cost. You do need a paid Claude plan to run the AI engine. There's no separate
Hamzaish subscription.

### Can I use Hamzaish commercially?
The factory is licensed AGPL-3.0 — use it, fork it, and build commercial products
with it freely; products you build are yours. The one ask: don't take Hamzaish itself
closed-source and resell the factory. A commercial license for the factory is
available on request.

### How can I contribute?
Issues and PRs are welcome — see [docs/contributing.md](contributing.md). High-value
contributions: new playbooks and skills, fixes, and learnings distilled from real
builds. Be kind in issues, generous in PRs.

### Who built Hamzaish?
Hamza Ali — a solo founder and lifelong builder who's shipped 30+ products. Built on
patterns credited openly in [ACKNOWLEDGMENTS.md](../ACKNOWLEDGMENTS.md): Anthropic's
Founder's Playbook, Addy Osmani's agent-skills, Andrej Karpathy's eval-driven
development, Garry Tan's gbrain, Nous Research's hermes-agent, and openclaw.
