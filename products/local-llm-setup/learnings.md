# Learnings — local-llm-setup

_Capture the transferable lesson only — never keys, credentials, or proprietary internals._

## What worked
- **Dogfooding caught what dry-run/CI never could.** Every check was green (ShellCheck, Linux + Windows smoke, fresh-clone test), yet the first *real* end-to-end run surfaced a real bug (context-variant baking) within minutes. It happened **again at v1.1.1**: simply reading the real `ollama list` on the dogfood machine exposed two more bugs CI couldn't — the baked variants were mis-named (`…-8k`, tier stripped) and `--uninstall` had never actually matched them (`:latest` tag). Green pipelines verify the happy path; only running the actual thing for its actual job exercises the integration. This is the evidence behind the Hamzaish [Admission Policy](../../meta/admission-policy.md).
- **Auto-detect beats a menu.** Never ask the user something the machine already knows (`uname`, `/proc/meminfo`, `sysctl`). One command, zero questions, with a `--platform` override only as the escape hatch.
- **Design for resume from day one.** Ollama keeps partial blobs, so an interrupted multi-GB pull continues. Once that's true, retry-on-failure is safe and is the single biggest robustness win.
- **One scriptable backbone (Ollama) is what made a CLI possible** — a GUI runtime (LM Studio) can't be driven headlessly. See `decisions/0001-ollama-as-runtime.md`.

## What we would do differently (pitfalls)

| Pitfall | The fix | Guardrail it became |
|---|---|---|
| `ollama create NAME -f -` (Modelfile via stdin) is rejected by Ollama 0.30.x → the promised `*-8k` context variants were silently never built | Write a temp Modelfile and pass its **path** | Fixed in v1.0.1; verified live on the 14B |
| Single-shot `ollama pull` strands the user on a transient `Error: EOF` (flaky/rate-limited connection) | Resume-retry loop around the pull | v1.0.1 `pull_with_retry` |
| A *resume* can wedge on a large blob (60× immediate EOF) even though a *fresh* pull works first-try | Detect no-progress and clear the partial to restart fresh; surface a `rm …-partial*` remedy | v1.0.1 message + ops runbook |
| In-script `ollama serve &` dies when the script exits → a later `ollama run` finds no server | Start via `brew services` (macOS) so it persists | v1.0.1 |
| Cold `brew install` auto-updates Homebrew → minutes of delay + a wall of unrelated output that reads as "broken" | `HOMEBREW_NO_AUTO_UPDATE=1` | v1.0.1 |
| Non-TTY `ollama pull` floods logs/CI with thousands of ANSI redraw lines | Suppress the progress bar when stdout isn't a TTY | v1.0.1 |
| `ollama --version` prints a "could not connect" warning when the server is down, leaking into the UI | Grep just the version line | v1.0.1 |
| Context variants were named `…-8k` (the tier was stripped), so re-running at a different tier silently overwrote the earlier variant — and it disagreed with the README, which already showed `…-14b-8k` | Keep the model size in the variant name, from **one shared helper** (`ctx_alias` / `Get-CtxAlias`) so it can't drift between scripts | v1.1.1 |
| `--uninstall` never removed the variants: `ollama create` tags them `:latest`, so `ollama list` shows `…-8k:latest` while the tool matched the bare name | Strip the implicit `:latest` when matching installed models | v1.1.1 |

## Operational notes
- Real throughput on **M5 Pro / 24 GB**: `qwen2.5-coder:14b` (Q4, ~9 GB) ≈ **25.7 tok/s** generation after a ~6 s first-load; 1.5B ≈ 147 tok/s. Useful, real-world numbers for the tier table.
- Home-bandwidth reality: ~18–19 GB of models over ~6.4 MB/s ≈ 45 min; expect interruptions and make re-runs safe (they are).

## Open questions
- Should the script pull the **coder model first, then reasoning**, so the user has one working model ASAP instead of waiting for both?
- Cross-platform parity: the `.sh` and `.ps1` must stay in lockstep — is CI dry-run enough, or do we need a real GPU Windows run in the loop?
- Do these download-hardening lessons generalize enough to become a standalone factory playbook ("shipping a CLI installer") via `/learn-loop`?
