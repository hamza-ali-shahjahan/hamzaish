#!/usr/bin/env bun
/**
 * check-import-boundaries — make an architectural invariant a property of the
 * build instead of a promise in a comment.
 *
 * Written 2026-08-20 after a product removed a metered API from its user-facing
 * paths. Every call site was deleted, the comments were updated, review passed
 * — and the API was STILL reachable, because one module used
 * `import type { X } from "the-sdk"`. Type-only imports are erased at compile
 * time, so they look free; they still put an edge in the module graph, and that
 * edge ran from a user request straight to the thing that had just been
 * removed. No human reading diffs was going to catch that.
 *
 * The general rule this encodes: **when you remove a capability for safety or
 * cost reasons, add a check that fails if it comes back.** Deleting code is not
 * enforcement — the next person re-adds it in good faith, because nothing
 * stopped them.
 *
 * Config: `.import-boundaries.json` at the repo root (or --config <path>).
 *
 *   {
 *     "boundaries": [
 *       {
 *         "name": "no BigQuery from user-facing paths",
 *         "forbidden": ["@google-cloud/bigquery"],
 *         "roots": ["src/app/**\/route.ts", "src/lib/tools/**\/*.ts"],
 *         "allow": ["src/app/api/admin/expansion/route.ts"],
 *         "why": "Metered API. Acquisition is approval-gated; see ADR-0006."
 *       }
 *     ]
 *   }
 *
 * `roots` are globbed, so a route added next week is covered without anyone
 * remembering to update a list — the failure mode of a hand-maintained roots
 * array is that it silently shrinks in coverage as the app grows.
 *
 * Exit 0 when every boundary holds, 1 otherwise. No config = pass (a repo that
 * has not declared any boundary has not violated one).
 *
 * ## Known limits
 * - Static analysis of `import`/`export ... from`/`require`/dynamic `import()`.
 *   Type-only imports are ignored by default (they are erased); opt in with\n *   `includeTypeOnly`.\n *   A module reached through a runtime string (`await import(name)`) is
 *   invisible, as is anything loaded by a bundler plugin.
 *   Real-world impact is low: the point is to stop an ordinary, well-meaning
 *   import, not a determined author.
 * - Resolves relative paths, the `@/` alias, and directory `index` files. Other
 *   tsconfig path aliases are not resolved and will read as external packages.
 * - Says nothing about whether the forbidden thing is CALLED — only whether it
 *   can be reached. That is deliberate: reachability is the property that
 *   survives refactoring.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, resolve, sep } from "node:path";

type Boundary = {
  name: string;
  forbidden: string[];
  roots: string[];
  allow?: string[];
  /**
   * Follow `import type` edges too. Default false — they are erased at compile
   * time, so a dependency boundary that counts them reports impossible
   * failures. Set true only for adjacency boundaries, where being one keystroke
   * away is itself the concern.
   */
  includeTypeOnly?: boolean;
  why?: string;
};

const ROOT = process.cwd();
const argConfig = process.argv.indexOf("--config");
const CONFIG = argConfig >= 0 ? process.argv[argConfig + 1] : ".import-boundaries.json";
const quiet = process.argv.includes("--quiet");

const log = (m = "") => {
  if (!quiet) console.log(m);
};

/** Minimal glob: supports `**`, `*`, and literal segments. */
function globToRegExp(glob: string): RegExp {
  const escaped = glob
    .split("/")
    .map((seg) => {
      if (seg === "**") return "(?:.+)?";
      return seg.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*");
    })
    .join("/")
    .replace(/\/\(\?:\.\+\)\?\//g, "(?:/.+)?/");
  return new RegExp(`^${escaped}$`);
}

function allFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) allFiles(p, out);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
}

function matchRoots(patterns: string[]): string[] {
  const regexes = patterns.map(globToRegExp);
  return allFiles(ROOT).filter((f) => {
    const rel = relative(ROOT, f).split(sep).join("/");
    return regexes.some((re) => re.test(rel));
  });
}

