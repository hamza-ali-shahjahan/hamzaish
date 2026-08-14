#!/usr/bin/env bun
// check-validation.ts — the "validate before you build" speed bump, made real.
//
// Reads products/<slug>/validation/README.md and gates on its State line.
//   exit 0 = clear to build — `debt-accepted`, or `validated`/`in-progress` backed by
//            at least one real evidence block under the ledger's `## Evidence` section
//   exit 1 = blocked (unvalidated, an empty claim, or no recorded debt)
//   exit 2 = usage error
//
// A state that claims validation has to show its work: `in-progress` used to pass with
// an empty ledger, and evidence used to be counted file-wide, so the `## Validation debt`
// block — a record of NOT validating — counted as evidence for it. See lib/validation-ledger.ts.
//
// It is a SPEED BUMP, not a wall. Building unvalidated is allowed — but the script
// forces you to either validate or write the debt down. The mistake we made on
// wp-to-astro (six build passes before one user conversation) becomes impossible to
// make *silently*.
//
// Usage: bun run scripts/check-validation.ts <slug>
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateLedger, TARGET_EVIDENCE } from './lib/validation-ledger';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];

if (!slug) {
  console.error('usage: bun run scripts/check-validation.ts <slug>');
  process.exit(2);
}

const ledger = resolve(root, 'products', slug, 'validation', 'README.md');

if (!existsSync(ledger)) {
  console.error(`✗ ${slug}: no validation ledger at products/${slug}/validation/README.md`);
  console.error('  → seed one from products/_template/validation/README.md');
  process.exit(1);
}

const { state, evidence, pass, reason } = evaluateLedger(readFileSync(ledger, 'utf8'));

if (pass) {
  console.log(`✓ ${slug}: validation state = ${state} (${evidence} evidence block(s)). Clear to build.`);
  process.exit(0);
}

console.error(`✗ ${slug}: validation state = ${state} (${evidence}/${TARGET_EVIDENCE} evidence blocks).`);
console.error(`  ${reason}`);
console.error(`  Momentum-first: build cheap & reversible freely; before expensive/irreversible bets, aim for ~${TARGET_EVIDENCE} target-profile conversations.`);
console.error('  Building anyway is fine — but record it, don\'t skip it silently. In products/' + slug + '/validation/README.md:');
console.error('    · log each real conversation as a `### YYYY-MM-DD — who they are` block under `## Evidence`, or');
console.error('    · set State: `debt-accepted` and fill the Validation debt block.');
process.exit(1);
