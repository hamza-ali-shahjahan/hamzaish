// Hamzaish — brain corpus
// The single definition of WHICH files the brain indexes.
//
// Both readers of this list must agree exactly or the freshness probe lies:
// `ingest.ts` reads it to build the index, `freshness.ts` stats the same files
// to decide whether the index has drifted. Two copies of this walk would drift
// apart silently — a file the probe doesn't watch is a file that can go stale
// without anyone noticing, which is the exact failure refresh-on-read exists
// to remove.

import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { existsSync } from "node:fs";

export const HAMZAISH_ROOT = join(import.meta.dir, "..");

type IngestRule = {
  root: string;
  source: string;
  exts: string[];
  recurse: boolean;
};

const INGEST_RULES: IngestRule[] = [
  // Top-level brain docs
  { root: "", source: "root", exts: [".md"], recurse: false }, // CLAUDE.md, README.md, MEMORY.md
  // Brain layer
  { root: "brain/identity", source: "brain/identity", exts: [".md"], recurse: true },
  { root: "brain/learnings", source: "brain/learnings", exts: [".md"], recurse: true },
  { root: "brain/anti-patterns", source: "brain/anti-patterns", exts: [".md"], recurse: true },
  { root: "brain/decision-log", source: "brain/decision-log", exts: [".md"], recurse: true },
  { root: "brain/knowledge", source: "brain/knowledge", exts: [".md"], recurse: true },
  // Standalone brain files (persona, operating-principles)
  { root: "brain", source: "brain", exts: [".md"], recurse: false },
  // Factory layer
  { root: "factory/playbooks", source: "factory/playbooks", exts: [".md"], recurse: true },
  { root: "factory/skills", source: "factory/skills", exts: [".md"], recurse: true },
  { root: "factory/agents", source: "factory/agents", exts: [".md"], recurse: true },
  { root: "factory/commands", source: "factory/commands", exts: [".md"], recurse: true },
  { root: "factory/workflows", source: "factory/workflows", exts: [".md"], recurse: true },
  // Meta layer
  { root: "meta", source: "meta", exts: [".md"], recurse: true },
  // Stack defaults
  { root: "stack", source: "stack", exts: [".md"], recurse: true },
  // Products — handled specially below so we can scope by slug
];

// Folders we never traverse into (matched by name, any depth)
const SKIP_DIRS = new Set([
  "_archive", "references", "node_modules", ".git", ".next", "dist", ".wrangler", ".turbo", "build"
]);

// Paths we never traverse into (matched by repo-relative prefix).
// AGENT-BLIND RULE: the judged system must never retrieve its own eval
// fixtures, rubrics, or verdicts via /brain-ask. Selection trusts separation,
// not re-checking (meta/SELF-EVOLUTION.md, meta/evals/README.md).
const SKIP_PATHS = ["meta/evals/skills", "meta/evals/runs"];

async function* walk(dir: string, recurse: boolean): AsyncGenerator<string> {
  const absDir = join(HAMZAISH_ROOT, dir);
  if (!existsSync(absDir)) return;
  const entries = await readdir(absDir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(absDir, e.name);
    if (e.isDirectory()) {
      if (!recurse) continue;
      if (SKIP_DIRS.has(e.name)) continue;
      if (e.name.startsWith(".")) continue;
      const rel = relative(HAMZAISH_ROOT, full);
      if (SKIP_PATHS.some((p) => rel === p || rel.startsWith(p + "/"))) continue;
      yield* walk(rel, recurse);
    } else if (e.isFile()) {
      yield relative(HAMZAISH_ROOT, full);
    }
  }
}

export type CorpusEntry = { path: string; source: string };

/**
 * Every file the brain indexes, with the source tag it is filed under.
 * Order is stable so the freshness fingerprint is reproducible.
 */
export async function* corpusFiles(): AsyncGenerator<CorpusEntry> {
  for (const rule of INGEST_RULES) {
    for await (const relPath of walk(rule.root, rule.recurse)) {
      if (!rule.exts.some((e) => relPath.endsWith(e))) continue;
      // root rule only picks top-level files (no subfolders)
      if (rule.root === "" && relPath.includes("/")) continue;
      // brain (non-recursive) rule only picks files directly in brain/
      if (rule.root === "brain" && relPath.split("/").length > 2) continue;
      yield { path: relPath, source: rule.source };
    }
  }

  // Products are walked specially so we can scope each by slug
  const productsAbs = join(HAMZAISH_ROOT, "products");
  if (!existsSync(productsAbs)) return;

  const productDirs = (await readdir(productsAbs, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"));

  for (const p of productDirs) {
    const base = `products/${p.name}`;
    const cfgPath = `${base}/product.config.json`;
    if (existsSync(join(HAMZAISH_ROOT, cfgPath))) {
      yield { path: cfgPath, source: "products/config" };
    }
    for (const f of ["README.md", "status.md", "scope.md", "prd.md", "metrics.md"]) {
      const fp = `${base}/${f}`;
      if (existsSync(join(HAMZAISH_ROOT, fp))) yield { path: fp, source: "products/docs" };
    }
    const decDir = `${base}/decisions`;
    if (existsSync(join(HAMZAISH_ROOT, decDir))) {
      for await (const f of walk(decDir, true)) {
        if (f.endsWith(".md")) yield { path: f, source: "products/decisions" };
      }
    }
    // Launch / analytics / interviews / learnings / validation / research docs.
    // (learnings + validation added 2026-07-02: product learnings were invisible
    // to the brain — the cross-product synthesis gap from the factory audit.
    // research added 2026-08-16 for market-xray: the walk is recursive, so the
    // local-only corpus/ under research/ becomes brain-searchable from disk even
    // though it is gitignored — evidence queryable, never committed.)
    for (const sub of ["launch", "analytics", "interviews", "learnings", "validation", "research"]) {
      const subDir = `${base}/${sub}`;
      if (existsSync(join(HAMZAISH_ROOT, subDir))) {
        for await (const f of walk(subDir, true)) {
          if (f.endsWith(".md")) yield { path: f, source: `products/${sub}` };
        }
      }
    }
  }

  const port = "products/_portfolio.md";
  if (existsSync(join(HAMZAISH_ROOT, port))) yield { path: port, source: "products/portfolio" };
}
