# OSS Publishing Checklist (npm / PyPI / crates / GitHub)

Six concrete gotchas paid for once by the wp-to-astro launch. Read this **before** any product enters publish-to-registry phase.

## The six gotchas

### 1. GitHub email privacy blocks first push

**Symptom**: `remote: error: GH007: Your push would publish a private email address`

**Fix**: Configure `git user.email` to your GitHub noreply (`<id>+<login>@users.noreply.github.com`) BEFORE the first commit.

```bash
# Get your noreply email
gh api user --jq '"\(.id)+\(.login)@users.noreply.github.com"'

# Configure for this repo
git config user.email "<the-noreply-email>"

# If commits already exist with the wrong email:
git rebase --root --exec 'git commit --amend --reset-author --no-edit'
```

### 2. npm silently strips `bin` paths with leading `./`

**Symptom**: Published package has no CLI binary. `npx <package>` errors `command not found`. Only signal is a one-line warning in `npm publish` output.

**Fix**: In `package.json` use `"bin": { "name": "bin/file.mjs" }` NOT `"./bin/file.mjs"`.

**Discipline**: Always run `npm pack --dry-run` and **read every line of output**. There are silent edits beyond this one.

### 3. 2FA with hardware security key (no TOTP) blocks publish

**Symptom**: `npm publish` returns `EOTP — open this URL in your browser to authenticate`. URL gets censored to `***` in non-TTY output (bash captures, CI logs) so the flow can't be driven from a script.

**Three options**:
- **Best for CI / future automation**: generate a granular access token at npmjs.com with "Bypass 2FA when publishing" checked. Set as `NPM_TOKEN` env var.
- **Cheapest one-shot**: run `npm publish --access public --auth-type=web` in YOUR terminal so the URL prints unmasked. Click, security key, done.
- Avoid: `pnpm publish --auth-type=web` — doesn't pass through cleanly; gets stuck on OTP wall.

### 4. `pnpm publish` doesn't pass `--auth-type=web` through cleanly

**Symptom**: The web-auth flow never triggers; stuck on OTP wall.

**Fix**: Use `npm publish` directly for the publish step. You can keep pnpm for everything else (install, run, build).

### 5. You can't republish the same version number

**Symptom**: `npm publish` returns 403, even if you `npm unpublish` the version first (within the 72-hour window).

**Fix**: Bump the patch (`0.6.0` → `0.6.1`), update CHANGELOG with "regression fix" note, republish.

**Bonus**: `npm deprecate <pkg>@<broken> "<reason>"` adds a friendly warning to anyone who pinned the broken release.

### 6. Post-publish "fresh install" smoke test is NOT optional

**Symptom**: "It was on the registry, I assumed it worked" → 6 hours later: real-world test reveals the emitted output crashes downstream.

**Fix**: After every publish, IN A FRESH DIRECTORY:

```bash
mkdir /tmp/test-<pkg>-smoke
cd /tmp/test-<pkg>-smoke
npm init -y
npm install <pkg>
# Exercise the bin/entry point
# Run the FULL downstream pipeline against a representative real input
```

If you skip this, you'll ship a patch within the hour when reality intervenes. (We did. v0.6.0 → v0.6.1.)

## Pre-publish checklist

- [ ] `package.json` `bin` paths have no leading `./`
- [ ] `npm pack --dry-run` output read line-by-line; no surprises
- [ ] Auth method decided: token (CI) or web-auth (manual). Tested.
- [ ] Version number is one you've never used (bump even if last publish was unpublished)
- [ ] LICENSE file present and matches package.json `license` field
- [ ] README has install instructions that work for a stranger
- [ ] CHANGELOG entry for this version

## Post-publish checklist (within 30 minutes of `npm publish`)

- [ ] Fresh install in `/tmp/...` — package downloads
- [ ] CLI binary actually invokable (`npx <pkg>` or `<bin>` in PATH)
- [ ] Run the canonical demo path end-to-end on a representative real input
- [ ] Output passes the deepest consumer-side validation (see [output-validation-for-codegen-tools.md](output-validation-for-codegen-tools.md))
- [ ] GitHub release tagged and published with the changelog excerpt
- [ ] Smoke test result recorded — either ✓ or "0.x.y+1 patch needed for <issue>"

## When publishing to multiple registries

Patterns transfer:
- **PyPI**: equivalent of (1) is missing `homepage` causing reverse-DNS check issues; (2) is `console_scripts` entry-point typos failing silently; (6) post-publish `pip install` smoke is mandatory.
- **crates**: (5) is even harsher — crates can't be unpublished at all. Always bump.
- **RubyGems**: post-publish `gem install` smoke same as npm.
- **GitHub Container Registry**: layer caching can mask `Dockerfile` regressions; pull from a fresh runner to test.

## Provenance

Tuition paid in the wp-to-astro launch, 2026-05-30. See `meta/retros/2026-05-30-wp-to-astro-shipping.md` and `brain/learnings/2026-05-30.md`.
