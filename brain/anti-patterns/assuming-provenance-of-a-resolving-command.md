---
name: assuming-provenance-of-a-resolving-command
description: Concluding where a command/skill/tool comes from because it *resolves* in your session — "it's not in this repo, so it must be a vendor built-in" — without finding the file that actually defines it
type: anti-pattern
---

# Assuming the provenance of a command that "just works"

## The pattern

You're reviewing or documenting a repo. A command (`/full-cycle`), a skill, an MCP tool, or a config "just works" in your session — but you can't find it in the repo. You fill the gap with a confident guess about where it comes from: *"it's a Claude Code / vendor built-in,"* *"it ships with the framework,"* *"it's a default."* You write that guess into a review, a changelog, or docs as if it were verified. It reads authoritative. It is unverified.

## Why we don't do it

On 2026-06-28, an automated review of Hamzaish concluded that `/full-cycle`, `/spec`, `/plan`, `/build` "resolve on a stock Claude Code install (Anthropic's global skills)." It got the *symptom* right — those commands are not in the Hamzaish repo — but invented the *cause*. The truth: they're the operator's **own** commands, from his separate public repo **`agent-skills`**, installed globally at `~/.claude/commands/`. Not Anthropic's, not built-in. The claim was repeated into a public changelog line before it was caught — by the operator's own memory ("I built that and called it full-cycle"), not by the review.

The leap that failed: **"not in this repo" → "therefore a vendor built-in."** Those are different facts. A command that resolves in a session can come from at least five places: this repo, a *different* repo of yours installed globally (`~/.claude/`), a companion/sibling project, a plugin/marketplace, or an actual vendor built-in. "It resolves" tells you it's *installed somewhere*, nothing about *where*.

The cost is sneaky: the wrong provenance leads to the wrong fix. "It's a built-in" suggests "just add a note." The real situation ("it's your separate repo, a fresh cloner won't have it") demands a real fix — declare the dependency or consolidate it. Guessing provenance hid the actual problem.

## What to do instead

Before writing where something comes from, **find the file that defines it** — it takes one command:

- `find . ~/.claude ~/Claude -iname "*<name>*"` — does a defining file exist, and where?
- For a slash command: is it in the repo's `factory/commands/` / `.claude/commands/`, or only in **global** `~/.claude/commands/`? Global ≠ shipped-with-this-repo.
- If you find it in another folder, check `git -C <that folder> remote -v` — is it your own separate repo? A clone of someone else's? A vendor package?
- Only call something a "vendor built-in" if you've confirmed it isn't defined in any of your own locations. When unsure, write "resolves from outside this repo (source: `<path>`)" — locate it, don't label it.

This is the review-time face of the brain's deeper rule (`hand-maintained-facts-drift`): a claim about provenance is a *fact*, and facts get verified from the source, not inferred from behavior.

## When this might not apply

- **You've actually opened the defining file** and confirmed the vendor — then state it; that's verification, not assumption.
- **Genuinely well-known built-ins** in narrow, unambiguous cases (e.g. a shell's `cd`) don't need a `find`. The bar is: *could a reasonable person be wrong about where this comes from?* For anything project-specific, slash-command-shaped, or installable, the answer is yes — verify.
