# local-llm-setup

> One command that takes a complete beginner from nothing to a running local LLM on their own machine — Mac, Linux, or Windows.

**The wedge:** the hard part of local AI was never the model — it's the first 30 minutes of setup (which runtime, which model, will it fit my RAM, what's "quantization," how to set a context window, how to test it). Every guide lists ~12 manual steps and a pile of decisions. This collapses all of it into **one command that asks you nothing it can figure out for itself** — it detects your OS, chip, RAM (and GPU/VRAM where present), picks a model that fits, installs the runtime, pulls and tunes the model, smoke-tests it, and offers to drop you into a chat.

**Why it matters (the thesis):** cloud AI tools can change their rules overnight. A capable model running on hardware you own is cheap insurance — *own part of your stack.* This removes the only real barrier to that.

- **Public OSS** (MIT): <https://github.com/hamza-ali-shahjahan/local-llm-setup>
- **Backbone:** [Ollama](https://ollama.com) (scriptable runtime) — see `decisions/0001-ollama-as-runtime.md`
- **Platforms:** macOS + Linux (one Bash script) and native Windows (a PowerShell port)

Code is public, so it lives in the repo above rather than a private path.
