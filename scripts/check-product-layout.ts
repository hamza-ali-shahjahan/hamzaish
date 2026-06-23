#!/usr/bin/env bun
// check-product-layout.ts — a product's CODE must never live inside this (public) repo.
//
// The defect this exists for: on 2026-06-23 ship-guard was scaffolded with its scanner
// at `products/ship-guard/code/` — inside the always-public Hamzaish repo. There is no
// .gitignore rule excluding `products/*/code`, so that code was on track to be committed
// straight into the public factory repo (it only escaped because the root carries
// .no-auto-commit). The rule (CLAUDE.md / hamzaish.md): a product's code lives in its OWN
// sibling repo, registered in gitignored code-paths.local.json; `products/<slug>/` holds
// METADATA ONLY (markdown + product.config.json + the standard subfolders).
//
//   exit 0 = every products/<slug>/ is metadata-only (no code tree, no source files)
//   exit 1 = a product is carrying code inside the factory repo — move it to its own repo
//
//   bun run check-product-layout
// See brain/anti-patterns/product-code-inside-factory-repo.md
import { readdirSync, statSync } from "node:fs";
import { join, resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTS = join(root, "products");

// Directories that are unmistakably a code tree, not product metadata.
const CODE_DIRS = new Set([
  "code", "src", "bin", "app", "lib", "dist", "build", "out",
  "node_modules", ".next", "public", "components", "pages",
]);
// File extensions that are source code (metadata is .md / .json / .txt only).
const CODE_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".go", ".rs",
  ".rb", ".java", ".kt", ".c", ".cc", ".cpp", ".h", ".hpp", ".php",
  ".swift", ".vue", ".svelte", ".sql",
]);
// Manifests that signal a code project even with no source yet.
const CODE_FILES = new Set([
  "package.json", "tsconfig.json", "bun.lockb", "pnpm-lock.yaml",
  "yarn.lock", "Cargo.toml", "go.mod", "requirements.txt", "pyproject.toml",
]);

type Violation = { slug: string; kind: string; path: string };
const violations: Violation[] = [];

function relToProducts(p: string) {
  return p.slice(root.length + 1);
}

// Recurse a product folder; metadata folders are shallow so this stays cheap.
function scan(slug: string, dir: string) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (CODE_DIRS.has(e.name)) {
        violations.push({ slug, kind: `code directory \`${e.name}/\``, path: relToProducts(full) });
        continue; // don't descend — the whole tree is the violation
      }
      scan(slug, full);
    } else if (e.isFile()) {
      if (CODE_FILES.has(e.name)) {
        violations.push({ slug, kind: `project manifest \`${e.name}\``, path: relToProducts(full) });
      } else if (CODE_EXT.has(extname(e.name))) {
        violations.push({ slug, kind: `source file \`${extname(e.name)}\``, path: relToProducts(full) });
      }
    }
  }
}

let products: string[] = [];
try {
  products = readdirSync(PRODUCTS, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("_")) // _template, _community, _archive are infra
    .map((e) => e.name);
} catch {
  console.error(`✗ products/ not found at ${PRODUCTS}`);
  process.exit(1);
}

for (const slug of products) scan(slug, join(PRODUCTS, slug));

if (violations.length) {
  console.error("✗ Product CODE found inside the (public) Hamzaish repo. Code belongs in its OWN sibling repo.\n");
  const bySlug = new Map<string, Violation[]>();
  for (const v of violations) (bySlug.get(v.slug) ?? bySlug.set(v.slug, []).get(v.slug)!).push(v);
  for (const [slug, vs] of bySlug) {
    console.error(`  ${slug}:`);
    for (const v of vs.slice(0, 6)) console.error(`    • ${v.kind.padEnd(24)} ${v.path}`);
    if (vs.length > 6) console.error(`    • …and ${vs.length - 6} more`);
  }
  console.error("\n  Fix: move the code to its own repo (e.g. ~/Claude/<Name>, git init, no remote +");
  console.error("  .no-auto-push if held local), register the path in code-paths.local.json under the");
  console.error("  slug, set code_path:null in product.config.json, and keep products/<slug>/ metadata-only.");
  console.error("  Why: brain/anti-patterns/product-code-inside-factory-repo.md");
  process.exit(1);
}

console.log(`✓ product layout clean — all ${products.length} product folders are metadata-only (code lives in their own repos).`);
process.exit(0);
