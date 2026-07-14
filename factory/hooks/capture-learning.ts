#!/usr/bin/env bun
/**
 * factory/hooks/capture-learning.ts
 *
 * Automatic correction-capture hook for the Hamzaish factory.
 *
 * WHAT IT DOES
 *   Registered (opt-in) as a Claude Code `UserPromptSubmit` hook, it inspects
 *   each user prompt for corrections / preferences / guardrails / praise, scores
 *   the match, and appends a candidate learning to a per-project, GITIGNORED
 *   queue under ~/.claude — never into any committed file. `/reflect` drains the
 *   queue and hands survivors to `/learn-loop`, which remains the promotion gate.
 *
 * WHY
 *   Hamzaish's learning machine (`/learn-loop` 5-axis scoring, fresh-eyes verify,
 *   `/kill-or-keep` feedback closure) is strong, but it can only score what got
 *   written down — and capture is manual today (a correction survives only if the
 *   model remembers to append it to brain/learnings/YYYY-MM-DD.md). This closes
 *   that gap: capture becomes automatic; promotion stays human-gated.
 *
 *   Pattern set + confidence approach adapted from Bayram Annakov's claude-reflect
 *   (MIT, https://github.com/BayramAnnakov/claude-reflect). We borrow the *capture
 *   mechanism*, NOT its storage target — see factory/hooks/README.md and
 *   brain/decision-log/2026-07-14-adopt-auto-capture-from-claude-reflect.md.
 *
 * TWO HARD RULES (mirroring scripts/auto-commit.sh):
 *   • FAIL-OPEN — any error → exit 0 with NO stdout. A UserPromptSubmit hook that
 *     printed to stdout would inject text into the model's context, and a non-zero
 *     exit (code 2) would BLOCK the user's prompt. Neither may ever happen here.
 *   • NEVER CAPTURE SECRETS — prompts that look like they carry a key/token/private
 *     key are skipped entirely (ties to the global secrets-file guardrail).
 *
 * The queue holds raw prompt text, which is fine because it lives ONLY in
 * ~/.claude (gitignored, never a repo). Promotion into any committed file must
 * DISTILL the lesson, never paste the raw line (conversations-never-in-a-repo).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type Sentiment = "correction" | "positive";
export type LearningType = "explicit" | "guardrail" | "correction" | "positive";

export interface CaptureRecord {
  type: LearningType;
  message: string;
  timestamp: string;
  project: string;
  patterns: string; // space-separated pattern names that fired
  confidence: number; // 0..1
  sentiment: Sentiment;
  decay_days: number; // staleness clock for UNPROCESSED queue items only
  session_id?: string;
}

/** Named detectors. Order matters: strongest signal wins the `type`. */
const DETECTORS: Array<{ name: string; type: LearningType; sentiment: Sentiment; base: number; re: RegExp }> = [
  // Explicit "write this down" intents — the highest-signal capture.
  { name: "explicit", type: "explicit", sentiment: "correction", base: 0.9,
    re: /\b(remember(?:\s+this)?|note to self|for future reference|keep in mind|from now on)\b/i },
  // Standing rules / guardrails.
  { name: "guardrail", type: "guardrail", sentiment: "correction", base: 0.85,
    re: /\b(always|never|make sure(?: to)?|you must|don'?t ever|be sure to)\b/i },
  // In-the-moment corrections.
  { name: "correction", type: "correction", sentiment: "correction", base: 0.7,
    re: /(\bno,|\bnope\b|\bdon'?t\b|\bdo not\b|\bstop\b|that'?s wrong|that is wrong|\bincorrect\b|\bactually,|\binstead\b|\brather than\b|use .+ not |not .+ use )/i },
  // Positive reinforcement — lower signal, routed to an auto-memory tier.
  { name: "positive", type: "positive", sentiment: "positive", base: 0.6,
    re: /\b(perfect|exactly|that'?s it|love it|works great|nailed it|well done|great,? that)\b/i },
];

/** Secret-shaped content — if any fires we skip capture entirely. */
const SECRET_PATTERNS: RegExp[] = [
  /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/,
  /\bsk-[A-Za-z0-9_-]{16,}/,              // OpenAI/Anthropic-style
  /\bAKIA[0-9A-Z]{16}\b/,                  // AWS access key id
  /\bghp_[A-Za-z0-9]{20,}/,                // GitHub PAT
  /\b(api[_-]?key|secret|password|passwd|access[_-]?token|bearer|private[_-]?key)\b\s*[:=]\s*\S+/i,
  /\b[A-Za-z0-9+/]{40,}={0,2}\b/,          // long base64/hex blob (over-broad on purpose: skipping is safe)
];

export function looksLikeSecret(prompt: string): boolean {
  return SECRET_PATTERNS.some((re) => re.test(prompt));
}

/** Encode a cwd the same way Claude Code names its ~/.claude/projects/<dir>. */
export function encodeCwd(cwd: string): string {
  return cwd.replace(/[^A-Za-z0-9]/g, "-");
}

export function queuePathFor(cwd: string, home = homedir(), override = process.env.HAMZAISH_CAPTURE_QUEUE): string {
  if (override) return override;
  return join(home, ".claude", "projects", encodeCwd(cwd), "hamzaish-learnings-queue.json");
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Detect whether a prompt carries a reusable learning. Returns a scored record
 * (minus timestamp/project/session), or null if nothing worth capturing.
 * Pure + side-effect-free so it is unit-testable.
 */
export function detectLearning(prompt: string): Pick<CaptureRecord, "type" | "patterns" | "confidence" | "sentiment" | "decay_days"> | null {
  const text = (prompt ?? "").trim();
  if (text.length < 3) return null;
  if (looksLikeSecret(text)) return null;

  const hits = DETECTORS.filter((d) => d.re.test(text));
  if (hits.length === 0) return null;

  // Strongest detector defines the type/sentiment; multi-pattern raises confidence.
  const strongest = hits.reduce((a, b) => (b.base > a.base ? b : a));
  let confidence = strongest.base;
  if (hits.length >= 3) confidence += 0.1;
  else if (hits.length === 2) confidence += 0.05;

  // Length adjustment: terse instructions are usually crisp rules; essays are noisy.
  if (text.length < 80) confidence += 0.1;
  else if (text.length > 300) confidence -= 0.15;
  confidence = clamp01(Number(confidence.toFixed(2)));

  const decay_days = confidence >= 0.8 ? 120 : confidence >= 0.7 ? 90 : 45;

  return {
    type: strongest.type,
    patterns: hits.map((h) => h.name).join(" "),
    confidence,
    sentiment: strongest.sentiment,
    decay_days,
  };
}

/** Append a record to the JSON queue, creating the dir/file as needed. Atomic-ish. */
export function appendToQueue(queuePath: string, record: CaptureRecord): void {
  const dir = queuePath.slice(0, queuePath.lastIndexOf("/"));
  if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });

  let items: CaptureRecord[] = [];
  if (existsSync(queuePath)) {
    try {
      const parsed = JSON.parse(readFileSync(queuePath, "utf8"));
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      // Corrupt queue → start fresh rather than throw; capture is best-effort.
      items = [];
    }
  }
  items.push(record);

  const tmp = `${queuePath}.tmp`;
  writeFileSync(tmp, JSON.stringify(items, null, 2));
  renameSync(tmp, queuePath);
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

async function main(): Promise<void> {
  try {
    const raw = await readStdin();
    if (!raw.trim()) return; // nothing to do
    const payload = JSON.parse(raw) as { prompt?: string; cwd?: string; session_id?: string };
    const prompt = payload.prompt ?? "";
    const cwd = payload.cwd ?? process.cwd();

    const detected = detectLearning(prompt);
    if (!detected) return; // not a learning — stay silent

    const record: CaptureRecord = {
      ...detected,
      message: prompt,
      timestamp: new Date().toISOString(),
      project: cwd,
      session_id: payload.session_id,
    };
    appendToQueue(queuePathFor(cwd), record);
  } catch {
    // FAIL-OPEN: never block or pollute the user's prompt.
  }
  // Deliberately no stdout. Exit 0.
}

if (import.meta.main) {
  await main();
}
