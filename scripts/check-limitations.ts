#!/usr/bin/env bun
// check-limitations.ts — every skill must say what it CAN'T do, as a RATCHET.
//
// The defect this exists for: the factory documents capability generously and limits
// sparsely. A skill that never states its edges gets invoked outside them, and the
// operator finds the edge by hitting it. Studied 2026-08-16 in deepseek-ai/deepseek-
// harness, where `scripts/verify-package-readme-limitations.ts` fails the build if a
// package README lacks "## Known Limitations and Deferred Work" — which is exactly why
// that repo's docs will tell you its sandbox does not confine network and its
// credentials file is readable by its own agent. Honesty held up by a lint outlives
// honesty held up by good intentions.
//
// Why a ratchet, not a wall: 73 of 74 skills/agents predate this rule. Failing them all
// at once would flood CI red or tempt aspirational one-liners — the same trap
// check-evals avoided (see its header, and brain/decision-log/2026-07-02-eval-coverage-
// ratchet.md). Everything existing today is grandfathered BY NAME; coverage only goes up.
//
//   exit 1 when:
//     • an entity listed as covered has LOST its limitations section (regression)
//     • a NEW skill/agent exists that is in neither list (the rule, enforced)
//   info only:
//     • the grandfathered backlog + coverage %
//     • a listed entity that is not on disk (stale manifest)
//
// Usage: bun run check-limitations           # report + gate
//        bun run check-limitations --quiet   # gate only (CI)
//        bun run check-limitations --init    # write the manifest ONCE from disk state
//        bun run check-limitations --self-test
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const quiet = process.argv.includes("--quiet");
const log = (s: string) => { if (!quiet) console.log(s); };

/**
 * A limitations section is any heading that names the edge. Deliberately broad on
 * WORDING and strict on EXISTENCE: the point is that the author had to think about
 * limits, not that they used the house phrase.
 */
const LIMITS_HEADING =
  /^#{1,4}\s+.*(known limits|known limitations|limitations|what it (can'?t|cannot|does ?n'?t|won'?t)|what this (can'?t|does ?n'?t)|not for|out of scope|deferred work|when not to)/im;

export function declaresLimits(markdown: string): boolean {
  return LIMITS_HEADING.test(markdown);
}

// ── self-test: deterministic anchor, no repo state ──────────────────────────────
if (process.argv.includes("--self-test")) {
  const yes = [
    "# s\n## Known limits\ncan't do X",
    "# s\n### What it can't do\n- nope",
    "# s\n#### Out of scope\ntext",
    "# s\n## When not to use this\ntext",
  ].every(declaresLimits);
  const no = ["# s\n## Usage\ntext", "# s\nlimitations are discussed inline but not as a heading"].every(
    (m) => !declaresLimits(m),
  );
  if (yes && no) {
    console.log("self-test: PASS (heading forms detected; prose mentions do not count)");
    process.exit(0);
  }
  console.error(`self-test: FAIL (positives=${yes} negatives=${no})`);
  process.exit(1);
}

// ── inventory: same walk as check-evals, so the two gates never disagree ────────
type Entity = { name: string; path: string; rel: string };
const entities: Entity[] = [];

const skillsRoot = join(root, "factory", "skills");
for (const e of readdirSync(skillsRoot)) {
  const md = join(skillsRoot, e, "SKILL.md");
  try {
    if (statSync(md).isFile()) entities.push({ name: e, path: md, rel: `factory/skills/${e}/SKILL.md` });
  } catch {
    /* not a skill dir */
  }
}
const agentsRoot = join(root, "factory", "agents");
for (const stage of readdirSync(agentsRoot)) {
  const stageDir = join(agentsRoot, stage);
  if (!statSync(stageDir).isDirectory()) continue;
  const direct = join(stageDir, "SKILL.md");
  try {
    if (statSync(direct).isFile()) entities.push({ name: stage, path: direct, rel: `factory/agents/${stage}/SKILL.md` });
  } catch {
    /* none */
  }
  for (const a of readdirSync(stageDir)) {
    const md = join(stageDir, a, "SKILL.md");
    try {
      if (statSync(md).isFile()) entities.push({ name: a, path: md, rel: `factory/agents/${stage}/${a}/SKILL.md` });
    } catch {
      /* skip */
    }
  }
}

