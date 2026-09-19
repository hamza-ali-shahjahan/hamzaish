// command-chain.test.ts — every step /builder-mode hands off to must exist in the factory.
//
// Chats opened outside the Hamzaish folder only see the global pointer stubs, and each
// stub tells Claude to read a hand-off it doesn't have from factory/commands/<name>.md or
// factory/skills/<name>/SKILL.md. That rule only works if every name the chain mentions
// really lives there — a renamed skill would break the build from any other folder while
// every chat inside the Hamzaish folder kept working (2026-09-19).
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
// Names the chain uses on purpose that belong to Claude Code, not Hamzaish.
const CLAUDE_CODE_OWN = new Set(["init"]);
const CHAIN = ["hamzaish", "full-cycle", "auto", "goal"];

function handoffs(file: string): string[] {
  const src = readFileSync(join(ROOT, "factory", "commands", `${file}.md`), "utf8");
  const slash = [...src.matchAll(/`\/([a-z][a-z-]*)`/g)].map((m) => m[1]);
  const skills = [...src.matchAll(/`([a-z][a-z-]*)` skill/g)].map((m) => m[1]);
  return [...new Set([...slash, ...skills])];
}

describe("the /builder-mode chain resolves from any folder", () => {
  for (const file of CHAIN) {
    test(`${file}: every hand-off is a factory command or skill`, () => {
      const missing = handoffs(file).filter(
        (n) =>
          !CLAUDE_CODE_OWN.has(n) &&
          !existsSync(join(ROOT, "factory", "commands", `${n}.md`)) &&
          !existsSync(join(ROOT, "factory", "skills", n, "SKILL.md")),
      );
      expect(missing).toEqual([]);
    });
  }
});
