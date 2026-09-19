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
//   5. Create products/_active.local.md + products/_portfolio.md from their examples
//   6. Create the factory control-plane files (orders, standing orders, heartbeat)
//   6.5 Record where Hamzaish lives — env.HAMZAISH_ROOT in ~/.claude/settings.json — and
//      re-point any hook whose folder moved. The first install wins: setup run inside a
//      second clone (a worktree, a backup) never takes the global commands over.
//   7. Install the global slash commands into ~/.claude/commands/ as pointer stubs
//      aimed at that folder
//   8. Build the brain index (bun brain/ingest.ts)
//   9. Offer to register the factory enablement + freshness hooks (SessionStart) in
//      ~/.claude/settings.json (consent prompt; HAMZAISH_REGISTER_HOOK=yes|no skips it)
//  10. Offer to register the four guard hooks (PreToolUse) in ~/.claude/settings.json
//      — they block unrecoverable actions before the tool call runs
//      (consent prompt; HAMZAISH_REGISTER_GUARDS=yes|no to skip the prompt)
//   then print the one next step (install.sh prints its own, so it sets HAMZAISH_INSTALLER=1)
//
// It NEVER overwrites your existing .local files or any command file you've customized.
// Re-running it is harmless — it just fills in whatever's missing.

import { readFile, writeFile, mkdir, symlink, readlink, copyFile, unlink, stat } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { decideCommandAction } from "./lib/command-refresh";
import { CORE_COMMANDS, chooseRoot, repointStaleHooks, samePath } from "./lib/install";

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

// Step 3b — your portfolio + active-sprint state (yours, never committed) ----
step(5, "Your portfolio + sprint state (local to this machine — never committed)");
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
  // The snapshot /portfolio-pulse maintains. Agents read it at session start, so a
  // fresh install gets an honest empty one instead of a missing file.
  const pDst = join(ROOT, "products", "_portfolio.md");
  const pSrc = join(ROOT, "products", "_portfolio.example.md");
  if (existsSync(pDst)) {
    skip("products/_portfolio.md already exists — leaving your portfolio snapshot untouched.");
    skipped++;
  } else if (existsSync(pSrc)) {
    await copyFile(pSrc, pDst);
    ok("Created products/_portfolio.md (empty) — /portfolio-pulse keeps it current.");
    created++;
  }
  console.log(c.dim("     products/ is yours and stays on this machine: gitignored, never committed to this public repo."));
  console.log(c.dim("     It starts empty and fills as you build with /builder-mode."));
}

// Step 3c — factory control plane (orders / authority / heartbeat) ----------
step(6, "Factory control plane (weekly mandate + autonomous-program authority — never committed)");
{
  // The three files that make unattended work bounded and auditable:
  //   FACTORY-ORDERS  — the weekly mandate + budget + stop conditions (allocation flows down)
  //   STANDING-ORDERS — per-program authority: scope/triggers/approval gates/escalation
  //   HEARTBEAT       — the weekly batched pulse checklist
  // autonomy-loop.ts wires ORDERS/STANDING into every unattended session's prompt;
  // /factory-launch is the guided walkthrough that fills them in.
  const PLANE = ["FACTORY-ORDERS", "STANDING-ORDERS", "HEARTBEAT"];
  for (const name of PLANE) {
    const dst = join(ROOT, `${name}.local.md`);
    const src = join(ROOT, `${name}.example.md`);
    if (existsSync(dst)) {
      skip(`${name}.local.md already exists — leaving your orders untouched.`);
      skipped++;
    } else if (existsSync(src)) {
      await copyFile(src, dst);
      ok(`Created ${name}.local.md from the template.`);
      created++;
    } else {
      warn(`No ${name}.example.md template found — skipping. (Unusual; check the repo root.)`);
      warned++;
    }
  }
  console.log(c.dim("     → Run /factory-launch in Claude Code for the guided fill-in (mandate, weekly cap, WIP caps)."));
}

