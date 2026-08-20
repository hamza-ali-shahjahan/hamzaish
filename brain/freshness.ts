#!/usr/bin/env bun
// Hamzaish — brain freshness probe
//
// Answers one question cheaply: has the markdown moved since the index was last
// built? Stat-only — no file reads, no hashing of bodies — so `/brain-ask` can
// afford to ask it before EVERY query and rebuild only when something actually
// changed.
//
// The defect this exists for: `brain/ask.ts` used to answer from whatever the
// last ingest left behind and merely PRINT "re-run bun brain/ingest.ts" in its
// no-hits footer. A stale index doesn't return no hits — it returns confident,
// out-of-date ones, so the reminder fired in the one case that wasn't the
// dangerous one. Recall that silently lags the files is worse than recall that
// admits it doesn't know.
//
//   bun brain/freshness.ts          # drift report; exit 1 if stale (like `graft check`)
//   bun brain/freshness.ts --json
//
// Prior art: Graft's ~3ms stat probe against the last build's fingerprint
// (references/README.md — "freshness engineering", studied 2026-07-30).

import { Database } from "bun:sqlite";
import { stat, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { corpusFiles, HAMZAISH_ROOT } from "./corpus.ts";

export const DB_PATH = join(import.meta.dir, "brain.db");
const FINGERPRINT_KEY = "corpus_fingerprint";

/**
 * How the fingerprint decides a file moved.
 *  - "stat" (default): size + mtime. Microseconds per file, and what any build
 *    system trusts. Blind spot: an edit that preserves BOTH byte length and
 *    mtime (a deliberate `touch -t` after a same-length change) reads as clean.
 *  - "hash": reads and hashes every body. Exact, and slower by roughly the cost
 *    of a full ingest — use it when you suspect a preserved-mtime edit.
 */
export type FingerprintMode = "stat" | "hash";

export function fingerprintMode(): FingerprintMode {
  return process.env.BRAIN_REFRESH === "hash" ? "hash" : "stat";
}

/**
 * A single hash over the whole indexed file set — path, size and mtime of every
 * file, in corpus order. Adds, deletes, renames and edits all move it.
 */
export async function computeFingerprint(
  mode: FingerprintMode = fingerprintMode(),
): Promise<{ fingerprint: string; files: number; elapsedMs: number }> {
  const startedAt = performance.now();
  const h = createHash("sha256");
  let files = 0;

  for await (const entry of corpusFiles()) {
    const abs = join(HAMZAISH_ROOT, entry.path);
    try {
      if (mode === "hash") {
        const body = await readFile(abs, "utf8");
        h.update(`${entry.path}:${createHash("sha256").update(body).digest("hex")}\n`);
      } else {
        const st = await stat(abs);
        h.update(`${entry.path}:${st.size}:${Math.floor(st.mtimeMs)}\n`);
      }
      files++;
    } catch {
      // Vanished between walk and stat — a concurrent delete. Record its absence
      // so the fingerprint still moves, then let ingest prune the row.
      h.update(`${entry.path}:MISSING\n`);
    }
  }

  return {
    fingerprint: h.digest("hex"),
    files,
    elapsedMs: Math.round(performance.now() - startedAt),
  };
}

export function readStoredFingerprint(db: Database): string | null {
  try {
    const row = db.prepare(`SELECT value FROM brain_meta WHERE key = ?`).get(FINGERPRINT_KEY) as
      | { value: string }
      | undefined;
    return row?.value ?? null;
  } catch {
    // brain_meta missing — an index built before this probe existed. Unknown
    // fingerprint reads as stale, which self-heals on the next ingest.
    return null;
  }
}

export function writeStoredFingerprint(db: Database, fingerprint: string): void {
  db.prepare(
    `INSERT INTO brain_meta (key, value, updated_at) VALUES ($k, $v, $t)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  ).run({ $k: FINGERPRINT_KEY, $v: fingerprint, $t: Date.now() });
}

export type FreshnessReport = {
  stale: boolean;
  reason: "no-index" | "never-fingerprinted" | "corpus-moved" | "fresh";
  stored: string | null;
  current: string | null;
  files: number;
  elapsedMs: number;
  mode: FingerprintMode;
};

/** The cheap question `/brain-ask` asks before every query. */
export async function checkFreshness(): Promise<FreshnessReport> {
  const mode = fingerprintMode();

  if (!(await Bun.file(DB_PATH).exists())) {
    return { stale: true, reason: "no-index", stored: null, current: null, files: 0, elapsedMs: 0, mode };
  }

  const { fingerprint, files, elapsedMs } = await computeFingerprint(mode);

  const db = new Database(DB_PATH, { readonly: true });
  db.exec("PRAGMA busy_timeout = 5000");
  let stored: string | null;
  try {
    stored = readStoredFingerprint(db);
  } finally {
    db.close();
  }

  if (stored === null) {
    return { stale: true, reason: "never-fingerprinted", stored, current: fingerprint, files, elapsedMs, mode };
  }
  if (stored !== fingerprint) {
    return { stale: true, reason: "corpus-moved", stored, current: fingerprint, files, elapsedMs, mode };
  }
  return { stale: false, reason: "fresh", stored, current: fingerprint, files, elapsedMs, mode };
}

const REASON_TEXT: Record<FreshnessReport["reason"], string> = {
  "no-index": "no index yet — nothing has been ingested",
  "never-fingerprinted": "index predates the freshness probe — one rebuild will settle it",
  "corpus-moved": "files have changed since the last ingest",
  fresh: "index matches the files on disk",
};

// CLI: a drift report, like `graft check`. Never refreshes — reporting drift and
// fixing it are separate jobs, so this stays safe to run anywhere.
if (import.meta.main) {
  const asJson = process.argv.includes("--json");
  const report = await checkFreshness();

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const mark = report.stale ? "✗ stale" : "✓ fresh";
    console.log(`${mark} — ${REASON_TEXT[report.reason]}`);
    console.log(`  ${report.files} files probed in ${report.elapsedMs}ms (${report.mode} mode)`);
    if (report.stale && report.reason !== "no-index") {
      console.log(`  run \`bun brain/ingest.ts\` to catch up (or just ask — /brain-ask refreshes itself)`);
    }
  }
  process.exit(report.stale ? 1 : 0);
}
