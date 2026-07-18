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
//   - Budget: hard `--max-sessions` cap (default 6) AND a hard `--max-spend-usd`
//     dollar cap (default 25) — sessions are measured via `--output-format json`
//     (total_cost_usd), appended to meta/telemetry/spend.local.jsonl, and the
//     loop aborts + escalates the moment the cap is reached. This closes the
//     old #6 gap ("caps SESSIONS, not tokens/cost").
//   - Branch-only + no irreversible/outward actions: instructed in every prompt
//     (no push to main, no deploy, no make-public, no money, no destructive ops).
//   - FACTORY-ORDERS/STANDING-ORDERS: when the factory's .local control-plane
//     files exist, every session is instructed to read them FIRST and operate
//     inside their mandate, authority table, and stop conditions.
//
// Usage:
//   bun scripts/autonomy-loop.ts --repo "<abs path>" --slug <name> \
//       --goal "<measurable objective>" [--max-sessions 6] [--runs-per-session 4] \
//       [--model sonnet] [--max-turns 60] [--max-spend-usd 25] [--stream] [--dry-run]
//
// --dry-run prints the prompt + the exact `claude` command and exits (no launch).
// --stream restores live inherit-stdio output for a watched first run — cost can't
//   be parsed in that mode, so it requires the .autonomy-spend-ok acknowledgement marker.

import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parseClaudeJson, capReached, recordSession, spendLine, ledgerLine, type SpendState } from "./lib/spend";

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
const STREAM = flag("stream");
// Hard dollar cap for the whole run. 0 = explicitly uncapped (requires the same
// conscious acknowledgement as --stream: the .autonomy-spend-ok marker).
const maxSpendUsd = Number(arg("max-spend-usd", "25"));

const HAMZAISH_ROOT = resolve(import.meta.dir, "..");
const LEDGER_PATH = join(HAMZAISH_ROOT, "meta", "telemetry", "spend.local.jsonl");
const ORDERS_PATH = join(HAMZAISH_ROOT, "FACTORY-ORDERS.local.md");
const STANDING_PATH = join(HAMZAISH_ROOT, "STANDING-ORDERS.local.md");

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
  // Control-plane wiring: when the factory's orders exist, they outrank
  // everything in this prompt except the safety rules (which only tighten).
  const orders: string[] = [];
  if (existsSync(ORDERS_PATH)) {
    orders.push(
      `FIRST read ${ORDERS_PATH} — the factory's current mandate, budget, and`,
      `stop conditions. Operate INSIDE it: if this objective isn't covered by the`,
      `mandate, or a stop condition is met, write loop-state "blocked" and stop.`,
    );
  }
  if (existsSync(STANDING_PATH)) {
    orders.push(
      `Also read ${STANDING_PATH} — the authority table. You are the`,
      `"overnight-build" program; its scope, approval gates, and escalation rules bind you.`,
    );
  }
  return [
    `You are session ${sessionNum} of an UNATTENDED autonomy loop in this repo.`,
    ``,
    ...(orders.length ? [...orders, ``] : []),
    `Read START-HERE.local.md and CLAUDE.md in the repo root so you respect`,
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

async function runSession(sessionNum: number): Promise<{ exitCode: number; costUsd: number; costParsed: boolean; turns?: number }> {
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
    ...(STREAM ? [] : ["--output-format", "json"]),
  ];

  if (DRY) {
    console.log(`\n--- session ${sessionNum} (dry-run) ---`);
    console.log(`cwd: ${repo}`);
    console.log(
      `cmd: claude -p <prompt> --model ${model} --max-turns ${maxTurns} --permission-mode ${permissionMode}` +
        (STREAM ? " (stream)" : " --output-format json"),
    );
    console.log(`prompt:\n${prompt}`);
    return { exitCode: 0, costUsd: 0, costParsed: true };
  }

  if (STREAM) {
    // Watched-run mode: live output, but the burn is unmeasured this session.
    const proc = Bun.spawn(cmd, { cwd: repo!, stdout: "inherit", stderr: "inherit" });
    return { exitCode: await proc.exited, costUsd: 0, costParsed: false };
  }

  // Default: capture the JSON result so the spend meter is real. stderr stays
  // live (progress/errors); stdout is the single result object.
  const proc = Bun.spawn(cmd, { cwd: repo!, stdout: "pipe", stderr: "inherit" });
  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  const cost = parseClaudeJson(stdout);
  if (cost.resultText) {
    const tail = cost.resultText.length > 600 ? `…${cost.resultText.slice(-600)}` : cost.resultText;
    console.log(`  session result:\n${tail.replace(/^/gm, "    ")}`);
  }
  if (!cost.parsed) {
    console.warn(`  ! could not parse session cost from output — recording $0 for this session; treat the meter as a FLOOR, not the truth.`);
  }
  return { exitCode, costUsd: cost.costUsd, costParsed: cost.parsed, turns: cost.turns };
}

