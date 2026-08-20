// Tests for the four guard hooks.
//
// Every guard gets both halves of its contract:
//   • it BLOCKS (exit 2) the unrecoverable action it exists to stop, and
//   • it FAILS OPEN (exit 0) on ordinary work.
// The second half matters as much as the first — a guard that blocks real work
// gets uninstalled, and an uninstalled guard protects nothing.
//
// Guards are run as real subprocesses against a fixture config, never the
// machine's own ~/.claude/guardhooks.conf, so results don't depend on who runs
// them or from which directory.

import { test, expect } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const HERE = import.meta.dir;

// Fixture config: a never-private repo name that can't collide with a real one.
const FIXTURE_DIR = mkdtempSync(join(tmpdir(), "guardhooks-test-"));
const CONF = join(FIXTURE_DIR, "guardhooks.conf");
writeFileSync(
  CONF,
  [
    'GUARDHOOKS_NEVER_PRIVATE="sacred-fixture-repo"',
    'GUARDHOOKS_PROTECTED_BRANCHES="main master production"',
    "",
  ].join("\n"),
);

const BLOCK = 2;
const ALLOW = 0;

/** Run a guard with `input` on stdin; return its exit code. */
function run(guard: string, input: unknown, env: Record<string, string> = {}): number {
  const proc = Bun.spawnSync({
    cmd: ["bash", join(HERE, guard)],
    stdin: new TextEncoder().encode(typeof input === "string" ? input : JSON.stringify(input)),
    // cwd is a temp dir so no test can accidentally match the real repo we run in.
    cwd: FIXTURE_DIR,
    env: { ...process.env, GUARDHOOKS_CONF: CONF, ...env },
    stdout: "pipe",
    stderr: "pipe",
  });
  return proc.exitCode ?? -1;
}

const bash = (command: string) => ({ tool_name: "Bash", tool_input: { command } });

type Case = [name: string, expected: number, input: unknown, env?: Record<string, string>];

function suite(guard: string, cases: Case[]) {
  for (const [name, expected, input, env] of cases) {
    const verb = expected === BLOCK ? "blocks" : "allows";
    test(`${guard.replace(/^guard-|\.sh$/g, "")} ${verb}: ${name}`, () => {
      expect(run(guard, input, env)).toBe(expected);
    });
  }
}

// ── guard-repo-visibility ────────────────────────────────────────────────────
suite("guard-repo-visibility.sh", [
  ["a never-private repo named in the command", BLOCK,
    bash("gh repo edit sacred-fixture-repo --visibility private")],

  // The whole reason never-private is its own tier: the escape hatch that works
  // for every other repo must NOT work here.
  ["a never-private repo even with the override token", BLOCK,
    bash("gh repo edit sacred-fixture-repo --visibility private # I-DOUBLE-CONFIRM-PRIVATE")],
  ["a never-private repo even with the override env var", BLOCK,
    bash("gh repo edit sacred-fixture-repo --visibility private"),
    { GUARDHOOKS_CONFIRM_PRIVATE: "yes-twice" }],

  ["any other repo without confirmation", BLOCK,
    bash("gh repo edit some-other-repo --visibility private")],
  ["archiving a repo without confirmation", BLOCK, bash("gh repo archive some-other-repo")],
  ["the REST API route to private", BLOCK,
    bash(`gh api -X PATCH repos/o/some-other-repo -f private=true`)],

  ["another repo once a human double-confirmed by token", ALLOW,
    bash("gh repo edit some-other-repo --visibility private # I-DOUBLE-CONFIRM-PRIVATE")],
  ["another repo once a human double-confirmed by env var", ALLOW,
    bash("gh repo edit some-other-repo --visibility private"),
    { GUARDHOOKS_CONFIRM_PRIVATE: "yes-twice" }],

  ["going private→public", ALLOW, bash("gh repo edit some-other-repo --visibility public")],
  ["creating a brand-new private repo", ALLOW, bash("gh repo create fresh-repo --private")],
  ["an ordinary command", ALLOW, bash("git status")],
  ["prose that merely mentions the word private", ALLOW,
    bash(`echo "the repo stays public, never private"`)],
]);

// ── guard-force-push ─────────────────────────────────────────────────────────
suite("guard-force-push.sh", [
  ["force-push to main", BLOCK, bash("git push --force origin main")],
  ["force-with-lease to main", BLOCK, bash("git push --force-with-lease origin main")],
  ["short -f to production", BLOCK, bash("git push -f origin production")],
  ["refspec force syntax", BLOCK, bash("git push origin +main")],
  ["deleting a protected branch by colon refspec", BLOCK, bash("git push origin :main")],
  ["deleting a protected branch by --delete", BLOCK, bash("git push --delete origin main")],

  ["force-pushing a feature branch", ALLOW, bash("git push --force origin feat/my-branch")],
  ["force-with-lease on a feature branch", ALLOW,
    bash("git push --force-with-lease origin rescue/v2")],
  ["an ordinary push to main", ALLOW, bash("git push origin main")],
  ["a force-push a human approved by token", ALLOW,
    bash("git push --force origin main # I-CONFIRM-FORCE-PUSH")],
  ["a force-push a human approved by env var", ALLOW,
    bash("git push --force origin main"), { GUARDHOOKS_ALLOW_FORCE_PUSH: "yes" }],
  ["a command that isn't a push at all", ALLOW, bash("git log --oneline -5")],
]);

