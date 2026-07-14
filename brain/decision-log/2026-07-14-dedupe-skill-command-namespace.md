# 2026-07-14 — One /name, one home: dedupe the skill/command namespace (follow-up to the duplicate-listing finding)

**Decision.** Claude Code unifies skills and commands into a single `/name` namespace, and live sessions were listing colliding names twice (double context load; for divergent descriptions, contradictory routing). From now: **a name lives as a skill folder OR a command file, never both** — enforced by `bun run check-skill-command-collision` in CI. And the setup-installed global copies in `~/.claude/commands/` become **generated pointer stubs**, not full copies.

## What the investigation found (two distinct causes)

1. **In-repo skill↔command collisions (4):** `brain-ask`, `portfolio-pulse`, `go-live`, `web-launch` each existed as both `factory/skills/<name>/SKILL.md` and `factory/commands/<name>.md`. Docs (code.claude.com/docs/en/skills) say commands and skills are one merged mechanism and the skill shadows the command on name ties — but in practice both descriptions load into the session listing.
2. **User-scope ↔ project-scope command doubles (16):** `bun run setup` installs real copies of factory commands into `~/.claude/commands/` (deliberate — so `/work-on`, `/full-cycle`, etc. work from any folder; symlinks show "Unknown command", see learning 2026-07-02). Inside the Hamzaish repo, the user-scoped copy AND the project-scoped copy both list — that's why *command-only* names (`full-cycle`, `goal`, `build`, `review`, `ship`, `test`, `setup`, `brain-ingest`, …) also doubled. Docs claim user scope shadows project scope; live sessions list both. Three of the copies had already drifted from their factory sources (`full-cycle`, `goal`, `ship`) — stale descriptions being served alongside fresh ones.

## Resolutions per pair

| Name | Resolution | Why |
|---|---|---|
| `brain-ask` | Skill folded into `factory/commands/brain-ask.md`; skill dir deleted | Command is the canonical user-typed door + the globally installed one; protocol was small enough to inline. Trigger phrases ("what did we decide about X") moved into the command description so model recall-routing survives. |
| `portfolio-pulse` | Skill dir deleted; command already superseded it | The command (rewritten 2026-07-02 with telemetry + showcase rule) contained a strict superset of the stale May-26 skill. |
| `go-live` | Command deleted; `factory/skills/go-live/SKILL.md` is the single source, `disable-model-invocation: true` | The 12.5KB skill already contained everything including the A1–A10 live gate; deliberate ritual per the skill-authoring standard — CLAUDE.md's table is the router, context cost now zero. |
| `web-launch` | Repo-side `factory/commands/web-launch.md` symlink removed | The plugin (`factory/plugins/web-launch/`) keeps its own command for portable `/plugin` installs; in-repo, the symlinked skill is the entry. Plugin pattern in CLAUDE.md updated: symlink skills only, never the same-named command. |

## The global-stub redesign (cause 2)

`scripts/setup.ts` step 6 now writes a **pointer stub** instead of copying the file: tiny frontmatter + a body that says "read `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/factory/commands/<name>.md` and follow it, applying $ARGUMENTS". CORE commands (`hamzaish`, `builder-mode`, `work-on`, `portfolio-pulse`, `brain-ask`, `brain-ingest`) keep the source's `description` so natural-language routing works from any cwd; the rest get a one-line pointer description (they're typed or chained by name). This kills **both** failure classes at once: a stub can't go stale (the 2026-07-02 incident class — the manifest/conffile machinery stays as the customization guard), and inside the repo the duplicate listing collapses from a full second description to one short line. Existing full copies migrate to stubs on the next `bun run setup` (manifest hash → safe refresh).

**Wrong if.** (a) A pointer stub's indirection fails in practice — the agent reads the stub but doesn't follow through to the factory file, or `$ARGUMENTS` gets lost; measurable as broken from-anywhere invocations after the next `bun run setup`. Then revert step 6 to full copies (git history has it) and accept the doubled listing. (b) Non-CORE stubs losing their descriptions breaks real natural-language routing outside the repo — then promote the missed name into CORE (one array entry). (c) A future Claude Code release implements the documented shadowing — then the stub design still wins on staleness, but the CI guard's "double context" rationale softens to "one source of truth".

**Revisit trigger.** First observed from-anywhere invocation failure after stub migration, or the next context-load audit (re-measure the listing per the skill-authoring standard — expect roughly the 16 duplicated command descriptions plus 4 collision descriptions gone, ~1k+ tokens/session back).
