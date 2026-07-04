---
name: claude-touched-secrets-file
description: Claude creating/reading/editing a real-secrets file (.env.local etc.) — the harness file-watcher then echoes the user's pasted keys into the chat transcript
type: anti-pattern
---

# Claude Touched a Secrets File

## The pattern

A setup flow needs API keys in `.env.local` (or similar). To be "helpful," Claude **creates the file with its Write tool** (even with blank placeholder values), then tells the user to fill in their keys. Or Claude Reads the file to "verify" it, or `cat`s it in Bash.

Result: any file Claude has read or written becomes **harness-watched**. The moment the user pastes their real keys and saves, the harness injects the file's new contents — the actual secret values — into the conversation transcript as a modified-file notification. The secrets are now in chat history, defeating the entire "never paste secrets in chat" discipline.

## Why we don't do it

**Incident 2026-07-03 (Muakkil go-live):** Claude created `~/Claude/Muakkil/.env.local` with blank `SUPABASE_SERVICE_ROLE_KEY=` / `ANTHROPIC_API_KEY=` lines and carefully instructed the user to fill them in himself "so they never touch chat." The user did exactly that — and the harness echoed the full file, both real keys included, into the transcript. Both keys had to be rotated. The user's (justified) reaction: *"What was the use of going through all the trouble if this had to happen?"*

The deeper lesson: **policy without enforcement fails at the tool layer.** The behavioral rule ("don't paste secrets in chat") was followed perfectly by both parties — the leak came through a side channel neither was watching.

## What to do instead

**The example + user-copies pattern:**

1. Claude creates/edits only `<name>.example` files with placeholder values (e.g. `.env.local.example`, committed, documented).
2. The **user** runs `cp .env.local.example .env.local` and pastes their keys **themselves**, in their own editor.
3. Claude verifies presence/format with **non-printing checks only**: `grep -c '^KEY=.' .env.local` (count), `grep -qE '^STRIPE_SECRET_KEY=sk_(live|test)_' .env.local` (boolean), `test -s` — never `cat`/`head`/`tail`/`sed`/plain `grep`, never Read.
4. Production secrets go into the host's secret store, entered by the user.

**Enforcement:** `~/.claude/hooks/guard-secrets-files.sh` (PreToolUse on Read/Write/Edit/NotebookEdit + Bash) hard-blocks Claude's access to `.env.local`, `.env.*.local`, `.dev.vars`, `id_rsa*`, `*.pem`, `credentials.json`, `secrets.*` — and Bash commands that would print them. Override requires Hamza's explicit in-chat approval (token `I-CONFIRM-SECRETS-FILE-ACCESS`).

**The stronger, root-cause fix (2026-07-04): no plaintext file at all.** The guard hook patches the *symptom* (Claude can't touch the file). **fnox** (recommended secrets backend, `brain/decision-log/2026-07-04-fnox-secrets-backend.md`) removes the *cause*: `fnox.toml` holds only ciphertext/provider references and is safe to commit, so there is no plaintext file for the harness to watch and echo. Agents reach secrets only through `fnox mcp` in exec-only mode, which redacts resolved values from output. **Caveat (red-teamed):** that redaction is literal string-matching — it closes this accidental-leak class but not adversarial exfiltration (base64/reverse/write-to-file), so it must be paired with Bash deny-rules (`fnox get`/`export`/`exec`) and a key kept out of agent reach. The guard hook stays as defense-in-depth.

## When this might not apply

- `.example` templates are always fine — creating them IS the sanctioned pattern.
- A committed `.env` holding only publishable values (anon keys, public URLs) is not a secrets file; editing it is fine.
- Genuinely exceptional need (e.g. migrating a secrets file's *names*, never values) → Hamza approves in chat, override token used once, never made a habit.

## Related

- `factory/skills/go-live/SKILL.md` — the provisioning flow this pattern reshaped (user-pastes, Claude boolean-verifies).
- Global `~/.claude/CLAUDE.md` → "Never touch real-secrets files" (machine-wide hard rule, 2026-07-03).
- Same family as `accidental-public-repo.md`: cheap check beats reversible-but-costly incident.
