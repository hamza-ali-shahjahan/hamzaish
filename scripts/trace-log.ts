#!/usr/bin/env bun
// trace-log.ts — the harness's flight recorder (session traces / deep telemetry).
//
// Fed by Claude Code hooks (.claude/settings.json → PostToolUse + Stop): reads ONE
// hook payload from stdin and appends ONE compact JSONL line to the day's trace
// file. This is the substrate the code-as-agent-harness survey (arXiv:2605.18747
// §3.5) calls "deep telemetry": harness revision should run on structured traces
// of what actually happened, not on what a session remembered to write down.
// `bun run trace-report` aggregates these; /learn-loop reads that report.
//
// Contract (each clause is load-bearing — see scripts/trace.test.ts):
//   • FAIL-OPEN. Any error — malformed stdin, unwritable disk — exits 0 silently.
//     A telemetry hook that can block a turn costs more than it measures.
//   • PRIVACY. Never records tool outputs, file contents, or prompts. Bash
//     commands truncate to 160 chars; error heads to 200. Traces are local-only:
//     *.local.jsonl is gitignored repo-wide, and this repo is public.
//   • BOUNDED. One file per day (meta/telemetry/traces/YYYY-MM-DD.local.jsonl),
//     so no single file grows without limit and old days are droppable.
//
// ok/err semantics: ok=false only on explicit failure signals (is_error,
// interrupted, an error field). stderr alone never flips ok — plenty of healthy
// tools chat on stderr — so failure counts are a floor, not an exact census.
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CMD_MAX = 160;
const ERR_MAX = 200;

try {
  const raw = await Bun.stdin.text();
  const p = JSON.parse(raw);
  if (typeof p !== "object" || p === null || typeof p.hook_event_name !== "string") process.exit(0);

  const resp = typeof p.tool_response === "object" && p.tool_response !== null ? p.tool_response : {};
  const input = typeof p.tool_input === "object" && p.tool_input !== null ? p.tool_input : {};

  const errSignal =
    resp.is_error === true ||
    resp.interrupted === true ||
    (typeof resp.error === "string" && resp.error.length > 0);
  const errHead = errSignal
    ? String(resp.error ?? resp.stderr ?? (resp.interrupted ? "interrupted" : "error")).slice(0, ERR_MAX)
    : undefined;

  const line: Record<string, unknown> = {
    t: new Date().toISOString(),
    sid: typeof p.session_id === "string" ? p.session_id.slice(0, 8) : "unknown",
    ev: p.hook_event_name,
  };
  if (typeof p.tool_name === "string") {
    line.tool = p.tool_name;
    line.ok = !errSignal;
    if (errHead) line.err = errHead;
    if (p.tool_name === "Bash" && typeof input.command === "string") line.cmd = input.command.slice(0, CMD_MAX);
  }

  const dir =
    process.env.HAMZAISH_TRACE_DIR ??
    join(resolve(dirname(fileURLToPath(import.meta.url)), ".."), "meta", "telemetry", "traces");
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, `${line.t!.toString().slice(0, 10)}.local.jsonl`), JSON.stringify(line) + "\n");
} catch {
  // fail-open, always
}
process.exit(0);
