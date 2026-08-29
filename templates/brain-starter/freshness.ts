#!/usr/bin/env bun
// brain freshness probe — starter (ported from Hamzaish's own brain/freshness.ts)
//
// Answers one question cheaply: has the corpus moved since the index was last
// built? Stat-only — no file reads, no hashing of bodies — so ask.ts can
// afford to check this before EVERY query and rebuild only when something
// actually changed. Without this, a stale index doesn't return no hits — it
// returns confident, out-of-date ones, which is worse than admitting it
// doesn't know. (Design ported from Graft via Hamzaish; see Hamzaish's own
// brain/freshness.ts for the full writeup.)
//
//   bun brain/freshness.ts          # drift report; exit 1 if stale
//   bun brain/freshness.ts --json

import { Database } from "bun:sqlite";
import { stat, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { corpusFiles, BRAIN_ROOT } from "./corpus.ts";

export const DB_PATH = join(import.meta.dir, "brain.db");
const FINGERPRINT_KEY = "corpus_fingerprint";

/**
 * How the fingerprint decides a file moved.
 *  - "stat" (default): size + mtime. Microseconds per file. Blind spot: an
 *    edit that preserves BOTH byte length and mtime reads as clean.
 *  - "hash": reads and hashes every body. Exact, slower — use it when you
 *    suspect a preserved-mtime edit.
 */
export type FingerprintMode = "stat" | "hash";

export function fingerprintMode(): FingerprintMode {
  return process.env.BRAIN_REFRESH === "hash" ? "hash" : "stat";
}

/** A single hash over the whole indexed file set — adds, deletes, renames and edits all move it. */
export async function computeFingerprint(
  mode: FingerprintMode = fingerprintMode(),
): Promise<{ fingerprint: string; files: number; elapsedMs: number }> {
  const startedAt = performance.now();
  const h = createHash("sha256");
  let files = 0;

  for await (const entry of corpusFiles()) {
    const abs = join(BRAIN_ROOT, entry.path);
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
      // Vanished between walk and stat — a concurrent delete. Record its
      // absence so the fingerprint still moves; ingest prunes the row.
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
    return null; // brain_meta missing — an index older than this probe. Reads as stale, self-heals on next ingest.
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

/** The cheap question ask.ts asks before every query. */
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

// CLI: a drift report. Never refreshes — reporting drift and fixing it are
// separate jobs, so this stays safe to run anywhere.
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
      console.log(`  run \`bun brain/ingest.ts\` to catch up (or just ask — brain/ask.ts refreshes itself)`);
    }
  }
  process.exit(report.stale ? 1 : 0);
}