// Step 6.5 — where Hamzaish lives -----------------------------------------------
// Factory files say ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}, and until 2026-09-19
// nothing set HAMZAISH_ROOT — so on any machine but the maintainer's, the global
// commands and the freshness hook pointed at a folder that did not exist. Record the
// location in ~/.claude/settings.json → env: Claude Code applies it to every session
// and its subprocesses (Bash tool calls, hooks). Rules live in scripts/lib/install.ts.
let INSTALL_ROOT = ROOT;
step(6.5, "Where Hamzaish lives (so commands and hooks find it from any folder)");
{
  const settingsPath = join(HOME, ".claude", "settings.json");
  try {
    let settings: Record<string, any> = {};
    if (existsSync(settingsPath)) settings = JSON.parse(await readFile(settingsPath, "utf8"));
    const configured: string | undefined = settings.env?.HAMZAISH_ROOT || process.env.HAMZAISH_ROOT || undefined;
    const choice = chooseRoot({ configured, home: HOME, thisRoot: ROOT });
    INSTALL_ROOT = choice.root;

    const recording = settings.env?.HAMZAISH_ROOT !== choice.root;
    if (recording) settings.env = { ...(settings.env ?? {}), HAMZAISH_ROOT: choice.root };
    const repointed = repointStaleHooks(settings, choice.root, HOME);
    if (recording || repointed) {
      await mkdir(join(HOME, ".claude"), { recursive: true });
      await writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n");
    }

    const here = samePath(choice.root, ROOT);
    if (!recording) {
      skip(here ? "HAMZAISH_ROOT already points at this folder." : `HAMZAISH_ROOT already points at ${choice.root}.`);
      skipped++;
    } else if (choice.why === "repoint") {
      ok(`HAMZAISH_ROOT named a folder that no longer holds Hamzaish (${configured}) — re-pointed here.`);
      created++;
    } else {
      ok(`Recorded ${here ? "this folder" : choice.root} as your Hamzaish (HAMZAISH_ROOT in ~/.claude/settings.json) — new Claude Code sessions find it from any folder.`);
      created++;
    }
    if (!here) {
      console.log(c.dim(`     This folder is a second copy — global commands and hooks stay with ${choice.root}.`));
      console.log(c.dim(`     To switch, set "HAMZAISH_ROOT": "${ROOT}" under "env" in ${settingsPath}, then re-run setup.`));
    }
    if (repointed) {
      ok(`Re-pointed ${repointed} hook(s) whose folder had moved.`);
      created++;
    }
  } catch (e) {
    warn(
      `Couldn't safely update ${settingsPath} (${e instanceof Error ? e.message : e}) — ` +
        `add "env": { "HAMZAISH_ROOT": "${ROOT}" } to it yourself.`,
    );
    warned++;
  }
}

