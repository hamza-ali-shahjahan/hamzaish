#!/usr/bin/env bun
// precompact-rescue.ts — PreCompact hook: rescue learning-shaped user turns from
// the transcript BEFORE compaction summarizes them away.
//
// Horizon port (google/adk-samples · long-horizon-harness, scouted 2026-08-05):
// their pre-compaction "flush fork" rescues durable facts to memory right before
// the summarizer runs, so lossy compaction can never eat them. This is the
// deterministic rung of that idea: re-run the capture classifier over the
// transcript's user turns and append anything missed to the SAME queue /reflect
// already drains — no new storage, no new review surface. The LLM rung
// (full-transcript fact rescue) arrives with /dream-review (phase 2).
//
// Why anything would be missed: capture-learning.ts only sees prompts typed
// AFTER hook registration — sessions born earlier (the 2026-08-06 drift class)
// or transcripts from machines without the hook got zero capture. Compaction
// is the last exit before those turns become summary soup.
//
// Same two hard rules as capture-learning.ts:
// - FAIL-OPEN — any error → exit 0, no stdout. Never block compaction.
// - NEVER capture secrets — detectLearning() drops secret-shaped text.
//
// Ships INERT (house pattern, decision-log 2026-07-14): activation is an
// explicit opt-in — see factory/hooks/README.md.

import { existsSync, readFileSync, statSync } from "node:fs";
import {
  appendToQueue,
  detectLearning,
  queuePathFor,
  type CaptureRecord,
} from "./capture-learning.ts";

const MAX_TRANSCRIPT_BYTES = 25 * 1024 * 1024; // pathological transcript → skip (fail-open)
const MAX_RESCUES_PER_RUN = 20; // bound a worst-case backlog of missed turns

export type RescueRecord = CaptureRecord & { source: "precompact-rescue" };

/** Pull plain-text USER turns out of a Claude Code JSONL transcript. */
export function extractUserTexts(jsonl: string): string[] {
  const texts: string[] = [];
  for (const line of jsonl.split("\n")) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line) as {
        type?: string;
        isMeta?: boolean;
        message?: { role?: string; content?: unknown };
      };
      if (entry?.type !== "user" || entry?.message?.role !== "user") continue;
      if (entry?.isMeta) continue;
      const content = entry.message?.content;
      if (typeof content === "string") {
        if (content.trim()) texts.push(content);
        continue;
      }
      if (Array.isArray(content)) {
        for (const part of content as Array<{ type?: string; text?: unknown }>) {
          if (part?.type === "text" && typeof part.text === "string" && part.text.trim()) {
            texts.push(part.text);
          }
        }
      }
    } catch {
      // Not JSON / unexpected shape → skip the line, keep scanning.
    }
  }
  return texts;
}

/**
 * Decide which user turns deserve rescue: learning-shaped (per the shared
 * classifier — secrets return null there) and not already in the queue.
 * Pure + side-effect-free so it is unit-testable.
 */
export function rescueRecords(
  userTexts: string[],
  existing: CaptureRecord[],
  cwd: string,
  sessionId?: string,
  now = new Date(),
): RescueRecord[] {
  const seen = new Set(existing.map((r) => r.message));
  const out: RescueRecord[] = [];
  for (const text of userTexts) {
    if (out.length >= MAX_RESCUES_PER_RUN) break;
    if (seen.has(text)) continue;
    const detected = detectLearning(text);
    if (!detected) continue;
    seen.add(text);
    out.push({
      ...detected,
      message: text,
      timestamp: now.toISOString(),
      project: cwd,
      session_id: sessionId,
      source: "precompact-rescue",
    });
  }
  return out;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

async function main(): Promise<void> {
  try {
    const raw = await readStdin();
    if (!raw.trim()) return;
    const payload = JSON.parse(raw) as {
      session_id?: string;
      transcript_path?: string;
      cwd?: string;
    };
    const cwd = payload.cwd ?? process.cwd();
    const transcriptPath = payload.transcript_path;
    if (!transcriptPath || !existsSync(transcriptPath)) return;
    if (statSync(transcriptPath).size > MAX_TRANSCRIPT_BYTES) return;

    const queuePath = queuePathFor(cwd);
    let existing: CaptureRecord[] = [];
    if (existsSync(queuePath)) {
      try {
        const parsed = JSON.parse(readFileSync(queuePath, "utf8"));
        if (Array.isArray(parsed)) existing = parsed;
      } catch {
        existing = []; // corrupt queue → rescue anyway; appendToQueue self-heals
      }
    }

    const rescued = rescueRecords(
      extractUserTexts(readFileSync(transcriptPath, "utf8")),
      existing,
      cwd,
      payload.session_id,
    );
    for (const record of rescued) appendToQueue(queuePath, record);
  } catch {
    // FAIL-OPEN: never block or slow compaction.
  }
  // Deliberately no stdout. Exit 0.
}

if (import.meta.main) {
  await main();
}
