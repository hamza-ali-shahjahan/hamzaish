#!/usr/bin/env bun
// scripts/autonomy-loop.ts
//
// Unattended multi-session autonomy: relaunch fresh headless `claude` sessions
// that resume a `/goal` until it's achieved, blocked, or the session budget runs
// out. Each fresh session = a fresh context window, so a long task can outlive
// any single session's memory. Continuity lives on disk (the repo's files +
// `/goal`'s `.goal/` log + a small loop-state.json handoff).
//
// SAFETY (all enforced here):
//   - Opt-in: refuses unless the target repo has a `.autonomy-ok` marker file.
//   - Kill switch: stops before a session if a `STOP` file exists in the repo.
//   - Budget: hard `--max-sessions` cap (default 6).
//   - Branch-only + no irreversible/outward actions: instructed in every prompt
//     (no push to main, no deploy, no make-public, no money, no destructive ops).
//
// Usage:
//   bun scripts/autonomy-loop.ts --repo "<abs path>" --slug <name> \
//       --goal "<measurable objective>" [--max-sessions 6] [--runs-per-session 4] \
//       [--model sonnet] [--max-turns 60] [--dry-run]
//
// --dry-run prints the prompt + the exact `claude` command and exits (no launch).

import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? (process.argv[i + 1] ?? fallback) : fallback;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

const repo = arg("repo");
const goal = arg("goal");
const slug = arg("slug");
const maxSessions = Number(arg("max-sessions", "6"));
const runsPerSession = Number(arg("runs-per-session", "4"));
const model = arg("model", "sonnet")!;
const maxTurns = Number(arg("max-turns", "60"));
// Headless Claude needs a permission mode to use tools unattended. acceptEdits
// auto-accepts file edits; a fully unattended run that also needs Bash/git will
// want `bypassPermissions`. Operator chooses consciously — it's the risk knob.
const permissionMode = arg("permission-mode", "acceptEdits")!;
const DRY = flag("dry-run");

function die(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!repo) die("--repo <abs path to the product repo> is required.");
if (!goal) die('--goal "<measurable objective>" is required.');
if (!slug) die("--slug <short-name> is required (names the .goal/ folder).");
if (!existsSync(repo!)) die(`repo path does not exist: ${repo}`);

const okMarker = join(repo!, ".autonomy-ok");
if (!existsSync(okMarker)) {
  die(
    `refusing to run: ${repo}/.autonomy-ok not found.\n` +
      `  Autonomy is opt-in. Create that marker file in the repo to allow it:\n` +
      `    touch "${repo}/.autonomy-ok"`,
  );
}

const goalDir = join(repo!, ".goal", slug!);
const statePath = join(goalDir, "loop-state.json");

function sessionPrompt(sessionNum: number): string {
  return [
    `You are session ${sessionNum} of an UNATTENDED autonomy loop in this repo.`,
    ``,
    `First, read START-HERE.local.md and CLAUDE.md in the repo root so you respect`,
    `its rules and current state. Then pursue this objective:`,
    ``,
    `    ${goal}`,
    ``,
    `How:`,
    `1. Use the /goal skill to make measurable progress, doing up to`,
    `   ${runsPerSession} scored run(s) this session, writing its log under`,
    `   .goal/${slug}/. If a prior log exists, RESUME from it.`,
    `2. Work ONLY on a feature branch — never commit to main directly.`,
    `3. Do NOT take any irreversible or outward action unattended: no push to`,
    `   main, no production deploy, no making a repo public, no moving money, no`,
    `   deleting data, no sending external messages. If the objective needs any of`,
    `   those, or a human decision/credential you lack, STOP and mark blocked.`,
    `4. Before you finish this session, WRITE the file`,
    `   .goal/${slug}/loop-state.json with EXACTLY this shape:`,
    `   {"state":"achieved"|"blocked"|"continue","note":"<one line>","session":${sessionNum}}`,
    `   - "achieved": the /goal rubric bar is met (sustained).`,
    `   - "blocked": needs a human, a credential, or a forbidden action.`,
    `   - "continue": progress made, more remains (ran out of runs/context).`,
  ].join("\n");
}

async function readState(): Promise<{ state: string; note?: string } | null> {
  if (!existsSync(statePath)) return null;
  try {
    return JSON.parse(await readFile(statePath, "utf8"));
  } catch {
    return null;
  }
}

