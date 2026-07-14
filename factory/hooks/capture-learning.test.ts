import { test, expect } from "bun:test";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  detectLearning,
  looksLikeSecret,
  encodeCwd,
  queuePathFor,
  appendToQueue,
  type CaptureRecord,
} from "./capture-learning.ts";

test("captures an explicit 'remember' instruction with high confidence", () => {
  const d = detectLearning("Remember this: always branch PRs from origin/main");
  expect(d).not.toBeNull();
  expect(d!.sentiment).toBe("correction");
  expect(d!.confidence).toBeGreaterThanOrEqual(0.8);
  expect(d!.decay_days).toBe(120);
});

test("captures a terse correction", () => {
  const d = detectLearning("no, use bun not npm");
  expect(d).not.toBeNull();
  expect(d!.patterns).toContain("correction");
});

test("captures a guardrail", () => {
  const d = detectLearning("never commit conversations into a repo");
  expect(d).not.toBeNull();
  expect(["guardrail", "correction"]).toContain(d!.type);
});

test("routes praise to positive sentiment", () => {
  const d = detectLearning("perfect, that's it");
  expect(d).not.toBeNull();
  expect(d!.sentiment).toBe("positive");
});

test("ignores an ordinary question (no learning)", () => {
  expect(detectLearning("what does this function return?")).toBeNull();
  expect(detectLearning("can you show me the tests?")).toBeNull();
});

test("SKIPS prompts that look like they carry secrets", () => {
  expect(looksLikeSecret("my key is sk-ABCD1234EFGH5678IJKL")).toBe(true);
  // Even with a correction verb present, a secret-shaped prompt is NOT captured.
  expect(detectLearning("no, use this token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ012345")).toBeNull();
  expect(detectLearning("always set password=hunter2supersecretvalue")).toBeNull();
});

test("encodeCwd matches Claude Code's project-dir scheme", () => {
  expect(encodeCwd("/Users/hamza/Claude")).toBe("-Users-hamza-Claude");
});

test("queuePathFor honors the env override", () => {
  expect(queuePathFor("/x", "/home", "/tmp/q.json")).toBe("/tmp/q.json");
  expect(queuePathFor("/Users/hamza/Claude", "/home", undefined)).toBe(
    "/home/.claude/projects/-Users-hamza-Claude/hamzaish-learnings-queue.json",
  );
});

test("appendToQueue creates the file and accumulates records", () => {
  const dir = mkdtempSync(join(tmpdir(), "hz-cap-"));
  const q = join(dir, "queue.json");
  const rec = (msg: string): CaptureRecord => ({
    type: "correction",
    message: msg,
    timestamp: "2026-07-14T00:00:00.000Z",
    project: "/x",
    patterns: "correction",
    confidence: 0.7,
    sentiment: "correction",
    decay_days: 90,
  });
  appendToQueue(q, rec("first"));
  appendToQueue(q, rec("second"));
  expect(existsSync(q)).toBe(true);
  const items = JSON.parse(readFileSync(q, "utf8")) as CaptureRecord[];
  expect(items).toHaveLength(2);
  expect(items[1].message).toBe("second");
});
