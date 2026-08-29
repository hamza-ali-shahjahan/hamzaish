// brain corpus — starter (ported pattern from Hamzaish's own brain/corpus.ts,
// generalized for any repo — see Hamzaish's brain/knowledge/2026-06-20-phase-c-brain-design.md
// and brain/decision-log/2026-08-29-company-brain-phase-1.md for where this came from)
//
// The single definition of WHICH files this brain indexes. Both `ingest.ts`
// and `freshness.ts` read this same generator so the index and the
// freshness probe can never watch different file sets — that's the failure
// Hamzaish's own brain hit before this pattern existed.
//
// Default: every `.md` file under BRAIN_ROOT, tagged by its top-level folder
// (or "root" for files directly at the repo root). No per-folder rules to
// maintain out of the box — add them once you know which sources you
// actually want to distinguish in search results (Hamzaish's own corpus.ts
// is a worked example of a repo that grew past this default).

import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { existsSync } from "node:fs";

// This file is expected to live at <your-repo>/brain/corpus.ts — one level
// up is the repo root, and that's what gets indexed.
export const BRAIN_ROOT = join(import.meta.dir, "..");

// Folders never traversed, matched by name at any depth. A name starting
// with "." or "_" is skipped automatically (dotfiles, and the convention of
// naming a folder "_archive" or "_draft" when you want it deliberately
// invisible to search) — add more here as your repo grows build output or
// vendor folders this doesn't already know about.
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".turbo", ".wrangler"]);

async function* walk(dir: string): AsyncGenerator<string> {
  const absDir = join(BRAIN_ROOT, dir);
  if (!existsSync(absDir)) return;
  const entries = await readdir(absDir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith(".") || e.name.startsWith("_")) continue;
    const rel = dir ? `${dir}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield* walk(rel);
    } else if (e.isFile() && e.name.endsWith(".md")) {
      yield rel;
    }
  }
}

export type CorpusEntry = { path: string; source: string };

/** Every file this brain indexes, tagged by its top-level folder ("root" for top-level files). */
export async function* corpusFiles(): AsyncGenerator<CorpusEntry> {
  for await (const relPath of walk("")) {
    const source = relPath.includes("/") ? relPath.split("/")[0] : "root";
    yield { path: relPath, source };
  }
}
