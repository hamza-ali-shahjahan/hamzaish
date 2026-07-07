#!/usr/bin/env bun
// scripts/check-mcp-config.ts
//
// Static MCP-config scanner — the `/security-check` § 7 backend.
// Treats MCP/agent configs as an attack surface: inline secrets, over-broad
// permissions, and unpinned/plaintext server sources are the cheap, high-signal
// mistakes AI-generated repos ship silently.
//
// Idea ported from metaharness's `mcp-scan` ("npm audit for agent tools") —
// see references/README.md § metaharness. Idea only; this implementation is ours.
//
// Usage:
//   bun scripts/check-mcp-config.ts <repo-dir | config-file> [more files…]
//
// Exit codes: 0 = clean (warnings allowed), 1 = at least one FAIL.
// Never prints a secret value — key names + masked prefixes only.

import { existsSync, readFileSync, statSync } from "fs";
import { join, resolve } from "path";

type Finding = { level: "FAIL" | "WARN"; file: string; where: string; msg: string };
const findings: Finding[] = [];
const scanned: string[] = [];

// Well-known config locations, relative to a repo root.
const CANDIDATES = [
  ".mcp.json",
  "mcp.json",
  ".claude/settings.json",
  ".claude/settings.local.json",
  ".cursor/mcp.json",
  "claude_desktop_config.json",
];

// Values that are clearly real credentials, not placeholders.
const SECRET_PREFIXES =
  /^(sk-ant-|sk-|sk_live_|pk_live_|rk_live_|ghp_|gho_|ghs_|github_pat_|xox[bpoas]-|AKIA|ASIA|re_|sbp_|whsec_|glpat-|ntn_|shpat_|eyJ[A-Za-z0-9_-]{10,})/;
const PLACEHOLDER =
  /(\$\{|\byour[_-]?|xxx|placeholder|example|change[-_]?me|dummy|<[^>]*>|^\s*$|123456|to[-_]?do|redacted)/i;

const OVERBROAD_ALLOW = new Set(["*", "Bash", "Bash(*)", "Bash(*:*)", "mcp__*"]);

function mask(v: string): string {
  return v.length <= 6 ? "•••" : `${v.slice(0, 4)}…(${v.length} chars)`;
}

function looksSecret(value: string): boolean {
  if (typeof value !== "string" || PLACEHOLDER.test(value)) return false;
  if (SECRET_PREFIXES.test(value)) return true;
  // Long, high-entropy-ish opaque token with no spaces: suspicious in an env block.
  return value.length >= 24 && !/\s/.test(value) && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}

function checkEnvBlock(file: string, serverName: string, blockName: string, block: unknown) {
  if (!block || typeof block !== "object") return;
  for (const [key, value] of Object.entries(block as Record<string, unknown>)) {
    if (typeof value === "string" && looksSecret(value)) {
      findings.push({
        level: "FAIL",
        file,
        where: `${serverName}.${blockName}.${key}`,
        msg: `inline credential (${mask(value)}) — reference the env var NAME and load it from the environment/secrets backend, never the value`,
      });
    }
  }
}

function checkServers(file: string, servers: unknown) {
  if (!servers || typeof servers !== "object") return;
  for (const [name, raw] of Object.entries(servers as Record<string, unknown>)) {
    const s = (raw ?? {}) as Record<string, unknown>;
    checkEnvBlock(file, name, "env", s.env);
    checkEnvBlock(file, name, "headers", s.headers);

    const url = typeof s.url === "string" ? s.url : "";
    if (url.startsWith("http://") && !/^http:\/\/(localhost|127\.0\.0\.1)/.test(url)) {
      findings.push({
        level: "FAIL",
        file,
        where: `${name}.url`,
        msg: `plaintext remote MCP server (${url}) — tool calls and tokens travel unencrypted; use https`,
      });
    }

    const args = Array.isArray(s.args) ? (s.args as unknown[]).map(String) : [];
    const cmd = typeof s.command === "string" ? s.command : "";
    if (/(^|\/)(npx|bunx|pnpm|uvx)$/.test(cmd)) {
      const movingTag = args.find((a) => /@(latest|next|canary|main|master)$/.test(a));
      if (movingTag) {
        findings.push({
          level: "WARN",
          file,
          where: `${name}.args`,
          msg: `MCP server pulled at a moving tag (${movingTag}) — pin a version, same rule as GitHub Action pinning`,
        });
      }
    }
  }
}

function checkPermissions(file: string, cfg: Record<string, unknown>) {
  const perms = (cfg.permissions ?? {}) as Record<string, unknown>;
  const allow = Array.isArray(perms.allow) ? (perms.allow as unknown[]).map(String) : [];
  for (const entry of allow) {
    if (OVERBROAD_ALLOW.has(entry)) {
      findings.push({
        level: "FAIL",
        file,
        where: `permissions.allow`,
        msg: `over-broad allowlist entry "${entry}" — default-deny; allow specific commands/tools, never a wildcard`,
      });
    }
  }
  if (perms.defaultMode === "bypassPermissions" || cfg.dangerouslySkipPermissions === true) {
    findings.push({
      level: "FAIL",
      file,
      where: `permissions`,
      msg: `permission prompting disabled (bypassPermissions) — every tool call runs unreviewed`,
    });
  }
}

function scanFile(path: string) {
  let cfg: Record<string, unknown>;
  try {
    cfg = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    findings.push({ level: "WARN", file: path, where: "-", msg: "unparseable JSON — scan it by hand" });
    scanned.push(path);
    return;
  }
  scanned.push(path);
  checkServers(path, cfg.mcpServers);
  // claude_desktop_config.json nests under the same key; .mcp.json may be flat {servers:…}
  checkServers(path, (cfg as Record<string, unknown>).servers);
  checkPermissions(path, cfg);
}

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error("usage: bun scripts/check-mcp-config.ts <repo-dir | config-file> [more…]");
  process.exit(2);
}

for (const input of inputs) {
  const p = resolve(input);
  if (!existsSync(p)) {
    console.error(`not found: ${input}`);
    process.exit(2);
  }
  if (statSync(p).isDirectory()) {
    for (const rel of CANDIDATES) {
      const candidate = join(p, rel);
      if (existsSync(candidate)) scanFile(candidate);
    }
  } else {
    scanFile(p);
  }
}

if (scanned.length === 0) {
  console.log("✅ no MCP configs found — nothing to scan");
  process.exit(0);
}

let fails = 0;
for (const f of findings) {
  if (f.level === "FAIL") fails++;
  console.log(`${f.level === "FAIL" ? "❌ FAIL" : "⚠️  WARN"} ${f.file} [${f.where}] — ${f.msg}`);
}
console.log(
  `${fails > 0 ? "❌" : "✅"} scanned ${scanned.length} config(s): ${fails} FAIL, ${findings.length - fails} WARN`
);
process.exit(fails > 0 ? 1 : 0);
