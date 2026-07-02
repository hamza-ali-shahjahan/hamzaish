#!/usr/bin/env bun
// scripts/setup.ts — Hamzaish onboarding
//
// One command that turns a fresh clone into a working factory:
//   bun run setup      (or: bun scripts/setup.ts)
//
// What it does (all steps idempotent + safe to re-run):
//   1. Confirm Bun is present (you're already running under it)
//   2. Check git identity — placeholder emails misattribute your commits on GitHub
//   3. Create code-paths.local.json from the example (skip if you already have one)
//   4. Create brain/identity/operator.local.md from the example (skip if yours exists)
//   5. Create products/_active.local.md sprint state from the example
//   6. Install the global slash commands into ~/.claude/commands/ as REAL copies
//   7. Build the brain index (bun brain/ingest.ts)
//   then print what to do next
//
// It NEVER overwrites your existing .local files or any command file you've customized.
// Re-running it is harmless — it just fills in whatever's missing.

import { readFile, writeFile, mkdir, symlink, readlink, copyFile, unlink, stat } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { decideCommandAction } from "./lib/command-refresh";

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

// Step 2 — git identity ------------------------------------------------------
step(2, "Git identity (so YOUR commits are attributed to YOU on GitHub)");
{
  // 2026-07-03 incident: a placeholder email (noreply@users.noreply.github.com)
  // makes GitHub credit your commits to a STRANGER's account — the literal GitHub
  // user "noreply". Looks exactly like an intrusion on your own repo. Detect
  // placeholders up front; NEVER silently edit the user's git config — print the
  // exact fix instead (with their real private address when gh is available).
  const email = (Bun.spawnSync(["git", "config", "user.email"]).stdout?.toString() || "").trim();
  const PLACEHOLDERS = new Set(["", "noreply@github.com", "noreply@users.noreply.github.com", "you@example.com"]);
  if (!PLACEHOLDERS.has(email)) {
    ok(`git identity looks real: ${email}`);
    skipped++;
  } else {
    warn(`git user.email is ${email === "" ? "UNSET" : `'${email}'`} — GitHub will misattribute your commits (possibly to a stranger's account).`);
    warned++;
    let suggestion = "<id>+<username>@users.noreply.github.com";
    try {
      const proc = Bun.spawnSync(["gh", "api", "user", "--jq", '"\\(.id)+\\(.login)@users.noreply.github.com"']);
      const v = (proc.stdout?.toString() || "").trim();
      if (proc.exitCode === 0 && v.includes("@")) suggestion = v;
    } catch {
      /* gh not installed/authed — generic hint stands */
    }
    console.log(c.dim(`     fix:  git config --global user.email '${suggestion}'`));
    console.log(c.dim(`     and:  git config --global user.name  '<your name>'`));
    console.log(c.dim(`     (setup never edits git config for you; the auto-push hook refuses placeholder identities either way)`));
  }
  // A repo-LOCAL override shadowing a healthy global is the sneaky variant that bit us.
  const localEmail = (Bun.spawnSync(["git", "config", "--local", "user.email"], { cwd: ROOT }).stdout?.toString() || "").trim();
  if (localEmail && PLACEHOLDERS.has(localEmail)) {
    warn(`this repo has a LOCAL user.email override ('${localEmail}') shadowing your global config — remove it: git config --local --unset user.email`);
    warned++;
  }
}

// Step 3 — code-paths.local.json -------------------------------------------
step(3, "Local code-path map (where your product code lives — never committed)");
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
step(4, "Operator identity (your working style + stack defaults — never committed)");
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

// Step 3b — active-product sprint state (yours, never committed) ------------
step(5, "Active-sprint state (which product the factory orients on — never committed)");
{
  const dst = join(ROOT, "products", "_active.local.md");
  const src = join(ROOT, "products", "_active.example.md");
  if (existsSync(dst)) {
    skip("products/_active.local.md already exists — leaving your sprint state untouched.");
    skipped++;
  } else if (existsSync(src)) {
    await copyFile(src, dst);
    ok("Created products/_active.local.md from the template. Fill it in when you start your first sprint (or delete it — empty is honest).");
    created++;
  } else {
    skip("No _active.example.md template found — skipping (sessions fall back to /portfolio-pulse).");
    skipped++;
  }
  console.log(c.dim("     The committed products/ folders are the maintainer's showcase — proof the factory ships."));
  console.log(c.dim("     YOUR portfolio starts empty and fills via /scaffold. /portfolio-pulse keeps the two separate."));
}

