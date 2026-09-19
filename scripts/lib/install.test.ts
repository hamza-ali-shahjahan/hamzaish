// install.test.ts — the rules for "where does this Hamzaish live", pinned.
//
// The 2026-09-19 defect: every global command and the freshness hook fell back to
// the maintainer's ~/Claude/Hamzaish, so an install anywhere else pointed at nothing.
// These cases pin the fix's rules — especially that a second clone never takes the
// global commands away from the install already in use.
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chooseRoot, expandRoot, hamzaishHook, repointStaleHooks, stubTarget } from "./install";

let dirs: string[] = [];
const temp = () => {
  const d = mkdtempSync(join(tmpdir(), "hz-install-"));
  dirs.push(d);
  return d;
};
/** A folder that looks like a Hamzaish install. */
const factoryAt = (dir: string) => {
  mkdirSync(join(dir, "factory", "commands"), { recursive: true });
  writeFileSync(join(dir, "factory", "commands", "hamzaish.md"), "---\n---\n");
  return dir;
};
afterEach(() => {
  for (const d of dirs) rmSync(d, { recursive: true, force: true });
  dirs = [];
});

describe("chooseRoot — the first install wins", () => {
  test("a fresh machine uses the folder setup runs in", () => {
    const home = temp();
    const here = factoryAt(join(temp(), "hamzaish"));
    expect(chooseRoot({ home, thisRoot: here })).toEqual({ root: here, why: "this-folder" });
  });

  test("an existing install at the old default keeps the global commands", () => {
    const home = temp();
    const legacy = factoryAt(join(home, "Claude", "Hamzaish"));
    const worktree = factoryAt(join(temp(), "hamzaish-wt"));
    expect(chooseRoot({ home, thisRoot: worktree })).toEqual({ root: legacy, why: "legacy" });
  });

  test("a configured install stays in charge when setup runs in a second clone", () => {
    const home = temp();
    const main = factoryAt(join(temp(), "main"));
    const second = factoryAt(join(temp(), "second"));
    expect(chooseRoot({ configured: main, home, thisRoot: second })).toEqual({ root: main, why: "other-copy" });
  });

  test("a configured folder that no longer holds Hamzaish is re-pointed here", () => {
    const home = temp();
    const here = factoryAt(join(temp(), "moved-here"));
    expect(chooseRoot({ configured: join(temp(), "gone"), home, thisRoot: here })).toEqual({
      root: here,
      why: "repoint",
    });
  });
});

describe("expandRoot / stubTarget", () => {
  test("the old stub notation falls back to ~/Claude/Hamzaish when nothing is set", () => {
    expect(expandRoot("${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/factory/commands/x.md", { HOME: "/h" })).toBe(
      "/h/Claude/Hamzaish/factory/commands/x.md",
    );
  });

  test("HAMZAISH_ROOT wins over the fallback", () => {
    expect(expandRoot("${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}/a", { HOME: "/h", HAMZAISH_ROOT: "/opt/hz" })).toBe(
      "/opt/hz/a",
    );
  });

  test("reads the target out of a generated pointer stub only", () => {
    const stub = "<!-- Generated pointer stub (bun run setup) -->\n\nRead `/opt/hz/factory/commands/work-on.md` and follow it";
    expect(stubTarget(stub, { HOME: "/h" })).toBe("/opt/hz/factory/commands/work-on.md");
    expect(stubTarget("Read `/somewhere.md` — a user's own command", { HOME: "/h" })).toBeUndefined();
  });
});

describe("hamzaishHook / repointStaleHooks", () => {
  test("recognizes clone-shaped hook paths, with arguments and ~", () => {
    expect(hamzaishHook("/opt/hz/factory/hooks/factory-session-context.sh --brief", "/h")).toEqual({
      written: "/opt/hz/factory/hooks/factory-session-context.sh",
      path: "/opt/hz/factory/hooks/factory-session-context.sh",
      rel: "factory/hooks/factory-session-context.sh",
      cloneRoot: "/opt/hz",
    });
    expect(hamzaishHook("bash ~/code/hz/scripts/auto-commit.sh", "/h")?.path).toBe("/h/code/hz/scripts/auto-commit.sh");
  });

  test("leaves a user's own same-named script alone", () => {
    expect(hamzaishHook("/h/.claude/hooks/guard-force-push.sh", "/h")).toBeUndefined();
  });

  test("re-points only hooks whose script is gone, keeping their arguments", () => {
    const home = temp();
    const root = temp();
    mkdirSync(join(root, "factory", "hooks"), { recursive: true });
    writeFileSync(join(root, "factory", "hooks", "factory-session-context.sh"), "");
    writeFileSync(join(root, "factory", "hooks", "factory-freshness.sh"), "");
    const live = join(root, "factory", "hooks", "factory-freshness.sh");
    const settings = {
      hooks: {
        UserPromptSubmit: [{ matcher: "", hooks: [{ type: "command", command: "/gone/factory/hooks/factory-session-context.sh --brief" }] }],
        SessionStart: [{ matcher: "", hooks: [{ type: "command", command: live }] }],
      },
    };
    expect(repointStaleHooks(settings, root, home)).toBe(1);
    expect(settings.hooks.UserPromptSubmit[0].hooks[0].command).toBe(
      `${join(root, "factory", "hooks", "factory-session-context.sh")} --brief`,
    );
    expect(settings.hooks.SessionStart[0].hooks[0].command).toBe(live);
  });
});
