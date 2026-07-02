#!/usr/bin/env bun
// Hamzaish — headless runtime CLI (Movement 1, brick #3)
//
// Runs one Task through the generate → verdict → route loop and prints the
// trace. This is the hand-runnable surface; the library (loop.ts) is what a
// future self-cranking driver imports.
//
//   bun factory/runtime/run-task.ts            # the ideate demo task
//   bun factory/runtime/run-task.ts --no-judge # deterministic floor only (faster, free-r)
//
// The demo task deliberately carries one EXTRA deterministic criterion the
// ideate protocol does not emit on its own (a `**Confidence:** N/10` line per
// idea). That makes the first attempt fail the floor, so the runtime feeds the
// criterion back and regenerates — exercising the FAIL_BUILDABLE→regen→PASS
// path live. The criterion is a demonstration device, not a claim that ideate
// normally needs it.

import { runTask, type Task } from "./loop";

const noJudge = process.argv.includes("--no-judge");

const ideateDemo: Task = {
  skill: "ideate",
  agent: "idea-generator", // model resolves from its model_tier frontmatter (sonnet — Tier B)
  generatePrompt: [
    "Read factory/agents/idea/idea-generator/SKILL.md and execute its protocol exactly.",
    "The protocol's one clarifying question is already answered: constraint/theme =",
    "AI-powered tools for solo founders and indie hackers. Produce exactly 4 ideas.",
    "You are running headless: never ask questions, never wait for input. Output only",
    "the final markdown deliverable (the ranked idea list + the one direct",
    "recommendation) to stdout. Do not create or modify any files.",
    "If the theme is too underspecified to proceed responsibly, do not guess — emit a",
    "single line starting with 'GAP:' naming exactly what is missing, and nothing else.",
  ].join(" "),
  deterministicChecks: [
    { type: "exit_code", equals: 0 },
    { type: "stdout_count_min", regex: "^## Idea", min: 4 },
    { type: "stdout_count_min", regex: "\\*\\*One-liner:\\*\\*", min: 4 },
    // The biting criterion — not in the protocol's contract, so attempt 1 fails it:
    { type: "stdout_count_min", regex: "\\*\\*Confidence:\\*\\* \\d+/10", min: 4 },
  ],
  judgeCriteria: noJudge
    ? []
    : [
        { id: "distinct_ideas", requirement: "The 4 ideas are genuinely distinct problems for distinct user moments — not thin variants of one product." },
        { id: "on_theme", requirement: "Every idea plausibly serves the theme (AI-powered tools for solo founders / indie hackers)." },
      ],
  maxAttempts: 2,
};

// ─── run + print the trace ─────────────────────────────────────────────────

const icon: Record<string, string> = { PASS: "✅", FAIL_BUILDABLE: "❌", GAP: "🕳️", UNCERTAIN: "❓" };

console.log(`→ headless runtime: task "${ideateDemo.skill}"  (maxAttempts=${ideateDemo.maxAttempts}${noJudge ? ", --no-judge" : ""})\n`);

const result = await runTask(ideateDemo);

for (const a of result.attempts) {
  console.log(`  attempt ${a.n}: ${icon[a.outcome] ?? ""} ${a.outcome} — ${a.reason}`);
  for (const c of a.checks) if (!c.ok) console.log(`     ✗ ${c.check} → ${c.detail}`);
}
console.log(`\n→ final: ${icon[result.finalOutcome] ?? ""} ${result.finalOutcome}`);
console.log(`→ route: ${result.route}`);
if (result.proposalPath) console.log(`→ proposal: ${result.proposalPath}`);
if (result.kept) console.log(`→ kept ${result.kept.length} chars of output (first 200):\n${result.kept.slice(0, 200)}…`);

// Exit 0 — the runtime classifying a task is success even when the verdict is
// not PASS. The verdict is data for the caller, not a pass/fail of the runtime.
process.exit(0);
