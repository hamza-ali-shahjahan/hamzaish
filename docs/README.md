# Hamzaish docs — the "why"

The [root README](../README.md) is the front door: what Hamzaish is and how to
start. **These pages explain why it's built the way it is** — so a first-time
reader (you, a collaborator, or future-you) understands the design, not just the
folder names.

| Page | What it covers |
|---|---|
| [Philosophy](./philosophy.md) | "The default is momentum." Why build-first, and when it's smart to pull in strategy. |
| [Architecture](./architecture.md) | The layers, the per-product skeleton, and the public/private boundary that protects your secret sauce. |
| [The `/hamzaish` momentum router](./the-momentum-router.md) | How the entry point triages you into building fast (or strategy, on demand). |
| [Security baseline](./security.md) | Secure-by-default for every product: pinned least-privilege Actions, untrusted-input handling, sandboxed agent code, secrets in a manager, RLS-on, and the production-branch deploy model. |
| [Contributing](./contributing.md) | How to add products and learnings — and share lessons without leaking IP. |

> These docs live **in the repo** (not the GitHub Wiki) on purpose: they version
> with the code, travel in every clone/fork, and get reviewed in PRs. The Wiki
> can't do those things.
