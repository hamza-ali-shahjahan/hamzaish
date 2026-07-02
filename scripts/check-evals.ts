#!/usr/bin/env bun
// check-evals.ts — enforce the eval-coverage debt rule (meta/evals/README.md:
// "Adding a skill without an eval is debt") as a RATCHET, not a big bang.
//
// Why a ratchet: 70+ agents/skills predate the harness. Failing them all at once
// would either flood CI red or tempt aspirational (unverified) cases — both
// violations of the harness's own rules ("the floor must be honest-green").
// So: everything existing today is grandfathered by name in coverage.json;
// coverage can only go UP from here. Decision log: brain/decision-log/2026-07-02-eval-coverage-ratchet.md
//
//   exit 1 when:
//     • a SKILL.md is missing frontmatter name/description   (structural floor)
//     • an entity listed as covered has lost its cases        (coverage regression)
//     • a NEW agent/skill exists that is in neither list      (the debt rule, enforced)
//   info only:
//     • grandfathered entities (the visible debt backlog + coverage %)
//     • a listed entity no longer on disk (stale manifest)
//     • a `factory/playbooks/...` reference that doesn't resolve (orphan pointer)
//
// Usage: bun run check-evals            # report + gate
//        bun run check-evals --quiet    # gate only (CI); print on failure
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const quiet = process.argv.includes("--quiet");
const log = (s: string) => { if (!quiet) console.log(s); };
const fails: string[] = [];
const warns: string[] = [];

// ── inventory: every agent + skill on disk, keyed by folder name ──────────────
type Entity = { name: string; skillMd: string };
const entities: Entity[] = [];

const skillsRoot = join(root, "factory", "skills");
for (const e of readdirSync(skillsRoot)) {
  const md = join(skillsRoot, e, "SKILL.md");
  try { if (statSync(md).isFile()) entities.push({ name: e, skillMd: md }); } catch { /* not a skill dir */ }
}
const agentsRoot = join(root, "factory", "agents");
for (const stage of readdirSync(agentsRoot)) {
  const stageDir = join(agentsRoot, stage);
  if (!statSync(stageDir).isDirectory()) continue;
  // stage-level SKILL.md (e.g. _orchestrator/SKILL.md sits directly in its folder)
  const direct = join(stageDir, "SKILL.md");
  try { if (statSync(direct).isFile()) entities.push({ name: stage, skillMd: direct }); } catch { /* none */ }
  for (const a of readdirSync(stageDir)) {
    const md = join(stageDir, a, "SKILL.md");
    try { if (statSync(md).isFile()) entities.push({ name: a, skillMd: md }); } catch { /* skip */ }
  }
}

// ── structural floor: frontmatter with name + description ─────────────────────
for (const ent of entities) {
  const src = readFileSync(ent.skillMd, "utf8");
  const fm = src.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) { fails.push(`${ent.name}: SKILL.md has no frontmatter block`); continue; }
  if (!/^name:\s*\S/m.test(fm[1])) fails.push(`${ent.name}: frontmatter missing name:`);
  if (!/^description:\s*\S/m.test(fm[1])) fails.push(`${ent.name}: frontmatter missing description:`);
  // orphan-pointer sweep (warn only): playbook references that don't resolve
  for (const m of src.matchAll(/`(factory\/playbooks\/[\w\/-]+\.md)`/g)) {
    if (!existsSync(join(root, m[1]))) warns.push(`${ent.name}: references missing ${m[1]}`);
  }
}

// ── behavioral coverage: which entities have ≥1 eval case on disk ─────────────
const casesRoot = join(root, "meta", "evals", "skills");
const diskCovered = new Set<string>();
if (existsSync(casesRoot)) {
  for (const e of readdirSync(casesRoot)) {
    const casesDir = join(casesRoot, e, "cases");
    try {
      if (readdirSync(casesDir).some((f) => f.endsWith(".yaml") || f.endsWith(".yml"))) diskCovered.add(e);
    } catch { /* no cases dir */ }
  }
}

// ── the ratchet manifest ───────────────────────────────────────────────────────
const manifestPath = join(root, "meta", "evals", "coverage.json");
if (!existsSync(manifestPath)) {
  fails.push("meta/evals/coverage.json missing — the ratchet has no baseline");
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { covered: string[]; grandfathered: string[] };
  const covered = new Set(manifest.covered);
  const grandfathered = new Set(manifest.grandfathered);
  const onDisk = new Set(entities.map((e) => e.name));

  for (const c of covered) {
    if (!diskCovered.has(c)) fails.push(`coverage regression — "${c}" is listed as covered but has no case file under meta/evals/skills/${c}/cases/`);
  }
  for (const ent of entities) {
    if (!covered.has(ent.name) && !grandfathered.has(ent.name))
      fails.push(`new agent/skill "${ent.name}" has no eval case — the debt rule (meta/evals/README.md) now blocks: add a case under meta/evals/skills/${ent.name}/cases/ (verified honest-green), or consciously grandfather it in coverage.json with a dated reason in the PR`);
  }
  for (const listed of [...covered, ...grandfathered]) {
    if (!onDisk.has(listed)) warns.push(`manifest lists "${listed}" but it no longer exists on disk — prune coverage.json`);
  }
  for (const d of diskCovered) {
    if (!covered.has(d) && onDisk.has(d)) warns.push(`"${d}" has cases on disk but isn't in coverage.json "covered" — promote it so a case deletion becomes a caught regression`);
  }

  const pct = onDisk.size ? Math.round((manifest.covered.filter((c) => onDisk.has(c)).length / onDisk.size) * 100) : 0;
  log(`entities on disk: ${onDisk.size} (agents + skills) · behavioral eval coverage: ${manifest.covered.filter((c) => onDisk.has(c)).length}/${onDisk.size} (${pct}%) · grandfathered debt: ${manifest.grandfathered.filter((g) => onDisk.has(g)).length}`);
}

for (const w of warns) log(`  ℹ ${w}`);
if (fails.length === 0) {
  log("✓ structural floor green · no coverage regressions · no new entity without an eval.");
  process.exit(0);
}
console.error(`✗ check-evals: ${fails.length} failure(s):`);
for (const f of fails) console.error(`  • ${f}`);
process.exit(1);
