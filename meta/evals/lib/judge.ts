// Hamzaish — eval harness LLM judge (Movement 1, brick #2: the judge seam, filled)
//
// THE GATE-NOT-ORACLE CONTRACT (meta/evals/PLAN.md §"Four ideas", idea 4):
// the judge may DEMOTE a case (criterion FAIL → FAIL_BUILDABLE, can't-classify →
// UNCERTAIN); it may never PROMOTE one. That contract is enforced by this
// module's return type: there is no value the judge can return that turns a
// failing case green — deterministic checks decide PASS, the judge only vetoes.
//
// Transport: `claude -p` (headless Claude Code) — zero deps, no API key, rides
// the operator's subscription. Swap to the Anthropic API later without touching
// the case format. Judge model: Haiku (cheap; rubric checks don't need Sonnet).
//
// AGENT-BLIND RULE: the judge prompt is built HERE, from the case's frozen
// criteria. The system under test never sees it; the judge never sees the SUT's
// prompt — only its output.

export type JudgeCriterion = { id: string; requirement: string };

export type CriterionVerdict = {
  id: string;
  verdict: "PASS" | "FAIL" | "UNSURE";
  evidence: string;
};

export type JudgeResult =
  | { ok: true; criteria: CriterionVerdict[] }
  | { ok: false; reason: string }; // judge unreachable/unparseable → caller maps to UNCERTAIN

const JUDGE_TIMEOUT_MS = 120_000;
const MAX_OUTPUT_CHARS = 30_000;
export const JUDGE_MODEL = "haiku";

function buildPrompt(criteria: JudgeCriterion[], sutOutput: string): string {
  const truncated =
    sutOutput.length > MAX_OUTPUT_CHARS
      ? sutOutput.slice(0, MAX_OUTPUT_CHARS) + "\n[... truncated for judging ...]"
      : sutOutput;
  return [
    "You are a frozen evaluation judge. You grade an OUTPUT against named CRITERIA.",
    "You are a gate, not an oracle: a criterion only gets PASS when the output clearly and",
    "verifiably satisfies it. If a criterion clearly is not met, return FAIL with the evidence.",
    "If you genuinely cannot tell from the output alone, return UNSURE — do not guess either way.",
    "",
    "Respond with ONLY a JSON array, no prose, no code fences:",
    '[{"id": "<criterion id>", "verdict": "PASS" | "FAIL" | "UNSURE", "evidence": "<one sentence citing the output>"}]',
    "Include exactly one entry per criterion, in order.",
    "",
    "CRITERIA:",
    ...criteria.map((c) => `- ${c.id}: ${c.requirement}`),
    "",
    "OUTPUT TO JUDGE:",
    "<<<OUTPUT",
    truncated,
    "OUTPUT>>>",
  ].join("\n");
}

/** Extract the first JSON array from text (tolerates stray prose/fences around it). */
function extractJsonArray(text: string): unknown[] | null {
  const start = text.indexOf("[");
  if (start === -1) return null;
  for (let end = text.lastIndexOf("]"); end > start; end = text.lastIndexOf("]", end - 1)) {
    try {
      const parsed = JSON.parse(text.slice(start, end + 1));
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* keep shrinking */
    }
  }
  return null;
}

export async function llmJudge(
  criteria: JudgeCriterion[],
  sutOutput: string,
  model: string = JUDGE_MODEL,
): Promise<JudgeResult> {
  let proc;
  try {
    proc = Bun.spawn(
      ["claude", "-p", buildPrompt(criteria, sutOutput), "--model", model, "--max-turns", "1"],
      { stdout: "pipe", stderr: "pipe", env: { ...process.env } },
    );
  } catch (e) {
    return { ok: false, reason: `judge spawn failed: ${(e as Error).message}` };
  }
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; proc.kill(); }, JUDGE_TIMEOUT_MS);
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  clearTimeout(timer);
  if (timedOut) return { ok: false, reason: `judge timed out after ${JUDGE_TIMEOUT_MS}ms` };
  if (exitCode !== 0) return { ok: false, reason: `judge exited ${exitCode}: ${stderr.slice(0, 120)}` };

  const arr = extractJsonArray(stdout);
  if (!arr) return { ok: false, reason: `judge output not a JSON array: ${stdout.slice(0, 120)}` };

  const byId = new Map<string, CriterionVerdict>();
  for (const row of arr as any[]) {
    if (row && typeof row.id === "string" && ["PASS", "FAIL", "UNSURE"].includes(row.verdict)) {
      byId.set(row.id, { id: row.id, verdict: row.verdict, evidence: String(row.evidence ?? "") });
    }
  }
  // A criterion the judge skipped is a criterion we can't trust → UNSURE, never assumed green.
  const results: CriterionVerdict[] = criteria.map(
    (c) => byId.get(c.id) ?? { id: c.id, verdict: "UNSURE", evidence: "judge returned no verdict for this criterion" },
  );
  return { ok: true, criteria: results };
}
