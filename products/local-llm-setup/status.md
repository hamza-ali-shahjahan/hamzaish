# local-llm-setup — Live Status

**Stage**: launch
**Status**: live — public OSS, v1.2.0, dogfooded

## Active sessions
_Coordination ledger — see [meta/parallel-sessions-protocol.md](../../meta/parallel-sessions-protocol.md). Read this first; update on claim/finish._

- **2026-06-14 — consolidated to a single owner.** One session now holds the repo + dogfood machine + brain; **no parallel work in flight.** The parallel "ponytail" session shipped **v1.2.0** (PR #1) and is **closed / handed off**. Long-running jobs (model downloads) are complete. Resume the branch-per-session + PR-to-main discipline only if a second session is genuinely needed.

## North star this sprint
> A first-timer on any of the three OSes runs one command and ends up chatting with a local model, with zero decisions required.

## Where it is
- **Shipped:** public repo + releases through **v1.2.0** (native Windows port + GPU-aware sizing + first-timer safeguards; v1.1.1 = size-encoded context-variant names + `--uninstall` `:latest` match fix; **v1.2.0 = optional `--lean` "ponytail" minimal-code coder variant**, merged via PR #1 with green Linux+Windows CI).
- **CI:** ShellCheck + real `ubuntu-latest` and `windows-latest` dry-run smoke tests — all green.
- **Dogfooded (2026-06-14):** full coder + reasoning stack in use on an M5 Pro / 24 GB — `qwen2.5-coder:14b` (~25.7 tok/s) and `deepseek-r1:14b` (~27.5 tok/s), both with 8k context variants, OpenAI-compatible API verified. Ollama runs persistently via `brew services`.

## Open immediately
- Real (non-CI) Windows+NVIDIA run to confirm GPU **offload during inference**. _(2026-06-14: the GPU detection + VRAM→tier **logic is verified** — ran the real `.ps1` under PowerShell with a simulated `nvidia-smi`, correct at every band: 8→7b, 12→14b, 23→32b, 47→70b, sub-6 GB → RAM. Only the real-hardware acceleration step remains; **deferred** until a box is available. Step-by-step procedure committed at repo `docs/verify-windows-gpu.md`.)_
- Decide whether the download-hardening learnings graduate to a factory playbook via `/learn-loop`.

## Distribution / next
- Soft-shared; LinkedIn post drafted. Candidate channels: Show HN, r/LocalLLaMA.