const declaring = new Set(entities.filter((e) => declaresLimits(readFileSync(e.path, "utf8"))).map((e) => e.name));

// ── manifest: the ratchet's memory ─────────────────────────────────────────────
const manifestPath = join(root, "meta", "limitations-coverage.json");
type Manifest = { _comment: string; covered: string[]; grandfathered: string[] };

if (process.argv.includes("--init")) {
  if (existsSync(manifestPath)) {
    console.error(`refusing to overwrite ${manifestPath} — delete it deliberately if you mean to reset the ratchet`);
    process.exit(1);
  }
  const m: Manifest = {
    _comment:
      "Ratchet for check-limitations.ts. `covered` = declares its limits today (losing it fails CI). " +
      "`grandfathered` = the visible backlog that predates the rule; move a name up when you add the section. " +
      "A new skill in neither list fails CI. Never add a name to grandfathered by hand.",
    covered: entities.filter((e) => declaring.has(e.name)).map((e) => e.name).sort(),
    grandfathered: entities.filter((e) => !declaring.has(e.name)).map((e) => e.name).sort(),
  };
  writeFileSync(manifestPath, `${JSON.stringify(m, null, 2)}\n`);
  console.log(`wrote ${manifestPath} — covered=${m.covered.length} grandfathered=${m.grandfathered.length}`);
  process.exit(0);
}

if (!existsSync(manifestPath)) {
  console.error(`missing ${manifestPath} — run: bun run check-limitations --init`);
  process.exit(1);
}
const manifest: Manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const covered = new Set(manifest.covered);
const grandfathered = new Set(manifest.grandfathered);

const fails: string[] = [];
const warns: string[] = [];

// regression: a covered entity that lost its section
for (const name of covered) {
  const ent = entities.find((e) => e.name === name);
  if (!ent) {
    warns.push(`${name}: listed as covered but not on disk (stale manifest entry)`);
    continue;
  }
  if (!declaring.has(name)) {
    fails.push(`${name}: had a limitations section and lost it — ${ent.rel}`);
  }
}
for (const name of grandfathered) {
  if (!entities.some((e) => e.name === name)) warns.push(`${name}: grandfathered but not on disk (stale manifest entry)`);
}

// the rule: a new entity must declare limits (it cannot join the backlog)
for (const ent of entities) {
  if (covered.has(ent.name) || grandfathered.has(ent.name)) continue;
  if (declaring.has(ent.name)) {
    warns.push(`${ent.name}: new and declares limits — add it to covered[] in meta/limitations-coverage.json`);
    continue;
  }
  fails.push(
    `${ent.name}: new skill/agent with no limitations section — add a "## Known limits" heading saying what it can't do (${ent.rel})`,
  );
}

// promotion is silent-good: an entity that moved from backlog to declaring
const promoted = [...grandfathered].filter((n) => declaring.has(n));

// ── report ─────────────────────────────────────────────────────────────────────
const total = entities.length;
const declared = entities.filter((e) => declaring.has(e.name)).length;
const pct = total === 0 ? 0 : Math.round((declared / total) * 100);

log(`limitations coverage: ${declared}/${total} (${pct}%) declare what they can't do`);
if (promoted.length > 0) {
  log(`\n  ↑ promoted (move these into covered[]): ${promoted.join(", ")}`);
}
if (!quiet && grandfathered.size > 0) {
  log(`\n  backlog (${grandfathered.size}) — grandfathered, coverage can only go up:`);
  const list = [...grandfathered].filter((n) => !declaring.has(n)).sort();
  for (let i = 0; i < list.length; i += 6) log(`    ${list.slice(i, i + 6).join(" · ")}`);
}
for (const w of warns) log(`  warn: ${w}`);

if (fails.length > 0) {
  console.error(`\n✗ check-limitations: ${fails.length} problem(s)`);
  for (const f of fails) console.error(`  • ${f}`);
  process.exit(1);
}
log(`\n✓ check-limitations: no regressions, no undeclared new skills`);
