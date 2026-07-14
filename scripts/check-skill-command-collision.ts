#!/usr/bin/env bun
// check-skill-command-collision.ts — a name must live as a skill OR a command, never both.
//
// The defect this exists for: on 2026-07-14 live sessions were listing ~10 names twice
// (brain-ask, portfolio-pulse, go-live, web-launch, plus the setup-installed globals) —
// double context load, and for pairs with divergent descriptions, contradictory routing.
// Claude Code unifies skills and commands into ONE /name namespace: a folder at
// factory/skills/<name>/SKILL.md and a file at factory/commands/<name>.md both create
// /<name>, and in practice BOTH descriptions load into every session. Docs say the skill
// shadows the command on ties — either way, two sources for one name is drift waiting
// to happen (which one did the operator just edit?).
//
//   exit 0 = every /name has exactly one home (skill folder XOR command file)
//   exit 1 = a name exists in both factory/skills/ and factory/commands/ — merge or rename
//
//   bun run check-skill-command-collision
// See brain/decision-log/2026-07-14-dedupe-skill-command-namespace.md
import { readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = join(root, "factory", "skills");
const COMMANDS = join(root, "factory", "commands");

// Skill names: directories (or symlinked directories — the plugin pattern) carrying a SKILL.md.
const skillNames = new Set(
  readdirSync(SKILLS).filter((e) => existsSync(join(SKILLS, e, "SKILL.md"))),
);

// Command names: top-level .md files (including symlinks — they'd still create /<name>).
const commandNames = readdirSync(COMMANDS)
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.slice(0, -3));

const collisions = commandNames.filter((n) => skillNames.has(n)).sort();

if (collisions.length > 0) {
  console.error(`✗ skill/command name collision${collisions.length > 1 ? "s" : ""} — each name below loads twice into every session:\n`);
  for (const n of collisions) {
    console.error(`  ${n}`);
    console.error(`    factory/skills/${n}/SKILL.md`);
    console.error(`    factory/commands/${n}.md`);
  }
  console.error(
    `\n  Fix: one home per name. Fold the skill's protocol into the command (commands are the` +
      `\n  canonical user-typed doors — CLAUDE.md), or delete the command and keep the skill` +
      `\n  (fine for deliberate rituals; pair with disable-model-invocation). Then update references.` +
      `\n  See brain/decision-log/2026-07-14-dedupe-skill-command-namespace.md`,
  );
  process.exit(1);
}

console.log(`✓ no skill/command name collisions (${skillNames.size} skills · ${commandNames.length} commands · every /name has one home)`);
