#!/usr/bin/env bun
/**
 * check-work-at-risk — how much finished work would vanish right now.
 *
 * Written 2026-08-20, after ~3 weeks and 6,080 lines of finished factory work
 * (the whole of v2.25.0) were found sitting uncommitted, on a branch that had
 * also silently diverged from origin. Nothing was lost, but nothing was
 * protecting it either: no stash, no branch, no backup. A single `git checkout .`
 * would have taken all of it.
 *
 * Every other gate in this repo asks "is the work correct?". This one asks the
 * question that comes first: "does the work still exist if this machine dies?"
 *
 * Three risks, cheapest to check first:
 *   1. UNCOMMITTED — changes that exist only in the working tree.
 *   2. UNPUSHED    — commits that exist only on this machine.
 *   3. DIVERGED    — local and origin have both moved, so a naive push fails
 *                    and a naive pull may clobber.
 *
 * Warn-only by default: it reports and exits 0, because losing work is a
 * discipline problem, not a correctness one, and a gate that blocks commits
 * for having uncommitted files would be absurd. `--strict` exits non-zero past
 * the thresholds, for anyone who wants CI or a hook to actually stop.
 *
 * Usage:
 *   bun run check-work-at-risk              # report, always exit 0
 *   bun run check-work-at-risk --strict     # exit 1 past the thresholds
 *   bun run check-work-at-risk --brief      # one line, for session hooks
 */
import { execSync } from "node:child_process";
import { statSync } from "node:fs";

const STALE_DAYS = 2; // uncommitted work older than this is called out
const MANY_FILES = 20; // this many dirty files is a backlog, not an edit
const MANY_COMMITS = 3; // unpushed commits past this are worth a push

const strict = process.argv.includes("--strict");
const brief = process.argv.includes("--brief");

function git(cmd: string): string {
  try {
    return execSync(`git ${cmd}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

/** Dirty paths, excluding anything gitignored (git already omits those). */
function dirtyPaths(): string[] {
  return git("status --porcelain")
    .split("\n")
    .filter(Boolean)
    .map((l) => l.slice(3).trim())
    .filter(Boolean);
}

/** Age in days of the OLDEST uncommitted change — the real risk signal. */
function oldestDirtyAgeDays(paths: string[]): number {
  let oldest = 0;
  const now = Date.now();
  for (const p of paths) {
    // Untracked directories arrive as "dir/" — statSync handles both.
    try {
      const age = (now - statSync(p.replace(/\/$/, "")).mtimeMs) / 86_400_000;
      if (age > oldest) oldest = age;
    } catch {
      // path vanished between listing and stat — ignore
    }
  }
  return oldest;
}

const paths = dirtyPaths();
const branch = git("rev-parse --abbrev-ref HEAD") || "(detached)";
const upstream = git("rev-parse --abbrev-ref --symbolic-full-name @{u}");

let ahead = 0;
let behind = 0;
if (upstream) {
  const counts = git(`rev-list --left-right --count ${upstream}...HEAD`).split(/\s+/);
  behind = Number(counts[0] ?? 0);
  ahead = Number(counts[1] ?? 0);
}

const ageDays = paths.length ? oldestDirtyAgeDays(paths) : 0;
const problems: string[] = [];

if (paths.length && ageDays >= STALE_DAYS) {
  problems.push(
    `${paths.length} uncommitted path(s), oldest ${ageDays.toFixed(1)} days old — nothing is protecting this`,
  );
} else if (paths.length >= MANY_FILES) {
  problems.push(`${paths.length} uncommitted path(s) — that is a backlog, not an edit`);
}
if (ahead >= MANY_COMMITS) {
  problems.push(`${ahead} commit(s) exist only on this machine`);
}
if (ahead > 0 && behind > 0) {
  problems.push(
    `branch has DIVERGED from ${upstream} (${ahead} ahead, ${behind} behind) — push will be rejected, pull may conflict`,
  );
}
if (!upstream) {
  problems.push(`branch '${branch}' has no upstream — nothing on this branch is backed up anywhere`);
}

if (brief) {
  console.log(
    problems.length
      ? `⚠ work at risk: ${problems[0]}${problems.length > 1 ? ` (+${problems.length - 1} more — bun run check-work-at-risk)` : ""}`
      : `✓ nothing at risk (${branch} clean, in sync)`,
  );
  process.exit(0);
}

console.log(`\ncheck-work-at-risk — branch ${branch}${upstream ? ` → ${upstream}` : ""}`);
console.log(
  `  uncommitted: ${paths.length} path(s)${paths.length ? `, oldest ${ageDays.toFixed(1)}d` : ""}` +
    `   unpushed: ${ahead}   behind: ${behind}`,
);

if (!problems.length) {
  console.log(`\n✓ nothing at risk — every finished thing is committed and pushed.\n`);
  process.exit(0);
}

console.log("");
for (const p of problems) console.log(`  ⚠ ${p}`);
console.log(`
  What to do, in this order:
    1. git checkout -b local-safety/snapshot-$(date +%F) && git add -A && git commit -m "wip(safety): snapshot"
       (insurance first — takes seconds, makes everything below reversible)
    2. git fetch origin && git rebase origin/<branch>     (resolve any divergence)
    3. commit in real pieces, then push

  Why: brain/anti-patterns/work-that-exists-only-on-one-machine.md
`);

process.exit(strict ? 1 : 0);
