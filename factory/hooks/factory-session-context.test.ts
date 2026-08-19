// factory-session-context.test.ts — pins the hook's scope so it can't silently
// narrow again (the 2026-08-06 gap: the factory repo itself got zero enablement;
// meta/retros/2026-08-06-enablement-gap-factory-repo.md).
import { test, expect, describe } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const HOOK = resolve(import.meta.dir, "factory-session-context.sh");
const FACTORY_ROOT = resolve(import.meta.dir, "..", "..");

function runHook(projectDir: string, ...args: string[]) {
  const proc = Bun.spawnSync(["bash", HOOK, ...args], {
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
  });
  return { out: proc.stdout.toString(), code: proc.exitCode };
}

/** Same, but feeds the hook the JSON payload Claude Code sends on stdin. */
function runHookWithPayload(
  projectDir: string,
  payload: Record<string, unknown>,
  ...args: string[]
) {
  const proc = Bun.spawnSync(["bash", HOOK, ...args], {
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
    stdin: Buffer.from(JSON.stringify(payload)),
  });
  return { out: proc.stdout.toString(), code: proc.exitCode };
}

const markerFor = (sessionId: string) =>
  join(process.env.TMPDIR ?? "/tmp", `hamzaish-active-${sessionId}`);

test("fires in the factory repo itself — SessionStart mode", () => {
  const { out, code } = runHook(FACTORY_ROOT);
  expect(code).toBe(0);
  const payload = JSON.parse(out);
  expect(payload.hookSpecificOutput.hookEventName).toBe("SessionStart");
  expect(payload.hookSpecificOutput.additionalContext).toContain("the factory repo");
  expect(payload.hookSpecificOutput.additionalContext).toContain("ENABLEMENT PROTOCOL");
});

test("fires in the factory repo itself — --brief mode", () => {
  const { out, code } = runHook(FACTORY_ROOT, "--brief");
  expect(code).toBe(0);
  const payload = JSON.parse(out);
  expect(payload.hookSpecificOutput.hookEventName).toBe("UserPromptSubmit");
  expect(payload.hookSpecificOutput.additionalContext).toContain("factory repo");
});

test("stays silent outside factory-managed repos — both modes", () => {
  const neutral = mkdtempSync(join(tmpdir(), "hz-ctx-"));
  expect(runHook(neutral)).toEqual({ out: "", code: 0 });
  expect(runHook(neutral, "--brief")).toEqual({ out: "", code: 0 });
});

test("still detects a registered product repo by its tendril marker", () => {
  const prod = mkdtempSync(join(tmpdir(), "hz-prod-"));
  writeFileSync(
    join(prod, "CLAUDE.md"),
    "# Acme — a hamzaish factory product\n\nslug: `acme`\n",
  );
  const full = runHook(prod);
  expect(JSON.parse(full.out).hookSpecificOutput.additionalContext).toContain("product: acme");
  const brief = runHook(prod, "--brief");
  expect(JSON.parse(brief.out).hookSpecificOutput.additionalContext).toContain("(acme)");
});

// The 2026-08-16 gap: a session rooted at $HOME ran /hamzaish and /work-on and
// worked a registered product for hours. Every directory check missed it, so it
// never got one reminder and drifted out of the bookends again and again.
// Detection asked "which folder is this?" when the question that matters is
// "has this session entered the factory?".
describe("session that ENTERED the factory but is rooted nowhere near a product", () => {
  const neutral = mkdtempSync(join(tmpdir(), "hz-home-"));

  test("stays silent before any Hamzaish command runs", () => {
    const sid = `t-none-${process.pid}`;
    rmSync(markerFor(sid), { force: true });
    expect(runHookWithPayload(neutral, { session_id: sid }, "--brief")).toEqual({
      out: "",
      code: 0,
    });
  });

  test("a Hamzaish command stamps the session, and every later message is reminded", () => {
    const sid = `t-entered-${process.pid}`;
    rmSync(markerFor(sid), { force: true });

    const stamp = runHookWithPayload(
      neutral,
      { session_id: sid, tool_name: "Skill", tool_input: { skill: "work-on", args: "copyright" } },
      "--stamp",
    );
    expect(stamp.code).toBe(0);
    expect(readFileSync(markerFor(sid), "utf8")).toBe("copyright");

    // The load-bearing assertion: neutral directory, reminder fires anyway.
    const brief = runHookWithPayload(neutral, { session_id: sid }, "--brief");
    expect(JSON.parse(brief.out).hookSpecificOutput.additionalContext).toContain("(copyright)");

    rmSync(markerFor(sid), { force: true });
  });

  test("a command with no product argument still marks the session active", () => {
    const sid = `t-noslug-${process.pid}`;
    rmSync(markerFor(sid), { force: true });

    runHookWithPayload(
      neutral,
      { session_id: sid, tool_name: "Skill", tool_input: { skill: "hamzaish", args: "" } },
      "--stamp",
    );
    const brief = runHookWithPayload(neutral, { session_id: sid }, "--brief");
    expect(JSON.parse(brief.out).hookSpecificOutput.additionalContext).toContain("(active)");

    rmSync(markerFor(sid), { force: true });
  });

  test("a non-Hamzaish skill does NOT stamp — no reminders in unrelated sessions", () => {
    const sid = `t-unrelated-${process.pid}`;
    rmSync(markerFor(sid), { force: true });

    runHookWithPayload(
      neutral,
      { session_id: sid, tool_name: "Skill", tool_input: { skill: "pdf-viewer:open" } },
      "--stamp",
    );
    expect(existsSync(markerFor(sid))).toBe(false);
    expect(runHookWithPayload(neutral, { session_id: sid }, "--brief").out).toBe("");
  });

  test("no session id (manual run, older harness) degrades to directory detection", () => {
    expect(runHookWithPayload(neutral, {}, "--brief")).toEqual({ out: "", code: 0 });
    const inFactory = runHookWithPayload(FACTORY_ROOT, {}, "--brief");
    expect(JSON.parse(inFactory.out).hookSpecificOutput.additionalContext).toContain("factory repo");
  });
});
