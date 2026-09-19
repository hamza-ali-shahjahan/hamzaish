// doctor.test.ts — the health check must catch what broke a stranger's first session.
//
// The healthy path is proven end to end by stranger-install.test.ts. These cases
// pin the failures, starting with the 2026-09-19 one: global commands aimed at the
// maintainer's ~/Claude/Hamzaish on a machine where nothing is there.
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { globalCommands } from "./lib/install";

const REPO = resolve(import.meta.dir, "..");
let homes: string[] = [];
afterEach(() => {
  for (const h of homes) rmSync(h, { recursive: true, force: true });
  homes = [];
});

/** A throwaway HOME: this settings.json, plus a pointer stub per global command reading from `stubRoot`. */
function homeWith(settings: object, stubRoot: string): string {
  const home = mkdtempSync(join(tmpdir(), "hz-doctor-"));
  homes.push(home);
  mkdirSync(join(home, ".claude", "commands"), { recursive: true });
  writeFileSync(join(home, ".claude", "settings.json"), JSON.stringify(settings));
  for (const name of globalCommands(REPO)) {
    writeFileSync(
      join(home, ".claude", "commands", `${name}.md`),
      `<!-- Generated pointer stub (bun run setup) -->\n\nRead \`${stubRoot}/factory/commands/${name}.md\` and follow it.\n`,
    );
  }
  return home;
}

function doctor(home: string) {
  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) if (v !== undefined) env[k] = v;
  delete env.HAMZAISH_ROOT;
  const p = Bun.spawnSync(["bun", join(REPO, "scripts", "doctor.ts")], { env: { ...env, HOME: home } });
  return { code: p.exitCode, out: (p.stdout.toString() + p.stderr.toString()).replace(/\x1b\[[0-9;]*m/g, "") };
}

describe("doctor", () => {
  test("a healthy install is ready", () => {
    const r = doctor(homeWith({ env: { HAMZAISH_ROOT: REPO } }, REPO));
    expect(r.out).toContain("Ready.");
    expect(r.code).toBe(0);
  });

  test("catches the stranger bug: commands aimed at ~/Claude/Hamzaish, nothing configured", () => {
    const r = doctor(homeWith({}, "${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}"));
    expect(r.code).toBe(1);
    expect(r.out).toContain("HAMZAISH_ROOT isn't set");
    expect(r.out).toContain("point at a folder that doesn't exist");
  });

  test("catches a HAMZAISH_ROOT whose folder is gone", () => {
    const r = doctor(homeWith({ env: { HAMZAISH_ROOT: "/nowhere/hamzaish" } }, REPO));
    expect(r.code).toBe(1);
    expect(r.out).toContain("no longer holds Hamzaish");
  });

  test("catches a hook whose script is gone", () => {
    const hooks = {
      SessionStart: [{ matcher: "", hooks: [{ type: "command", command: "/nowhere/factory/hooks/factory-freshness.sh" }] }],
    };
    const r = doctor(homeWith({ env: { HAMZAISH_ROOT: REPO }, hooks }, REPO));
    expect(r.code).toBe(1);
    expect(r.out).toContain("factory-freshness.sh");
  });
});
