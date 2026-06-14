#!/usr/bin/env bun
// check-assets.ts — catch a broken local asset/link reference before it ships blank.
//
// The defect this exists for: on 2026-06-15 the README's hero <img> pointed at a
// GIF that a rename had moved away (a failed multi-pathspec `git add` left the
// reference update unstaged). The file existed under a new name; the README
// pointed at the old one → the hero rendered blank on GitHub. By eye, "it
// committed" looked done. This makes it a one-liner: every relative file
// reference in the scanned docs must resolve to a real file.
//
//   exit 0 = every local reference resolves
//   exit 1 = a reference points at a file that doesn't exist (likely a rename
//            whose reference update never landed)
//
// Scope: relative references only — Markdown images/links ![](path) / [](path)
// and HTML src="path" / href="path". External URLs (http/https), in-page anchors
// (#...), and mailto: are skipped. Default targets: README.md + ACKNOWLEDGMENTS.md
// + docs/*.md (the operator-facing surfaces most likely to reference assets).
//
// Usage: bun run scripts/check-assets.ts            # report + gate
//        bun run scripts/check-assets.ts --quiet     # gate only (CI); print on failure
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const quiet = process.argv.includes("--quiet");
const log = (s: string) => { if (!quiet) console.log(s); };

// ── which docs to scan ─────────────────────────────────────────────────────
const docs: string[] = ["README.md", "ACKNOWLEDGMENTS.md"];
const docsDir = join(root, "docs");
if (existsSync(docsDir)) {
  for (const f of readdirSync(docsDir)) if (f.endsWith(".md")) docs.push(join("docs", f));
}

// ── extract relative reference targets from one doc ────────────────────────
const isExternal = (t: string) =>
  /^(https?:)?\/\//.test(t) || t.startsWith("#") || t.startsWith("mailto:") || t.startsWith("data:") || t.startsWith("<");

function refsIn(text: string): string[] {
  const out = new Set<string>();
  // Markdown ![alt](target) and [text](target) — target up to space/paren/quote
  for (const m of text.matchAll(/\]\(\s*([^)\s]+)/g)) out.add(m[1]);
  // HTML src="..." / href="..."
  for (const m of text.matchAll(/(?:src|href)\s*=\s*"([^"]+)"/g)) out.add(m[1]);
  return [...out].filter((t) => !isExternal(t)).map((t) => t.replace(/[?#].*$/, "")); // strip ?query / #frag
}

// ── check each reference resolves to a real file ───────────────────────────
const broken: { doc: string; ref: string }[] = [];
let checked = 0;
for (const doc of docs) {
  const abs = join(root, doc);
  if (!existsSync(abs)) continue;
  const base = dirname(abs);
  for (const ref of refsIn(readFileSync(abs, "utf8"))) {
    checked++;
    // resolve relative to the doc's own directory (how GitHub renders relative links)
    if (!existsSync(resolve(base, ref))) broken.push({ doc, ref });
  }
}

log(`checked ${checked} relative reference(s) across ${docs.length} doc(s)`);
if (broken.length === 0) {
  log("✓ every local asset/link reference resolves. No broken references.");
  process.exit(0);
}

console.error(`✗ ${broken.length} broken local reference(s) — pointing at files that don't exist:`);
for (const b of broken) console.error(`  - ${b.doc} → ${b.ref}`);
console.error("  Likely a rename whose reference update never landed (verify the staged set before committing).");
process.exit(1);