// Step 4 — global slash commands -------------------------------------------
step(7, "Global slash commands (so /builder-mode, /work-on, /brain-ask, etc. work from any folder)");
{
  // POINTER STUBS, not full copies or symlinks. Three constraints meet here:
  //   • Symlinks fail — Claude Code's loader does not reliably follow them ("Unknown command").
  //   • Full copies rot — the 2026-07-02 staleness incident (brain/learnings/2026-07-02.md).
  //   • Full copies DOUBLE-LIST — inside the Hamzaish repo, the user-scoped copy and the
  //     project-scoped command both load, so ~16 descriptions burned context twice per
  //     session (decision log 2026-07-14). Docs claim user scope shadows project scope,
  //     but live sessions list both.
  // A stub is a tiny real file whose BODY defers to the factory file at run time — it
  // cannot go stale (it carries no protocol), and inside the repo it costs one short line.
  // CORE commands keep the source's `description` so natural-language routing works from
  // any folder ("where should I focus today" → /portfolio-pulse); the rest are reached by
  // being typed or chained by name, so they get a one-line pointer description.
  //
  // The manifest (.hamzaish-installed.json) is still the conffile pattern: dest==manifest
  // → we installed it, safe to refresh (now: when the stub template or the source's
  // frontmatter changes); dest!=manifest → user customized it, never clobber. Scope: the
  // CORE set installs if missing; ANY ~/.claude/commands/*.md with a factory/commands
  // counterpart is refresh-managed (having it there is the opt-in).
  //
  // The stub names the install's absolute path (decided in step 6.5) rather than
  // ${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}: the Read tool expands no variables, and
  // that fallback is the maintainer's layout — on any other machine it pointed at nothing.
  const CORE = CORE_COMMANDS;
  const FACTORY_CMD = join(INSTALL_ROOT, "factory", "commands");
  const buildStub = (name: string, srcContent: string): string => {
    const fm = /^---\n([\s\S]*?)\n---/.exec(srcContent)?.[1] ?? "";
    const srcDesc = /^description:\s*(.+)$/m.exec(fm)?.[1]?.trim();
    const hint = /^argument-hint:\s*(.+)$/m.exec(fm)?.[1]?.trim();
    const desc = CORE.includes(name) && srcDesc ? srcDesc : `Hamzaish global door — runs the factory-current /${name}.`;
    return [
      "---",
      `description: ${desc}`,
      ...(hint ? [`argument-hint: ${hint}`] : []),
      "---",
      "",
      "<!-- Generated pointer stub (bun run setup) — do not hand-edit; the real command lives in the factory. -->",
      "",
      `The user invoked: \`/${name} $ARGUMENTS\``,
      "",
      `Hamzaish lives at \`${INSTALL_ROOT}\` — wherever a factory file says \`$HAMZAISH_ROOT\` (or \`\${HAMZAISH_ROOT:-…}\`), it means that folder.`,
      "",
      `Read \`${FACTORY_CMD}/${name}.md\` and follow it exactly as if it were this command's body, applying \`$ARGUMENTS\` as it specifies. It always reflects the current factory version — never answer from a stale copy.`,
      "",
    ].join("\n");
  };
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
    if (f.endsWith(".md") && existsSync(join(INSTALL_ROOT, "factory", "commands", f))) names.add(f.slice(0, -3));
  }

  for (const name of [...names].sort()) {
    const target = join(INSTALL_ROOT, "factory", "commands", `${name}.md`);
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

    const srcContent = await readFile(target, "utf8"); // dereferences (builder-mode.md -> hamzaish.md content)
    const stub = buildStub(name, srcContent);
    const srcHash = sha(stub); // "source" for the conffile decision is what we WOULD install: the stub
    const destExists = existsSync(dest);
    const destHash = destExists ? sha(await readFile(dest, "utf8")) : undefined;
    const action = decideCommandAction({ destExists, destHash, srcHash, manifestHash: manifest[name], force: forceRefresh });

    switch (action) {
      case "install":
        await writeFile(dest, stub);
        manifest[name] = srcHash;
        ok(`/${name} → pointer stub installed.`);
        created++;
        break;
      case "skip":
        manifest[name] = destHash!; // record identical pre-manifest installs so future upgrades auto-refresh
        skip(`/${name} already current.`);
        skipped++;
        break;
      case "refresh":
        await writeFile(dest, stub); // includes migrating a pre-stub full copy we installed → stub
        manifest[name] = srcHash;
        ok(`/${name} → refreshed to the current pointer stub (you hadn't customized it).`);
        created++;
        break;
      case "force-refresh":
        await writeFile(dest, stub);
        manifest[name] = srcHash;
        ok(`/${name} → overwritten with the pointer stub (--refresh-commands).`);
        created++;
        break;
      case "keep-customized":
        warn(`/${name}: locally customized — left as-is. (bun run setup --refresh-commands overwrites; a copy of your edits first is on you.)`);
        warned++;
        break;
    }
  }
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(c.dim("     Pointer stubs (loader skips symlinks; full copies rot + double-list); .hamzaish-installed.json tracks them so upgrades refresh, edits never clobber."));
}

// Step 5 — build the brain index -------------------------------------------
step(8, "Brain index (full-text search over the factory)");
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

// Step 9 — enablement hook (the factory announces itself) --------------------
step(9, "Enablement hook (factory Flight Plan/Receipt in every product session)");
{
  const settingsPath = join(HOME, ".claude", "settings.json");
  const hookCmd = join(INSTALL_ROOT, "factory", "hooks", "factory-session-context.sh");
  type HookEntry = { type: string; command?: string; [k: string]: unknown };
  type HookGroup = { matcher?: string; hooks?: HookEntry[] };
  try {
    let settings: Record<string, any> = {};
    if (existsSync(settingsPath)) {
      settings = JSON.parse(await readFile(settingsPath, "utf8"));
    }
    const groups: HookGroup[] = settings.hooks?.SessionStart ?? [];
    const already = groups.some((g) =>
      (g.hooks ?? []).some((h) => typeof h.command === "string" && h.command.includes("factory-session-context.sh")),
    );
    if (already) {
      skip("SessionStart enablement hook already registered.");
      skipped++;
    } else {
      // Consent, because this edits the user's global Claude Code settings.
      const forced = process.env.HAMZAISH_REGISTER_HOOK === "yes";
      const declined = process.env.HAMZAISH_REGISTER_HOOK === "no";
      const consent = forced
        ? true
        : declined
          ? false
          : typeof confirm === "function"
            ? confirm("  Register the factory enablement hook (SessionStart) in ~/.claude/settings.json?")
            : false;
      if (!consent) {
        skip("Not registered. Enable anytime: HAMZAISH_REGISTER_HOOK=yes bun run setup");
        skipped++;
      } else {
        settings.hooks ??= {};
        // Two registrations, one consent: SessionStart carries the full protocol
        // once; UserPromptSubmit repeats a one-line reminder on every message so
        // long-lived sessions can't drift out of the bookends.
        const wanted: [string, string][] = [
          ["SessionStart", hookCmd],
          ["UserPromptSubmit", `${hookCmd} --brief`],
        ];
        for (const [event, cmd] of wanted) {
          settings.hooks[event] ??= [];
          const eventGroups: HookGroup[] = settings.hooks[event];
          const has = eventGroups.some((g) =>
            (g.hooks ?? []).some((h) => typeof h.command === "string" && h.command.includes("factory-session-context.sh") && (event !== "UserPromptSubmit" || h.command.includes("--brief"))),
          );
          if (has) continue;
          const bare = eventGroups.find((g) => (g.matcher ?? "") === "");
          const entry = { type: "command", command: cmd };
          if (bare) bare.hooks = [...(bare.hooks ?? []), entry];
          else eventGroups.push({ matcher: "", hooks: [entry] });
        }
        await mkdir(join(HOME, ".claude"), { recursive: true });
        await writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n");
        ok("Registered — full protocol at session start + a per-message reminder, in factory product repos.");
        created++;
      }
    }
  } catch (e) {
    warn(
      `Couldn't safely update ${settingsPath} (${e instanceof Error ? e.message : e}) — ` +
        "register manually; see factory/hooks/factory-session-context.sh header.",
    );
    warned++;
  }
}

