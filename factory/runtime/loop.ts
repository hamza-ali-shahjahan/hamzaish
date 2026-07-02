// Hamzaish — the headless runtime (Movement 1, brick #3)
//
// The generate → verdict → route loop. A PROGRAM calls Claude as a subroutine,
// runs the harness's verdict on the output, and routes on that verdict without
// a human in the loop. This is the runtime `meta/SELF-EVOLUTION.md` reaches for
// and `brain/knowledge/2026-06-04-interactive-vs-headless-self-evolving.md`
// describes: "the loop has to live in a script that calls Claude."
//
// BENCH vs LOOP — the load-bearing distinction:
//   The eval harness (meta/evals/) judges FROZEN fixtures and is AGENT-BLIND —
//   the system under test must never see its own test. This runtime is the
//   opposite surface: it runs a REAL task, and the acceptance criteria ARE the
//   spec, deliberately fed back to the generator to steer it. That feedback is
//   forbidden on the bench but is legitimate iteration here. So the runtime is
//   NOT agent-blind, and it lives in factory/ (HOW YOU ACT), importing the
//   harness's primitives as a library. The wall between bench and loop stays clean.
//
// COMPOSER, NOT REIMPLEMENTATION: every primitive already exists and is exported.
// This file wires them into a production loop with feedback-regeneration and a
// four-way router — logic that is genuinely its own.

import { mkdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { runChecks, runInvocation, type CheckSpec, type CheckResult } from "../../meta/evals/lib/checks";
import { llmJudge, JUDGE_MODEL, type JudgeCriterion, type CriterionVerdict, type JudgeResult } from "../../meta/evals/lib/judge";
import { modelForAgent, escalate, stakesFromPrompt, DEFAULT_MODEL, type Stakes } from "./model-policy";

const ROOT = resolve(import.meta.dir, "..", "..");
const PROPOSALS_DIR = join(import.meta.dir, "proposals");
const SUT_TIMEOUT_MS = 480_000; // claude -p reads playbooks + generates — minutes
const GAP_MARKER = /^GAP:/m;     // the SUT emits this when the spec is silent (never guess)

// ─── the four runtime outcomes (mirrors the harness; GAP/UNCERTAIN are the human pulls) ──

export type RuntimeOutcome = "PASS" | "FAIL_BUILDABLE" | "GAP" | "UNCERTAIN";

export type Task = {
  skill: string;
  agent?: string; // the factory agent this task executes — its model_tier frontmatter drives model choice
  generatePrompt: string; // the claude -p prompt for the system under test
  deterministicChecks: CheckSpec[]; // reused harness type — cheap floor, runs first
  judgeCriteria: JudgeCriterion[]; // reused harness type — the gate, runs only after the floor
  maxAttempts: number; // bounded; one regenerate on FAIL_BUILDABLE is maxAttempts: 2
  model?: string; // explicit override; else resolved from agent's model_tier (factory/model-policy.md, wired)
  stakes?: Stakes; // "high" escalates to the top tier regardless of role; default sniffed from the prompt
};

export type Attempt = {
  n: number;
  outcome: RuntimeOutcome;
  reason: string;
  checks: CheckResult[];
  output: string;
};

export type TaskResult = {
  skill: string;
  finalOutcome: RuntimeOutcome;
  route: string; // human-readable routed action
  attempts: Attempt[];
  kept: string | null; // the kept output on PASS, else null
  proposalPath?: string; // set on GAP
};

// ─── dependency seams (real by default; injectable so every route is force-testable) ──

export type GenerateResult = { ok: true; output: string } | { ok: false; reason: string };
export type Generator = (prompt: string, model: string) => Promise<GenerateResult>;
export type Judge = (criteria: JudgeCriterion[], output: string, model: string) => Promise<JudgeResult>;

/** The real generator: a read-only headless Claude Code call. */
export const claudeGenerator: Generator = async (prompt, model) => {
  const inv = await runInvocation(
    ["claude", "-p", prompt, "--model", model, "--allowedTools", "Read Glob Grep", "--max-turns", "30"],
    ROOT,
    SUT_TIMEOUT_MS,
  );
  if (inv === "timeout") return { ok: false, reason: "generation timed out — can't distinguish broken from slow" };
  if ("spawnError" in (inv as any)) return { ok: false, reason: `spawn failed: ${(inv as any).spawnError}` };
  const { stdout, exitCode } = inv as { stdout: string; exitCode: number };
  if (exitCode !== 0) return { ok: false, reason: `claude exited ${exitCode}` };
  if (!stdout.trim()) return { ok: false, reason: "empty output" };
  return { ok: true, output: stdout };
};

// ─── feedback (the bench-forbidden, runtime-legitimate move) ──────────────────

function buildDeterministicFeedback(failed: CheckResult[]): string {
  return [
    "Your previous attempt did not meet these required criteria:",
    ...failed.map((c) => `- ${c.check} (your output: ${c.detail})`),
    "Revise so every one is satisfied. Output only the corrected deliverable.",
  ].join("\n");
}

function buildJudgeFeedback(failed: CriterionVerdict[]): string {
  return [
    "A reviewer judged your previous attempt and found these criteria unmet:",
    ...failed.map((c) => `- ${c.id}: ${c.evidence}`),
    "Revise to satisfy them. Output only the corrected deliverable.",
  ].join("\n");
}

// ─── the GAP seam (Movement 2 inbox — stubbed, like brick #1 stubbed the judge) ──

async function writeProposalStub(task: Task, output: string): Promise<string> {
  await mkdir(PROPOSALS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const path = join(PROPOSALS_DIR, `${task.skill}-${stamp}.md`);
  const gapLine = (output.match(/^GAP:.*/m) ?? ["GAP: (unspecified)"])[0];
  const body = [
    `# Proposal — gap surfaced by ${task.skill}`,
    ``,
    `**Status:** open — awaiting human ratification (Movement 2 inbox; nothing auto-promotes).`,
    `**Raised:** ${new Date().toISOString()}`,
    ``,
    `## The gap the runtime hit`,
    ``,
    `> ${gapLine.replace(/^GAP:\s*/, "")}`,
    ``,
    `The runtime stopped rather than guess. Per SELF-EVOLUTION.md, a GAP is *signal*`,
    `("you never told me what to do here"), not waste — it routes up to a human, who`,
    `decides, and the decision becomes a rule the next run inherits.`,
    ``,
    `## What the generator produced before stopping`,
    ``,
    "```",
    output.slice(0, 2000),
    "```",
  ].join("\n");
  await Bun.write(path, body);
  return relative(ROOT, path);
}

// ─── the loop ─────────────────────────────────────────────────────────────────

function finish(
  task: Task,
  attempts: Attempt[],
  finalOutcome: RuntimeOutcome,
  route: string,
  extra: { kept?: string; proposalPath?: string } = {},
): TaskResult {
  return { skill: task.skill, finalOutcome, route, attempts, kept: extra.kept ?? null, proposalPath: extra.proposalPath };
}

/**
 * Run one task to a verdict, regenerating with criterion-feedback on
 * FAIL_BUILDABLE up to task.maxAttempts. Returns the full trace. Pure of
 * process.exit — this is a library a CLI or a future claude -p driver calls.
 */
export async function runTask(task: Task, deps: { generate?: Generator; judge?: Judge } = {}): Promise<TaskResult> {
  const generate = deps.generate ?? claudeGenerator;
  const judge = deps.judge ?? ((c, o, m) => llmJudge(c, o, m));
  // Model resolution order (factory/model-policy.md, now wired): explicit override →
  // the agent's model_tier frontmatter → Tier B default. Then stakes escalate UP only.
  const base = task.model ?? (task.agent ? modelForAgent(task.agent) : DEFAULT_MODEL);
  const model = escalate(base, task.stakes ?? stakesFromPrompt(task.generatePrompt));
  const attempts: Attempt[] = [];
  let feedback = "";

  for (let n = 1; n <= task.maxAttempts; n++) {
    const prompt = feedback ? `${task.generatePrompt}\n\n${feedback}` : task.generatePrompt;
    const gen = await generate(prompt, model);

    // (2) can't even get an output → UNCERTAIN, escalate now.
    if (!gen.ok) {
      attempts.push({ n, outcome: "UNCERTAIN", reason: gen.reason, checks: [], output: "" });
      return finish(task, attempts, "UNCERTAIN", `escalate — ${gen.reason}`);
    }
    const output = gen.output;

    // (3) the generator flagged a silent spec → GAP, write a proposal, never guess.
    if (GAP_MARKER.test(output)) {
      const proposalPath = await writeProposalStub(task, output);
      attempts.push({ n, outcome: "GAP", reason: "generator emitted GAP marker — spec silent", checks: [], output });
      return finish(task, attempts, "GAP", `proposal written → ${proposalPath} (awaiting ratification)`, { proposalPath });
    }

    // (4) deterministic floor first (cheap). Any fail → FAIL_BUILDABLE; regenerate if attempts remain.
    const checks = runChecks(task.deterministicChecks, { stdout: output, stderr: "", exitCode: 0 });
    const failed = checks.filter((c) => !c.ok);
    if (failed.length > 0) {
      attempts.push({ n, outcome: "FAIL_BUILDABLE", reason: `${failed.length}/${checks.length} deterministic criteria failed`, checks, output });
      feedback = buildDeterministicFeedback(failed);
      continue;
    }

    // (5) judge gate — only after the floor is green. Gate, never oracle: it can demote, not promote.
    if (task.judgeCriteria.length > 0) {
      const judged = await judge(task.judgeCriteria, output, JUDGE_MODEL);
      if (!judged.ok) {
        attempts.push({ n, outcome: "UNCERTAIN", reason: `judge unavailable: ${judged.reason}`, checks, output });
        return finish(task, attempts, "UNCERTAIN", "escalate — judge unavailable");
      }
      for (const cr of judged.criteria) {
        checks.push({ check: `judge: ${cr.id}`, ok: cr.verdict === "PASS", detail: `${cr.verdict} — ${cr.evidence}` });
      }
      const jfail = judged.criteria.filter((c) => c.verdict === "FAIL");
      const junsure = judged.criteria.filter((c) => c.verdict === "UNSURE");
      if (jfail.length > 0) {
        attempts.push({ n, outcome: "FAIL_BUILDABLE", reason: `judge failed: ${jfail.map((c) => c.id).join(", ")}`, checks, output });
        feedback = buildJudgeFeedback(jfail);
        continue;
      }
      if (junsure.length > 0) {
        attempts.push({ n, outcome: "UNCERTAIN", reason: `judge unsure: ${junsure.map((c) => c.id).join(", ")} — human look needed`, checks, output });
        return finish(task, attempts, "UNCERTAIN", "escalate — judge unsure");
      }
    }

    // (1) all green → keep.
    attempts.push({ n, outcome: "PASS", reason: "all criteria green", checks, output });
    return finish(task, attempts, "PASS", "kept", { kept: output });
  }

  // attempts exhausted while still FAIL_BUILDABLE — the last failure stands.
  return finish(task, attempts, "FAIL_BUILDABLE", `gave up after ${task.maxAttempts} attempt(s) — last failure stands, escalate`);
}
