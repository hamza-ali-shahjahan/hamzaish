#!/usr/bin/env bun
// check-npm-bin — preflight a package.json's `bin` so the CLI survives `npm publish`.
//
// The trap (paid for twice): npm STRIPS any bin target with a leading "./" at
// publish-normalize time. The command silently vanishes from the installed package;
// the only hint is one warning line you'll scroll past. Proven empirically:
//
//     bin "./x.ts"  → stripped        bin "x.ts"  → survives
//     bin "./x"     → stripped        bin "x"     → survives
//     bin "./x.mjs" → stripped        bin "x.mjs" → survives
//
//   => it's the "./", NOT the extension.
//   => and `npm pack` keeps the bin silently — only `npm publish --dry-run` surfaces it.
//   See factory/playbooks/launch-stage/oss-publishing-checklist.md (#2).
//
// Secondary: a raw ".ts" bin only runs under `bun`; `npx`/node can't execute it.
// Fine for a bun-only tool; for node reach, point bin at an extensionless launcher.
//
//   bun scripts/check-npm-bin.ts [package-dir]     # default: cwd
//
// Exit 1 on any ERROR (leading "./", or a bin target that doesn't exist).

import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const dir = resolve(process.argv[2] ?? ".");
const pkgPath = join(dir, "package.json");
if (!existsSync(pkgPath)) {
  console.error(`✗ no package.json at ${dir}`);
  process.exit(2);
}

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const bin = pkg.bin;
if (!bin) {
  console.log('• no "bin" field — nothing to check.');
  process.exit(0);
}

const entries: [string, string][] =
  typeof bin === "string" ? [[pkg.name ?? "(package)", bin]] : Object.entries(bin);

let errors = 0;
let warns = 0;
console.log(`📦 check-npm-bin — ${pkg.name ?? dir}\n`);

for (const [cmd, target] of entries) {
  // ERROR: leading ./ or ../ — npm strips it at publish, the command disappears.
  if (/^\.\.?\//.test(target)) {
    errors++;
    console.log(`  ✗ ${cmd} → "${target}"`);
    console.log(`     npm STRIPS leading "./" bin targets at publish — the command will vanish.`);
    console.log(`     fix: drop the leading "./"  →  "${target.replace(/^\.\.?\//, "")}"`);
    continue;
  }
  // ERROR: target file missing — npm would publish a dangling bin.
  const file = join(dir, target);
  if (!existsSync(file)) {
    errors++;
    console.log(`  ✗ ${cmd} → "${target}"  (file does not exist in the package)`);
    continue;
  }
  // WARN: raw .ts bin is bun-only (node/npx can't run it).
  if (basename(target).endsWith(".ts")) {
    warns++;
    console.log(`  ⚠ ${cmd} → "${target}"  bun-only (npx/node can't execute a .ts bin)`);
    console.log(`     ok if bun-only by design; for node reach, use an extensionless launcher.`);
    continue;
  }
  // WARN: no shebang — the bin won't be directly executable.
  if (readFileSync(file, "utf8").slice(0, 2) !== "#!") {
    warns++;
    console.log(`  ⚠ ${cmd} → "${target}"  no shebang — add e.g. "#!/usr/bin/env bun"`);
    continue;
  }
  console.log(`  ✓ ${cmd} → "${target}"`);
}

console.log("");
if (errors) {
  console.log(`✗ ${errors} error(s) — this package would publish a broken or absent CLI.`);
  process.exit(1);
}
console.log(warns ? `✓ no publish-breaking errors (${warns} warning(s) to weigh).` : `✓ bin is publish-safe.`);