// Step 9b — freshness notice (a stale factory is invisible otherwise) ---------
step(9.5, "Freshness notice (tells you when your clone has gone stale — never auto-pulls)");
{
  // Deliberately its OWN consent and its OWN already-check rather than riding along with
  // step 9: that block short-circuits when the enablement hook is present, so bundling
  // this into it would mean every existing install never gets the notice — which is the
  // exact staleness problem it exists to solve.
  //
  // The global commands are pointer stubs reading the live clone, so a pull updates
  // everything at once. The cost of that design is that a stale clone looks identical to
  // a fresh one. This hook is the only thing that makes staleness visible; it informs and
  // never acts (see factory/hooks/factory-freshness.sh).
  const settingsPath = join(HOME, ".claude", "settings.json");
  const hookCmd = join(INSTALL_ROOT, "factory", "hooks", "factory-freshness.sh");
  type HookEntry = { type: string; command?: string; [k: string]: unknown };
  type HookGroup = { matcher?: string; hooks?: HookEntry[] };
  try {
    let settings: Record<string, any> = {};
    if (existsSync(settingsPath)) {
      settings = JSON.parse(await readFile(settingsPath, "utf8"));
    }
    const groups: HookGroup[] = settings.hooks?.SessionStart ?? [];
    const already = groups.some((g) =>
      (g.hooks ?? []).some((h) => typeof h.command === "string" && h.command.includes("factory-freshness.sh")),
    );
    if (already) {
      skip("SessionStart freshness hook already registered.");
      skipped++;
    } else {
      const forced = process.env.HAMZAISH_REGISTER_HOOK === "yes";
      const declined = process.env.HAMZAISH_REGISTER_HOOK === "no";
      const consent = forced
        ? true
        : declined
          ? false
          : typeof confirm === "function"
            ? confirm("  Register the freshness notice (SessionStart, checks once/24h, never pulls)?")
            : false;
      if (!consent) {
        skip("Not registered — you won't be told when the factory is out of date. Enable anytime: HAMZAISH_REGISTER_HOOK=yes bun run setup");
        skipped++;
      } else {
        settings.hooks ??= {};
        settings.hooks.SessionStart ??= [];
        const eventGroups: HookGroup[] = settings.hooks.SessionStart;
        const bare = eventGroups.find((g) => (g.matcher ?? "") === "");
        const entry = { type: "command", command: hookCmd };
        if (bare) bare.hooks = [...(bare.hooks ?? []), entry];
        else eventGroups.push({ matcher: "", hooks: [entry] });
        await mkdir(join(HOME, ".claude"), { recursive: true });
        await writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n");
        ok("Registered — one line at session start when your clone is behind. Silence: HAMZAISH_NO_UPDATE_CHECK=1");
        created++;
      }
    }
  } catch (e) {
    warn(
      `Couldn't safely update ${settingsPath} (${e instanceof Error ? e.message : e}) — ` +
        "register manually; see factory/hooks/factory-freshness.sh header.",
    );
    warned++;
  }
}

