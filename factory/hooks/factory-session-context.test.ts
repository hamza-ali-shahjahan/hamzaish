// factory-session-context.test.ts — pins the hook's scope so it can't silently
// narrow again (the 2026-08-06 gap: the factory repo itself got zero enablement;
// meta/retros/2026-08-06-enablement-gap-factory-repo.md).
import { test, expect } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
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
