# Decision — fnox as the recommended secrets backend for `/go-live`

**Date:** 2026-07-04
**Status:** Adopted (Phase 1 of the jdx/en.dev toolchain evaluation)
**Scope:** factory — `/go-live`, product starter, secrets anti-pattern

## Decision

Adopt **fnox** (jdx/en.dev, https://github.com/jdx/fnox) as the *recommended* secrets backend for the product go-live flow, replacing the plaintext `.env.local` file with encrypted-in-config (`fnox.toml`) or remote-provider references. The existing user-pastes-into-`.env.local` flow stays as the **fallback** for products not on fnox. Runtime access for agents goes exclusively through fnox's MCP server in **exec-only** mode.

## Why

The 2026-07-03 Muakkil incident (a Claude-created `.env.local` became harness-watched; the user's pasted Supabase + Anthropic keys were echoed into the transcript; both rotated) was closed at the symptom level by `guard-secrets-files.sh`. fnox closes it at the **root**: there is no plaintext secrets file on disk to be watched. `fnox.toml` holds only age/KMS ciphertext or provider references and is safe to commit. Secrets exist only in a child process's environment at `fnox exec` time, and the MCP `exec` tool redacts resolved values from stdout/stderr before they reach the agent.

## Red-team evidence (the gate)

Piloted in scratchpad with a throwaway age key + fake secret `fake-secret-hunter2-9000`, driving `fnox mcp` over stdio with `[mcp] tools = ["exec"]`. Results:

| Test | Path | Result |
|---|---|---|
| `tools/list` under allowlist | MCP | **Only `exec` exposed** ✓ |
| `printenv SECRET` | MCP exec | `[REDACTED]` ✓ |
| `echo $SECRET` | MCP exec | `[REDACTED]` ✓ |
| `get_secret` / `get` | MCP | **Blocked** — "not enabled in this configuration" ✓ |
| `base64` of secret | MCP exec | **Leaked** (recoverable) ✗ |
| `rev` / char-spread of secret | MCP exec | **Leaked** (recoverable) ✗ |
| `echo $SECRET > file` | MCP exec | Plaintext **written to disk** ✗ |
| `fnox get` / `fnox export` / CLI `fnox exec -- printenv` | shell | **Raw value** ✗ |
| read the age `key_file` | shell | **Full offline decryption** ✗ |

**Verdict: PASS for the accidental-leak threat model (our actual incident), CONDITIONAL on confinement.** Redaction is literal string-matching on stdout/stderr, exactly as documented — it stops *accidental* leakage (the `printenv`/watcher-echo class) but not *adversarial* exfiltration by a prompt-injected agent. The property therefore holds **only if the agent is confined to the MCP `exec` tool** and cannot (a) run `fnox` in Bash or (b) read the decryption key.

## Confinement conditions (ship these with the wiring), weakest to strongest

1. **Key never agent-readable — the only real boundary.** Deny-rules (below) are best-effort; this is the layer that holds against a *determined/injected* agent. Prefer a **remote provider (1Password / KMS)** whose auth the agent can't complete, so there is no local key at all. If a local age key is used, it lives outside the repo and unreadable to the agent (add its path pattern to `guard-secrets-files.sh`).
2. **Shell deny-rules (best-effort).** The product repo's `.claude/settings.json` denies **all** `fnox` at the agent's shell: `Bash(fnox)` + `Bash(fnox:*)`. The agent has no legitimate shell use of fnox (it goes through MCP), so blocking the whole tool is both safe and more robust than arg-constrained rules. **But** Claude Code deny-rules are documented as bypassable (option injection `fnox --version get`, env prefixes `FNOX_PROFILE=x fnox get`, `eval`, absolute paths) — they stop the naive path, not a determined one. See the permissions docs.
3. **MCP config** is `tools = ["exec"]` + an explicit `secrets` allowlist — never the permissive default (blocks `get_secret`/`get` through MCP).
4. **Guard hook stays.** `guard-secrets-files.sh` remains as defense-in-depth; fnox is additive, not a replacement.
5. **No inline comments in the JSON.** `.claude/settings.json` and `.mcp.json` use strict validation — an unknown `_comment` key rejects the *whole file*, which would silently drop the deny-rules. (Caught in review: the first cut shipped `_comment` in both; removed. Rationale is documented in SETUP.md and the go-live skill instead.)

## What would prove this wrong

- A published exploit of the exec-only config that leaks a secret *without* Bash access or key-file read (i.e., breaks the confinement model itself, not just the known transform/write-to-file paths).
- fnox abandonment (it's young — ~1.9k stars, v1.29.0). Revisit if release cadence stalls > 3 months.
- Operational friction: if the fnox flow measurably slows go-live vs `.env.local` without the safety being needed, demote it back to opt-in.

## Revisit trigger

Next quarterly toolchain review, or the first product that runs an unattended/autonomous go-live (where adversarial confinement stops being hypothetical).

## Not adopted in Phase 1

hk (wrong layer — our guards are Claude Code hooks, not git hooks), aube (Bun-first stack conflict + churn). pitchfork is Phase 2. See `brain/learnings/2026-07-04.md` for the full toolchain analysis.
