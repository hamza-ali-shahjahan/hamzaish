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
import { dirname, resolve, join, relative } from "node:path";
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

function refsIn(raw: string): string[] {
  // Strip fenced code blocks + inline code spans first — href/src/links inside
  // documentation EXAMPLES (an SEO doc showing `<link href="/llms.txt">`, a
  // template line) are not real links and must not be flagged as broken.
  const text = raw.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  const out = new Set<string>();
  // Markdown ![alt](target) and [text](target) — target up to space/paren/quote
  for (const m of text.matchAll(/\]\(\s*([^)\s]+)/g)) out.add(m[1]);
  // HTML src="..." / href="..."
  for (const m of text.matchAll(/(?:src|href)\s*=\s*"([^"]+)"/g)) out.add(m[1]);
  return [...out].filter((t) => !isExternal(t)).map((t) => t.replace(/[?#].*$/, "")); // strip ?query / #frag
}

// ── check each reference resolves to a real file (and isn't gitignored) ─────
const broken: { doc: string; ref: string; why: string }[] = [];
const existing: { doc: string; ref: string; rel: string }[] = [];
let checked = 0;
for (const doc of docs) {
  const abs = join(root, doc);
  if (!existsSync(abs)) continue;
  const base = dirname(abs);
  for (const ref of refsIn(readFileSync(abs, "utf8"))) {
    checked++;
    const target = resolve(base, ref); // resolve relative to the doc's own dir (how GitHub renders it)
    if (!existsSync(target)) broken.push({ doc, ref, why: "file does not exist" });
    else existing.push({ doc, ref, rel: relative(root, target) });
  }
}

// A reference that resolves ONLY because the target is gitignored is broken for
// everyone else — absent in the repo, on GitHub, and in CI. (This class passed
// locally but failed CI on 2026-06-20: committed docs linking to gitignored
// meta/research/ files that exist on the author's disk but ship nowhere.)
if (existing.length) {
  const res = Bun.spawnSync(["git", "check-ignore", "--stdin"], {
    cwd: root,
    stdin: new TextEncoder().encode(existing.map((e) => e.rel).join("\n")),
    stdout: "pipe",
    stderr: "pipe",
  });
  const ignored = new Set(new TextDecoder().decode(res.stdout).split("\n").map((s) => s.trim()).filter(Boolean));
  for (const e of existing) {
    if (ignored.has(e.rel)) broken.push({ doc: e.doc, ref: e.ref, why: "resolves only to a gitignored file — absent for readers & CI" });
  }
}

log(`checked ${checked} relative reference(s) across ${docs.length} doc(s)`);
if (broken.length === 0) {
  log("✓ every local asset/link reference resolves. No broken references.");
  process.exit(0);
}

console.error(`✗ ${broken.length} broken local reference(s):`);
for (const b of broken) console.error(`  - ${b.doc} → ${b.ref}  (${b.why})`);
console.error("  Fix: point at a committed file. A gitignored target ships nowhere — readers and CI 404 even though it exists on your disk.");
process.exit(1);
