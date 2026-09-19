#!/usr/bin/env bun
// check-user-state.ts — a USER's product state must never be committed to this (public) repo.
//
// The defect this exists for: on 2026-09-13 a routine product registration revealed that
// `products/` was TRACKED — 194 files across 23 real products (status, scope, learnings,
// decisions, validation notes, pricing thinking) were published in this permanently-public
// repo. The documented registration step (`cp -r products/_template products/<slug>`) put
// every user's private portfolio inside the tool's own git repo by default. That is wrong
// for the maintainer and much worse for a stranger who installs Hamzaish: on any machine,
// the person using the factory is a USER of it, and their portfolio is their data.
//
// Sibling guard: check-product-layout.ts covers product CODE inside this repo.
// This one covers product STATE — the metadata that guard deliberately allows.
//
//   exit 0 = only the factory's own fixtures are tracked under products/
//   exit 1 = a user's product state is tracked — untrack it (git rm -r --cached)
//
//   bun run check-user-state
// See brain/anti-patterns/user-state-inside-factory-repo.md
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// The factory's OWN fixtures under products/ — these are tool, not user data.
// `_template` is what a user copies; `_smoke` is CI's fixture; `_community` is
// contributed examples; the loose files are the repo's own docs and the empty
// starters `bun run setup` copies. NOT here: `_portfolio.md` — the snapshot
// /portfolio-pulse writes is the user's live business state (untracked 2026-09-19).
const FACTORY_FIXTURES = new Set([
  "_template", "_smoke", "_community",
  "README.md", "SHOWCASE.md", "_portfolio.example.md", "_active.example.md",
]);

let tracked: string[];
try {
  tracked = execFileSync("git", ["ls-files", "products/"], { cwd: root, encoding: "utf8" })
    .split("\n").filter(Boolean);
} catch {
  console.error("check-user-state: could not run `git ls-files` (not a git repo?)");
  process.exit(1);
}

// products/<entry>/... — anything whose first path entry isn't a fixture is user state.
const offenders = new Map<string, number>();
const folders = new Set<string>();
for (const path of tracked) {
  const parts = path.split("/");
  const entry = parts[1];
  if (!entry || FACTORY_FIXTURES.has(entry)) continue;
  offenders.set(entry, (offenders.get(entry) ?? 0) + 1);
  if (parts.length > 2) folders.add(entry);
}

if (offenders.size === 0) {
  console.log(`✓ check-user-state: only factory fixtures tracked under products/ (${tracked.length} files)`);
  process.exit(0);
}

const total = [...offenders.values()].reduce((a, b) => a + b, 0);
console.error(`✗ check-user-state: ${total} file(s) of USER product state are tracked in this public repo.\n`);
for (const [slug, n] of [...offenders].sort((a, b) => b[1] - a[1])) {
  console.error(`    products/${slug}${folders.has(slug) ? "/" : ""}  — ${n} file(s)`);
}
console.error(`
  A product's state belongs to the person who built it, not to the factory.
  This repo is permanently public: anything tracked here is published.

  Fix (files stay on disk — this only untracks them):

      ${[...offenders.keys()].map((s) => `git rm -r --cached products/${s}`).join("\n      ")}

  Then commit. .gitignore already ignores products/* except the factory's fixtures.`);
process.exit(1);
