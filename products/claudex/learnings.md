# ClauDex — Learnings

## 2026-07-12 — npm names get squatted fast; the marketplace motion is the moat
`claudex` AND `claudex-cli` were already taken on npm by unrelated projects
within days of the codex-plugin-cc wave. Lesson: for Claude Code tooling, npm is
not the distribution channel anyway — the audience just learned
`/plugin marketplace add <owner>/<repo>` from OpenAI's own launch, so GitHub IS
the registry and the install motion doubles as brand education. Scoped
`@hamzaish/claudex` stays available as a later npx-installer convenience
(same pattern as `@hamzaish/rotscan`).

## 2026-07-12 — commands over auto-firing skills when the action spends someone else's quota
First instinct was a skill that auto-runs cross-model review. Killed it:
invoking a second AI vendor spends the user's Codex quota and minutes of
latency — silent auto-invocation would be the plugin's #1 uninstall reason.
Explicit invocation is consent. The compromise that keeps both benefits:
commands do the work, an advisory skill only *suggests* the command at
risky-change moments.

## 2026-07-12 — moment marketing = ride the incumbent's install motion, don't invent one
The launch asset isn't the code, it's that the install is byte-for-byte the
same shape as the thing that trended four days ago. Every article about
codex-plugin-cc is indirect onboarding for ClauDex.
