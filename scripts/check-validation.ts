#!/usr/bin/env bun
// check-validation.ts — the "validate before you build" speed bump, made real.
//
// Reads products/<slug>/validation/README.md and gates on its State line.
//   exit 0 = clear to build (validated | in-progress | debt-accepted)
//   exit 1 = blocked (unvalidated, no recorded debt)
//   exit 2 = usage error
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

const text = readFileSync(ledger, 'utf8');
const state = (text.match(/\*\*State\*\*:\s*`?([a-z-]+)`?/i)?.[1] ?? 'unvalidated').toLowerCase();
const evidence = (text.match(/^###\s+\d{4}-\d{2}-\d{2}/gm) ?? []).length;

const PASS = new Set(['validated', 'in-progress', 'debt-accepted']);

if (PASS.has(state)) {
  console.log(`✓ ${slug}: validation state = ${state} (${evidence} evidence block(s)). Clear to build.`);
  process.exit(0);
}

console.error(`✗ ${slug}: validation state = ${state} (${evidence}/5 evidence blocks).`);
console.error('  Rule: 5 conversations with target-profile users before production code.');
console.error('  Building anyway is fine — but record it, don\'t skip it silently:');
console.error(`    edit products/${slug}/validation/README.md → State: \`debt-accepted\` + fill the Validation debt block.`);
process.exit(1);
