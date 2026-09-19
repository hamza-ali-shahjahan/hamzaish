// scripts/lib/install.ts — where a Hamzaish install lives. Shared by setup, doctor and their tests.
//
// Factory files say `${HAMZAISH_ROOT:-$HOME/Claude/Hamzaish}`. That fallback is the
// maintainer's own folder layout, and until 2026-09-19 nothing set HAMZAISH_ROOT — so
// an install anywhere else got global commands and hooks aimed at a folder that did
// not exist on that machine. Setup now records the install's location as
// `env.HAMZAISH_ROOT` in ~/.claude/settings.json (Claude Code applies settings `env`
// to every session and its subprocesses — Bash tool calls and hooks included), bakes
// it into the global pointer stubs, and re-points hooks whose clone has moved.
import { existsSync, readdirSync, realpathSync } from "node:fs";
import { join } from "node:path";

/** Commands whose global stub keeps the source's full description (natural-language routing). */
export const CORE_COMMANDS = [
  "hamzaish", "builder-mode", "work-on", "portfolio-pulse", "brain-ask", "brain-ingest", "idea-gate",
];

/**
 * Hamzaish command names that Claude Code also ships as built-ins
 * (https://code.claude.com/docs/en/commands): `/goal`, `/plan` (plan mode), `/review`
 * (alias of `/code-review`). Never installed for every chat — a user-scope stub could
 * change what typing them does in every project on the machine. Inside the Hamzaish
 * folder they still resolve as project commands, and every stub tells Claude to read
 * Hamzaish's own file for these names when a factory file hands off to them.
 */
export const CLAUDE_BUILTIN_NAMES = new Set(["goal", "plan", "review"]);

/**
 * Every factory command setup installs for every chat (since 2026-09-19 — before that,
 * only CORE_COMMANDS, so /builder-mode's hand-offs to /full-cycle, /build, /ship … were
 * unknown in any chat opened outside the Hamzaish folder).
 */
export function globalCommands(root: string): string[] {
  const dir = join(root, "factory", "commands");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3))
    .filter((n) => !CLAUDE_BUILTIN_NAMES.has(n))
    .sort();
}

/** Hook scripts Hamzaish registers, by their path inside a clone. */
export const HOOK_SCRIPTS = [
  "factory/hooks/factory-session-context.sh",
  "factory/hooks/factory-freshness.sh",
  "factory/hooks/guardhooks/guard-repo-visibility.sh",
  "factory/hooks/guardhooks/guard-force-push.sh",
  "factory/hooks/guardhooks/guard-mass-delete.sh",
  "factory/hooks/guardhooks/guard-secrets-files.sh",
  "scripts/auto-commit.sh",
  "scripts/auto-pull-rebase.sh",
];

/** A folder is a Hamzaish install if it carries the front-door command. */
export const isFactory = (dir: string | undefined): dir is string =>
  !!dir && existsSync(join(dir, "factory", "commands", "hamzaish.md"));

/** Same folder? Symlink- and case-resolved when both exist (macOS folders are case-insensitive). */
export function samePath(a: string, b: string): boolean {
  if (a === b) return true;
  try {
    return realpathSync.native(a) === realpathSync.native(b);
  } catch {
    return false;
  }
}

export type RootChoice = {
  /** The folder global commands and hooks should use. */
  root: string;
  /**
   * configured — HAMZAISH_ROOT already names this folder
   * other-copy — HAMZAISH_ROOT names a different, working install; that one stays in charge
   * legacy     — nothing configured, but an install sits at the old default ~/Claude/Hamzaish
   * this-folder — first install on this machine
   * repoint    — HAMZAISH_ROOT named a folder that no longer holds Hamzaish (moved or deleted)
   */
  why: "configured" | "other-copy" | "legacy" | "this-folder" | "repoint";
};

/**
 * Which install global commands and hooks should point at. The first install wins:
 * running setup inside a second clone (a worktree, a backup) never silently takes
 * the global commands away from the one already in use.
 */