// Run a command silently, return its exit code (non-secret-printing: we read the
// code, never the output). Used for the floor precondition checks.
function code(cmd: string[], cwd: string): number {
  try {
    return Bun.spawnSync(cmd, { cwd, stdout: "ignore", stderr: "ignore" }).exitCode ?? 1;
  } catch {
    return 1;
  }
}

// Phase 3 floor gate — the safe/lean/observable preconditions the manager loop
// needs before it dispatches an UNATTENDED /goal run. Checks only what's present,
// fail-safe. fnox secrets are a HARD gate (a run that can't resolve its secrets
// wastes sessions); pitchfork + spend-visibility are loud WARNINGS (pitchfork may
// be started by the run itself; #6 spend visibility is the efficiency session's
// to build — we refuse to *silently* run without it, not refuse to run).
function checkFloorPreconditions(): void {
  console.log(`\n── floor preconditions ──`);

  // SAFE leg — fnox config must be valid & required secrets defined if the repo
  // uses fnox. NOTE: `fnox check` verifies secrets are DEFINED/configured, not
  // that they DECRYPT (a missing key still passes) — decryption is verified at
  // the run's first `fnox exec`. This gate catches the common "forgot to set a
  // required secret / bad config" case, which is what wastes unattended sessions.
  if (existsSync(join(repo!, "fnox.toml"))) {
    if (code(["fnox", "check"], repo!) === 0) {
      console.log(`  ✓ fnox: config valid, required secrets defined (fnox check)`);
    } else {
      die(
        `fnox.toml present but \`fnox check\` failed — required secrets are missing or the config is invalid.\n` +
          `  Fix it before an unattended run wastes sessions on unresolvable secrets.`,
      );
    }
  } else {
    console.log(`  • fnox: no fnox.toml — assuming .env.local / no secrets needed`);
  }

  // SAFE leg — pitchfork daemon presence (informational only; `pitchfork status`
  // exits 0 for a merely DEFINED daemon, so it can't prove liveness — the run
  // itself must start + verify readiness. Same readiness≠liveness lesson as the
  // pitchfork decision log.
  if (existsSync(join(repo!, "pitchfork.toml"))) {
    console.log(
      `  • pitchfork: 'web' daemon defined — the run must \`pitchfork start web\` and verify ` +
        `readiness before asserting any localhost link (status alone ≠ liveness)`,
    );
  }

  // OBSERVABLE leg (#6) — spend. The meter is built in now: sessions run with
  // --output-format json, cost is parsed + ledgered, and --max-spend-usd is a
  // HARD abort. The unmeasured modes (--stream, or an explicit cap of 0) still
  // demand the conscious .autonomy-spend-ok acknowledgement.
  const unmeasured = STREAM || maxSpendUsd <= 0;
  if (!unmeasured) {
    console.log(`  ✓ spend: hard cap $${maxSpendUsd.toFixed(2)} — measured per session, ledgered to ${LEDGER_PATH}`);
  } else if (existsSync(join(repo!, ".autonomy-spend-ok"))) {
    console.log(`  ⚠ spend UNMEASURED this run (${STREAM ? "--stream" : "cap 0"}) — acknowledged via .autonomy-spend-ok. Watch the burn yourself.`);
  } else {
    die(
      `refusing an UNMEASURED unattended run (${STREAM ? "--stream disables cost parsing" : "--max-spend-usd 0 disables the cap"}).\n` +
        `  An unattended loop with no burn meter is the cost-runaway the factory guards against\n` +
        `  (factory/playbooks/scale-stage/abuse-and-cost-controls.md).\n` +
        `  Either drop the flag (default: measured, $25 cap) or acknowledge consciously:\n` +
        `    touch "${repo}/.autonomy-spend-ok"`,
    );
  }

  // Control plane — orders present? (informational; the prompt wires them in)
  console.log(
    existsSync(ORDERS_PATH)
      ? `  ✓ FACTORY-ORDERS.local.md present — sessions operate inside the mandate`
      : `  • no FACTORY-ORDERS.local.md — sessions run on --goal alone (bun run setup scaffolds the control plane)`,
  );
}

