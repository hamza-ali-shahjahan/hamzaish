#!/usr/bin/env bun
// scripts/setup.ts — Hamzaish onboarding
//
// One command that turns a fresh clone into a working factory:
//   bun run setup      (or: bun scripts/setup.ts)
//
// What it does (all steps idempotent + safe to re-run):
//   1. Confirm Bun is present (you're already running under it)
//   2. Create code-paths.local.json from the example (skip if you already have one)
//   3. Create brain/identity/operator.local.md from the example (skip if yours exists)
//   4. Wire the global slash commands into ~/.claude/commands/ (skip ones already linked)
//   5. Build the brain index (bun brain/ingest.ts)
//   6. Print what to do next
//
// It NEVER overwrites your existing .local files or your existing command symlinks.
// Re-running it is harmless — it just fills in whatever's missing.

import { readFile, writeFile, mkdir, symlink, readlink, copyFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";

const ROOT = resolve(import.meta.dir, "..");
const HOME = homedir();
const CMD_DIR = join(HOME, ".claude", "commands");

// pretty output -------------------------------------------------------------
const c = {
  gold: (s: string) => `\x1b[33m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
};
const ok = (s: string) => console.log(`  ${c.green("✓")} ${s}`);
const skip = (s: string) => console.log(`  ${c.dim("·")} ${c.dim(s)}`);
const warn = (s: string) => console.log(`  ${c.red("!")} ${s}`);
const step = (n: number, s: string) => console.log(`\n${c.gold(`${n}.`)} ${c.bold(s)}`);

let created = 0,
  skipped = 0,
  warned = 0;

// ---------------------------------------------------------------------------

console.log(c.gold(`
   ┌─────────────────────────────────────────┐
   │   Hamzaish — setting up your factory     │
   └─────────────────────────────────────────┘`));
console.log(c.dim(`   root: ${ROOT}`));

// Step 1 — Bun -------------------------------------------------------------
step(1, "Runtime");
ok(`Bun ${Bun.version} — you're running under it, so it's installed.`);

// Step 2 — code-paths.local.json -------------------------------------------
step(2, "Local code-path map (where your product code lives — never committed)");
{
  const dst = join(ROOT, "code-paths.local.json");
  const src = join(ROOT, "code-paths.example.json");
  if (existsSync(dst)) {
    skip("code-paths.local.json already exists — leaving your paths untouched.");
    skipped++;
  } else if (existsSync(src)) {
    await copyFile(src, dst);
    ok("Created code-paths.local.json from the example. Map your product slugs → folders here.");
    created++;
  } else {
    await writeFile(dst, "{}\n");
    ok("Created an empty code-paths.local.json (no example found). Add slug → path entries as you onboard products.");
    created++;
  }
}

// Step 3 — operator identity -----------------------------------------------
step(3, "Operator identity (your working style + stack defaults — never committed)");
{
  const dst = join(ROOT, "brain", "identity", "operator.local.md");
  const src = join(ROOT, "brain", "identity", "operator.example.md");
  if (existsSync(dst)) {
    skip("operator.local.md already exists — leaving your identity untouched.");
    skipped++;
  } else if (existsSync(src)) {
    await copyFile(src, dst);
    ok("Created brain/identity/operator.local.md from the template.");
    console.log(c.dim("     → Open it and fill in your name, stack defaults, and working style (~2 min)."));
    created++;
  } else {
    warn("No operator.example.md template found — skipping. (Unusual; check brain/identity/.)");
    warned++;
  }
}

// Step 4 — global slash commands -------------------------------------------
step(4, "Global slash commands (so /work-on, /brain-ask, etc. work from any folder)");
{
  const commands = ["work-on", "portfolio-pulse", "brain-ask", "brain-ingest"];
  if (!existsSync(CMD_DIR)) {
    await mkdir(CMD_DIR, { recursive: true });
    console.log(c.dim(`     created ${CMD_DIR}`));
  }
  for (const name of commands) {
    const target = join(ROOT, "factory", "commands", `${name}.md`);
    const link = join(CMD_DIR, `${name}.md`);
    if (!existsSync(target)) {
      warn(`/${name}: source missing at factory/commands/${name}.md — skipped.`);
      warned++;
      continue;
    }
    if (existsSync(link)) {
      // Is it already our symlink?
      try {
        const current = await readlink(link);
        if (resolve(current) === resolve(target)) {
          skip(`/${name} already linked.`);
          skipped++;
          continue;
        }
        warn(`/${name}: ~/.claude/commands/${name}.md exists but points elsewhere (${current}) — left as-is. Remove it manually if you want Hamzaish's version.`);
        warned++;
        continue;
      } catch {
        warn(`/${name}: ~/.claude/commands/${name}.md exists as a real file (not a symlink) — left as-is.`);
        warned++;
        continue;
      }
    }
    await symlink(target, link);
    ok(`/${name} → linked.`);
    created++;
  }
  console.log(c.dim("     (Claude Code picks these up automatically. Other agents: read AGENTS.md.)"));
}

// Step 5 — build the brain index -------------------------------------------
step(5, "Brain index (full-text search over the factory)");
{
  const proc = Bun.spawnSync(["bun", join(ROOT, "brain", "ingest.ts")], {
    cwd: ROOT,
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = (proc.stdout?.toString() || "").trim();
  if (proc.exitCode === 0) {
    const lastLines = out.split("\n").slice(-2).join("\n").replace(/\n/g, "\n     ");
    ok("Brain indexed.");
    if (lastLines) console.log(c.dim(`     ${lastLines}`));
  } else {
    warn("Brain ingest hit an error — run `bun brain/ingest.ts` manually to see it.");
    warned++;
  }
}

// Done ----------------------------------------------------------------------
console.log(c.gold(`
   ┌─────────────────────────────────────────┐
   │   ✓ Factory ready                        │
   └─────────────────────────────────────────┘`));
console.log(`   ${c.dim("created")} ${created}   ${c.dim("already-set")} ${skipped}${warned ? `   ${c.red("needs-attention")} ${warned}` : ""}`);

console.log(`
${c.bold("Next:")}
  1. ${c.gold("Fill in your identity")} — open ${c.dim("brain/identity/operator.local.md")} (2 min)
  2. ${c.gold("See the factory")}      — in Claude Code, run ${c.dim("/portfolio-pulse")}
  3. ${c.gold("Start a product")}      — ${c.dim("/work-on <slug>")}  or scaffold a new one with ${c.dim("/scaffold")}
  4. ${c.gold("Ask the brain")}        — ${c.dim('/brain-ask "what should I focus on"')}

${c.dim("Optional power-up: auto-commit + auto-push on every Claude turn —")}
${c.dim("see CLAUDE.md → \"Auto-commit safety net\" to enable the hooks.")}

${c.dim("Re-run this anytime — it only fills in what's missing.")}
`);
