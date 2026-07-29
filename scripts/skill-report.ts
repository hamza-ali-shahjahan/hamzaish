#!/usr/bin/env bun
// skill-report.ts — which skills earn their keep, measured in production.
//
// Ported idea: OpenSpace's skill-outcome telemetry (per-skill usage events + a
// provisional→trusted promotion rule) — references/README.md → OpenSpace §1.
// Our version rides the EXISTING trace substrate (scripts/trace-log.ts records
// the skill name on every Skill tool call) instead of a new store: the eval
// harness already measures skills at AUTHORING time; this measures them IN USE.
// /learn-loop grounds in it (4th instrument); /kill-or-keep's curator pass
// reads `dormant` rows as archive candidates (archive, never delete).
//
//   bun run skill-report              # markdown summary, last 30 days
//   bun run skill-report --days 7     # narrower window
//   bun run skill-report --json       # machine-readable (for skills/agents)
//
// Trust states (derived, honest — evidence, never proof):
//   trusted    ≥2 distinct sessions, zero trace failures, eval-covered
//   proven     ≥2 distinct sessions, zero trace failures, not yet eval-covered
//   active     used this window, below the trusted bar
//   demoted    ≥1 failed invocation this window — investigate before trusting
//   dormant    known factory skill, zero uses this window — curator candidate
//
// Failure counts are a floor (trace-log flags explicit error signals only), so
// `trusted` means "no evidence against, some evidence for" — not a guarantee.
// `dormant` is a question (unused, or a capture gap?), never a verdict.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export type SkillRow = {
  skill: string;
  invocations: number;
  sessions: number;
  failures: number;
  last_used: string | null; // YYYY-MM-DD
  in_factory: boolean; // lives under factory/skills/ (vs global/plugin skill seen in traces)
  eval_covered: boolean;
  state: "trusted" | "proven" | "active" | "demoted" | "dormant";
};

export type SkillReport = {
  window_days: number;
  from: string;
  skill_events: number;
  rows: SkillRow[];
};

export function deriveState(r: Omit<SkillRow, "state">): SkillRow["state"] {
  if (r.invocations === 0) return "dormant";
  if (r.failures > 0) return "demoted";
  if (r.sessions >= 2) return r.eval_covered ? "trusted" : "proven";
  return "active";
}

/** Pure aggregation — inventory + coverage injected so tests need no filesystem. */
export function aggregateSkills(
  lines: string[],
  inventory: string[],
  evalCovered: string[],
  windowDays: number,
  from: string,
): SkillReport {
  type Acc = { invocations: number; sids: Set<string>; failures: number; last: string | null };
  const acc: Record<string, Acc> = {};
  const covered = new Set(evalCovered);
  let skillEvents = 0;

  for (const raw of lines) {
    let e: any;
    try { e = JSON.parse(raw); } catch { continue; }
    if (typeof e?.t !== "string" || e.t.slice(0, 10) < from) continue;
    if (e.tool !== "Skill" || typeof e.skill !== "string") continue;
    skillEvents++;
    const a = (acc[e.skill] ??= { invocations: 0, sids: new Set(), failures: 0, last: null });
    a.invocations++;
    if (typeof e.sid === "string") a.sids.add(e.sid);
    if (e.ok === false) a.failures++;
    const day = e.t.slice(0, 10);
    if (a.last === null || day > a.last) a.last = day;
  }

  const factory = new Set(inventory);
  const names = new Set([...Object.keys(acc), ...inventory]);
  const rows: SkillRow[] = [...names].map((skill) => {
    const a = acc[skill] ?? { invocations: 0, sids: new Set<string>(), failures: 0, last: null };
    const base = {
      skill,
      invocations: a.invocations,
      sessions: a.sids.size,
      failures: a.failures,
      last_used: a.last,
      in_factory: factory.has(skill),
      eval_covered: covered.has(skill),
    };
    return { ...base, state: deriveState(base) };
  });

  // Used skills first (by invocations), then dormant alphabetically — the curator reads the tail.
  rows.sort((x, y) =>
    y.invocations - x.invocations || x.skill.localeCompare(y.skill),
  );

  return { window_days: windowDays, from, skill_events: skillEvents, rows };
}

function factoryInventory(): string[] {
  const skillsRoot = join(root, "factory", "skills");
  if (!existsSync(skillsRoot)) return [];
  const out: string[] = [];
  for (const e of readdirSync(skillsRoot)) {
    try { if (statSync(join(skillsRoot, e, "SKILL.md")).isFile()) out.push(e); } catch { /* not a skill dir */ }
  }
  return out;
}

function evalCoverage(): string[] {
  try {
    const c = JSON.parse(readFileSync(join(root, "meta", "evals", "coverage.json"), "utf8"));
    return Array.isArray(c?.covered) ? c.covered : [];
  } catch {
    return [];
  }
}

if (import.meta.main) {
  const asJson = process.argv.includes("--json");
  const daysIdx = process.argv.indexOf("--days");
  const days = daysIdx !== -1 ? Math.max(1, Number(process.argv[daysIdx + 1]) || 30) : 30;
  const from = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

  const dir = process.env.HAMZAISH_TRACE_DIR ?? join(root, "meta", "telemetry", "traces");
  const lines: string[] = [];
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).sort()) {
      const m = f.match(/^(\d{4}-\d{2}-\d{2})\.local\.jsonl$/);
      if (!m || m[1] < from) continue;
      lines.push(...readFileSync(join(dir, f), "utf8").split("\n").filter(Boolean));
    }
  }

  const r = aggregateSkills(lines, factoryInventory(), evalCoverage(), days, from);

  if (asJson) {
    console.log(JSON.stringify(r, null, 2));
    process.exit(0);
  }

  console.log(`## Skill outcomes — last ${r.window_days} days (since ${r.from})\n`);
  if (r.skill_events === 0) {
    console.log(
      "_No Skill-call traces in this window yet. Usage accumulates automatically via the project hooks " +
        "(skill NAME only — never args; local-only, gitignored). Note: traces recorded before the skill " +
        "field landed (v2.23.0) have no skill names — early dormant rows may just predate the instrument._",
    );
    process.exit(0);
  }
  const used = r.rows.filter((x) => x.invocations > 0);
  const dormant = r.rows.filter((x) => x.state === "dormant");
  console.log(`**${r.skill_events}** skill invocations · **${used.length}** skills used · **${dormant.length}** dormant\n`);
  console.log("| skill | state | invocations | sessions | failures | last used | eval |");
  console.log("|---|---|---|---|---|---|---|");
  for (const x of used)
    console.log(
      `| ${x.skill}${x.in_factory ? "" : " *(external)*"} | ${x.state} | ${x.invocations} | ${x.sessions} | ${x.failures} | ${x.last_used ?? "—"} | ${x.eval_covered ? "✓" : "—"} |`,
    );
  if (dormant.length) {
    console.log(`\n**Dormant this window** (curator candidates — archive, never delete; see /kill-or-keep):\n`);
    console.log(dormant.map((x) => `\`${x.skill}\``).join(" · "));
  }
  console.log(
    "\n_`trusted` = ≥2 sessions, 0 failures, eval-covered. Failure counts are a floor; dormant is a question, not a verdict._",
  );
}
