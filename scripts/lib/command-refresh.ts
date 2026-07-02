// command-refresh.ts — the one decision global command copies need.
//
// Problem (learning 2026-07-02): ~/.claude/commands/ holds REAL copies of factory
// commands (the loader skips symlinks), and copies rot after factory upgrades.
// "The copy differs from the source" alone cannot distinguish the two cases that
// matter — the factory moved ahead (SAFE to refresh) vs. the user customized the
// copy (NEVER clobber). A manifest of what setup last installed settles it:
//   dest == manifest  → user never touched it → factory moved ahead → refresh
//   dest != manifest  → user edited it        → keep, unless --refresh-commands
// (The conffile pattern every package manager uses, applied to slash commands.)

export type CommandAction =
  | "install" // dest missing → copy in
  | "skip" // dest identical to source → nothing to do (still record hash: migrates pre-manifest installs)
  | "refresh" // dest matches what we installed, source moved ahead → safe overwrite
  | "force-refresh" // user asked to overwrite regardless (--refresh-commands)
  | "keep-customized"; // dest was edited by the user and no force → never clobber

export function decideCommandAction(opts: {
  destExists: boolean;
  destHash?: string; // required when destExists
  srcHash: string;
  manifestHash?: string; // what setup recorded at last install/refresh, if anything
  force: boolean;
}): CommandAction {
  if (!opts.destExists) return "install";
  if (opts.destHash === opts.srcHash) return "skip";
  if (opts.manifestHash !== undefined && opts.destHash === opts.manifestHash) return "refresh";
  if (opts.force) return "force-refresh";
  return "keep-customized";
}
