// Hamzaish — eval harness check primitives (Movement 1 / Phase D, brick #1)
//
// Deterministic checks only in v1. The LLM judge is a SEAM (stubbed below) —
// when it lands, it is a GATE, never an oracle: it may push a case to
// UNCERTAIN, it may never auto-PASS (meta/evals/PLAN.md §"Four ideas").
//
// AGENT-BLIND RULE: nothing in here may expose case files or expectations to
// the system under test. The invoked command runs with the repo as cwd but the
// brain index excludes meta/evals/**/cases and **/runs (see brain/ingest.ts).

export type CheckSpec =
  | { type: "exit_code"; equals: number }
  | { type: "json_parse" }
  | { type: "top_n_contains"; n: number; any_of: string[] }
  | { type: "stdout_matches"; regex: string };

export type CaseSpec = {
  name: string;
  skill: string;
  description?: string;
  invoke: { cmd: string[]; timeout_ms?: number };
  preflight?: { must_exist?: string[] };
  checks: CheckSpec[];
};

export type CheckResult = { check: string; ok: boolean; detail: string };

// The four-outcome verdict (+ SKIP for missing environment, which is a
// non-verdict: the case neither passed nor failed — it couldn't run).
export type Outcome = "PASS" | "FAIL_BUILDABLE" | "GAP" | "UNCERTAIN" | "SKIP";

export type Verdict = {
  name: string;
  skill: string;
  outcome: Outcome;
  reason: string;
  checks: CheckResult[];
  duration_ms: number;
};

const KNOWN_CHECKS = new Set(["exit_code", "json_parse", "top_n_contains", "stdout_matches"]);

/** Executable-criterion-or-GAP, applied at load time: if a case's criteria
 *  aren't machine-checkable as written, that's a GAP now — not a surprise later. */
export function validateCase(c: any): string | null {
  if (!c || typeof c !== "object") return "case file is not a mapping";
  if (!c.name || !c.skill) return "missing name/skill";
  if (!Array.isArray(c.invoke?.cmd) || c.invoke.cmd.length === 0 || !c.invoke.cmd.every((x: any) => typeof x === "string"))
    return "invoke.cmd must be a non-empty string array";
  if (!Array.isArray(c.checks) || c.checks.length === 0)
    return "no checks — a case with no executable criterion is a GAP by definition";
  for (const ch of c.checks) {
    if (!KNOWN_CHECKS.has(ch?.type)) return `unknown check type: ${ch?.type}`;
    if (ch.type === "exit_code" && typeof ch.equals !== "number") return "exit_code check needs equals:<number>";
    if (ch.type === "top_n_contains" && (!Array.isArray(ch.any_of) || ch.any_of.length === 0 || typeof ch.n !== "number"))
      return "top_n_contains needs n:<number> and any_of:[paths]";
    if (ch.type === "stdout_matches" && typeof ch.regex !== "string") return "stdout_matches needs regex:<string>";
  }
  return null;
}

/** Spawn the system under test with a hard timeout. Timeout → null (caller maps to UNCERTAIN). */
export async function runInvocation(
  cmd: string[],
  cwd: string,
  timeoutMs: number,
): Promise<{ stdout: string; stderr: string; exitCode: number } | "timeout" | { spawnError: string }> {
  let proc;
  try {
    proc = Bun.spawn(cmd, { cwd, stdout: "pipe", stderr: "pipe" });
  } catch (e) {
    return { spawnError: (e as Error).message };
  }
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; proc.kill(); }, timeoutMs);
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  clearTimeout(timer);
  if (timedOut) return "timeout";
  return { stdout, stderr, exitCode };
}

/** Run all checks against an invocation result. Pure + deterministic. */
export function runChecks(
  specs: CheckSpec[],
  inv: { stdout: string; stderr: string; exitCode: number },
): CheckResult[] {
  const results: CheckResult[] = [];
  let parsed: any = undefined;
  for (const spec of specs) {
    switch (spec.type) {
      case "exit_code":
        results.push({
          check: `exit_code == ${spec.equals}`,
          ok: inv.exitCode === spec.equals,
          detail: `got ${inv.exitCode}`,
        });
        break;
      case "json_parse":
        try {
          parsed = JSON.parse(inv.stdout);
          results.push({ check: "stdout is valid JSON", ok: true, detail: "parsed" });
        } catch (e) {
          results.push({ check: "stdout is valid JSON", ok: false, detail: (e as Error).message.slice(0, 120) });
        }
        break;
      case "top_n_contains": {
        const rows: any[] = Array.isArray(parsed?.results) ? parsed.results : [];
        if (parsed === undefined) {
          results.push({ check: `top-${spec.n} contains expected`, ok: false, detail: "no parsed JSON (json_parse missing or failed before this check)" });
          break;
        }
        const topN = rows.slice(0, spec.n).map((r) => String(r.path ?? ""));
        const hit = topN.find((p) => spec.any_of.includes(p));
        results.push({
          check: `top-${spec.n} contains one of [${spec.any_of.join(", ")}]`,
          ok: !!hit,
          detail: hit ? `hit: ${hit}` : `top-${spec.n} was: ${topN.join(" | ") || "(empty)"}`,
        });
        break;
      }
      case "stdout_matches":
        results.push({
          check: `stdout matches /${spec.regex}/`,
          ok: new RegExp(spec.regex, "m").test(inv.stdout),
          detail: inv.stdout.slice(0, 80).replace(/\n/g, " "),
        });
        break;
    }
  }
  return results;
}

/** SEAM ONLY — the LLM judge. Not implemented in brick #1. When implemented it
 *  must return structured per-criterion results and may classify a case as
 *  UNCERTAIN; it must never produce PASS on its own. */
export function llmJudge(): { outcome: "UNCERTAIN"; reason: string } {
  return { outcome: "UNCERTAIN", reason: "LLM judge not implemented (seam only — see PLAN.md)" };
}