// ── guard-mass-delete ────────────────────────────────────────────────────────
suite("guard-mass-delete.sh", [
  ["rm -rf at filesystem root", BLOCK, bash("rm -rf /")],
  ["rm -rf on a root glob", BLOCK, bash("rm -rf /*")],
  ["rm -rf on the home directory", BLOCK, bash("rm -rf ~")],
  ["rm -rf on $HOME", BLOCK, bash("rm -rf $HOME")],
  ["rm -rf on a system directory", BLOCK, bash("rm -rf /etc")],
  ["rm -rf on a bare glob", BLOCK, bash("rm -rf *")],
  ["rm -rf on the current directory", BLOCK, bash("rm -rf .")],
  ["rm -rf on the parent directory", BLOCK, bash("rm -rf ..")],
  ["split -r -f flags on a dangerous root", BLOCK, bash("rm -r -f /")],

  ["a targeted node_modules delete", ALLOW, bash("rm -rf node_modules")],
  ["a targeted build-output delete", ALLOW, bash("rm -rf ./dist")],
  ["a targeted temp-path delete", ALLOW, bash("rm -rf /tmp/scratch-123")],
  ["a non-recursive single-file delete", ALLOW, bash("rm somefile.txt")],
  ["a delete a human approved by token", ALLOW, bash("rm -rf ~ # I-CONFIRM-MASS-DELETE")],
  ["a delete a human approved by env var", ALLOW,
    bash("rm -rf ~"), { GUARDHOOKS_ALLOW_MASS_DELETE: "yes" }],
  ["an unrelated command", ALLOW, bash("ls -la")],
]);

// ── guard-secrets-files ──────────────────────────────────────────────────────
// The harness wrapper these calls arrive inside; it must not itself read as an
// interpreter opening the file.
const WRAP = "perl -e 'alarm shift; exec @ARGV' 20 ";

suite("guard-secrets-files.sh", [
  ["reading a secrets file", BLOCK,
    { tool_name: "Read", tool_input: { file_path: "/x/.env.local" } }],
  ["writing a secrets file", BLOCK,
    { tool_name: "Write", tool_input: { file_path: "/x/.env.local", content: "A=1" } }],
  ["reading a private key", BLOCK,
    { tool_name: "Read", tool_input: { file_path: "/u/.ssh/id_rsa" } }],
  ["cat-ing a secrets file", BLOCK, bash("cat /x/.env.local")],
  ["cat-ing it through the harness wrapper", BLOCK, bash(`${WRAP}cat /x/.env.local`)],
  ["sed-ing a secrets file", BLOCK, bash("sed -n 1p /x/.env.local")],
  ["an interpreter reading a secrets file", BLOCK, bash("python3 script.py /x/.env.local")],
  ["grep without a quiet/count flag", BLOCK, bash("grep KEY /x/.env.local")],
  ["copying a secrets file to another name", BLOCK, bash("cp .env.local /tmp/x")],

  ["writing the .example template instead", ALLOW,
    { tool_name: "Write", tool_input: { file_path: "/x/.env.local.example", content: "A=" } }],
  ["reading a plain .env", ALLOW, { tool_name: "Read", tool_input: { file_path: "/x/.env" } }],
  ["editing a doc that merely mentions the path", ALLOW,
    { tool_name: "Edit", tool_input: {
        file_path: "/x/docs/SETUP.md",
        old_string: "put it in .env.local",
        new_string: "you paste your keys into .env.local yourself",
      } }],
  ["a non-printing count check", ALLOW, bash(`${WRAP}grep -c KEY= /x/.env.local`)],
  ["a non-printing existence check", ALLOW, bash("test -s .env.local && echo ok")],
  ["a commit message that names the file", ALLOW,
    bash(`${WRAP}git commit -m "document that .env.local holds the keys"`)],
  ["prose mentioning the path", ALLOW, bash("echo done editing docs about .env.local")],
  ["listing a directory", ALLOW, bash("ls -la /x")],
  ["access a human approved by token", ALLOW,
    { tool_name: "Read", tool_input: { file_path: "/x/.env.local" }, note: "I-CONFIRM-SECRETS-FILE-ACCESS" }],
]);
