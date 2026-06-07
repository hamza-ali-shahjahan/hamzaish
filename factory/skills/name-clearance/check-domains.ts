#!/usr/bin/env bun
/**
 * check-domains.ts — fast WHOIS availability signal for a candidate brand name
 * across multiple TLDs. Part of the `name-clearance` skill.
 *
 * Usage:
 *   bun check-domains.ts <name> [tld ...]
 *   bun check-domains.ts pediment              # defaults: com ai legal app io co
 *   bun check-domains.ts pediment com legal ai
 *
 * Dependency-free — shells out to the system `whois`. The "AVAILABLE" verdict
 * is a HEURISTIC (registries vary, and some — e.g. .ai/.legal — return sparse
 * data). Always confirm a finalist at a real registrar before relying on it.
 */
import { spawnSync } from "node:child_process";

const TAKEN_HINTS = [/Domain Name:/i, /Creation Date:/i, /Registry Expiry/i, /Registrar:/i, /Name Server:/i];
const FREE_HINTS = [/No match/i, /NOT FOUND/i, /No Data Found/i, /^No entries found/im, /Status:\s*(free|AVAILABLE)/i];

const name = (process.argv[2] || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
const tlds = process.argv.slice(3).length
  ? process.argv.slice(3)
  : ["com", "ai", "legal", "app", "io", "co"];

if (!name) {
  console.error("usage: bun check-domains.ts <name> [tld ...]");
  process.exit(1);
}

console.log(`\nDomain signal for "${name}" (heuristic — confirm finalists at a registrar):\n`);
for (const raw of tlds) {
  const tld = raw.replace(/^\./, "");
  const domain = `${name}.${tld}`;
  const res = spawnSync("whois", [domain], { encoding: "utf8", timeout: 15000 });
  const out = `${res.stdout || ""}${res.stderr || ""}`;
  let status = "unknown";
  if (FREE_HINTS.some((r) => r.test(out))) status = "AVAILABLE ✅";
  else if (TAKEN_HINTS.some((r) => r.test(out))) status = "taken";
  const created = (out.match(/Creation Date:\s*([0-9-]+)/i) || [])[1];
  console.log(`  ${domain.padEnd(26)} ${status}${created ? `  (since ${created})` : ""}`);
}
console.log("");