// Step 4 — global slash commands -------------------------------------------
step(6, "Global slash commands (so /hamzaish, /work-on, /brain-ask, etc. work from any folder)");
{
  // REAL copies, not symlinks: Claude Code's command/skill loader does not reliably
  // follow symlinks during discovery, so a symlinked global command can silently show
  // "Unknown command". Copies are always found. (In-repo /commands still resolve via the
  // .claude symlinks.)
  //
  // Staleness fix (2026-07-02, brain/learnings/2026-07-02.md): copies rot after factory
  // upgrades, and "the copy differs" alone can't distinguish "the factory moved ahead"
  // (safe to refresh) from "you customized it" (never clobber). A manifest of installed
  // hashes (.hamzaish-installed.json) settles it — the conffile pattern. Scope: the CORE
  // set installs if missing; ANY ~/.claude/commands/*.md with a factory/commands
  // counterpart is refresh-managed (having it there is the opt-in).
  const CORE = ["hamzaish", "builder-mode", "work-on", "portfolio-pulse", "brain-ask", "brain-ingest"];
  const MANIFEST_PATH = join(CMD_DIR, ".hamzaish-installed.json");
  const forceRefresh = process.argv.includes("--refresh-commands");
  const sha = (s: string) => new Bun.CryptoHasher("sha256").update(s).digest("hex");

  if (!existsSync(CMD_DIR)) {
    await mkdir(CMD_DIR, { recursive: true });
    console.log(c.dim(`     created ${CMD_DIR}`));
  }
  let manifest: Record<string, string> = {};
  try {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  } catch {
    /* first run under the manifest scheme */
  }

  const names = new Set(CORE);
  for (const f of readdirSync(CMD_DIR)) {
    if (f.endsWith(".md") && existsSync(join(ROOT, "factory", "commands", f))) names.add(f.slice(0, -3));
  }

  for (const name of [...names].sort()) {
    const target = join(ROOT, "factory", "commands", `${name}.md`);
    const dest = join(CMD_DIR, `${name}.md`);
    if (!existsSync(target)) {
      warn(`/${name}: source missing at factory/commands/${name}.md — skipped.`);
      warned++;
      continue;
    }
    // Legacy Hamzaish symlink → upgrade to a copy; foreign symlink → never touch.
    if (existsSync(dest)) {
      try {
        const current = await readlink(dest); // throws if dest is a real file
        if (resolve(current) === resolve(target)) {
          await unlink(dest);
        } else {
          warn(`/${name}: ~/.claude/commands/${name}.md points elsewhere (${current}) — left as-is.`);
          warned++;
          continue;
        }
      } catch {
        /* real file — the normal case */
      }
    }

    const srcContent = await readFile(target, "utf8");
    const srcHash = sha(srcContent);
    const destExists = existsSync(dest);
    const destHash = destExists ? sha(await readFile(dest, "utf8")) : undefined;
    const action = decideCommandAction({ destExists, destHash, srcHash, manifestHash: manifest[name], force: forceRefresh });

    switch (action) {
      case "install":
        await copyFile(target, dest); // dereferences (builder-mode.md -> hamzaish.md content)
        manifest[name] = sha(await readFile(dest, "utf8"));
        ok(`/${name} → installed.`);
        created++;
        break;
      case "skip":
        manifest[name] = destHash!; // record identical pre-manifest installs so future upgrades auto-refresh
        skip(`/${name} already current.`);
        skipped++;
        break;
      case "refresh":
        await copyFile(target, dest);
        manifest[name] = sha(await readFile(dest, "utf8"));
        ok(`/${name} → refreshed to the current factory version (you hadn't customized it).`);
        created++;
        break;
      case "force-refresh":
        await copyFile(target, dest);
        manifest[name] = sha(await readFile(dest, "utf8"));
        ok(`/${name} → overwritten with the factory version (--refresh-commands).`);
        created++;
        break;
      case "keep-customized":
        warn(`/${name}: locally customized — left as-is. (bun run setup --refresh-commands overwrites; a copy of your edits first is on you.)`);
        warned++;
        break;
    }
  }
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(c.dim("     Real copies (the loader skips symlinks); .hamzaish-installed.json tracks them so upgrades refresh, edits never clobber."));
}

// Step 5 — build the brain index -------------------------------------------
step(7, "Brain index (full-text search over the factory)");
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
