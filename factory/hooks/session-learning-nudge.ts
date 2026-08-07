#!/usr/bin/env bun
// session-learning-nudge.ts — Stop hook: the self-improvement loop's floor.
//
// CLAUDE.md's rule is "every session that produces real work ends with a
// learning" — but until now the rule lived in prose, and prose gets dropped
// (the same drift class every hook in this directory exists for). This makes
// forgetting LOUD, exactly once: if a Hamzaish-managed repo landed real
// (non-wip) commits today, brain/learnings/ has no entry for today, and the
// capture queue is quiet — the session gets ONE blocking nudge to distill a
// learning before it stops. Horizon port (2026-08-05 scout): their post-turn
// review fork decides "anything memory-worthy?" — this is the deterministic
// rung of the same idea (the LLM rung arrives with /dream-review, phase 2).
//
// Hard rules:
// - FAIL-OPEN — any error → exit 0, silent. Never trap a session.
// - AT MOST ONE nudge per session — marker file written at nudge time.
// - stop_hook_active in → exit 0 immediately (the documented loop guard).
//
// Ships INERT (house pattern, decision-log 2026-07-14): activation is an
// explicit opt-in — see factory/hooks/README.md.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { queuePathFor } from "./capture-learning.ts";

export function localDateStamp(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Walk up from `start` (max 6 levels): is this a Hamzaish-managed surface? */
export function isManagedDir(start: string): boolean {
  let probe = start;
  for (let i = 0; i < 6; i++) {
    try {
      if (existsSync(join(probe, ".hamzaish-managed"))) return true;
      const claudeMd = join(probe, "CLAUDE.md");
      if (existsSync(claudeMd) && /hamzaish factory product/i.test(readFileSync(claudeMd, "utf8"))) {
        return true;
      }
    } catch {
      // unreadable level → keep walking
    }
    const parent = dirname(probe);
    if (parent === probe) break;
    probe = parent;
  }
  return false;
}

export interface NudgeInputs {
  stopHookActive: boolean;
  managed: boolean;
  markerExists: boolean;
  commitSubjectsToday: string[];
  learningsFileExists: boolean;
  queueFreshToday: boolean;
}

/** Pure decision: nudge only when real work happened and nothing got captured. */
export function shouldNudge(i: NudgeInputs): boolean {
  if (i.stopHookActive || !i.managed || i.markerExists) return false;
  const realWork = i.commitSubjectsToday.some((s) => !s.startsWith("wip(auto):"));
  if (!realWork) return false;
  if (i.learningsFileExists || i.queueFreshToday) return false;
  return true;
}

export function nudgeReason(dateStamp: string, hamzaishRoot: string): string {
  return (
    `🏭 Learning check (fires once per session): real commits landed today, but ` +
    `${hamzaishRoot}/brain/learnings/${dateStamp}.md has no entry and the capture ` +
    `queue is quiet. Append ONE distilled learning (what worked / what didn't / ` +
    `what surprised) to that file — or tell the user you're consciously skipping ` +
    `and why — then stop.`
  );
}

function commitSubjectsToday(cwd: string): string[] {
  try {
    return execFileSync(
      "git",
      ["-C", cwd, "log", "--since=midnight", "--pretty=%s", "-n", "50"],
      { timeout: 3000, stdio: ["ignore", "pipe", "ignore"] },
    )
      .toString()
      .split("\n")
      .filter(Boolean);
  } catch {
    return []; // no repo / no commits / git hiccup → treated as no real work
  }
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
      cwd?: string;
      stop_hook_active?: boolean;
    };
    const cwd = payload.cwd ?? process.cwd();
    const marker = join(tmpdir(), `hz-nudge-${payload.session_id ?? "unknown"}`);
    const root = process.env.HAMZAISH_ROOT ?? join(homedir(), "Claude", "Hamzaish");
    const stamp = localDateStamp();

    let queueFreshToday = false;
    try {
      const queuePath = queuePathFor(cwd);
      queueFreshToday =
        existsSync(queuePath) && localDateStamp(statSync(queuePath).mtime) === stamp;
    } catch {
      queueFreshToday = false;
    }

    const decide = shouldNudge({
      stopHookActive: payload.stop_hook_active === true,
      managed: isManagedDir(cwd),
      markerExists: existsSync(marker),
      commitSubjectsToday: commitSubjectsToday(cwd),
      learningsFileExists: existsSync(join(root, "brain", "learnings", `${stamp}.md`)),
      queueFreshToday,
    });
    if (!decide) return;

    writeFileSync(marker, new Date().toISOString()); // throttle BEFORE speaking
    process.stdout.write(
      JSON.stringify({ decision: "block", reason: nudgeReason(stamp, root) }) + "\n",
    );
  } catch {
    // FAIL-OPEN: never trap a session in a nudge loop.
  }
}

if (import.meta.main) {
  await main();
}
