# Running the factory on another host

Hamzaish ships no agent loop and no model. It rides a host. The bet is that the
host is the commodity and the factory — brain, guardrails, judge — is the thing
that compounds and should outlive any one of them.

That was a prediction until 2026-08-13, when DeepSeek open-sourced
[`deepseek-harness`](https://github.com/deepseek-ai/deepseek-harness) (MIT), a
second host that reads the same files this factory is written in. This page is
the honest map of what would carry over.

**Status: mapped, not tested.** Nothing here has been run. The harness is in
developer preview and its own README says, in capitals, that there will be
compatibility-breaking changes. Treat every row below as a reading of its source,
not a result.

## Why this is checkable at all

Three conventions this factory already follows turn out to be the portable ones:

1. **Markdown, not code.** Skills are `SKILL.md` with YAML frontmatter — the
   Anthropic Agent Skills shape. `deepseek-harness` implements the same spec
   (`packages/skill/skill-filesystem/`), including `user-invocable` and
   `disable-model-invocation`.
2. **Context in `AGENTS.md`.** Its instruction loader defaults to
   `['AGENTS.md', 'CLAUDE.md']` — both files load with no adapter.
3. **The judge is plain scripts.** Every gate runs under `bun` and cares nothing
   about which agent produced the work. Verification that doesn't know who built
   it is the point, and it's the part that ports for free.

## What carries over

| Asset | Ports? | Mechanism |
|---|---|---|
| `AGENTS.md` / `CLAUDE.md` | ✅ direct | Default instruction candidates. Nested files discovered on file access. |
| Skills (`SKILL.md`) | ✅ direct | Same frontmatter spec; point its `customSkillDirs` at `factory/skills/`. |
| The judge (`bun run check-*`, `eval`, `verify`) | ✅ direct | Plain processes. Host-agnostic already. |
| The brain (`brain/`, `/brain-ask`) | ✅ direct | Markdown + a SQLite index, read by scripts. |
| Playbooks | ✅ direct | Prose loaded as context by whatever reads it. |
| Slash commands (23 `.md`) | ⚠️ rewrite | Become skills with `user-invocable: true` + `disable-model-invocation: true`. Mechanical, not conceptual. |
| Agents (35 `SKILL.md`) | ⚠️ partial | Load as skills. True subagent delegation needs its Agent Preset format (a YAML plugin subtree), which is heavier and more powerful than a markdown definition. |
| Hooks | ⚠️ partial | It ships a Claude Code hook bridge covering 7 of 30 events, command handlers only, run serially. |
| MCP servers | ⚠️ re-declare | Full stdio/http support and the identical `mcp__server__tool` naming, but configured in YAML — no `.mcp.json` import. |
| `@path` imports inside `CLAUDE.md` | ❌ | Not interpreted. Inline the content or point at it in prose. |

**Rough read: the brain, the playbooks, the skills, and the entire judge carry
over; the command and subagent layers need a mechanical rewrite.** The parts that
don't port are ergonomics. The parts that do are the parts that compound — which
is the thesis, and the reason this page exists.

## The shape of a trial

Not run. Written down so the first person to try it starts from something.

```yaml
# a cordis.patch.yml overlay pointing the harness at this factory's skills
- dsh-skill-filesystem:
    customSkillDirs:
      - ./factory/skills
```

A trial worth doing would answer one question — *does a skill written for one
host behave the same on another?* — and the way to answer it is the eval harness
that already exists:

```bash
bun run eval --no-llm      # deterministic, agent-blind, no key needed
```

If the same cases pass under both hosts, the claim is earned. If they don't, the
gap is the real finding and belongs in a decision record.

## What this does not claim

- **Not "Hamzaish runs on DeepSeek Harness."** It has not been run. Saying
  otherwise would be exactly the aspiration-as-fact failure the honest-copy rule
  bans.
- **Not a recommendation to switch.** Claude Code is the supported host. This is
  insurance and evidence, not a migration plan.
- **Not a claim the harness is good.** It ships no agent-capability evaluation at
  all — no benchmark runner, no task suite, no scorer. It can prove it behaves
  deterministically; it cannot show you it succeeds at tasks. Neither can most
  things in this category, which is why the judge here is the differentiated part.
- **Not stable ground.** Developer preview, no releases, no compatibility
  promise, and closed to external pull requests.

## Watch triggers

Look again when any of these change:

- The harness cuts a tagged release or drops the breaking-changes warning.
- Its hook bridge covers the events the factory's guards actually use.
- A second host adopts the same skills spec (that would make the convention, not
  the harness, the thing to track).
- The eval-coverage ratchet here passes ~50%, at which point a cross-host run
  would prove something meaningful rather than being a demo.
