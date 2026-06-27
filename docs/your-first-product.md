# Your first product in 10 minutes

Hand-held walkthrough from a fresh clone to a product you're actively building — with the factory's brain working for you. No prior Hamzaish knowledge assumed.

**Before you start:** you've run the [Quickstart](../README.md#quickstart--first-win-in-5-minutes) (`bun run setup`), or the [complete-beginner walkthrough](start-here.md). If not, do that first.

---

## 1. Tell the factory who you are (2 min)

Open `brain/identity/operator.local.md` (setup created it from a template — it's git-ignored, so it's yours). Fill in:
- your name, what you're building toward
- your default stack (e.g. Next.js + Supabase, or Bun + Hono — whatever you reach for)
- how you like to work (fast? approval gates? quality bar?)

This is how Claude tailors its voice and defaults to *you*. Two minutes, then save.

## 2. Open the folder in Claude Code

```bash
cd hamzaish    # (or wherever you cloned it)
claude
```

Claude auto-reads `CLAUDE.md` + `AGENTS.md` and is now your factory cofounder. Try:

```
/portfolio-pulse
```

It shows every product and today's recommended action. (On a fresh clone it'll show the example products — those are the maintainer's; you'll add your own next.)

## 3. Add your first product — two ways

**A) You already have a product you're building.** Tell Claude:

> "Register my product `<name>` — the code lives at `~/path/to/your/repo`. It's a `<one-liner>`."

Claude creates `products/<slug>/` (config + scope + status + decisions + learnings) and maps the code path in `code-paths.local.json` (git-ignored — your code location never leaves your machine). Your code stays in *its own* repo; Hamzaish only holds the metadata + lessons.

**B) You're starting fresh.** Let the factory help you think first, then scaffold:

```
/ideate                          # generate ideas grounded in your patterns
/validate "<your idea>"          # pressure-test it (customer discovery + devil's advocate)
/scaffold "<name>" "<one-liner>" # lay down the product folder + a Next.js starter
```

(Skipping straight to `/scaffold` is fine for cheap, reversible experiments — that's the momentum default. Reach for `/validate` when it's expensive or hard to undo.)

## 4. Enter the workspace

```
/work-on <slug>
```

This loads everything the factory knows about that product — config, scope, status, recent decisions, the right playbook for its stage, and the product's own `CLAUDE.md` — then says "ready." Now every request you make has full context.

## 5. Build something, then capture the lesson

Make your first change (a feature, a fix — whatever's next). When something teaches you a lesson worth keeping:

```
/brain-ask "have we seen <this problem> before?"
```

If it's new, note it in `products/<slug>/learnings.md` (what worked / what bit you / the fix). That's the factory's memory — the next build inherits it. Refresh the index after writing:

```
/brain-ingest
```

## 6. See it in the portfolio

```
/portfolio-pulse
```

Your product now appears with its stage and a recommended next action. You've gone from zero to a tracked, context-rich, self-remembering product.

---

## What just happened (the loop you'll repeat)

```
operator.local.md (who you are)
        ↓
/work-on <slug>  →  build  →  capture a learning  →  /brain-ingest
        ↑                                                   │
        └───────────── the next build inherits it ──────────┘
```

That's the whole factory in miniature: **persistent context in, build, lesson out, smarter next time.** Across many products, the lessons compound — one product's hard-won fix becomes every product's guardrail.

## Where to go next

- **More products?** Repeat steps 3–6. The factory is built for parallelism.
- **Understand the why?** → [Architecture](architecture.md) · [Philosophy](philosophy.md)
- **Where it's all heading?** → [meta/SELF-EVOLUTION.md](../meta/SELF-EVOLUTION.md) — how the factory goes from improving-by-hand to improving-itself.
- **The discipline** (validate before build, scope as moat, measure before launch) → [README › The discipline](../README.md#the-discipline-dont-violate).
