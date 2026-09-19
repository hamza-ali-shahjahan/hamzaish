// stranger-install.test.ts — install Hamzaish the way a stranger does, and check it works.
//
// The 2026-09-19 finding: on a fresh install into any folder but the maintainer's
// ~/Claude/Hamzaish, every global command pointed at a folder that didn't exist, and
// setup's closing advice contradicted the installer's. Every existing check passed,
// because every check ran on the maintainer's machine. This test copies the repo the
// way a clone would see it — tracked files only, so nothing personal comes along —
// into a throwaway folder with a throwaway HOME, runs setup, and checks what a
// stranger's first session depends on.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { CLAUDE_BUILTIN_NAMES, globalCommands, hamzaishHook, hookCommands, stubTarget } from "./lib/install";

const REPO = resolve(import.meta.dir, "..");
const plain = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");

let base = "";
let home = "";
let clone = "";
let setupOut = "";
let setupCode: number | null = null;

/** A stranger's environment: a fresh HOME, consent given, and no HAMZAISH_ROOT. */
function strangerEnv(): Record<string, string> {
  const e: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) if (v !== undefined) e[k] = v;
  delete e.HAMZAISH_ROOT;
  delete e.HAMZAISH_INSTALLER;
  return { ...e, HOME: home, HAMZAISH_REGISTER_HOOK: "yes", HAMZAISH_REGISTER_GUARDS: "yes" };
}

const runSetup = () => Bun.spawnSync(["bun", "scripts/setup.ts"], { cwd: clone, env: strangerEnv(), stdin: "ignore" });
const settings = () => JSON.parse(readFileSync(join(home, ".claude", "settings.json"), "utf8"));

beforeAll(() => {
  // realpath: macOS's temp dir is reached through a symlink (/var → /private/var),
  // and setup reports the resolved path.
  base = realpathSync(mkdtempSync(join(tmpdir(), "hz-stranger-")));
  home = join(base, "home");
  clone = join(base, "somewhere", "hamzaish"); // anywhere but ~/Claude/Hamzaish
  mkdirSync(home, { recursive: true });
  mkdirSync(clone, { recursive: true });

  // What a clone holds: tracked files (plus new, not-yet-committed ones), never
  // ignored ones — so no user products, no .local files. tar keeps symlinks intact.
  const files = Bun.spawnSync(["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: REPO })
    .stdout.toString()
    .split("\0")
    .filter((f) => {
      if (!f) return false;
      try {
        lstatSync(join(REPO, f));
        return true;
      } catch {
        return false; // deleted in the working tree
      }
    });
  const pack = Bun.spawnSync(["tar", "--null", "-T", "-", "-cf", "-"], { cwd: REPO, stdin: Buffer.from(files.join("\0")) });
  Bun.spawnSync(["tar", "-xf", "-"], { cwd: clone, stdin: pack.stdout });
  Bun.spawnSync(["git", "init", "-q"], { cwd: clone });

  const p = runSetup();
  setupOut = plain(p.stdout.toString() + p.stderr.toString());
  setupCode = p.exitCode;
}, 120_000);

afterAll(() => {
  if (base) rmSync(base, { recursive: true, force: true });
});

describe("a stranger's fresh install", () => {
  test("setup succeeds", () => {
    expect(setupCode).toBe(0);
  });

  test("records where Hamzaish lives for every future session", () => {
    expect(settings().env?.HAMZAISH_ROOT).toBe(clone);
  });

  test("every Hamzaish command works in every chat, pointing at a file inside this install", () => {
    const names = globalCommands(clone);
    expect(names.length).toBeGreaterThanOrEqual(20);
    for (const name of names) {
      const stub = readFileSync(join(home, ".claude", "commands", `${name}.md`), "utf8");
      // No HAMZAISH_ROOT passed: the stub must work without it.
      const target = stubTarget(stub, { HOME: home });
      expect(target).toBe(join(clone, "factory", "commands", `${name}.md`));
      expect(existsSync(target!)).toBe(true);
      // Hand-offs (/full-cycle, the `plan` skill, …) resolve from any folder.
      expect(stub).toContain(join(clone, "factory", "skills"));
    }
  });

  test("never claims a name Claude Code ships as a built-in", () => {
    for (const name of CLAUDE_BUILTIN_NAMES) {
      expect(existsSync(join(home, ".claude", "commands", `${name}.md`))).toBe(false);
    }
  });

  test("every hook it registers runs a script inside this install", () => {
    const hooks = hookCommands(settings()).map((c) => hamzaishHook(c, home));
    expect(hooks.filter(Boolean).length).toBeGreaterThanOrEqual(7); // enablement ×2, freshness, 4 guards
    for (const h of hooks) {
      if (!h) continue;
      expect(h.cloneRoot).toBe(clone);
      expect(existsSync(h.path)).toBe(true);
    }
  });

  test("gives the newcomer an empty portfolio of their own", () => {
    expect(readFileSync(join(clone, "products", "_portfolio.md"), "utf8")).toContain("your factory is empty");
  });

  test("ends with exactly one next step: /builder-mode", () => {
    const next = setupOut.slice(setupOut.lastIndexOf("Next"));
    expect(next).toContain("/builder-mode");
    for (const other of ["/portfolio-pulse", "/work-on", "/factory-launch", "/scaffold", "/brain-ask"]) {
      expect(next).not.toContain(other);
    }
  });

  test("the health check says it's ready", () => {
    const p = Bun.spawnSync(["bun", "scripts/doctor.ts"], { cwd: clone, env: strangerEnv() });
    const out = plain(p.stdout.toString() + p.stderr.toString());
    expect(out).toContain("Ready");
    expect(p.exitCode).toBe(0);
  });

  test("running setup again changes nothing", () => {
    const p = runSetup();
    expect(p.exitCode).toBe(0);
    expect(plain(p.stdout.toString())).toMatch(/created 0\b/);
  });

  // The one-line installer runs setup too. Until 2026-09-19 that printed two "Next"
  // lists back to back — setup's five steps, then the installer's /builder-mode.
  // Pointed at the existing clone, install.sh skips the network clone (its pull
  // fails harmlessly with no remote) and re-runs setup the way a real install does.
  test("the one-line installer shows exactly one next step", () => {
    const p = Bun.spawnSync(["sh", join(clone, "install.sh")], {
      cwd: base,
      env: { ...strangerEnv(), HAMZAISH_DIR: clone },
      stdin: "ignore",
    });
    const out = plain(p.stdout.toString() + p.stderr.toString());
    expect(p.exitCode).toBe(0);
    expect(out.match(/Next/g)?.length).toBe(1);
    expect(out.slice(out.indexOf("Next"))).toContain("/builder-mode");
  }, 60_000);
});