// Step 10 — guard hooks (policy the agent doesn't get a vote on) -------------
step(10, "Guard hooks (block unrecoverable actions before they run)");
{
  const settingsPath = join(HOME, ".claude", "settings.json");
  const guardDir = join(INSTALL_ROOT, "factory", "hooks", "guardhooks");
  type HookEntry = { type: string; command?: string; [k: string]: unknown };
  type HookGroup = { matcher?: string; hooks?: HookEntry[] };

  // Each guard runs on the tools it can actually see its action through.
  // Only the secrets guard needs the file tools; the rest are shell-only.
  const GUARDS: [file: string, matcher: string, what: string][] = [
    ["guard-repo-visibility.sh", "Bash", "un-publishing a public repo"],
    ["guard-force-push.sh", "Bash", "rewriting a protected branch"],
    ["guard-mass-delete.sh", "Bash", "recursive deletes aimed at a root"],
    ["guard-secrets-files.sh", "Read|Write|Edit|NotebookEdit|Bash", "reading real-secrets files"],
  ];

  try {
    let settings: Record<string, any> = {};
    if (existsSync(settingsPath)) {
      settings = JSON.parse(await readFile(settingsPath, "utf8"));
    }
    const existing: HookGroup[] = settings.hooks?.PreToolUse ?? [];
    const isRegistered = (file: string) =>
      existing.some((g) =>
        (g.hooks ?? []).some((h) => typeof h.command === "string" && h.command.includes(file)),
      );
    const missing = GUARDS.filter(([file]) => !isRegistered(file));

    if (missing.length === 0) {
      skip(`All ${GUARDS.length} guard hooks already registered.`);
      skipped++;
    } else {
      // Consent, because this installs hooks that can BLOCK the agent's tool
      // calls in every session on this machine — not just in this repo.
      const forced = process.env.HAMZAISH_REGISTER_GUARDS === "yes";
      const declined = process.env.HAMZAISH_REGISTER_GUARDS === "no";
      console.log(c.dim(`     ${missing.length} not yet installed: ${missing.map(([, , w]) => w).join(", ")}`));
      console.log(c.dim(`     They fail open — a guard only ever blocks on a clear match.`));
      const consent = forced
        ? true
        : declined
          ? false
          : typeof confirm === "function"
            ? confirm(`  Register ${missing.length} guard hook(s) in ~/.claude/settings.json?`)
            : false;
      if (!consent) {
        skip("Not registered. Enable anytime: HAMZAISH_REGISTER_GUARDS=yes bun run setup");
        skipped++;
      } else {
        settings.hooks ??= {};
        settings.hooks.PreToolUse ??= [];
        const groups: HookGroup[] = settings.hooks.PreToolUse;
        for (const [file, matcher] of missing) {
          const entry = { type: "command", command: join(guardDir, file) };
          const group = groups.find((g) => (g.matcher ?? "") === matcher);
          if (group) group.hooks = [...(group.hooks ?? []), entry];
          else groups.push({ matcher, hooks: [entry] });
        }
        await mkdir(join(HOME, ".claude"), { recursive: true });
        await writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n");
        ok(`Registered ${missing.length} guard hook(s).`);
        created++;
      }
    }

    // The config is optional — the guards ship with safe defaults — but the
    // never-private repo list is empty until someone fills it in.
    const confPath = join(HOME, ".claude", "guardhooks.conf");
    if (existsSync(confPath)) {
      skip("guardhooks.conf present — your settings are in use.");
      skipped++;
    } else {
      console.log(
        c.dim(`     Optional config (defaults are safe without it):`) +
          `\n       ${c.dim(`cp ${join(guardDir, "guardhooks.conf.example")} ${confPath}`)}`,
      );
    }
  } catch (e) {
    warn(
      `Couldn't safely update ${settingsPath} (${e instanceof Error ? e.message : e}) — ` +
        "register manually; see factory/hooks/guardhooks/README.md.",
    );
    warned++;
  }
}

// Done ----------------------------------------------------------------------
console.log(c.gold(`
   ┌─────────────────────────────────────────┐
   │   ✓ Factory ready                        │
   └─────────────────────────────────────────┘`));
console.log(`   ${c.dim("created")} ${created}   ${c.dim("already-set")} ${skipped}${warned ? `   ${c.red("needs-attention")} ${warned}` : ""}`);

// ONE next step. Until 2026-09-19 this printed five (none of them /builder-mode), right
// after install.sh had said "/builder-mode" — two contradicting first steps on one
// screen. install.sh prints its own copy (with the cd), so it sets HAMZAISH_INSTALLER=1.
if (process.env.HAMZAISH_INSTALLER !== "1") {
  console.log(`
${c.bold("Next:")} open Claude Code in this folder and type
      ${c.gold("/builder-mode <your idea>")}   ${c.dim("e.g. /builder-mode a tip calculator for freelancers")}

${c.dim("Stuck? bun run doctor checks your setup and prints the fix for anything wrong.")}
${c.dim("Re-run setup anytime — it only fills in what's missing.")}
`);
}
