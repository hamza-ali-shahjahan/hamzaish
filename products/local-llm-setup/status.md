# local-llm-setup — Live Status

**Stage**: launch
**Status**: live — public OSS, v1.1.1, dogfooded

## North star this sprint
> A first-timer on any of the three OSes runs one command and ends up chatting with a local model, with zero decisions required.

## Where it is
- **Shipped:** public repo + releases through **v1.1.1** (native Windows port + GPU-aware sizing + first-timer safeguards; v1.1.1 = size-encoded context-variant names + `--uninstall` `:latest` match fix, both surfaced by dogfooding).
- **CI:** ShellCheck + real `ubuntu-latest` and `windows-latest` dry-run smoke tests — all green.
- **Dogfooded (2026-06-14):** full coder + reasoning stack in use on an M5 Pro / 24 GB — `qwen2.5-coder:14b` (~25.7 tok/s) and `deepseek-r1:14b` (~27.5 tok/s), both with 8k context variants, OpenAI-compatible API verified. Ollama runs persistently via `brew services`.

## Open immediately
- Real (non-CI) Windows run on an NVIDIA GPU box to confirm the `.ps1` GPU-aware path beyond dry-run.
- Decide whether the download-hardening learnings graduate to a factory playbook via `/learn-loop`.

## Distribution / next
- Soft-shared; LinkedIn post drafted. Candidate channels: Show HN, r/LocalLLaMA.
