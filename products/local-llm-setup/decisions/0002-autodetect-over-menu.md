# 0002 — Auto-detect the machine; never make the user choose what the computer knows

- **Date**: 2026-06-14
- **Decision**: Default to fully automatic detection of OS, chip, RAM, and GPU. Offer a manual `--platform` override only as a fallback (e.g. WSL/edge cases), not as the primary flow. No "pick your machine" menu.
- **Why**: `uname` / `sysctl` / `/proc/meminfo` answer "what machine is this" reliably and instantly. A menu adds friction and a chance to get it wrong, with zero payoff. The product's promise is "one command that asks you nothing it can figure out for itself."
- **What would prove it wrong**: Detection is wrong often enough that users distrust it, or a common environment (e.g. some container/VM) can't be detected reliably.
- **Revisit trigger**: A recurring class of machines where auto-detect misfires and the override isn't discoverable enough.
