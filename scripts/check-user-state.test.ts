// check-user-state.test.ts — the user-state guard, exercised against a throwaway repo.
//
// The guard's contract: only the factory's own fixtures may be tracked under
// products/. Everything else there is a USER's data — including the portfolio
// snapshot /portfolio-pulse writes (products/_portfolio.md), which carried the
// maintainer's live business state in this public repo until 2026-09-19. The
// empty starter it is copied from (products/_portfolio.example.md) is a fixture.
import { afterEach, describe, expect, test } from "bun:test";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const GUARD = resolve(import.meta.dir, "check-user-state.ts");
let dirs: string[] = [];

/** A throwaway git repo holding a copy of the guard, with exactly `files` tracked. */
function repoWith(files: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), "user-state-"));
  dirs.push(dir);
  mkdirSync(join(dir, "scripts"));
  copyFileSync(GUARD, join(dir, "scripts", "check-user-state.ts"));
  for (const f of files) {
    mkdirSync(dirname(join(dir, f)), { recursive: true });
    writeFileSync(join(dir, f), "x\n");
  }
  Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  // -f: the test decides what is tracked, not any global excludes file.
  Bun.spawnSync(["git", "add", "-f", ...files], { cwd: dir });
  return dir;
}

function runGuard(dir: string) {
  const p = Bun.spawnSync(["bun", join(dir, "scripts", "check-user-state.ts")], { cwd: dir });
  return { code: p.exitCode, out: p.stdout.toString() + p.stderr.toString() };
}

afterEach(() => {
  for (const d of dirs) rmSync(d, { recursive: true, force: true });
  dirs = [];
});

describe("check-user-state", () => {
  test("passes when only the factory's fixtures are tracked", () => {
    const r = runGuard(
      repoWith([
        "products/_template/README.md",
        "products/README.md",
        "products/SHOWCASE.md",
        "products/_portfolio.example.md",
        "products/_active.example.md",
      ]),
    );
    expect(r.code).toBe(0);
  });

  test("fails on a tracked product folder and prints the untrack command", () => {
    const r = runGuard(repoWith(["products/README.md", "products/my-app/status.md"]));
    expect(r.code).toBe(1);
    expect(r.out).toContain("git rm -r --cached products/my-app");
  });

  test("treats the portfolio snapshot as user state", () => {
    const r = runGuard(repoWith(["products/README.md", "products/_portfolio.md"]));
    expect(r.code).toBe(1);
    expect(r.out).toContain("git rm -r --cached products/_portfolio.md");
  });
});
