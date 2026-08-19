// scripts/lib/verification-ledger.ts — tamper-evident record of what was actually verified.
//
// The defect this exists for: the receipt's "Checked:" line is written by the same
// entity that did the work. A session can say "Checked: 12 tests passed" having run
// nothing, and the legibility gate passes it — because that gate lints VOCABULARY and
// SHAPE, never TRUTH. Studied 2026-08-16 in robiot/fable-os, whose kernel refuses to
// let the model forge a trace line: the trusted channel is one the narrator cannot
// write to, and the dispatcher emits the line itself when a handler stays silent
// (core/tool.c). We cannot reproduce a ring-0 boundary in a single-agent shell, so we
// buy the next strongest property and NAME IT HONESTLY:
//
//   TAMPER-EVIDENT, NOT UNFORGEABLE.
//
//   • records are appended by the gate RUNNER from a real exit code, never composed
//     by the narrator;
//   • each record hash-chains to its predecessor, so a retroactive edit or a deleted
//     middle record breaks the chain and renders as BROKEN, not as success;
//   • an empty ledger renders "nothing was verified" — silence becomes a visible
//     claim instead of an absent one, which is the failure mode that matters most.
//
// A session with shell access can still append a false record. The chain makes that a
// deliberate act rather than a slip of narration, which is the honest ceiling here.
// Claiming more would be the exact sin this file exists to prevent.
//
// Pure functions only; verify.ts does the process spawning and file writes.
import { createHash } from "node:crypto";

/** One recorded gate execution. `hash` covers every other field plus `prev`. */
export type VerificationRecord = {
  /** ISO timestamp the gate finished. */
  ts: string;
  /** Gate name as invoked, e.g. "check-counts". */
  gate: string;
  /** The exact command run, for audit. */
  cmd: string;
  /** Real process exit code. 0 = pass. */
  exitCode: number;
  /** Wall-clock milliseconds. */
  durationMs: number;
  /** Hash of the previous record, or GENESIS for the first. */
  prev: string;
  /** sha256 over the canonical form of this record. */
  hash: string;
};

export const GENESIS = "genesis";

/** Fields that are hashed, in a fixed order — key order must never vary. */
function canonical(r: Omit<VerificationRecord, "hash">): string {
  return JSON.stringify([r.prev, r.ts, r.gate, r.cmd, r.exitCode, r.durationMs]);
}

export function hashRecord(r: Omit<VerificationRecord, "hash">): string {
  return createHash("sha256").update(canonical(r)).digest("hex").slice(0, 16);
}

/** Build the next record in a chain. `prior` is the existing (possibly empty) chain. */
export function appendRecord(
  prior: readonly VerificationRecord[],
  fields: Omit<VerificationRecord, "prev" | "hash">,
): VerificationRecord {
  const prev = prior.length === 0 ? GENESIS : prior[prior.length - 1]!.hash;
  const body = { ...fields, prev };
  return { ...body, hash: hashRecord(body) };
}

export type ChainStatus = { ok: true } | { ok: false; brokenAt: number; why: string };

/**
 * Verify the hash chain end to end. A broken chain is reported, never repaired —
 * repairing it would destroy the only evidence that something was edited.
 */
export function verifyChain(records: readonly VerificationRecord[]): ChainStatus {
  let expectedPrev = GENESIS;
  for (let i = 0; i < records.length; i++) {
    const r = records[i]!;
    if (r.prev !== expectedPrev) {
      return { ok: false, brokenAt: i, why: `record ${i} links to ${r.prev}, expected ${expectedPrev}` };
    }
    const recomputed = hashRecord(r);
    if (recomputed !== r.hash) {
      return { ok: false, brokenAt: i, why: `record ${i} (${r.gate}) content does not match its hash` };
    }
    expectedPrev = r.hash;
  }
  return { ok: true };
}

export type CheckedLine = {
  /** The rendered sentence, ready to paste after "Checked:". */
  text: string;
  /** True when every recorded gate passed AND at least one ran AND the chain holds. */
  clean: boolean;
  passed: string[];
  failed: string[];
};

/**
 * Render the receipt's Checked line FROM RECORDS. The narrator supplies no words here
 * beyond what the ledger contains — that is the whole point of the file.
 *
 * Plain, day-1 wording: this string is user-facing and passes the legibility gate.
 */
export function renderChecked(records: readonly VerificationRecord[]): CheckedLine {
  const chain = verifyChain(records);
  if (!chain.ok) {
    return {
      text: `the record of what was checked has been altered (${chain.why}) — treat nothing here as verified`,
      clean: false,
      passed: [],
      failed: [],
    };
  }
  if (records.length === 0) {
    return { text: "nothing was verified — no check was run this session", clean: false, passed: [], failed: [] };
  }
  // Last run wins per gate: a re-run after a fix is the state that counts.
  const latest = new Map<string, VerificationRecord>();
  for (const r of records) latest.set(r.gate, r);
  const passed = [...latest.values()].filter((r) => r.exitCode === 0).map((r) => r.gate).sort();
  const failed = [...latest.values()].filter((r) => r.exitCode !== 0).map((r) => r.gate).sort();

  const parts: string[] = [];
  if (passed.length > 0) parts.push(`${passed.join(", ")} ${passed.length === 1 ? "was" : "were"} run and passed`);
  if (failed.length > 0) parts.push(`${failed.join(", ")} ${failed.length === 1 ? "was" : "were"} run and FAILED`);
  return { text: parts.join("; "), clean: failed.length === 0, passed, failed };
}

/** Parse a JSONL ledger body. Unreadable lines are dropped, never guessed at. */
export function parseLedger(body: string): VerificationRecord[] {
  const out: VerificationRecord[] = [];
  for (const line of body.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    try {
      const r = JSON.parse(t);
      if (typeof r?.gate === "string" && typeof r?.exitCode === "number" && typeof r?.hash === "string") out.push(r);
    } catch {
      /* a corrupt line is not a verified gate — drop it and let the chain break loudly */
    }
  }
  return out;
}
