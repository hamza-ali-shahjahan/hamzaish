# local-llm-setup — Live Status

**Stage**: launch
**Status**: live — public OSS, v1.1.0, dogfooded

## North star this sprint
> A first-timer on any of the three OSes runs one command and ends up chatting with a local model, with zero decisions required.

## Where it is
- **Shipped:** public repo + releases through **v1.1.0** (native Windows port + GPU-aware sizing + first-timer safeguards).
- **CI:** ShellCheck + real `ubuntu-latest` and Windows dry-run smoke tests — all green.
- **Dogfooded (2026-06-14):** on an M5 Pro / 24 GB — `qwen2.5-coder:14b` running at **~25.7 tok/s**, 8k context variant built, OpenAI-compatible API verified. `deepseek-r1:14b` (reasoning) pulling to complete the coder+reasoning setup.

## Open immediately
- Finish the `deepseek-r1:14b` reasoning model pull; re-verify both models end-to-end.
- Real (non-CI) Windows run on an NVIDIA GPU box to confirm the `.ps1` GPU-aware path beyond dry-run.
- Decide whether the download-hardening learnings graduate to a factory playbook via `/learn-loop`.

## Distribution / next
- Soft-shared; LinkedIn post drafted. Candidate channels: Show HN, r/LocalLLaMA.
