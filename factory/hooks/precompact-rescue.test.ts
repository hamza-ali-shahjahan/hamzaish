import { test, expect } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { extractUserTexts, rescueRecords } from "./precompact-rescue.ts";
import type { CaptureRecord } from "./capture-learning.ts";

const HOOK = resolve(import.meta.dir, "precompact-rescue.ts");

const TRANSCRIPT = [
  JSON.stringify({ type: "user", message: { role: "user", content: [{ type: "text", text: "no, use bun not npm" }] } }),
  JSON.stringify({ type: "user", message: { role: "user", content: "what does this function return?" } }),
  JSON.stringify({ type: "user", message: { role: "user", content: [{ type: "text", text: "my key is sk-ABCD1234EFGH5678IJKL" }] } }),
  JSON.stringify({ type: "assistant", message: { role: "assistant", content: [{ type: "text", text: "never commit secrets — noted" }] } }),
  JSON.stringify({ type: "user", isMeta: true, message: { role: "user", content: "remember to always ignore this meta line" } }),
  "not json at all",
  JSON.stringify({ type: "user", message: { role: "user", content: [{ type: "tool_result", content: "always retry on 429" }] } }),
].join("\n");

test("extractUserTexts pulls only real user text turns", () => {
  const texts = extractUserTexts(TRANSCRIPT);
  expect(texts).toContain("no, use bun not npm");
  expect(texts).toContain("what does this function return?");
  // assistant text, meta lines, tool_result payloads, junk lines: all excluded
  expect(texts).not.toContain("never commit secrets — noted");
  expect(texts).not.toContain("remember to always ignore this meta line");
  expect(texts).not.toContain("always retry on 429");
  expect(texts).toHaveLength(3); // the secret-shaped turn is extracted here, dropped by the classifier later
});

test("rescueRecords keeps learning-shaped turns, drops questions and secrets", () => {
  const out = rescueRecords(extractUserTexts(TRANSCRIPT), [], "/x", "sess-1");
  expect(out).toHaveLength(1);
  expect(out[0].message).toBe("no, use bun not npm");
  expect(out[0].source).toBe("precompact-rescue");
  expect(out[0].project).toBe("/x");
});

test("rescueRecords dedupes against the existing queue", () => {
  const existing = [{ message: "no, use bun not npm" } as CaptureRecord];
  const out = rescueRecords(extractUserTexts(TRANSCRIPT), existing, "/x");
  expect(out).toHaveLength(0);
});

test("hook end-to-end: rescues once, then dedupes on a second compaction", () => {
  const dir = mkdtempSync(join(tmpdir(), "hz-rescue-"));
  const transcriptPath = join(dir, "transcript.jsonl");
  const queuePath = join(dir, "queue.json");
  writeFileSync(transcriptPath, TRANSCRIPT);

  const stdin = JSON.stringify({
    session_id: "sess-e2e",
    transcript_path: transcriptPath,
    cwd: dir,
    hook_event_name: "PreCompact",
    trigger: "auto",
  });
  const run = () =>
    Bun.spawnSync(["bun", HOOK], {
      stdin: Buffer.from(stdin),
      env: { ...process.env, HAMZAISH_CAPTURE_QUEUE: queuePath },
    });

  const first = run();
  expect(first.exitCode).toBe(0);
  expect(first.stdout.toString()).toBe(""); // silent by contract
  const items = JSON.parse(readFileSync(queuePath, "utf8")) as Array<CaptureRecord & { source?: string }>;
  expect(items).toHaveLength(1);
  expect(items[0].message).toBe("no, use bun not npm");
  expect(items[0].source).toBe("precompact-rescue");

  const second = run();
  expect(second.exitCode).toBe(0);
  expect(JSON.parse(readFileSync(queuePath, "utf8"))).toHaveLength(1); // no double-rescue
});

test("hook fails open on a missing transcript", () => {
  const dir = mkdtempSync(join(tmpdir(), "hz-rescue-miss-"));
  const queuePath = join(dir, "queue.json");
  const proc = Bun.spawnSync(["bun", HOOK], {
    stdin: Buffer.from(JSON.stringify({ transcript_path: join(dir, "nope.jsonl"), cwd: dir })),
    env: { ...process.env, HAMZAISH_CAPTURE_QUEUE: queuePath },
  });
  expect(proc.exitCode).toBe(0);
  expect(proc.stdout.toString()).toBe("");
  expect(existsSync(queuePath)).toBe(false);
});
