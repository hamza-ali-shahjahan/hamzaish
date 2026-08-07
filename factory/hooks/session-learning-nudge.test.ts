import { test, expect } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  isManagedDir,
  localDateStamp,
  nudgeReason,
  shouldNudge,
  type NudgeInputs,
} from "./session-learning-nudge.ts";

const HOOK = resolve(import.meta.dir, "session-learning-nudge.ts");

const BASE: NudgeInputs = {
  stopHookActive: false,
  managed: true,
  markerExists: false,
  commitSubjectsToday: ["feat: real work landed"],
  learningsFileExists: false,
  queueFreshToday: false,
};

test("nudges when real work landed and nothing was captured", () => {
  expect(shouldNudge(BASE)).toBe(true);
});

test("never nudges when stop_hook_active (loop guard)", () => {
  expect(shouldNudge({ ...BASE, stopHookActive: true })).toBe(false);
});

test("never nudges outside managed repos", () => {
  expect(shouldNudge({ ...BASE, managed: false })).toBe(false);
});

test("never nudges twice in one session (marker)", () => {
  expect(shouldNudge({ ...BASE, markerExists: true })).toBe(false);
});

test("wip(auto) snapshots alone are not real work", () => {
  expect(
    shouldNudge({ ...BASE, commitSubjectsToday: ["wip(auto): 2026-08-06T12:00:00", "wip(auto): 2026-08-06T13:00:00"] }),
  ).toBe(false);
  expect(shouldNudge({ ...BASE, commitSubjectsToday: [] })).toBe(false);
});

test("stays silent when today's learning already exists", () => {
  expect(shouldNudge({ ...BASE, learningsFileExists: true })).toBe(false);
});

test("stays silent when the capture queue is fresh today", () => {
  expect(shouldNudge({ ...BASE, queueFreshToday: true })).toBe(false);
});

test("localDateStamp is YYYY-MM-DD (local)", () => {
  expect(localDateStamp(new Date(2026, 7, 6))).toBe("2026-08-06");
});

test("nudgeReason names the exact file to append to", () => {
  const reason = nudgeReason("2026-08-06", "/home/ada/Claude/Hamzaish");
  expect(reason).toContain("/home/ada/Claude/Hamzaish/brain/learnings/2026-08-06.md");
  expect(reason).toContain("once per session");
});

test("isManagedDir: marker file, tendril CLAUDE.md, and plain dirs", () => {
  const withMarker = mkdtempSync(join(tmpdir(), "hz-mng-"));
  writeFileSync(join(withMarker, ".hamzaish-managed"), "");
  expect(isManagedDir(withMarker)).toBe(true);

  const withTendril = mkdtempSync(join(tmpdir(), "hz-tnd-"));
  writeFileSync(join(withTendril, "CLAUDE.md"), "# Acme — a hamzaish factory product\n");
  expect(isManagedDir(withTendril)).toBe(true);

  const plain = mkdtempSync(join(tmpdir(), "hz-plain-"));
  expect(isManagedDir(plain)).toBe(false);
});

test("hook end-to-end: silent in an unmanaged repo", () => {
  const plain = mkdtempSync(join(tmpdir(), "hz-nudge-e2e-"));
  const proc = Bun.spawnSync(["bun", HOOK], {
    stdin: Buffer.from(
      JSON.stringify({ session_id: "s-e2e", cwd: plain, stop_hook_active: false }),
    ),
    env: { ...process.env },
  });
  expect(proc.exitCode).toBe(0);
  expect(proc.stdout.toString()).toBe("");
});
