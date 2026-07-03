# Making a GitHub repo public — the go-public checklist

The companion to [`oss-publishing-checklist.md`](oss-publishing-checklist.md). That one covers pushing a package to a **registry** (npm / PyPI / crates). *This* one covers the step before and around it: taking a folder on disk and safely making it a **public GitHub repo** that a stranger can use.

Read this **before** running `gh repo create … --public` or flipping any repo to public.

The order matters: every step before "Create the repo" is reversible-cheap; making something public is the one step with reputational cost if you get scope, secrets, or visibility wrong.

---

## Step 0 — Pre-flight existence check (NON-NEGOTIABLE)

The single most expensive mistake here is creating a *new* public repo when one already exists, or publishing the wrong folder. See [`brain/anti-patterns/accidental-public-repo.md`](../../../brain/anti-patterns/accidental-public-repo.md) (Incident 2026-05-30: a public `agent-skills` repo went live while the real project was already a private repo).

Run all three before touching `gh repo create`:

```bash
find ~ -maxdepth 4 -type d -iname '*<requested-name>*' 2>/dev/null
gh repo list --json name,visibility --limit 200 --jq '.[] | select(.name | test("<requested-name>"; "i"))'
gh repo view "<owner>/<requested-name>" --json name 2>&1 | head -3
```

- **Any hit → stop and ask** which repo the user means before creating anything.
- **Clean (the exact-name view returns "Could not resolve to a Repository") → the name is free.**
- **When in doubt, create private.** private→public is one click; public→private has already leaked.

## Step 1 — Identity (do this BEFORE the first commit)

GitHub email-privacy rejects the first push with `GH007: Your push would publish a private email address` if commits carry your real email. Set the noreply email **per-repo** so it's baked into commit #1:

```bash
gh api user --jq '"\(.id)+\(.login)@users.noreply.github.com"'
git config user.email "<that-noreply-email>"
```

If commits already exist with the wrong email:
`git rebase --root --exec 'git commit --amend --reset-author --no-edit'`

## Step 2 — Secret & PII scan (before the first commit goes anywhere)

Public means *forever* — git history is not erasable in practice once cloned/indexed. Scan first:

```bash
git diff --cached | grep -nEi '(api[_-]?key|secret|token|password|BEGIN [A-Z ]*PRIVATE KEY|sk-[a-zA-Z0-9]{20})' || echo "clean"
```

- A real `.gitignore` should already exclude `.env`, `*.pem`, `*.key`.
- Check for absolute home paths, internal hostnames, and personal emails in scripts/configs.
- If a secret already landed in history: rotate it (assume it's burned), then scrub with `git filter-repo` or start a clean history.

**Also scan for security-POSTURE documents, not just secrets** (Incident 2026-07-03: a
`REPO-ACCOUNT-SECURITY-AUDIT.md` — which repos had exposed secrets + rotation status — sat
one `git add -A` from publication). An audit contains no keys, but it maps your weaknesses
for an attacker. These NEVER go in a public tree: security audits, secret
inventories/exposure lists, rotation logs/schedules, pentest findings, incident reports
naming credentials. Check paths AND history:

```bash
git ls-files | grep -riE 'security[-_ ]?audit|secrets?[-_ ]?(audit|inventory|exposure|rotation)|rotation[-_ ]?(log|status)|pentest' || echo "clean"
git log --all --diff-filter=A --name-only --format= | sort -u | grep -riE 'security[-_ ]?audit|pentest' || echo "history clean"
```

Keep them in a gitignored `meta/security/` (the factory ships this ignore + a
`check-sensitive-docs` CI guard) or outside the repo entirely.

## Step 3 — Community-health files (GitHub's "community profile" checkboxes)

A stranger should be able to understand, trust, use, and contribute. The full set:

- [ ] **README.md** — what it is, why, a quickstart that works for someone with zero context, requirements, license line.
- [ ] **LICENSE** — pick deliberately. **MIT** for max adoption of a standalone tool/script; **AGPL-3.0** when you want copyleft (Hamzaish's own default). The license text's copyright holder and the README badge must agree.
- [ ] **.gitignore** — OS junk, editor dirs, and secret patterns (`.env*`, `*.pem`, `*.key`).
- [ ] **CONTRIBUTING.md** — how to test, lint, and the one or two house rules.
- [ ] **CODE_OF_CONDUCT.md** — Contributor Covenant 2.1, with a real contact email.
- [ ] **SECURITY.md** — how to report privately (email, not a public issue) + supported versions.
- [ ] **.github/workflows/** — at least one CI check (lint/test) so the badge is green and PRs are gated.

## Step 4 — CI / lint that actually runs

A green badge is trust. Wire the minimum check for the language:

- Shell → `shellcheck` via `ludeeus/action-shellcheck` (set `SHELLCHECK_OPTS: -S error` so style nits don't redden the badge).
- Node/Py/etc → the project's existing test/lint command.

If you can't lint locally (tool not installed), let CI be the linter — but then *expect* the first PR/build to surface issues; don't assume green.

## Step 5 — Safe install instructions

If the README hands users a one-liner:

- **Prefer download-then-inspect-then-run** over `curl … | bash`. Reading a script before running it is the security ethos you want to model.
- **NEVER put a trailing `# comment` (or emoji) on a `curl … | bash` line.** It mis-parses on paste and SIGPIPEs the script — see [`brain/anti-patterns/inline-comments-in-piped-bash.md`](../../../brain/anti-patterns/inline-comments-in-piped-bash.md) (Paxel, 2026-06-04). Put the explanation on its own line, above the bare command.

## Step 6 — Create the repo (the irreversible step)

Only now, with checks clean and files in place:

```bash
git init && git add -A && git commit -m "Initial commit"
gh repo create "<owner>/<name>" --public --source=. --remote=origin \
  --description "<one-line description>" --push
```

- Re-confirm `--public` is what the user asked for. Default to `--private` if there is any ambiguity.
- Add **description** and **topics** (`gh repo edit --add-topic …`) — discoverability is part of "publish."
- A raw-file install URL only works after the push and on the default branch (`main`).

## Step 7 — Post-publish smoke test

"It's on GitHub, I assume it works" is how you ship a same-hour patch. From a **fresh clone in a clean dir**, run the canonical path end-to-end:

```bash
cd "$(mktemp -d)" && git clone "https://github.com/<owner>/<name>.git" && cd "<name>"
# run the documented quickstart exactly as a stranger would
```

If it's also going to a registry, continue with [`oss-publishing-checklist.md`](oss-publishing-checklist.md) (bin paths, `npm pack --dry-run`, 2FA/auth, version bumps, fresh-install smoke).

---

## The 60-second checklist

- [ ] Step 0 existence check clean (filesystem + `gh repo list` + exact-name view)
- [ ] noreply `git config user.email` set before commit #1
- [ ] secret/PII scan clean; `.gitignore` excludes `.env*`, keys
- [ ] README + LICENSE + .gitignore + CONTRIBUTING + CODE_OF_CONDUCT + SECURITY present
- [ ] license choice deliberate; LICENSE holder + README badge agree
- [ ] CI lint/test workflow present
- [ ] any `curl | bash` line is bare (no trailing comment)
- [ ] `--public` re-confirmed (else default private)
- [ ] description + topics set
- [ ] fresh-clone smoke test passed

## Provenance

Distilled while publishing `local-llm-setup` (2026-06-13). Builds directly on the two prior incidents it cites. Cross-referenced from [`BEST-PRACTICES.md`](../../../BEST-PRACTICES.md) "Never do this" and surfaced by the `/publish-repo` command.
