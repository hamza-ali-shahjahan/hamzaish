// factory/runtime/eval-score.ts — the EXECUTED-eval signal for the hill-climb.
//
// /goal's fresh-eyes rubric is a subjective LLM score. Where a skill HAS an eval in
// meta/evals/, its executed pass fraction is an objective, model-independent signal
// the loop can climb instead of (or alongside) the rubric — doctrine:
// factory/playbooks/ai-native-2026/cost-to-outcome-and-model-independence.md.
// This runs the harness for one skill and parses its summary line into a score.

import { resolve } from "node:path";

export type EvalScore = {
  counts: Record<string, number>;
  scored: number; // PASS+FAIL_BUILDABLE+GAP+UNCERTAIN (SKIP excluded — it never ran)
  pass: number;
  fraction: number; // pass / scored (0 when nothing scored)
};

/** Pure: parse the runner's `→ summary: PASS=.. SKIP=..` line into a score. */
export function parseEvalSummary(stdout: string): EvalScore {
  const line = stdout.match(/→ summary:\s*(.+)$/m);
  const counts: Record<string, number> = {};
  if (line) for (const m of line[1].matchAll(/([A-Z_]+)=(\d+)/g)) counts[m[1]] = Number(m[2]);
  const pass = counts.PASS ?? 0;
  const scored = pass + (counts.FAIL_BUILDABLE ?? 0) + (counts.GAP ?? 0) + (counts.UNCERTAIN ?? 0);
  return { counts, scored, pass, fraction: scored ? Math.round((pass / scored) * 1000) / 1000 : 0 };
}

/** Run the eval harness for one skill and return its executed score. `noLlm` scores
 *  only the deterministic floor (fast, free — no model calls). */
export async function scoreSkill(
  skill: string,
  root = resolve(import.meta.dir, "..", ".."),
  opts: { noLlm?: boolean } = {},
): Promise<EvalScore> {
  const args = ["meta/evals/run.ts", "--skill", skill];
  if (opts.noLlm) args.push("--no-llm");
  const proc = Bun.spawn(["bun", ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
  const [stdout] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  return parseEvalSummary(stdout);
}
