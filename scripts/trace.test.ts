// trace.test.ts — the session-traces slice, proven per our own rule
// (feature-slicing: no slice without a named eval + an end-to-end test).
//
//   E2E TEST  "trace pipeline end-to-end" — real hook payloads piped into the
//             real trace-log.ts process, then the real report aggregates them.
//   EVAL      "trace-capture-fidelity" — N synthetic events in, exactly N
//             accounted for, failures attributed to the right tool/command.
//
// Also pins the two load-bearing contract clauses: fail-open (malformed input
// can never produce a non-zero exit) and privacy (truncation caps hold).
import { describe, expect, test } from "bun:test";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { aggregate } from "./trace-report";

const scripts = resolve(dirname(fileURLToPath(import.meta.url)));

async function runLogger(stdin: string, dir: string) {
  const proc = Bun.spawn(["bun", join(scripts, "trace-log.ts")], {
    stdin: new TextEncoder().encode(stdin),
    env: { ...process.env, HAMZAISH_TRACE_DIR: dir },
    stdout: "pipe",
    stderr: "pipe",
  });
  return await proc.exited;
}

const postToolUse = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    session_id: "abcdef1234567890",
    hook_event_name: "PostToolUse",
    tool_name: "Bash",
    tool_input: { command: "git status" },
    tool_response: { stdout: "clean", stderr: "" },
    ...over,
  });

function readLines(dir: string): any[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".local.jsonl"))
    .flatMap((f) => readFileSync(join(dir, f), "utf8").split("\n").filter(Boolean))
    .map((l) => JSON.parse(l));
}

describe("trace pipeline end-to-end", () => {
  test("a hook payload becomes one valid JSONL line with the contract fields", async () => {
    const dir = mkdtempSync(join(tmpdir(), "traces-"));
    expect(await runLogger(postToolUse(), dir)).toBe(0);
    const lines = readLines(dir);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ sid: "abcdef12", ev: "PostToolUse", tool: "Bash", ok: true, cmd: "git status" });
    expect(lines[0].t).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(lines[0].err).toBeUndefined();
  });

  test("explicit error signals flip ok=false and capture an error head; stderr alone does not", async () => {
    const dir = mkdtempSync(join(tmpdir(), "traces-"));
    await runLogger(postToolUse({ tool_response: { is_error: true, stderr: "boom: exit 1" } }), dir);
    await runLogger(postToolUse({ tool_response: { stdout: "", stderr: "warning: noisy but fine" } }), dir);
    const [failed, noisy] = readLines(dir);
    expect(failed.ok).toBe(false);
    expect(failed.err).toBe("boom: exit 1");
    expect(noisy.ok).toBe(true);
    expect(noisy.err).toBeUndefined();
  });

  test("fail-open: malformed and non-object stdin exit 0 and write nothing", async () => {
    const dir = mkdtempSync(join(tmpdir(), "traces-"));
    expect(await runLogger("not json at all", dir)).toBe(0);
    expect(await runLogger('"just a string"', dir)).toBe(0);
    expect(await runLogger("", dir)).toBe(0);
    expect(readdirSync(dir)).toHaveLength(0);
  });

  test("privacy caps: commands truncate to 160 chars, error heads to 200, outputs never recorded", async () => {
    const dir = mkdtempSync(join(tmpdir(), "traces-"));
    await runLogger(
      postToolUse({
        tool_input: { command: "x".repeat(500) },
        tool_response: { is_error: true, error: "e".repeat(500), stdout: "SECRET-OUTPUT" },
      }),
      dir,
    );
    const [line] = readLines(dir);
    expect(line.cmd).toHaveLength(160);
    expect(line.err).toHaveLength(200);
    expect(JSON.stringify(line)).not.toContain("SECRET-OUTPUT");
  });

  test("Stop events land as turns; the real report aggregates the real files", async () => {
    const dir = mkdtempSync(join(tmpdir(), "traces-"));
    await runLogger(postToolUse(), dir);
    await runLogger(JSON.stringify({ session_id: "abcdef1234567890", hook_event_name: "Stop" }), dir);
    const proc = Bun.spawn(["bun", join(scripts, "trace-report.ts"), "--json"], {
      env: { ...process.env, HAMZAISH_TRACE_DIR: dir },
      stdout: "pipe",
    });
    await proc.exited;
    const report = JSON.parse(await new Response(proc.stdout).text());
    expect(report.events).toBe(2);
    expect(report.turns).toBe(1);
    expect(report.sessions).toBe(1);
    expect(report.tools.Bash.count).toBe(1);
  });
});

describe("eval: trace-capture-fidelity", () => {
  test("25 synthetic events → 25 accounted for, failures attributed exactly", () => {
    const today = new Date().toISOString();
    const lines: string[] = [];
    for (let i = 0; i < 10; i++)
      lines.push(JSON.stringify({ t: today, sid: "s1", ev: "PostToolUse", tool: "Bash", ok: true, cmd: "ls -la" }));
    for (let i = 0; i < 6; i++)
      lines.push(JSON.stringify({ t: today, sid: "s1", ev: "PostToolUse", tool: "Bash", ok: false, err: "x", cmd: "bun test" }));
    for (let i = 0; i < 4; i++)
      lines.push(JSON.stringify({ t: today, sid: "s2", ev: "PostToolUse", tool: "Read", ok: true }));
    for (let i = 0; i < 2; i++)
      lines.push(JSON.stringify({ t: today, sid: "s2", ev: "PostToolUse", tool: "Edit", ok: false, err: "y" }));
    for (let i = 0; i < 3; i++) lines.push(JSON.stringify({ t: today, sid: "s2", ev: "Stop" }));

    const r = aggregate(lines, 7, today.slice(0, 10));
    expect(r.events).toBe(25);
    expect(r.turns).toBe(3);
    expect(r.sessions).toBe(2);
    expect(r.tools.Bash).toMatchObject({ count: 16, failures: 6, failure_rate: 0.375 });
    expect(r.tools.Read).toMatchObject({ count: 4, failures: 0, failure_rate: 0 });
    expect(r.tools.Edit).toMatchObject({ count: 2, failures: 2, failure_rate: 1 });
    expect(r.top_failing_commands[0]).toEqual({ command: "bun", failures: 6 });
    expect(r.failures_by_day[today.slice(0, 10)]).toBe(8);
  });

  test("window filter: events before the from-date are excluded, unparsable lines skipped", () => {
    const lines = [
      JSON.stringify({ t: "2026-01-01T00:00:00Z", sid: "old", ev: "PostToolUse", tool: "Bash", ok: true }),
      JSON.stringify({ t: new Date().toISOString(), sid: "new", ev: "PostToolUse", tool: "Bash", ok: true }),
      "{{{ corrupt line",
    ];
    const r = aggregate(lines, 7, new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10));
    expect(r.events).toBe(1);
    expect(r.sessions).toBe(1);
  });
});
