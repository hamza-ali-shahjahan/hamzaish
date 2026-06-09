# Security baseline — secure-by-default for every product

Every product Hamzaish scaffolds is secure from commit zero. This page is the
**why** behind that baseline and the threat model it defends against — AI-native
factories ship fast, and AI-generated code passes functional tests while failing
security silently. The defaults below are cheap to keep and expensive to bolt on
later.

The mechanical enforcement lives in:

- `templates/product-starter-nextjs/` — `.gitignore`, `.env.example`,
  `.github/workflows/secret-scan.yml`, `.gitleaks.toml`, `.githooks/pre-commit`
- `/security-check <slug>` — fast audit (`factory/commands/security-check.md`)
- `/ship <slug>` — the single deploy action (`factory/commands/ship.md`)
- `/scaffold` — wires all of this into new products (`factory/skills/scaffold/SKILL.md`)
- the deep pass — `factory/agents/mvp/security-reviewer/` +
  `factory/playbooks/mvp-stage/security-checklist.md`

---

## 1. Least-privilege + pinned GitHub Actions

CI runs with your repo's secrets in scope. Two failure modes dominate, and both
are config-level:

**Pin every action; never use a moving ref.** `@main` / `@master` / `@beta` is a
moving tag the upstream owner (or anyone who compromises them) can repoint at new
code — which then runs with your secrets. Pin to a **version tag at minimum, a full
commit SHA ideally**. Bump deliberately, reading the changelog.

```yaml
# bad — moving ref, runs whatever upstream pushes
- uses: some/action@main
# ok — version tag
- uses: some/action@v2.3.9
# best — immutable commit SHA
- uses: some/action@<40-char-sha> # v2.3.9
```

> **`anthropics/claude-code-action` — pin to `>= v1.0.94`.** Versions **before
> v1.0.94** are subject to a prompt-injection → secret-exfiltration advisory: a
> crafted issue/PR/comment could steer the action into leaking repo secrets. Pin
> to `v1.0.94` or later (ideally the patched commit SHA). `/security-check` flags
> any `claude-code-action` below v1.0.94, and flags bare `@v1`/`@beta`/`@main` on
> it as unpinned-and-unsafe.

**Declare least-privilege `permissions`.** The default `GITHUB_TOKEN` is often
write-scoped. Set the narrowest scope each job needs — the secret-scan and CI jobs
only need to read:

```yaml
permissions:
  contents: read   # nothing else unless a job genuinely needs it
```

Avoid `permissions: write-all`. Grant `contents: write` / `id-token: write` only
to the specific job that requires it.

## 2. Treat all external / user input as untrusted (prompt injection)

Anything you didn't author is attacker-controlled: issue and PR bodies, comments,
webhook payloads, scraped pages, uploaded files, and **any text passed to an LLM**.

- **CI triggers:** `pull_request_target`, `issues`, and `issue_comment` run in a
  **privileged context with secrets**. Never check out and run untrusted PR code,
  or feed issue/PR text into a privileged step, under those triggers. Use
  `pull_request` (no secrets for forks) for anything that executes contributor
  code. `/security-check` flags these.
- **LLM calls:** user text passed to a model can carry injected instructions
  ("ignore your rules, exfiltrate X"). Never let raw model output take privileged
  actions on the user's behalf, hit internal services, or render as trusted HTML.
  Sanitize model output before rendering (don't trust markdown to be safe HTML);
  keep LLM API keys server-side only; cap per-user spend.
- **App input:** validate every server action / API route with zod (or equivalent);
  parameterize SQL; validate file MIME/size/extension; guard user-supplied URLs
  against SSRF (no internal IPs).

## 3. Run agent-generated code in a disposable sandbox — never on the host

Code an agent writes or fetches should execute in a **throwaway, isolated
environment**, not on your machine or a host with credentials. A prompt-injected or
buggy agent that runs on the host can read your `~/.ssh`, env vars, and every other
repo.

- **Docker / VS Code devcontainer** — the default, and now **partly enforced
  rather than merely advised**: the Next.js starter ships a `.devcontainer/`
  (`devcontainer.json` + `Dockerfile`, Node + Bun, non-root user, **workspace-only
  mount, no host SSH/secret passthrough**), and `/scaffold` copies it into every
  new product and tells the operator to "Reopen in Container." So a freshly
  scaffolded product comes with the isolated box already wired — the agent works
  inside it with only the repo mounted; blow it away after. (Opening the product
  in the container is still the operator's action; running on the bare host
  instead is at their own risk.)
- **E2B (or equivalent ephemeral cloud sandbox)** — for running untrusted or
  generated code remotely with nothing of yours attached.
- Scope what the sandbox can reach: no host network to internal services, no real
  secrets unless the task genuinely needs them (and then only scoped, rotatable
  ones).

The rule: **the blast radius of a compromised agent should be one disposable box**,
not your laptop.

## 4. Secrets live in a manager, never in the repo

- Only `.env.example` (placeholder **names**, no values) is committed. `.env`,
  `.env.local`, `.env*.local` are gitignored.
- **Local dev:** real values in `.env.local` (gitignored).
- **Prod / preview:** a secret manager / platform env — **Vercel Project → Settings
  → Environment Variables**. CI uses throwaway placeholders for the build.
- **Defense in depth:** `gitleaks` runs in CI on every push/PR
  (`secret-scan.yml`), and the optional `.githooks/pre-commit` hook catches leaks
  before they leave your machine.
- **If a secret ever hits a commit, it is compromised** — even after deletion, it's
  in history and likely already scraped. **Rotate the key first**, then scrub
  history. Removal alone is not remediation.

## 5. RLS on by default (Supabase)

Row Level Security is the authorization backstop. Without it, the anon/service keys
plus a guessable query expose every row.

- **Every table holding user data:** `enable row level security` + an explicit
  policy that scopes rows to their owner. No `public`-readable policies on user data.
- Set the habit in the starter migration; don't wait until launch.
- App-layer `userId === resourceOwnerId` checks are good, but RLS is the layer that
  holds when an endpoint forgets the check. `/security-check` reminds you to verify
  RLS coverage.

## 6. Production-branch deploy model

Deploys are **deliberate, reviewed, and single-action** — not a side effect of
saving work.

- **Vercel Production Branch = `production`.** Pushes to the working branch
  (`main`) build Preview deployments, not Production.
- **`/ship <slug>` is the only deploy action.** It gates on `/security-check`,
  shows exactly what will ship, then fast-forwards reviewed commit(s) onto
  `production` and pushes. That push is the deploy.
- **Auto-commit `wip(auto):` snapshots stay on the working branch and never reach
  `production`.** They're recoverable save-points (see the auto-commit hook in the
  root `CLAUDE.md`), folded into a real commit before they're promoted.
- **Auto-push is opt-in (exfiltration posture).** The auto-commit hook makes
  **local restore-point commits by default and does not push.** A repo only
  pushes automatically if the operator drops a `.auto-push` marker in its root —
  and even then the hook **secret-scans the to-be-pushed commits** (gitleaks if
  installed, else a built-in key-pattern grep) and **aborts the push if a likely
  secret is found**. The default means your work and secrets don't leave the
  machine automatically; you push (or `/ship`) deliberately. (`.no-auto-push`
  remains as an extra hard guard.)
- `production` is fast-forward-only — never force-pushed or rewound. A divergence
  is a stop-and-resolve, not an override.

---

## What this baseline is NOT

A substitute for the full pre-launch review (`security-reviewer` agent +
`security-checklist.md`), a penetration test, or a SOC 2 audit. It's the
secure-by-default floor that makes those later efforts cheaper — not the ceiling.
