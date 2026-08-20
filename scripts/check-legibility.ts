#!/usr/bin/env bun
// check-legibility.ts — lint a Hamzaish plan/receipt bookend for day-1 legibility.
//
// The defect this exists for: on 2026-08-01 the factory's first receipts were VISIBLE
// but unreadable — "doors run: … · tendrils planted · commits: a50ffc0" — insider
// shorthand a new user cannot parse (see the wider industry version of this failure:
// agents optimizing summaries for throughput, not understandability; README "Your
// agent stopped speaking human"). The enablement protocol (hamzaish.md §5) now ends
// with a legibility gate; this script encodes that gate so it is checkable in evals
// and CI, not just remembered.
//
// The receipt gained a Recommendation line on 2026-08-20, after a proposal whose
// recommendation was present but buried in the body — the operator had to ask for it
// outright. The receipt is the part that gets read, so the call has to live there.
// "NA" is a valid recommendation; a missing line and a hedge are not.
//
//   bun run check-legibility "<bookend text>"     # or pipe it on stdin
//   exit 0 = passes the gate · exit 1 = violations listed
//
// It lints whatever you hand it: a plan block, a receipt block, or both.
const BANNED = [
  "lane", "lanes", "slice", "slices", "tendril", "tendrils", "door", "doors",
  "artifact", "artifacts", "retro", "e2e", "typecheck", "rle", "subagent",
  "subagents", "scaffold", "monorepo",
] as const;

const text = (process.argv[2] ?? (await Bun.stdin.text())).trim();
if (!text) {
  console.error("usage: bun run check-legibility \"<plan or receipt text>\"  (or pipe stdin)");
  process.exit(1);
}

const problems: string[] = [];
const lower = text.toLowerCase();
// Real words only — separators like "—" and "·" are not words.
const words = lower.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w));

// 1. Banned internal nouns (word-boundary match so "sliced apples" in a game
//    feature list doesn't trip it, but "slice" as a noun does).
for (const bad of BANNED) {
  if (new RegExp(`\\b${bad}\\b`, "i").test(text)) {
    problems.push(`banned insider word "${bad}" — say what it does in plain words instead`);
  }
}

// 2. Shape: if it claims to be a plan/receipt, its lines must all be present.
const isPlan = /hamzaish plan/i.test(text);
const isReceipt = /hamzaish receipt/i.test(text);
if (isPlan) {
  for (const line of ["goal:", "steps:", "commands:", "proof"]) {
    if (!lower.includes(line)) problems.push(`plan is missing its "${line}" line`);
  }
}
if (isReceipt) {
  for (const line of ["what you got:", "checked:", "recommendation:", "try next:"]) {
    if (!lower.includes(line)) problems.push(`receipt is missing its "${line}" line`);
  }
}
if (!isPlan && !isReceipt) {
  problems.push('no "🏭 Hamzaish plan" or "🏭 Hamzaish receipt" header found');
}

// 3. Word caps. Targets are ~80 (plan) and ~65 (receipt); the gate FAILS well above
//    them — it exists to catch runaway bookends, not to bean-count rich-but-readable
//    ones. Calibrated so the operator-approved reference bookends pass with headroom.
if (isPlan && !isReceipt && words.length > 130) {
  problems.push(`plan is ${words.length} words — target is ~80, and past 130 it stops being a glance`);
}
if (isReceipt && !isPlan && words.length > 85) {
  problems.push(`receipt is ${words.length} words — target is ~65, and past 85 it stops being a glance`);
}

// 4. The recommendation must actually make a call. An empty line, or a hedge that
//    defers the decision back to the reader, is the failure this line was added to
//    prevent — "NA" is the honest way to say there is no call to make.
if (isReceipt) {
  const rec = (text.split(/recommendation:/i)[1] ?? "").split(/\n/)[0].trim();
  const bare = rec.replace(/[^a-z0-9]/gi, "").toLowerCase();
  // "NA" / "N/A" / "not applicable" all normalize to an honest no-call and pass.
  const NO_CALL = ["na", "notapplicable"];
  const HEDGES = ["tbd", "todo", "none", "unclear", "uptoyou", "yourcall", "youdecide", "depends"];
  if (bare.length === 0) {
    problems.push('Recommendation is empty — name the one thing to do next, or write exactly "NA"');
  } else if (!NO_CALL.includes(bare) && HEDGES.includes(bare)) {
    problems.push(`Recommendation "${rec}" defers the decision back to the reader — make the call, or write exactly "NA"`);
  }
}

// 5. Receipt teaches exactly ONE next command.
if (isReceipt) {
  const tryNext = text.split(/try next:/i)[1] ?? "";
  const commands = tryNext.match(/\/[a-z][a-z0-9-]*/gi) ?? [];
  if (commands.length === 0) problems.push("Try next has no /command to teach");
  if (commands.length > 1) problems.push(`Try next lists ${commands.length} commands — exactly one, never a menu`);
}

// 6. Machine noise the user can't feel: commit hashes and file paths.
if (/\b[0-9a-f]{7,40}\b/.test(text.replace(/https?:\S+/g, ""))) {
  problems.push("looks like a commit hash — users can't feel hashes; drop it");
}
if (/(^|[\s(])(\.?\/|~\/)[\w.-]+\/[\w./-]+/.test(text)) {
  problems.push("contains a file path — name the thing in plain words instead");
}

if (problems.length) {
  console.error(`✗ fails the legibility gate (${problems.length}):`);
  for (const p of problems) console.error(`  • ${p}`);
  process.exit(1);
}
console.log(`✓ passes the legibility gate (${words.length} words).`);
process.exit(0);