// Fail fast BEFORE burning sessions: the headless loop needs the `claude` CLI on PATH and
// a git repo to keep work on a branch. A flaky/missing shell is the #1 cause of an
// unattended run that "ran all night" but produced nothing — surface it in one message.
function preflight(): void {
  const problems: string[] = [];
  if (!Bun.which("claude"))
    problems.push("`claude` CLI not on PATH — headless sessions can't launch (install Claude Code).");
  if (!Bun.which("git"))
    problems.push("`git` not on PATH — branch-only safety can't be enforced.");
  if (!existsSync(join(repo!, ".git")))
    problems.push(`${repo} is not a git repo — run \`git init\` so work stays on a branch.`);
  if (problems.length) {
    console.error("✗ preflight failed:\n  - " + problems.join("\n  - "));
    process.exit(1);
  }
  console.log("✓ preflight ok: claude CLI + git + repo present.");
}

// HEAD sha, used to tell "made no progress" from "progressed but didn't write a handoff".
async function headSha(): Promise<string> {
  try {
    const p = Bun.spawn(["git", "-C", repo!, "rev-parse", "HEAD"], {
      stdout: "pipe",
      stderr: "ignore",
    });
    const out = await new Response(p.stdout).text();
    await p.exited;
    return out.trim();
  } catch {
    return "";
  }
}

async function runSession(sessionNum: number): Promise<number> {
  const prompt = sessionPrompt(sessionNum);
  const cmd = [
    "claude",
    "-p",
    prompt,
    "--model",
    model,
    "--max-turns",
    String(maxTurns),
    "--permission-mode",
    permissionMode,
  ];

  if (DRY) {
    console.log(`\n--- session ${sessionNum} (dry-run) ---`);
    console.log(`cwd: ${repo}`);
    console.log(
      `cmd: claude -p <prompt> --model ${model} --max-turns ${maxTurns} --permission-mode ${permissionMode}`,
    );
    console.log(`prompt:\n${prompt}`);
    return 0;
  }

  // Inherit stdio so a watched first run is visible live.
  const proc = Bun.spawn(cmd, { cwd: repo!, stdout: "inherit", stderr: "inherit" });
  return await proc.exited;
}

async function main() {
  // Clear any stale handoff so we read THIS run's state, not a previous one's.
  await mkdir(goalDir, { recursive: true });

  console.log(`▶ autonomy-loop — "${goal}"`);
  console.log(
    `  repo=${repo}\n  slug=${slug} model=${model} max-sessions=${maxSessions} runs/session=${runsPerSession}${DRY ? " (dry-run)" : ""}`,
  );

  if (!DRY) preflight();
  let stuck = 0; // consecutive sessions with no handoff AND no new commits
  let lastSha = DRY ? "" : await headSha();

  for (let s = 1; s <= maxSessions; s++) {
    if (existsSync(join(repo!, "STOP"))) {
      console.log(`\n■ STOP file present in repo — halting before session ${s}.`);
      return;
    }
    console.log(`\n=== session ${s}/${maxSessions} ===`);
    const code = await runSession(s);
    if (DRY) continue;
    if (code !== 0) {
      console.warn(`  ! claude exited ${code} — treating as end-of-session.`);
    }

    const state = await readState();
    const sha = await headSha();
    const advanced = sha !== "" && sha !== lastSha;
    lastSha = sha;
    if (!state) {
      if (advanced) {
        console.warn(
          `  ! no .goal/${slug}/loop-state.json this session, but new commits landed — ` +
            `treating as progress, continuing.`,
        );
        stuck = 0;
        continue;
      }
      stuck++;
      console.warn(
        `  ! no loop-state.json AND no new commits this session (stuck ${stuck}/2). ` +
          `Likely hit --max-turns (${maxTurns}) before writing state.`,
      );
      if (stuck >= 2) {
        console.log(
          `\n■ ${stuck} consecutive sessions made no progress and wrote no handoff — stopping to ` +
            `avoid burning the session budget blindly. Inspect ${repo}/.goal/${slug}/ ` +
            `(raise --max-turns, narrow the goal, or check the shell).`,
        );
        return;
      }
      continue;
    }
    stuck = 0;
    console.log(`  state=${state.state}${state.note ? ` — ${state.note}` : ""}`);
    if (state.state === "achieved") {
      console.log(`\n✓ Goal achieved after ${s} session(s).`);
      return;
    }
    if (state.state === "blocked") {
      console.log(`\n⏸ Blocked — needs you: ${state.note ?? "(no note)"}`);
      return;
    }
  }
  console.log(
    `\n◷ Session budget (${maxSessions}) spent without achieving the bar.\n` +
      `  Inspect ${repo}/.goal/${slug}/ and re-run to continue, or raise --max-sessions.`,
  );
}

main().catch((e) => {
  console.error("× autonomy-loop failed:", e);
  process.exit(1);
});
