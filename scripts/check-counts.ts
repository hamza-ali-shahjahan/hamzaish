#!/usr/bin/env bun
// check-counts.ts — make "every count real" self-enforcing.
//
// The defect this exists for: on 2026-06-28 an ultracode review found nearly every
// headline number in the README/ledger had drifted from the filesystem (practices
// 128 vs 130 vs 133; playbooks 39 vs 41; skills "17" vs 19; security "59" vs "80+"
// vs 65), AND the no-`/Users/` path rule was breached and green in CI
// (products/copyright shipped a real `code_path`). All one root cause: facts
// hand-maintained in many places with nothing deriving or checking them. See
// brain/anti-patterns/hand-maintained-facts-drift.md.
//
// This guard derives the counts from the filesystem and fails if any headline claim,
// a tracked `/Users/hamza` path, or a non-null product `code_path` disagrees.
//
//   exit 0 = every claimed count matches disk; no path leak; all code_path === null
//   exit 1 = drift found (printed with the exact site and the right number)
//
//   bun run check-counts
import { readdirSync, existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const r = (...p: string[]) => join(root, ...p);
const read = (p: string) => readFileSync(r(p), "utf8");

// ─── derive the counts from disk ────────────────────────────────────────────
function mdFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (extname(e.name) === ".md" && e.name.toLowerCase() !== "readme.md") out.push(full);
    }
  };
  walk(dir);
  return out;
}
// entries (real dir or symlink) under a folder that contain a child file `child`
function entriesWithChild(dir: string, child: string): string[] {
  return readdirSync(dir)
    .filter((name) => {
      const p = join(dir, name);
      try { return statSync(p).isDirectory() && existsSync(join(p, child)); } catch { return false; }
    });
}
function topLevelMd(dir: string): string[] {
  return readdirSync(dir)
    .filter((n) => extname(n) === ".md" && n.toLowerCase() !== "readme.md");
}

const agents = mdFilesRecursive(r("factory/agents")).length;
// lifecycle-stage agents only — excludes engineering/ subagents and the _orchestrator router
const stageAgents = ["idea", "mvp", "launch", "scale", "portfolio"]
  .reduce((n, s) => n + mdFilesRecursive(r("factory/agents", s)).length, 0);