/**
 * Imports, split by whether they survive compilation.
 *
 * This distinction is the difference between a useful check and one that cries
 * wolf. `import type { X } from "pkg"` is ERASED — the module is never loaded,
 * nothing is installed, no code can run. So:
 *
 *   - A **dependency** boundary ("this must run with no node_modules") must
 *     ignore type-only edges, or it reports failures that cannot happen.
 *   - An **adjacency** boundary ("this path must not even be near the metered
 *     SDK") may want them, because a type-only import is one keystroke from a
 *     value import and signals the boundary is not really understood.
 *
 * Default is value-only — the runtime truth. Set `includeTypeOnly` per boundary
 * to opt into the stricter reading, and say why in `why`.
 */
function importsOf(file: string, includeTypeOnly: boolean): string[] {
  const src = readFileSync(file, "utf8");
  const specs: string[] = [];

  const fromRe = /(?:^|\n)(\s*(?:import|export)[\s\S]*?)from\s+["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = fromRe.exec(src))) {
    const clause = m[1];
    // `import type {...}` / `export type {...}` — erased. An inline
    // `import { type A, b }` still loads the module for `b`, so only a clause
    // whose `type` sits immediately after the keyword counts as type-only.
    const typeOnly = /^\s*(?:import|export)\s+type\b/.test(clause);
    if (typeOnly && !includeTypeOnly) continue;
    specs.push(m[2]);
  }

  for (const re of [
    /(?:^|\n)\s*import\s+["']([^"']+)["']/g, // side-effect import
    /import\(\s*["']([^"']+)["']\s*\)/g,
    /require\(\s*["']([^"']+)["']\s*\)/g,
  ]) {
    while ((m = re.exec(src))) specs.push(m[1]);
  }
  return specs;
}

function resolveSpec(spec: string, from: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(ROOT, "src", spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null; // bare package — not a local file
  for (const c of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

/** Depth-first; returns the offending chain or null. */
function findPath(
  entry: string,
  forbidden: Set<string>,
  includeTypeOnly: boolean,
): string[] | null {
  const seen = new Set<string>();
  const stack: Array<{ file: string; chain: string[] }> = [
    { file: entry, chain: [relative(ROOT, entry)] },
  ];
  while (stack.length) {
    const { file, chain } = stack.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const spec of importsOf(file, includeTypeOnly)) {
      if (forbidden.has(spec)) return [...chain, spec];
      const next = resolveSpec(spec, file);
      if (next) stack.push({ file: next, chain: [...chain, relative(ROOT, next)] });
    }
  }
  return null;
}

function main() {
  const configPath = join(ROOT, CONFIG);
  if (!existsSync(configPath)) {
    log(`check-import-boundaries: no ${CONFIG} — nothing declared, nothing to enforce.`);
    process.exit(0);
  }

  const { boundaries } = JSON.parse(readFileSync(configPath, "utf8")) as {
    boundaries: Boundary[];
  };
  let violations = 0;
  let checked = 0;

  for (const b of boundaries) {
    const forbidden = new Set(b.forbidden);
    const allow = new Set((b.allow ?? []).map((a) => a.split("/").join(sep)));
    const roots = matchRoots(b.roots);

    if (roots.length === 0) {
      console.error(`✗ ${b.name}: roots matched NO files — the boundary is vacuous`);
      console.error(`  patterns: ${b.roots.join(", ")}`);
      violations++;
      continue;
    }

    const bad: string[][] = [];
    for (const r of roots) {
      const rel = relative(ROOT, r);
      if (allow.has(rel)) continue;
      checked++;
      const hit = findPath(r, forbidden, b.includeTypeOnly ?? false);
      if (hit) bad.push(hit);
    }

    if (bad.length === 0) {
      log(`  ✓ ${b.name} — ${roots.length} entry point(s), ${allow.size} allowed exception(s)`);
    } else {
      violations += bad.length;
      console.error(`\n✗ ${b.name} — ${bad.length} violation(s)`);
      if (b.why) console.error(`  why this boundary exists: ${b.why}`);
      for (const chain of bad) console.error(`\n  ${chain.join("\n    → ")}`);
    }
  }

  if (violations) {
    console.error(
      `\n✗ check-import-boundaries: ${violations} violation(s) across ${checked} entry point(s).`,
    );
    console.error(
      `  Either the import is wrong, or the boundary moved — if the latter, change ${CONFIG}\n` +
        `  deliberately so the decision is recorded rather than quietly eroded.\n`,
    );
    process.exit(1);
  }

  log(`\n✓ check-import-boundaries: ${checked} entry point(s), every boundary holds.\n`);
  process.exit(0);
}

main();
