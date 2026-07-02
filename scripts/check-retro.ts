#!/usr/bin/env bun
// check-retro.ts — the retro discipline, enforced mechanically.
//
// The gap this exists for: the 2026-07-02 factory audit found ONE retro filed
// (2026-05-30) against a year that included four product launches, a buildathon,
// and two major factory pivots. meta/retros/README.md says when to write one;
// nothing made it happen. This does: every changelog entry dated on/after the
// ratchet date must either link a real file in meta/retros/ or carry an explicit
// `**Retro:** skipped — <reason>` line. Skipping stays legal — skipping *silently*
// doesn't (same shape as check-validation's record-the-debt rule).
//
//   exit 0 = every post-ratchet entry has a retro link (file exists) or a dated skip
//   exit 1 = a post-ratchet entry has neither
//
// Usage: bun run check-retro            # report + gate
//        bun run check-retro --quiet    # gate only (CI); print on failure
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const quiet = process.argv.includes("--quiet");
const log = (s: string) => { if (!quiet) console.log(s); };

// Entries before this date are history; the rule applies from here forward.
const RATCHET_DATE = "2026-07-02";

const changelog = readFileSync(join(root, "meta", "changelog.md"), "utf8");
// Headers: ## YYYY-MM-DD — vX.Y · title
const headerRe = /^##\s+(\d{4}-\d{2}-\d{2})\s+—\s+(v[\d.]+)\s+·\s+(.*)$/gm;
const headers = [...changelog.matchAll(headerRe)];

const fails: string[] = [];
let checked = 0;
for (let i = 0; i < headers.length; i++) {
  const [, date, version] = headers[i];
  if (date < RATCHET_DATE) continue;
  checked++;
  const start = headers[i].index! + headers[i][0].length;
  const end = i + 1 < headers.length ? headers[i + 1].index! : changelog.length;
  const body = changelog.slice(start, end);

  const retroLink = body.match(/meta\/retros\/([\w.-]+\.md)/);
  const explicitSkip = /\*\*Retro:\*\*\s*skipped\s*—/i.test(body);

  if (retroLink) {
    if (!existsSync(join(root, "meta", "retros", retroLink[1])))
      fails.push(`${version} (${date}): links meta/retros/${retroLink[1]} but the file doesn't exist`);
  } else if (!explicitSkip) {
    fails.push(`${version} (${date}): no retro link and no explicit skip — add a meta/retros/ entry (10 lines is fine) or a \`**Retro:** skipped — <reason>\` line`);
  }
}

log(`changelog entries on/after ${RATCHET_DATE}: ${checked} checked`);
if (fails.length === 0) {
  log("✓ every post-ratchet entry has a retro or a recorded skip.");
  process.exit(0);
}
console.error(`✗ check-retro: ${fails.length} entr${fails.length === 1 ? "y" : "ies"} missing retro discipline:`);
for (const f of fails) console.error(`  • ${f}`);
process.exit(1);