const skills = entriesWithChild(r("factory/skills"), "SKILL.md").length; // incl. plugin symlinks
const commands = topLevelMd(r("factory/commands")).length;
const playbooks = readdirSync(r("factory/playbooks"), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .reduce((n, e) => n + topLevelMd(join(r("factory/playbooks"), e.name)).length, 0); // top-level only — excludes nested templates

const bp = read("BEST-PRACTICES.md").split("\n");
const practiceLines = bp.filter((l) => /^- \*\*/.test(l));
const practices = practiceLines.length;
const proven = practiceLines.filter((l) => l.includes("✅")).length;
const partial = practiceLines.filter((l) => l.includes("🟡")).length;
const research = practiceLines.filter((l) => l.includes("⏳")).length;

const securityChecks = read("factory/playbooks/mvp-stage/security-checklist.md")
  .split("\n").filter((l) => /^\s*[-*] \[/.test(l) || l.includes("☐")).length;

const skillsAndCommands = skills + commands;

console.log(
  `derived from disk:\n` +
  `  agents=${agents} (stage=${stageAgents})  skills=${skills}  commands=${commands}  (skills+commands=${skillsAndCommands})\n` +
  `  playbooks=${playbooks}  practices=${practices} (✅${proven} 🟡${partial} ⏳${research})  security-checks=${securityChecks}`
);

// ─── assertions against the claim sites ──────────────────────────────────────
type Fail = string;
const fails: Fail[] = [];

// generic keyword scan across the fact-bearing files — these words only appear as
// headline counts, so any `<N> <kw>` must equal the disk count. docs/ joined
// 2026-09-19: it was never scanned, and docs/philosophy.md had drifted to "78 skills".
const DOC_FILES = readdirSync(r("docs")).filter((n) => extname(n) === ".md").map((n) => `docs/${n}`);
const FACT_FILES = ["README.md", "BEST-PRACTICES.md", "scripts/hero.ts", ...DOC_FILES];
function assertKeyword(kw: string, expected: number, notFollowedBy?: string) {
  const re = new RegExp(`(\\d+)\\s+${kw}\\b${notFollowedBy ? `(?!${notFollowedBy})` : ""}`, "g");
  for (const f of FACT_FILES) {
    const lines = read(f).split("\n");
    lines.forEach((line, i) => {
      for (const m of line.matchAll(re)) {
        if (Number(m[1]) !== expected) fails.push(`${f}:${i + 1}  "${m[1]} ${kw}" → should be ${expected}`);
      }
    });
  }
}
assertKeyword("agents", agents);
assertKeyword("playbooks", playbooks);
assertKeyword("practices", practices);
assertKeyword("skills", skills, "\\s*&\\s*commands"); // "69 skills & commands" is the combined count, checked below
assertKeyword("commands", commands);

// targeted assertions (pattern → expected), file-scoped
const TARGETED: { file: string; re: RegExp; expected: number; what: string }[] = [
  { file: "README.md", re: /(\d+)\s+(?:lifecycle-)?stage agents/g, expected: stageAgents, what: "stage agents (engineering subagents + the router aren't stage agents)" },
  { file: "README.md", re: /(\d+)\s+skills\s*\+\s*(\d+)\s+commands/g, expected: skills, what: `skills (+ commands=${commands})` },
  { file: "README.md", re: /skills & commands \((\d+)\)/g, expected: skillsAndCommands, what: "skills & commands header" },
  { file: "README.md", re: /(\d+)\s+skills & commands/g, expected: skillsAndCommands, what: "skills & commands badge" },
  { file: "README.md", re: /practices ledger \((\d+)\)/g, expected: practices, what: "practices ledger header" },
  { file: "README.md", re: /The agents \((\d+)\)/g, expected: agents, what: "agents header" },
  { file: "README.md", re: /The playbooks \((\d+)\)/g, expected: playbooks, what: "playbooks header" },
  { file: "README.md", re: /(\d+)\s*✅\s*proven/g, expected: proven, what: "✅ proven" },
  { file: "BEST-PRACTICES.md", re: /(\d+)\s+proven by real ships/g, expected: proven, what: "proven by real ships" },
  { file: "README.md", re: /(\d+)\+?\s+concrete checks/g, expected: securityChecks, what: "security concrete checks" },
  { file: "README.md", re: /Security Checklist — (\d+)\+?\s+checks/g, expected: securityChecks, what: "security checklist checks" },
];
for (const t of TARGETED) {
  const lines = read(t.file).split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(t.re)) {
      if (Number(m[1]) !== t.expected) fails.push(`${t.file}:${i + 1}  ${t.what} "${m[1]}" → should be ${t.expected}`);
    }
  });
}
// the "17 skills + 12 commands" line also encodes the command count in its 2nd group
{
  const lines = read("README.md").split("\n");
  lines.forEach((line, i) => {
    const m = /(\d+)\s+skills\s*\+\s*(\d+)\s+commands/.exec(line);
    if (m && Number(m[2]) !== commands) fails.push(`README.md:${i + 1}  commands "${m[2]}" → should be ${commands}`);
  });
}