// Active escalation — the loop's whole point unattended is that it reaches YOU
// when stuck. The old behaviour only printed to a console nobody's watching.
// Now: write a durable ESCALATION.md the human/dashboard can find, and fire a
// desktop notification (macOS; fail-soft everywhere else).
async function escalate(reason: string, note: string): Promise<void> {
  const path = join(goalDir, "ESCALATION.md");
  const body =
    `# Autonomy loop needs you — ${slug}\n\n` +
    `- **Reason:** ${reason}\n- **Note:** ${note}\n- **Goal:** ${goal}\n- **Repo:** ${repo}\n\n` +
    `The loop halted and is waiting on a human. Inspect \`.goal/${slug}/\`, resolve, then re-run.\n`;
  try {
    await writeFile(path, body);
    console.log(`  ↳ wrote ${path}`);
  } catch {}
  if (process.platform === "darwin") {
    const msg = `${slug}: ${reason} — ${note}`.replace(/"/g, "'");
    code(["osascript", "-e", `display notification "${msg}" with title "Autonomy loop needs you"`], repo!);
  }
}

async function main() {
  // Clear any stale handoff so we read THIS run's state, not a previous one's.
  await mkdir(goalDir, { recursive: true });

  console.log(`▶ autonomy-loop — "${goal}"`);
  console.log(
    `  repo=${repo}\n  slug=${slug} model=${model} max-sessions=${maxSessions} runs/session=${runsPerSession} max-spend=$${maxSpendUsd.toFixed(2)}${DRY ? " (dry-run)" : ""}`,
  );

  checkFloorPreconditions();

  let spend: SpendState = { spentUsd: 0, capUsd: maxSpendUsd };
  for (let s = 1; s <= maxSessions; s++) {
    if (existsSync(join(repo!, "STOP"))) {
      console.log(`\n■ STOP file present in repo — halting before session ${s}.`);
      return;
    }
    console.log(`\n=== session ${s}/${maxSessions} · ${spendLine(spend)} ===`);
    const result = await runSession(s);
    if (DRY) continue;
    if (result.exitCode !== 0) {
      console.warn(`  ! claude exited ${result.exitCode} — treating as end-of-session.`);
    }

    const state = await readState();

    // Spend accounting: record → ledger → enforce. The ledger append is
    // fail-soft (a full disk must not kill the loop) but the CAP never is.
    spend = recordSession(spend, result.costUsd);
    try {
      await mkdir(join(HAMZAISH_ROOT, "meta", "telemetry"), { recursive: true });
      await appendFile(
        LEDGER_PATH,
        ledgerLine({
          ts: new Date().toISOString(),
          slug: slug!,
          session: s,
          model,
          costUsd: result.costUsd,
          turns: result.turns,
          state: state?.state,
        }) + "\n",
      );
    } catch (e) {
      console.warn(`  ! could not write spend ledger (${LEDGER_PATH}): ${e}`);
    }
    console.log(`  session cost: $${result.costUsd.toFixed(2)} · run total ${spendLine(spend)}`);
    if (capReached(spend)) {
      console.log(`\n■ SPEND CAP reached (${spendLine(spend)}) — hard stop.`);
      await escalate("spend-cap", `${spendLine(spend)} after ${s} session(s)`);
      return;
    }
    if (!state) {
      console.warn(
        `  ! no .goal/${slug}/loop-state.json written this session — cannot tell progress.\n` +
          `    Continuing to next session (the relaunch is harmless), but check the goal log.`,
      );
      continue;
    }
    console.log(`  state=${state.state}${state.note ? ` — ${state.note}` : ""}`);
    if (state.state === "achieved") {
      console.log(`\n✓ Goal achieved after ${s} session(s).`);
      return;
    }
    if (state.state === "blocked") {
      console.log(`\n⏸ Blocked — needs you: ${state.note ?? "(no note)"}`);
      await escalate("blocked", state.note ?? "(no note)");
      return;
    }
  }
  console.log(
    `\n◷ Session budget (${maxSessions}) spent without achieving the bar.\n` +
      `  Inspect ${repo}/.goal/${slug}/ and re-run to continue, or raise --max-sessions.`,
  );
  await escalate("budget-spent", `${maxSessions} sessions spent without meeting the bar`);
}

main().catch((e) => {
  console.error("× autonomy-loop failed:", e);
  process.exit(1);
});