export function chooseRoot(opts: { configured?: string; home: string; thisRoot: string }): RootChoice {
  const { configured, home, thisRoot } = opts;
  if (isFactory(configured)) {
    return { root: configured, why: samePath(configured, thisRoot) ? "configured" : "other-copy" };
  }
  const legacy = join(home, "Claude", "Hamzaish");
  if (!configured && isFactory(legacy)) return { root: legacy, why: "legacy" };
  return { root: thisRoot, why: configured ? "repoint" : "this-folder" };
}

/** Expand the factory's path notation the way a shell would, for existence checks. */
export function expandRoot(path: string, env: { HAMZAISH_ROOT?: string; HOME: string }): string {
  const root = env.HAMZAISH_ROOT || join(env.HOME, "Claude", "Hamzaish");
  return path
    .replace(/\$\{HAMZAISH_ROOT:-[^}]*\}/g, root)
    .replace(/\$\{HAMZAISH_ROOT\}|\$HAMZAISH_ROOT\b/g, root)
    .replace(/^(?:~|\$\{HOME\}|\$HOME)(?=\/)/, env.HOME);
}

/** The file a generated pointer stub tells Claude to read, expanded; undefined if it isn't a stub. */
export function stubTarget(stub: string, env: { HAMZAISH_ROOT?: string; HOME: string }): string | undefined {
  if (!stub.includes("Generated pointer stub")) return undefined;
  const m = /Read `([^`]+)`/.exec(stub);
  return m ? expandRoot(m[1], env) : undefined;
}

/**
 * The Hamzaish hook script a registered hook command runs, if any: its path as
 * written, that path expanded, and the clone it lives in. Only clone-shaped paths
 * (ending in a known factory location) count — a user's own script of the same
 * name elsewhere is never ours to judge or re-point.
 */
export function hamzaishHook(
  command: string,
  home: string,
): { written: string; path: string; rel: string; cloneRoot: string } | undefined {
  for (const rel of HOOK_SCRIPTS) {
    const at = command.indexOf(`/${rel}`);
    if (at === -1) continue;
    const end = at + rel.length + 1;
    let start = at;
    while (start > 0 && !/[\s"'=]/.test(command[start - 1])) start--;
    const written = command.slice(start, end);
    const path = written.replace(/^(?:~|\$\{HOME\}|\$HOME)(?=\/)/, home);
    return { written, path, rel, cloneRoot: path.slice(0, path.length - rel.length - 1) };
  }
  return undefined;
}

type HookGroup = { matcher?: string; hooks?: { type?: string; command?: string }[] };

/** Every registered hook command in a settings object, in order. */
export function hookCommands(settings: { hooks?: Record<string, HookGroup[]> }): string[] {
  const out: string[] = [];
  for (const groups of Object.values(settings.hooks ?? {})) {
    for (const g of groups ?? []) for (const h of g.hooks ?? []) if (typeof h.command === "string") out.push(h.command);
  }
  return out;
}

/**
 * Re-point Hamzaish hooks whose script no longer exists (the clone moved or was
 * deleted) at the same script under `root`. Mutates `settings`; returns how many
 * commands changed. Hooks whose script still exists are left alone.
 */
export function repointStaleHooks(
  settings: { hooks?: Record<string, HookGroup[]> },
  root: string,
  home: string,
): number {
  let changed = 0;
  for (const groups of Object.values(settings.hooks ?? {})) {
    for (const g of groups ?? []) {
      for (const h of g.hooks ?? []) {
        if (typeof h.command !== "string") continue;
        const hook = hamzaishHook(h.command, home);
        if (!hook || existsSync(hook.path)) continue;
        const replacement = join(root, hook.rel);
        if (!existsSync(replacement)) continue;
        h.command = h.command.replace(hook.written, replacement);
        changed++;
      }
    }
  }
  return changed;
}
