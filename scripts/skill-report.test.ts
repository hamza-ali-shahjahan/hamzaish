// skill-report.test.ts — the skill-outcome telemetry slice, proven per our own
// rule (feature-slicing: no slice without a named eval + an end-to-end test).
//
//   E2E TEST  "skill outcomes end-to-end" — real Skill-call hook payloads piped
//             through the real trace-log.ts process, then aggregated.
//   EVAL      "skill-outcome-fidelity" — synthetic events in, exact per-skill
//             attribution out, every trust state derived correctly.
//
// Ported idea: OpenSpace's outcome telemetry + trust promotion (references/
// README.md → OpenSpace §1); the trust bar here is deliberately conservative.
import { describe, expect, test } from "bun:test";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { aggregateSkills, deriveState } from "./skill-report";

const scripts = resolve(dirname(fileURLToPath(import.meta.url)));

const skillLine = (skill: string, sid: string, ok = true, t = new Date().toISOString()) =>
  JSON.stringify({ t, sid, ev: "PostToolUse", tool: "Skill", ok, skill });

describe("skill outcomes end-to-end", () => {
  test("a real Skill hook payload flows through trace-log into the aggregate", async () => {
    const dir = mkdtempSync(join(tmpdir(), "skillrep-"));
    const payload = JSON.stringify({
      session_id: "abcdef1234567890",
      hook_event_name: "PostToolUse",
      tool_name: "Skill",
      tool_input: { skill: "tidy", args: "never-recorded" },
      tool_response: { stdout: "ok" },
    });
    const proc = Bun.spawn(["bun", join(scripts, "trace-log.ts")], {
      stdin: new TextEncoder().encode(payload),
      env: { ...process.env, HAMZAISH_TRACE_DIR: dir },
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(await proc.exited).toBe(0);
    const lines = readdirSync(dir)
      .filter((f) => f.endsWith(".local.jsonl"))
      .flatMap((f) => readFileSync(join(dir, f), "utf8").split("\n").filter(Boolean));
    const r = aggregateSkills(lines, ["tidy"], [], 7, new Date(Date.now() - 86_400_000).toISOString().slice(0, 10));
    expect(r.skill_events).toBe(1);
    expect(r.rows[0]).toMatchObject({ skill: "tidy", invocations: 1, sessions: 1, failures: 0, state: "active" });
    expect(JSON.stringify(r)).not.toContain("never-recorded");
  });
});

describe("eval: skill-outcome-fidelity", () => {
  test("per-skill attribution is exact and every trust state derives correctly", () => {
    const lines = [
      // `validate`: 3 invocations across 2 sessions, no failures, eval-covered → trusted
      skillLine("validate", "s1"),
      skillLine("validate", "s1"),
      skillLine("validate", "s2"),
      // `tidy`: 2 sessions, no failures, NOT eval-covered → proven
      skillLine("tidy", "s1"),
      skillLine("tidy", "s3"),
      // `ideate`: 1 session only → active
      skillLine("ideate", "s2"),
      // `scaffold`: has a failure → demoted (even though 2 sessions)
      skillLine("scaffold", "s1"),
      skillLine("scaffold", "s2", false),
      // `loop`: seen in traces but not a factory skill → external, still reported
      skillLine("loop", "s9"),
      // noise the aggregator must skip
      JSON.stringify({ t: new Date().toISOString(), sid: "s1", ev: "PostToolUse", tool: "Bash", ok: true, cmd: "ls" }),
      "{{{ corrupt",
      // out-of-window skill event must not count
      skillLine("validate", "old", true, "2026-01-01T00:00:00Z"),
    ];
    const inventory = ["validate", "tidy", "ideate", "scaffold", "web-launch"];
    const from = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const r = aggregateSkills(lines, inventory, ["validate", "scaffold"], 7, from);

    expect(r.skill_events).toBe(9);
    const by = Object.fromEntries(r.rows.map((x) => [x.skill, x]));
    expect(by.validate).toMatchObject({ invocations: 3, sessions: 2, failures: 0, state: "trusted", eval_covered: true });
    expect(by.tidy).toMatchObject({ invocations: 2, sessions: 2, failures: 0, state: "proven", eval_covered: false });
    expect(by.ideate).toMatchObject({ invocations: 1, sessions: 1, state: "active" });
    expect(by.scaffold).toMatchObject({ invocations: 2, failures: 1, state: "demoted" });
    expect(by.loop).toMatchObject({ in_factory: false, invocations: 1 });
    expect(by["web-launch"]).toMatchObject({ invocations: 0, state: "dormant", in_factory: true });
    // ordering: most-used first, dormant tail
    expect(r.rows[0].skill).toBe("validate");
    expect(r.rows.at(-1)!.state).toBe("dormant");
  });

  test("trust bar is exact at the boundaries", () => {
    const base = { skill: "x", last_used: "2026-07-30", in_factory: true } as const;
    expect(deriveState({ ...base, invocations: 0, sessions: 0, failures: 0, eval_covered: true })).toBe("dormant");
    expect(deriveState({ ...base, invocations: 5, sessions: 5, failures: 1, eval_covered: true })).toBe("demoted");
    expect(deriveState({ ...base, invocations: 2, sessions: 2, failures: 0, eval_covered: true })).toBe("trusted");
    expect(deriveState({ ...base, invocations: 2, sessions: 2, failures: 0, eval_covered: false })).toBe("proven");
    expect(deriveState({ ...base, invocations: 2, sessions: 1, failures: 0, eval_covered: true })).toBe("active");
  });
});
