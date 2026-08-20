// Pins the freshness contract: the probe must NOTICE every way the corpus can
// move, and must stay quiet when it hasn't. A probe that misses a change is
// worse than no probe — it converts "you forgot to reindex" into "the brain
// confidently told you something out of date."

import { test, expect, afterEach } from "bun:test";
import { writeFile, unlink, appendFile, utimes } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { computeFingerprint } from "./freshness.ts";
import { corpusFiles, HAMZAISH_ROOT } from "./corpus.ts";

// A file inside a real indexed folder — the only way to exercise the real walk.
// Leading underscore + explicit cleanup so a failed run can't leave it behind.
const PROBE_DOC = join(HAMZAISH_ROOT, "brain/knowledge/_freshness-test-fixture.md");

afterEach(async () => {
  if (existsSync(PROBE_DOC)) await unlink(PROBE_DOC);
});

test("fingerprint is stable when nothing moves", async () => {
  const a = await computeFingerprint();
  const b = await computeFingerprint();
  expect(a.fingerprint).toBe(b.fingerprint);
  expect(a.files).toBeGreaterThan(0);
});

test("fingerprint moves when a file is added, and returns when it is removed", async () => {
  const before = await computeFingerprint();
  await writeFile(PROBE_DOC, "# fixture\nadded\n");
  const added = await computeFingerprint();
  expect(added.fingerprint).not.toBe(before.fingerprint);
  expect(added.files).toBe(before.files + 1);

  await unlink(PROBE_DOC);
  const after = await computeFingerprint();
  expect(after.fingerprint).toBe(before.fingerprint);
});

test("fingerprint moves when an existing file's content grows", async () => {
  await writeFile(PROBE_DOC, "# fixture\noriginal\n");
  const before = await computeFingerprint();
  await appendFile(PROBE_DOC, "a materially longer second line\n");
  const after = await computeFingerprint();
  expect(after.fingerprint).not.toBe(before.fingerprint);
});

// The documented blind spot of stat mode, asserted rather than assumed: a same-length
// edit with a restored mtime is invisible to size+mtime, and hash mode is the answer.
// This is why BRAIN_REFRESH=hash exists — the limit is real, not theoretical.
test("stat mode misses a same-length edit with a preserved mtime; hash mode catches it", async () => {
  await writeFile(PROBE_DOC, "# fixture\nAAAA\n");
  const stamp = new Date(2020, 0, 1);
  await utimes(PROBE_DOC, stamp, stamp);

  const statBefore = await computeFingerprint("stat");
  const hashBefore = await computeFingerprint("hash");

  await writeFile(PROBE_DOC, "# fixture\nBBBB\n"); // same byte length
  await utimes(PROBE_DOC, stamp, stamp); // and the same mtime

  expect((await computeFingerprint("stat")).fingerprint).toBe(statBefore.fingerprint);
  expect((await computeFingerprint("hash")).fingerprint).not.toBe(hashBefore.fingerprint);
});

test("the corpus walk still covers each layer the brain indexes", async () => {
  const sources = new Set<string>();
  let sawOperatingPrinciples = false;
  for await (const entry of corpusFiles()) {
    sources.add(entry.source);
    if (entry.path === "brain/operating-principles.md") sawOperatingPrinciples = true;
  }
  // Regression guard for the 2026-08-20 extraction of this walk out of ingest.ts:
  // a rule silently dropped here would make those files unsearchable AND unwatched.
  for (const expected of ["root", "brain", "brain/learnings", "brain/anti-patterns",
                          "factory/playbooks", "meta", "stack", "products/config"]) {
    expect(sources.has(expected)).toBe(true);
  }
  expect(sawOperatingPrinciples).toBe(true);
});
