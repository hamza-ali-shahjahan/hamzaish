#!/usr/bin/env bun
// tidy.ts — portable repo rot scanner. Report-FIRST, summary-FIRST. Nothing is
// ever edited without an explicit, confirmed --fix. Works on ANY git repo, and
// across many at once — so you can sweep 100+ repos (pre-Hamzaish included) and
// see the rot at a glance, then decide what to clean.
//
//   bun scripts/tidy.ts                  # scan the current repo → summary + next steps
//   bun scripts/tidy.ts <path>           # scan a specific repo
//   bun scripts/tidy.ts --all <dir>      # scan every git repo under <dir>, one aggregate table
//   bun scripts/tidy.ts --links          # drill into one category (also --secrets --files --deps)
//   bun scripts/tidy.ts --json           # machine-readable
//
// Four kinds of rot:  🔗 links · 🔑 secrets · 🗑 dead files · 📦 deps
// The summary shows the EXTENT per category first; details + fixes are opt-in.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, extname, basename } from "node:path";

// ── args ───────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (f: string) => argv.includes(f);
const json = flag("--json");
const allDir = argv.includes("--all") ? argv[argv.indexOf("--all") + 1] : null;
const only = ["--links", "--secrets", "--files", "--deps"].filter(flag).map((f) => f.slice(2));
const target = argv.find((a) => !a.startsWith("--") && a !== allDir) ?? ".";

// ── git helpers ──────────────────────────────────────────────────────────────
function git(repo: string, args: string[]): string {
  const r = Bun.spawnSync(["git", "-C", repo, ...args], { stdout: "pipe", stderr: "pipe" });
  return new TextDecoder().decode(r.stdout);
}
const isRepo = (p: string) => existsSync(join(p, ".git"));
const tracked = (repo: string, glob?: string) => git(repo, ["ls-files", ...(glob ? [glob] : [])]).split("\n").filter(Boolean);
const isExternal = (t: string) =>
  /^(https?:)?\/\//.test(t) || t.startsWith("#") || t.startsWith("mailto:") || t.startsWith("data:") || t.startsWith("<") || t.includes("{{") || t.includes("${") || t.includes("$(");

type Finding = { kind: string; file: string; detail: string };

