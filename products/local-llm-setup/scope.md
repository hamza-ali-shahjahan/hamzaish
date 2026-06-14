# local-llm-setup — Scope

## Does
- Detects OS (macOS / Linux / Windows), chip, RAM — and NVIDIA GPU/VRAM where present — and **auto-picks a model tier** (7B → 70B) that fits.
- Installs the **Ollama** runtime the right way per platform (Homebrew on macOS, official installer on Linux, `winget`/official installer on Windows).
- Pulls a coder model + a reasoning model, **bakes a sane context window** into ready-to-use `*-8k` variants, and runs a **live smoke test**.
- Hardens the real-world path: disk-space precheck, resume-retry on flaky downloads, persistent server, quiet unattended output, and a `--dry-run` no-op preview.
- Ships as **two single-file scripts** kept in lockstep: `local-llm-setup.sh` (Mac/Linux) and `local-llm-setup.ps1` (Windows).

## Deliberately does NOT
- **Not a model server or UI** — it sets up Ollama and gets out of the way; bring your own chat/IDE/agent (it prints the OpenAI-compatible endpoint).
- **Not a fine-tuning / training tool** — inference setup only.
- **Not a multi-runtime abstraction** — Ollama is the single backbone, on purpose (scriptability). No LM Studio / llama.cpp branching.
- **Not a cluster/distributed-inference orchestrator** — single machine. (Pooling machines via EXO/MLX is explicitly out of scope.)
- **No telemetry, no account, no cloud** — runs entirely locally; sends nothing anywhere.
