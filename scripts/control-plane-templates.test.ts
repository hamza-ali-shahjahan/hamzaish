// control-plane-templates.test.ts — the /factory-launch contract, enforced.
//
// The skill promises: `bun run setup` scaffolds three control-plane files from
// committed templates, and those templates carry the sections the harness
// depends on (autonomy-loop wires ORDERS/STANDING into unattended prompts; the
// heartbeat runs the checklist). A template losing a load-bearing section would
// silently un-govern unattended runs — so the sections are pinned here.
import { describe, expect, test } from "bun:test";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");

const REQUIRED: Record<string, string[]> = {
  "FACTORY-ORDERS.example.md": [
    "## Mandate",
    "## Budget",
    "## Tick discipline",
    "## Stop / complete conditions",
    "## Hard ops rules",
    "## Honesty rules",
  ],
  "STANDING-ORDERS.example.md": [
    "## The iron law",
    "## Program: overnight-build",
    "## Program: gtm-draft",
    "## Program: heartbeat",
    "**Scope:**",
    "**Triggers:**",
    "**Approval gates:**",
    "**Escalation:**",
  ],
  "HEARTBEAT.example.md": ["## Checklist", "## Report shape", "[SILENT]"],
};

describe("control-plane templates", () => {
  for (const [file, sections] of Object.entries(REQUIRED)) {
    test(`${file} exists and carries its load-bearing sections`, () => {
      const path = join(ROOT, file);
      expect(existsSync(path)).toBe(true);
      const src = readFileSync(path, "utf8");
      for (const s of sections) expect(src).toContain(s);
    });
  }

  test("setup.ts scaffolds exactly these templates (names stay in sync)", () => {
    const setup = readFileSync(join(ROOT, "scripts", "setup.ts"), "utf8");
    for (const name of ["FACTORY-ORDERS", "STANDING-ORDERS", "HEARTBEAT"]) {
      expect(setup).toContain(`"${name}"`);
    }
  });

  test("autonomy-loop wires ORDERS + STANDING into unattended sessions", () => {
    const loop = readFileSync(join(ROOT, "scripts", "autonomy-loop.ts"), "utf8");
    expect(loop).toContain("FACTORY-ORDERS.local.md");
    expect(loop).toContain("STANDING-ORDERS.local.md");
    expect(loop).toContain("overnight-build");
  });
});