// ── scanner: 🔗 links (broken file, or resolves only to a gitignored target) ──
function scanLinks(repo: string): Finding[] {
  const out: Finding[] = [];
  const files = tracked(repo, "*.md").filter((f) => !f.startsWith("_archive/"));
  const existing: { file: string; ref: string; rel: string }[] = [];
  for (const f of files) {
    let txt: string;
    try { txt = readFileSync(join(repo, f), "utf8"); } catch { continue; }
    const refs = new Set<string>();
    for (const m of txt.matchAll(/\]\(\s*([^)\s]+)/g)) refs.add(m[1]);
    for (const m of txt.matchAll(/(?:src|href)\s*=\s*"([^"]+)"/g)) refs.add(m[1]);
    for (let ref of refs) {
      if (isExternal(ref)) continue;
      ref = ref.replace(/[?#].*$/, "");
      const tgt = ref.startsWith("/") ? join(repo, ref.slice(1)) : resolve(join(repo, dirname(f)), ref);
      if (!existsSync(tgt)) out.push({ kind: "links", file: f, detail: `${ref} → missing` });
      else existing.push({ file: f, ref, rel: relative(repo, tgt) });
    }
  }
  if (existing.length) {
    const r = Bun.spawnSync(["git", "-C", repo, "check-ignore", "--stdin"], {
      stdin: new TextEncoder().encode(existing.map((e) => e.rel).join("\n")), stdout: "pipe", stderr: "pipe",
    });
    const ignored = new Set(new TextDecoder().decode(r.stdout).split("\n").map((s) => s.trim()).filter(Boolean));
    for (const e of existing) if (ignored.has(e.rel)) out.push({ kind: "links", file: e.file, detail: `${e.ref} → gitignored (ships nowhere)` });
  }
  return out;
}

// ── scanner: 🔑 secrets (high-confidence patterns; review-grade, not gitleaks) ──
const SECRET_PATTERNS: [string, RegExp][] = [
  ["AWS access key", /AKIA[0-9A-Z]{16}/],
  ["Stripe live/test key", /\b(sk|rk)_(live|test)_[0-9a-zA-Z]{20,}/],
  ["GitHub token", /\b(ghp|gho|ghs|ghu)_[0-9A-Za-z]{36}\b|github_pat_[0-9A-Za-z_]{60,}/],
  ["Google API key", /AIza[0-9A-Za-z_\-]{35}/],
  ["Slack token", /xox[baprs]-[0-9A-Za-z-]{10,}/],
  ["Private key block", /-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
];
function scanSecrets(repo: string): Finding[] {
  const out: Finding[] = [];
  const skip = /(\.example$|\.lock$|lock\.json$|package-lock|bun\.lock|\.(png|jpg|jpeg|gif|svg|webp|ico|pdf|woff2?|mp4)$)/i;
  for (const f of tracked(repo)) {
    if (skip.test(f)) continue;
    let txt: string;
    try { txt = readFileSync(join(repo, f), "utf8"); } catch { continue; }
    if (txt.length > 2_000_000) continue;
    for (const [name, re] of SECRET_PATTERNS) {
      const m = txt.match(re);
      if (m) out.push({ kind: "secrets", file: f, detail: `possible ${name} — REVIEW (${m[0].slice(0, 6)}…)` });
    }
  }
  return out;
}

// ── scanner: 🗑 dead files (committed assets referenced by nothing) ───────────
const ASSET = /\.(png|jpg|jpeg|gif|svg|webp|ico|pdf|mp4|webm|woff2?)$/i;
function scanDeadFiles(repo: string): Finding[] {
  const all = tracked(repo);
  const assets = all.filter((f) => ASSET.test(f) && !f.startsWith("_archive/"));
  if (!assets.length) return [];
  const text = all.filter((f) => !ASSET.test(f)).map((f) => { try { return readFileSync(join(repo, f), "utf8"); } catch { return ""; } }).join("\n");
  return assets.filter((a) => !text.includes(basename(a))).map((a) => ({ kind: "files", file: a, detail: "orphaned — referenced nowhere" }));
}

// ── scanner: 📦 deps (package.json deps that don't resolve on npm) ────────────
const depCache = new Map<string, boolean>();
async function npmExists(name: string): Promise<boolean> {
  if (depCache.has(name)) return depCache.get(name)!;
  let ok = true;
  try { const r = await fetch(`https://registry.npmjs.org/${name.replace("/", "%2F")}`, { method: "GET" }); ok = r.status !== 404; } catch { ok = true; /* network down → don't false-alarm */ }
  depCache.set(name, ok);
  return ok;
}
async function scanDeps(repo: string): Promise<Finding[]> {
  const out: Finding[] = [];
  const pkgs = tracked(repo, "package.json").concat(tracked(repo, "*/package.json")).filter((f) => !f.includes("node_modules") && !f.startsWith("_archive/"));
  for (const p of [...new Set(pkgs)]) {
    let j: any;
    try { j = JSON.parse(readFileSync(join(repo, p), "utf8")); } catch { continue; }
    const deps = { ...(j.dependencies ?? {}), ...(j.devDependencies ?? {}) };
    for (const name of Object.keys(deps)) {
      if (deps[name]?.startsWith?.("workspace:") || deps[name]?.startsWith?.("file:") || deps[name]?.startsWith?.("link:")) continue;
      if (!(await npmExists(name))) out.push({ kind: "deps", file: p, detail: `${name} → not found on npm` });
    }
  }
  return out;
}

// ── run all scanners on one repo ─────────────────────────────────────────────
async function scanRepo(repo: string) {
  const want = (k: string) => only.length === 0 || only.includes(k);
  const findings: Finding[] = [];
  if (want("links")) findings.push(...scanLinks(repo));
  if (want("secrets")) findings.push(...scanSecrets(repo));
  if (want("files")) findings.push(...scanDeadFiles(repo));
  if (want("deps")) findings.push(...(await scanDeps(repo)));
  return findings;
}

const LABEL: Record<string, string> = { links: "🔗 Links", secrets: "🔑 Secrets", files: "🗑  Dead files", deps: "📦 Deps" };
const NEXT: Record<string, string> = {
  links: "broken/gitignored link(s) — wrong paths or targets that ship nowhere",
  secrets: "possible committed secret(s) — REVIEW each; rotate the key if real",
  files: "orphaned asset(s) — referenced nowhere; safe to prune",
  deps: "dependency(ies) that don't resolve on npm — fix before install",
};
function summarize(name: string, findings: Finding[]) {
  const by: Record<string, Finding[]> = {};
  for (const f of findings) (by[f.kind] = by[f.kind] || []).push(f);
  const cats = only.length ? only : ["links", "secrets", "files", "deps"];
  console.log(`\n📋  tidy — ${name}\n`);
  for (const k of cats) console.log(`  ${LABEL[k].padEnd(14)} ${(by[k]?.length ?? 0) === 0 ? "clean" : `${by[k].length} found`}`);
  const dirty = cats.filter((k) => by[k]?.length);
  if (!dirty.length) { console.log(`\n  ✓ no rot detected. This repo is tidy.\n`); return; }
  console.log(`\n  Recommended next steps:`);
  for (const k of dirty) console.log(`   • ${LABEL[k]}: ${by[k].length} ${NEXT[k]}`);
  // show a few details per dirty category (capped so it never overwhelms)
  for (const k of dirty) {
    console.log(`\n  ${LABEL[k]} — first ${Math.min(5, by[k].length)} of ${by[k].length}:`);
    for (const f of by[k].slice(0, 5)) console.log(`     ${f.file}  ·  ${f.detail}`);
    if (by[k].length > 5) console.log(`     …and ${by[k].length - 5} more (re-run with --${k} for the full list)`);
  }
  console.log(`\n  What next?  drill in: ${dirty.map((k) => `--${k}`).join(" ")}   ·   then clean with: --fix (shows each change first)\n`);
}

// ── main ─────────────────────────────────────────────────────────────────────
if (flag("--fix")) {
  console.log("--fix is the confirmed-cleanup mode (shows each change before applying). Not wired in this build yet — report-first is live; fixing lands next. Run without --fix to see the rot.");
  process.exit(0);
}

if (allDir) {
  // multi-repo: every git repo directly under allDir
  const root = resolve(allDir);
  const repos = readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && isRepo(join(root, e.name)))
    .map((e) => join(root, e.name));
  const rows: { name: string; counts: Record<string, number>; total: number }[] = [];
  for (const repo of repos) {
    const f = await scanRepo(repo);
    const counts: Record<string, number> = {};
    for (const x of f) counts[x.kind] = (counts[x.kind] ?? 0) + 1;
    rows.push({ name: basename(repo), counts, total: f.length });
  }
  rows.sort((a, b) => b.total - a.total);
  if (json) { console.log(JSON.stringify(rows, null, 2)); process.exit(0); }
  console.log(`\n📋  tidy — ${repos.length} repos under ${allDir}\n`);
  console.log(`  ${"repo".padEnd(28)} 🔗   🔑   🗑    📦`);
  for (const r of rows) console.log(`  ${r.name.padEnd(28)} ${String(r.counts.links ?? 0).padStart(3)}  ${String(r.counts.secrets ?? 0).padStart(3)}  ${String(r.counts.files ?? 0).padStart(3)}  ${String(r.counts.deps ?? 0).padStart(3)}${r.total === 0 ? "   ✓ tidy" : ""}`);
  const dirty = rows.filter((r) => r.total);
  console.log(`\n  ${dirty.length}/${repos.length} repos have rot. Drill into one:  bun scripts/tidy.ts <repo-path>\n`);
  process.exit(0);
}

// single repo
const repo = resolve(target);
if (!isRepo(repo)) { console.error(`✗ not a git repo: ${repo}`); process.exit(2); }
const findings = await scanRepo(repo);
if (json) { console.log(JSON.stringify(findings, null, 2)); process.exit(0); }
summarize(basename(repo), findings);
process.exit(0);