// ─── README badges: the number lives in the image URL ───────────────────────
// The scans above read "53 playbooks" in prose but never ".../badge/51-playbooks-blue.svg"
// in a URL — which is how the header badge said 51 while the body said 53 (2026-09-19).
// An unrecognized count badge fails too, so a new one can't ship unchecked.
const BADGE_COUNTS: Record<string, number> = {
  "agents": agents,
  "skills & commands": skillsAndCommands,
  "playbooks": playbooks,
  "security checks": securityChecks,
};
read("README.md").split("\n").forEach((line, i) => {
  for (const m of line.matchAll(/img\.shields\.io\/badge\/(\d+)-([^-"]+)-/g)) {
    const label = decodeURIComponent(m[2]).replace(/_/g, " ");
    if (!(label in BADGE_COUNTS)) fails.push(`README.md:${i + 1}  count badge "${m[1]} ${label}" isn't checked — use a label from BADGE_COUNTS or add it there`);
    else if (Number(m[1]) !== BADGE_COUNTS[label]) fails.push(`README.md:${i + 1}  badge "${m[1]} ${label}" → should be ${BADGE_COUNTS[label]}`);
  }
});

// ─── README playbook table: each stage row's "(N)" and links match its folder ───
// The rows summed to 49 while the headline said 53: four playbooks were never listed.
const STAGE_DIRS: Record<string, string> = {
  "Idea": "idea-stage", "MVP": "mvp-stage", "Launch": "launch-stage", "Scale": "scale-stage",
  "Founder's wisdom": "founders-wisdom", "AI-native": "ai-native-2026",
};
read("README.md").split("\n").forEach((line, i) => {
  const m = /^\| \*\*\S+\s+(.+?) \((\d+)\)\*\* \|/.exec(line);
  if (!m || !(m[1] in STAGE_DIRS)) return;
  const dir = STAGE_DIRS[m[1]];
  const onDisk = topLevelMd(r("factory/playbooks", dir));
  if (Number(m[2]) !== onDisk.length) fails.push(`README.md:${i + 1}  playbook row "${m[1]} (${m[2]})" → should be ${onDisk.length}`);
  const unlisted = onDisk.filter((f) => !line.includes(`factory/playbooks/${dir}/${f}`));
  if (unlisted.length) fails.push(`README.md:${i + 1}  playbook row "${m[1]}" doesn't link: ${unlisted.join(", ")}`);
});

// ─── path-leak guard: no real `/Users/hamza` in tracked files ────────────────
// learnings & anti-patterns quote leaked paths as the incident evidence; the changelog
// & _archive are history; and this guard's own source has to name the pattern it hunts.
try {
  const out = execSync(
    `git grep -nI "/Users/hamza" -- . ':(exclude)brain/learnings/*' ':(exclude)brain/anti-patterns/*' ':(exclude)scripts/check-counts.ts' ':(exclude)meta/changelog.md' ':(exclude,glob)_archive/**'`,
    { cwd: root, encoding: "utf8" }
  ).trim();
  if (out) out.split("\n").forEach((l) => fails.push(`path leak — ${l}  (use \${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish} / ~ / a sibling-repo phrasing)`));
} catch (e: any) {
  // git grep exits 1 when there are NO matches — that's the success case.
  if (e.status !== 1) fails.push(`path-leak check could not run: ${e.message}`);
}

// ─── product code_path must be null (the real path lives in code-paths.local.json) ──
// Only a TRACKED config can leak a path into this public repo. Since 2026-09-19 every
// user product is gitignored (check-user-state), so this now guards the fixtures
// (_template, …) — walking the disk instead flagged a user's own, never-committed files.
let trackedConfigs: string[] = [];
try {
  trackedConfigs = execSync("git ls-files -- 'products/*/product.config.json'", { cwd: root, encoding: "utf8" })
    .trim().split("\n").filter(Boolean);
} catch { /* not a git checkout — nothing tracked to check */ }
for (const rel of trackedConfigs) {
  let json: any;
  try { json = JSON.parse(read(rel)); } catch { fails.push(`${rel} — invalid JSON`); continue; }
  if ("code_path" in json && json.code_path !== null)
    fails.push(`${rel} — code_path must be null (got ${JSON.stringify(json.code_path)})`);
}

// ─── version consistency: one source of truth (package.json), no drift ───────
// Hamzaish's version was once stated four ways (package.json/CLAUDE.md/changelog/tag).
// Source of truth = package.json; docs/versioning.md must mirror it; never behind the latest tag.
const SEMVER = /^\d+\.\d+\.\d+$/;
const cmpSemver = (a: string, b: string) => {
  const A = a.split(".").map(Number), B = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (A[i] !== B[i]) return A[i] - B[i];
  return 0;
};
const pkgVersion = JSON.parse(read("package.json")).version;
if (!SEMVER.test(pkgVersion)) {
  fails.push(`package.json version "${pkgVersion}" is not MAJOR.MINOR.PATCH semver`);
} else {
  const vm = read("docs/versioning.md").match(/Current version:\s*`?(\d+\.\d+\.\d+)`?/i);
  if (!vm) fails.push(`docs/versioning.md is missing a "Current version: X.Y.Z" line`);
  else if (vm[1] !== pkgVersion) fails.push(`version drift — docs/versioning.md says ${vm[1]} but package.json says ${pkgVersion}`);
  try {
    const tags = execSync("git tag --list 'v[0-9]*'", { cwd: root, encoding: "utf8" })
      .trim().split("\n").map((t) => t.replace(/^v/, "")).filter((t) => SEMVER.test(t));
    if (tags.length) {
      const latest = tags.sort(cmpSemver).at(-1)!;
      if (cmpSemver(pkgVersion, latest) < 0)
        fails.push(`package.json ${pkgVersion} is BEHIND the latest released tag v${latest} — bump it`);
    }
  } catch { /* no git / no tags in a shallow CI checkout — skip, not a failure */ }
}

// ─── verdict ─────────────────────────────────────────────────────────────────
if (fails.length) {
  console.error(`\n✗ ${fails.length} fact(s) drifted from disk:\n`);
  for (const f of fails) console.error(`  • ${f}`);
  console.error(`\n  Fix the doc to match disk, or update the count if the disk changed.`);
  console.error(`  Why: brain/anti-patterns/hand-maintained-facts-drift.md`);
  process.exit(1);
}
console.log(`\n✓ all headline counts match disk · no /Users/hamza leak · every code_path is null · version ${pkgVersion} consistent`);
process.exit(0);
