#!/usr/bin/env bun
// scripts/doctor.ts — "is my Hamzaish set up right?" in one command.
//
// The defect this exists for (2026-09-19): an install anywhere but the maintainer's
// own ~/Claude/Hamzaish got global commands and a freshness hook aimed at a folder
// that didn't exist on that machine — and nothing said so. A newcomer would type
// /builder-mode and watch it flail. Each check below is something a first session
// depends on; every problem prints its fix, and nearly every fix is `bun run setup`.
//
//   bun run doctor
//   exit 0 = ready (lines marked ! are advice, not breakage)
//   exit 1 = something will break a session — the fix is printed under it
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { globalCommands, hamzaishHook, hookCommands, isFactory, samePath, stubTarget } from "./lib/install";

const ROOT = resolve(import.meta.dir, "..");
const HOME = homedir();
const SETTINGS = join(HOME, ".claude", "settings.json");

const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};
let problems = 0;
let advice = 0;
const pass = (s: string) => console.log(`  ${c.green("✓")} ${s}`);
const note = (s: string, fix?: string) => {
  advice++;
  console.log(`  ${c.yellow("!")} ${s}`);
  if (fix) console.log(c.dim(`      fix: ${fix}`));
};
const fail = (s: string, fix: string) => {
  problems++;
  console.log(`  ${c.red("✗")} ${s}`);
  console.log(c.dim(`      fix: ${fix}`));
};

console.log(`\n${c.bold("Hamzaish doctor")} ${c.dim(`— ${ROOT}`)}\n`);

// 1. Tools ------------------------------------------------------------------
pass(`Bun ${Bun.version}`);
if (Bun.which("git")) pass("git");
else fail("git isn't installed", "install git (https://git-scm.com), then re-run bun run setup");
if (Bun.which("claude")) pass("Claude Code (command line)");
else
  note(
    "Claude Code's command line isn't on your PATH",
    "install it from https://claude.ai/code — or open this folder in the Claude desktop app's Code tab",
  );

// 2. Where Hamzaish lives -----------------------------------------------------
let settings: Record<string, any> = {};
if (existsSync(SETTINGS)) {
  try {
    settings = JSON.parse(readFileSync(SETTINGS, "utf8"));
  } catch {
    fail("~/.claude/settings.json isn't valid JSON", "fix it by hand (a stray comma is the usual cause), then re-run bun run setup");
  }
}
const configured: string | undefined = settings.env?.HAMZAISH_ROOT;
const atLegacyDefault = samePath(ROOT, join(HOME, "Claude", "Hamzaish"));
if (!configured && atLegacyDefault) {
  // Installs from before 2026-09-19 at the old default work through the fallback.
  note(
    "HAMZAISH_ROOT isn't set — this works only because this folder sits at the old default ~/Claude/Hamzaish",
    "bun run setup — it records the folder so nothing depends on where it sits",
  );
} else if (!configured) {
  fail("Claude Code doesn't know where Hamzaish lives (HAMZAISH_ROOT isn't set)", "bun run setup");
} else if (!isFactory(configured)) {
  fail(`HAMZAISH_ROOT points at ${configured}, which no longer holds Hamzaish (moved or deleted?)`, "bun run setup (from your Hamzaish folder)");
} else if (samePath(configured, ROOT)) {
  pass("Claude Code knows Hamzaish lives in this folder");
} else {
  note(
    `Your global commands use the Hamzaish at ${configured}, not this folder`,
    `fine if that's your main copy — to switch, set "HAMZAISH_ROOT": "${ROOT}" under "env" in ~/.claude/settings.json, then re-run bun run setup`,
  );
}

// 3. Global commands ------------------------------------------------------------
// Resolve each stub the way a session would: with the settings env it will have.
const sessionEnv = { HOME, HAMZAISH_ROOT: configured };
const missing: string[] = [];
const dangling: string[] = [];
const customized: string[] = [];
const commands = globalCommands(ROOT);
for (const name of commands) {
  const file = join(HOME, ".claude", "commands", `${name}.md`);
  if (!existsSync(file)) {
    missing.push(`/${name}`);
    continue;
  }
  const target = stubTarget(readFileSync(file, "utf8"), sessionEnv);
  if (target === undefined) customized.push(`/${name}`);
  else if (!existsSync(target)) dangling.push(`/${name}`);
}
if (missing.length) fail(`Global command(s) not installed: ${missing.join(" ")}`, "bun run setup");
if (dangling.length) fail(`Global command(s) point at a folder that doesn't exist: ${dangling.join(" ")}`, "bun run setup");
if (customized.length) note(`Global command(s) you customized weren't checked: ${customized.join(" ")}`);
if (!missing.length && !dangling.length) {
  pass(`${commands.length - customized.length} global commands point at files that exist`);
}

// 4. Hooks ------------------------------------------------------------------------
const hooks = hookCommands(settings)
  .map((cmd) => hamzaishHook(cmd, HOME))
  .filter((h): h is NonNullable<typeof h> => !!h);
const dead = hooks.filter((h) => !existsSync(h.path));
if (dead.length) {
  const names = [...new Set(dead.map((h) => h.rel.split("/").pop()))].join(", ");
  fail(`Hook(s) run a script that no longer exists: ${names}`, "bun run setup — it re-points hooks whose folder moved");
} else if (hooks.length) {
  pass(`${hooks.length} Hamzaish hooks run scripts that exist`);
} else {
  note(
    "No Hamzaish hooks registered — the per-session reminders that keep plans and receipts on are off",
    "HAMZAISH_REGISTER_HOOK=yes bun run setup",
  );
}

// 5. The brain's search index -------------------------------------------------------
if (existsSync(join(ROOT, "brain", "brain.db"))) pass("Brain search index built");
else note("The brain's search index isn't built yet", "bun run ingest");

// 6. Your local files -----------------------------------------------------------------
const local = ["code-paths.local.json", "brain/identity/operator.local.md", "products/_portfolio.md"];
const absent = local.filter((f) => !existsSync(join(ROOT, f)));
if (absent.length) note(`Your local file(s) are missing: ${absent.join(", ")}`, "bun run setup");
else pass("Your local files are in place");

// 7. git identity -----------------------------------------------------------------------
const email = (Bun.spawnSync(["git", "config", "user.email"], { cwd: ROOT }).stdout?.toString() || "").trim();
const PLACEHOLDERS = new Set(["", "noreply@github.com", "noreply@users.noreply.github.com", "you@example.com"]);
if (PLACEHOLDERS.has(email)) {
  note(
    `git user.email is ${email ? `'${email}'` : "not set"} — GitHub would credit your commits to the wrong account`,
    "git config --global user.email '<id>+<username>@users.noreply.github.com'",
  );
} else {
  pass(`git identity: ${email}`);
}

// Verdict -------------------------------------------------------------------------------
console.log("");
if (problems) {
  console.log(`${c.red(`${problems} problem${problems === 1 ? "" : "s"}`)} — each has its fix above. Most are fixed by: ${c.bold("bun run setup")}`);
  process.exit(1);
}
console.log(
  `${c.green("Ready.")} Open Claude Code in this folder and type ${c.bold("/builder-mode <your idea>")}` +
    (advice ? c.dim(`  (${advice} note${advice === 1 ? "" : "s"} above — advice, not breakage)`) : ""),
);
