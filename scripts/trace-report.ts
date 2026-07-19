#!/usr/bin/env bun
// trace-report.ts — turn session traces into a diagnosis, not an anecdote.
//
// Aggregates the JSONL trace files scripts/trace-log.ts accumulates
// (meta/telemetry/traces/YYYY-MM-DD.local.jsonl) into the questions the
// self-improvement loop actually asks: which tools fail, what bash commands
// keep breaking, how much work happened. /learn-loop reads this BEFORE scoring
// candidates so retros are grounded in what happened, not what was remembered
// (deep telemetry — arXiv:2605.18747 §3.5; decision log 2026-07-19).
//
//   bun run trace-report              # markdown summary, last 7 days
//   bun run trace-report --days 30    # wider window
//   bun run trace-report --json       # machine-readable (for skills/agents)
//
// Failure counts are a floor (trace-log.ts only flags explicit error signals) —
// treat rising rates as a signal to investigate, never as a full census.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = process.env.HAMZAISH_TRACE_DIR ?? join(root, "meta", "telemetry", "traces");
const asJson = process.argv.includes("--json");
const daysIdx = process.argv.indexOf("--days");
const days = daysIdx !== -1 ? Math.max(1, Number(process.argv[daysIdx + 1]) || 7) : 7;

type ToolStat = { count: number; failures: number };
export type Report = {
  window_days: number;
  from: string;
  events: number;
  turns: number;
  sessions: number;
  tools: Record<string, ToolStat & { failure_rate: number }>;
  top_failing_commands: { command: string; failures: number }[];
  failures_by_day: Record<string, number>;
};

export function aggregate(lines: string[], windowDays: number, from: string): Report {
  const tools: Record<string, ToolStat> = {};
  const sids = new Set<string>();
  const cmdFails: Record<string, number> = {};
  const failsByDay: Record<string, number> = {};
  let events = 0;
  let turns = 0;

  for (const raw of lines) {
    let e: any;
    try { e = JSON.parse(raw); } catch { continue; }
    if (typeof e?.t !== "string" || e.t.slice(0, 10) < from) continue;
    events++;
    if (typeof e.sid === "string") sids.add(e.sid);
    if (e.ev === "Stop") { turns++; continue; }
    if (typeof e.tool !== "string") continue;
    const s = (tools[e.tool] ??= { count: 0, failures: 0 });
    s.count++;
    if (e.ok === false) {
      s.failures++;
      failsByDay[e.t.slice(0, 10)] = (failsByDay[e.t.slice(0, 10)] ?? 0) + 1;
      if (typeof e.cmd === "string") {
        const head = e.cmd.trim().split(/\s+/)[0] || "(empty)";
        cmdFails[head] = (cmdFails[head] ?? 0) + 1;
      }
    }
  }

  return {
    window_days: windowDays,
    from,
    events,
    turns,
    sessions: sids.size,
    tools: Object.fromEntries(
      Object.entries(tools)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([k, v]) => [k, { ...v, failure_rate: v.count ? +(v.failures / v.count).toFixed(3) : 0 }]),
    ),
    top_failing_commands: Object.entries(cmdFails)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([command, failures]) => ({ command, failures })),
    failures_by_day: failsByDay,
  };
}

if (import.meta.main) {
  const from = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const lines: string[] = [];
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).sort()) {
      const m = f.match(/^(\d{4}-\d{2}-\d{2})\.local\.jsonl$/);
      if (!m || m[1] < from) continue;
      lines.push(...readFileSync(join(dir, f), "utf8").split("\n").filter(Boolean));
    }
  }
  const r = aggregate(lines, days, from);

  if (asJson) {
    console.log(JSON.stringify(r, null, 2));
    process.exit(0);
  }

  console.log(`## Session traces — last ${r.window_days} days (since ${r.from})\n`);
  if (r.events === 0) {
    console.log(
      "_No traces yet. They accumulate automatically once the project hooks in `.claude/settings.json` are approved (fresh clones get prompted on first session). Local-only, gitignored — nothing leaves this machine._",
    );
    process.exit(0);
  }
  console.log(`**${r.events}** events · **${r.turns}** turns · **${r.sessions}** session(s)\n`);
  console.log("| tool | calls | failures | rate |");
  console.log("|---|---|---|---|");
  for (const [tool, s] of Object.entries(r.tools))
    console.log(`| ${tool} | ${s.count} | ${s.failures} | ${Math.round(s.failure_rate * 100)}% |`);
  if (r.top_failing_commands.length) {
    console.log("\n**Top failing bash commands** (by first token):\n");
    for (const c of r.top_failing_commands) console.log(`- \`${c.command}\` — ${c.failures} failure(s)`);
  }
  console.log(
    "\n_Failure counts are a floor (explicit error signals only). Rising rate on one tool/command = a harness gap worth a guard — see operating principle 15._",
  );
}
