#!/usr/bin/env bun
// check-changelog.ts — catch a dropped changelog header before a reader (or /release) does.
//
// The defect this exists for: on 2026-06-14 the v1.26 entry's header was lost in a
// rebase, so a shipped feature (install.sh) silently rendered as part of v1.27. The
// body was there; the header wasn't. By eye it took a careful read to spot. This makes
// it a one-liner: every `vX.Y` that ships in a git commit subject must have a matching
// `## … vX.Y …` header in meta/changelog.md.
//
//   exit 0 = every shipped version has an entry (or is a documented fold)
//   exit 1 = a commit-subject version has no changelog header — likely a dropped header
//
// It checks ONE direction on purpose: commit-version → changelog header. The reverse
// (headers with no commit, e.g. web-UI entries v1.13–v1.16) is fine and expected, so
// it's reported as info only, never a failure. Folded small commits that intentionally
// never got their own block live in FOLDED below (see the changelog's numbering note).
//
// Usage: bun run scripts/check-changelog.ts            # report + gate
//        bun run scripts/check-changelog.ts --quiet    # gate only (CI); print on failure
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const quiet = process.argv.includes('--quiet');
const log = (s: string) => { if (!quiet) console.log(s); };

// Versions whose commits were deliberately folded into a neighbouring entry rather than
// getting their own block. Documented in meta/changelog.md → "Numbering note". Adding a
// version here is the explicit, auditable way to say "this fold is intentional."
const FOLDED = new Set(['v1.5', 'v1.6', 'v1.12']);

// ── changelog headers: ## 2026-… — vX.Y · title ───────────────────────────────
const changelog = readFileSync(resolve(root, 'meta', 'changelog.md'), 'utf8');
const headerVersions = new Set(
  [...changelog.matchAll(/^##\s+\d{4}-\d{2}-\d{2}\s+—\s+(v\d+\.\d+)\s/gm)].map((m) => m[1]),
);

// ── commit-subject versions: leading "vX.Y" in any commit subject ──────────────
const subjects = new TextDecoder()
  .decode(Bun.spawnSync(['git', 'log', '--format=%s'], { cwd: root }).stdout)
  .split('\n');
const commitVersions = new Set<string>();
for (const s of subjects) {
  const m = s.match(/^(v\d+\.\d+)\b/);
  if (m) commitVersions.add(m[1]);
}

// ── the gate: every shipped (committed) version needs an entry, unless folded ──
const byNum = (a: string, b: string) => Number(a.slice(1)) - Number(b.slice(1)) || a.localeCompare(b);
const missing = [...commitVersions].filter((v) => !headerVersions.has(v) && !FOLDED.has(v)).sort(byNum);
const headerOnly = [...headerVersions].filter((v) => !commitVersions.has(v)).sort(byNum);

log(`changelog headers: ${headerVersions.size} · commit-subject versions: ${commitVersions.size} · folded (exempt): ${[...FOLDED].sort(byNum).join(', ')}`);
if (headerOnly.length) log(`  ℹ entries with no version-tagged commit (fine — web-UI/non-vX.Y commits): ${headerOnly.join(', ')}`);

if (missing.length === 0) {
  log('✓ every shipped version has a changelog entry. No dropped headers.');
  process.exit(0);
}

console.error(`✗ ${missing.length} shipped version(s) have a commit subject but NO changelog header: ${missing.join(', ')}`);
console.error('  This usually means a header was dropped in a rebase (the body may still be there, mis-filed under the entry above it).');
console.error('  Fix: restore the header from its commit (e.g. `git show <sha> -- meta/changelog.md`), or — if the fold was intentional — add the version to FOLDED in this script.');
process.exit(1);
