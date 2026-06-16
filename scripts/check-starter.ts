#!/usr/bin/env bun
// check-starter.ts — a fresh scaffold must actually install (and optionally boot).
//
// The defect this exists for: on 2026-06-15 the starter shipped `@inngest/sdk@^1.0.0`
// — a package that doesn't exist on npm (404). Every scaffolded product failed
// `bun install` at step one; the "first win in 5 minutes" was dead on arrival, and
// nobody caught it because the template was READ, not RUN. A scaffold/template is
// only "done" when a fresh scaffold genuinely installs.
//
//   exit 0 = a fresh scaffold installs cleanly (every dependency resolves)
//   exit 1 = `bun install` failed — a broken / nonexistent / mis-pinned dependency
//
// Heavier than check-changelog / check-assets (a real install) → CI-tier, not every
// commit. Default is install-only (catches the 404-dep class); --boot adds a live
// `bun dev` HTTP-200 check (the v1.25 "the next scaffold is the live test" promise).
//
//   bun run check-starter            # scaffold + bun install
//   bun run check-starter --boot     # also start bun dev and assert HTTP 200, zero env
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = join(root, "templates", "product-starter-nextjs");
const boot = process.argv.includes("--boot");

if (!existsSync(TEMPLATE)) {
  console.error(`✗ starter template not found: ${TEMPLATE}`);
  process.exit(1);
}

// ── 1. scaffold a fresh copy into a temp dir ───────────────────────────────
const dir = mkdtempSync(join(tmpdir(), "hz-starter-"));
const cleanup = () => rmSync(dir, { recursive: true, force: true });
cpSync(TEMPLATE, dir, { recursive: true });

// ── 2. substitute placeholders the way /scaffold does (valid package name etc.) ──
const SUBS: Record<string, string> = {
  PRODUCT_SLUG: "starter-check", PRODUCT_NAME: "Starter Check", PRODUCT_DESCRIPTION: "CI scaffold check",
  ONE_LINER: "CI scaffold check", CORE_BENEFIT: "ship faster", TARGET_USER: "builders",
  PRODUCT_DOMAIN: "example.com", PRODUCT_URL: "https://example.com", PLACEHOLDER: "placeholder",
};
function walk(d: string): string[] {
  return readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    if (e.name === "node_modules" || e.name === ".git") return [];
    const p = join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
for (const f of walk(dir)) {
  let text: string;
  try { text = readFileSync(f, "utf8"); } catch { continue; }
  if (!text.includes("{{")) continue;
  writeFileSync(f, text.replace(/\{\{([A-Z_]+)\}\}/g, (_, k) => SUBS[k] ?? "placeholder"));
}

// ── 3. bun install — the guard (a dead/nonexistent dependency fails HERE) ───
console.log("→ scaffolded a fresh starter; running `bun install` (the guard)…");
const install = Bun.spawnSync(["bun", "install"], { cwd: dir, stdout: "pipe", stderr: "pipe" });
const log = new TextDecoder().decode(install.stdout) + "\n" + new TextDecoder().decode(install.stderr);
if (install.exitCode !== 0) {
  console.error("✗ `bun install` FAILED on a fresh scaffold — a dependency does not resolve:");
  for (const l of log.split("\n").filter((l) => /error|failed|404/i.test(l)).slice(0, 8)) console.error("    " + l);
  console.error("  → fix the offending dependency in templates/product-starter-nextjs/package.json");
  cleanup();
  process.exit(1);
}
const pkgs = (log.match(/(\d+) packages installed/) ?? [])[1] ?? "?";
console.log(`✓ fresh scaffold installs cleanly (${pkgs} packages).`);

// ── 4. optional --boot: prove `bun dev` serves HTTP 200 with zero env ──────
if (boot) {
  console.log("→ --boot: starting `bun dev` (zero env), asserting HTTP 200…");
  rmSync(join(dir, ".env.local"), { force: true }); // true zero-env
  const port = 4288;
  const dev = Bun.spawn(["bun", "dev"], { cwd: dir, env: { ...process.env, PORT: String(port) }, stdout: "pipe", stderr: "pipe" });
  let served = false;
  for (let i = 0; i < 45; i++) {
    await Bun.sleep(2000);
    try {
      const r = await fetch(`http://localhost:${port}/`);
      if (r.status === 200) { served = true; break; }
    } catch { /* not up yet */ }
  }
  dev.kill();
  await dev.exited;
  if (!served) {
    console.error(`✗ \`bun dev\` did not serve HTTP 200 on :${port} within ~90s (zero env).`);
    cleanup();
    process.exit(1);
  }
  console.log("✓ `bun dev` boots and serves HTTP 200 with zero env.");
}

cleanup();
console.log("✓ starter is launch-ready: a brand-new scaffold works from zero.");
process.exit(0);
