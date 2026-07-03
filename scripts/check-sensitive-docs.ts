#!/usr/bin/env bun
// check-sensitive-docs.ts — block security-posture documents from ever being committed
// to this always-public repo.
//
// The defect this exists for: on 2026-07-03 a stray meta/security/REPO-ACCOUNT-
// SECURITY-AUDIT.md (which repos had exposed secrets + their rotation status) sat
// untracked next to three legitimately-committable stray docs. One habitual
// `git add -A` away from publishing an attacker's shopping list. A .gitignore line
// alone is bypassable (`git add -f`, a rename, a new file outside the ignored dir) —
// this makes the TRACKED TREE itself the thing that fails loudly.
//
//   exit 0 = no tracked file looks like a security-posture document
//   exit 1 = a tracked path matches a sensitive-doc pattern (audit, secret
//            inventory, rotation log, incident report with credentials scope)
//
// Scope: git index paths only (what would actually publish). Content is not
// scanned — path/name patterns are the contract: security-posture docs live in
// meta/security/ (ignored + blocked) or outside the repo entirely. If a file is
// genuinely public-safe, renaming it to not look like an exposure inventory is
// the point, not a workaround.
//
// Usage: bun run scripts/check-sensitive-docs.ts          # report + gate
//        bun run scripts/check-sensitive-docs.ts --quiet  # gate only (CI)
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const quiet = process.argv.includes("--quiet");
const log = (s: string) => { if (!quiet) console.log(s); };

// Path/name patterns that mean "security posture" — matched against every tracked path.
const SENSITIVE: { re: RegExp; why: string }[] = [
  { re: /(^|\/)meta\/security\//i, why: "meta/security/ is the local-only security-notes home — never tracked" },
  // (?!or) spares "security-auditor" — the agent that PERFORMS audits is fine to ship;
  // its OUTPUT is what must never land here.
  { re: /security[-_ ]?audit(?!or)/i, why: "security-audit documents map your weaknesses for attackers" },
  { re: /secrets?[-_ ]?(audit|inventory|exposure|rotation)/i, why: "secret inventories/rotation logs say which keys exist and which leaked" },
  { re: /rotation[-_ ]?(log|status|schedule)/i, why: "rotation logs reveal credential lifecycle + gaps" },
  { re: /(^|\/)(pentest|penetration[-_ ]?test)/i, why: "pentest output enumerates exploitable findings" },
];

const tracked = execSync("git ls-files", { cwd: root, encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const hits: { path: string; why: string }[] = [];
for (const p of tracked) {
  for (const { re, why } of SENSITIVE) {
    if (re.test(p)) { hits.push({ path: p, why }); break; }
  }
}

if (hits.length) {
  // Failure must print even in --quiet: this is the loud part of the gate.
  console.error("✗ check-sensitive-docs: security-posture document(s) in the tracked tree of a PUBLIC repo:\n");
  for (const h of hits) console.error(`  ${h.path}\n    → ${h.why}`);
  console.error("\nRemove from the index (git rm --cached <path>), move it out of the repo (or into");
  console.error("gitignored meta/security/), and if it ever reached a REMOTE, treat the contents as");
  console.error("disclosed: rotate whatever it names and purge history (see meta/security notes).");
  process.exit(1);
}

log(`✓ check-sensitive-docs: ${tracked.length} tracked paths, none look like security-posture documents`);
