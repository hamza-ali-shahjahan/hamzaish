# 0001 — Ollama as the single runtime backbone

- **Date**: 2026-06-14
- **Decision**: Build the tool entirely around Ollama, not LM Studio or raw llama.cpp, and do not abstract over multiple runtimes.
- **Why**: The whole product is a *CLI* — it must be fully scriptable and headless. Ollama is CLI-first (install, `pull`, `create`, `serve`, OpenAI-compatible API), works on all three OSes, and resumes interrupted downloads. LM Studio is GUI-first and can't be driven hands-off; supporting multiple runtimes would multiply the surface area for no beginner benefit.
- **What would prove it wrong**: Ollama stagnates or a materially better scriptable runtime appears; or beginners demand a GUI flow this CLI can't serve.
- **Revisit trigger**: A runtime ships that beats Ollama on cross-platform scriptability + GPU support, or user feedback shows the CLI framing is the wrong wedge.
