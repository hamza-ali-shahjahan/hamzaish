#!/usr/bin/env bun
// check-decisions.ts — a decision record must say what it BEAT and what would prove it
// WRONG, as a ratchet.
//
// The defect this exists for: CLAUDE.md hard rule #3 already specifies the shape of a
// decision record (date + decision + why + what-would-prove-it-wrong + revisit-trigger)
// and nothing checks it. Rules that live only in prose decay silently — which is the
// same failure the check ladder exists to fix (operating principle 15: a lesson that
// can be a check becomes a check).
//
// The `alternatives` requirement comes from deepseek-ai/deepseek-harness, studied
// 2026-08-16, whose agent-note gate makes "## Alternatives considered" mandatory with a
// one-line rationale worth keeping verbatim: "A decision recorded without what it beat
// invites re-litigation — the failure Agent Notes exist to prevent." That repo carries
// 688 such records under the gate. Ours carries 12, which is exactly when the format is
// cheap to fix.
//
// Why a ratchet: 5 of 12 existing records predate the rule. Same treatment as
// check-evals and check-limitations — grandfather by name, coverage only goes up.
//
//   exit 1 when:
//     • a compliant record LOSES a required element (regression)
//     • a NEW decision record is missing any required element
//   info only:
//     • the grandfathered backlog + compliance %
//
// Usage: bun run check-decisions          # report + gate
//        bun run check-decisions --quiet  # gate only (CI)
//        bun run check-decisions --init   # write the manifest ONCE from disk state
//        bun run check-decisions --self-test
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const quiet = process.argv.includes("--quiet");
const log = (s: string) => { if (!quiet) console.log(s); };

/**
 * The four elements CLAUDE.md rule #3 requires, plus `alternatives`.
 *
 * Patterns are broad on WORDING and strict on PRESENCE — a record must show the
 * thinking, not use the house phrase. The label forms below are all real shapes found
 * in this repo's own records, which is why the matcher is built rather than hand-written:
 *
 *   **Decision:** …            colon inside the bold
 *   **Decision.** …            period inside the bold (2026-07-05-live-path-goal)
 *   - **Decision**: …          colon outside the bold (the product template)
 *   5. **Not adopted:** …      inside a numbered list (2026-07-30-external-repo-mining)
 *   ## Decision                a heading
 */
function label(alternatives: string): RegExp {
  // line start · optional quote/list marker · optional bold · LABEL · optional bold · : or .
  const inline = `^[\\s>]*(?:[-*+]|\\d+[.)])?\\s*\\**\\s*(?:${alternatives})\\s*\\**\\s*[:.]`;
  const heading = `^#{1,4}\\s+.*(?:${alternatives})`;
  return new RegExp(`${inline}|${heading}`, "im");
}

export const ELEMENTS = {
  decision: label("decision"),
  why: label("why|rationale"),
  alternatives: label(
    "alternatives?(?: considered)?|not adopted|rejected|options considered|what it beat|considered and rejected",
  ),
  wrongIf: label("wrong if|what would prove (?:it|this) wrong|falsifiers?|disconfirming signal"),
  revisit: label("revisit(?:[- ]trigger)?|review trigger"),
} as const;

export type ElementName = keyof typeof ELEMENTS;

export function missingElements(markdown: string): ElementName[] {
  return (Object.keys(ELEMENTS) as ElementName[]).filter((k) => !ELEMENTS[k].test(markdown));
}

// ── self-test: deterministic anchor, no repo state ─────────────────────────────
if (process.argv.includes("--self-test")) {
  const complete = [
    "# 2026-01-01 — thing",
    "**Decision:** did X.",
    "**Why:** because Y.",
    "**Alternatives considered:** Z, rejected because slow.",
    "**Wrong if:** metric stays flat by March.",
    "**Revisit:** at the next quarterly review.",
  ].join("\n\n");
  const bare = "# 2026-01-01 — thing\n\nWe did X because Y.";
  const okComplete = missingElements(complete).length === 0;
  const okBare = missingElements(bare).length === 5;
  // The house's own alternate wording must pass — "Not adopted" is how the real records read.
  const okHouse = !missingElements("**Not adopted:** the other thing").includes("alternatives");
  if (okComplete && okBare && okHouse) {
    console.log("self-test: PASS (complete record clean, bare record missing all five, house wording accepted)");
    process.exit(0);
  }
  console.error(`self-test: FAIL (complete=${okComplete} bare=${okBare} house=${okHouse})`);
  process.exit(1);
}

// ── inventory: factory decisions + every product's decisions ───────────────────
// Templates are excluded: a template is the SHAPE of a record, not a decision, and
// gating it would force it to carry filled-in content it exists to leave blank.
const isTemplate = (slug: string, file: string) => slug === "_template" || /^0000-template\.md$/.test(file);

type Record_ = { id: string; path: string; rel: string };
const records: Record_[] = [];

const factoryLog = join(root, "brain", "decision-log");
if (existsSync(factoryLog)) {
  for (const f of readdirSync(factoryLog)) {
    if (!f.endsWith(".md") || f.startsWith("_") || f === "README.md" || isTemplate("", f)) continue;
    records.push({ id: `brain/${f}`, path: join(factoryLog, f), rel: `brain/decision-log/${f}` });
  }
}
const productsRoot = join(root, "products");
if (existsSync(productsRoot)) {
  for (const slug of readdirSync(productsRoot)) {
    const dir = join(productsRoot, slug, "decisions");
    try {
      if (!statSync(dir).isDirectory()) continue;
    } catch {
      continue;
    }
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".md") || f === "README.md" || isTemplate(slug, f)) continue;
      records.push({ id: `${slug}/${f}`, path: join(dir, f), rel: `products/${slug}/decisions/${f}` });
    }
  }
}

const compliant = new Set(records.filter((r) => missingElements(readFileSync(r.path, "utf8")).length === 0).map((r) => r.id));

// ── manifest: the ratchet's memory ─────────────────────────────────────────────
const manifestPath = join(root, "meta", "decision-format-coverage.json");
type Manifest = { _comment: string; compliant: string[]; grandfathered: string[] };

if (process.argv.includes("--init")) {
  if (existsSync(manifestPath)) {
    console.error(`refusing to overwrite ${manifestPath} — delete it deliberately if you mean to reset the ratchet`);
    process.exit(1);
  }
  const m: Manifest = {
    _comment:
      "Ratchet for check-decisions.ts (CLAUDE.md rule #3 + alternatives). `compliant` = has all five elements " +
      "(losing one fails CI). `grandfathered` = predates the rule; move a name up when you complete it. " +
      "A NEW decision record must be complete — it cannot join grandfathered.",
    compliant: records.filter((r) => compliant.has(r.id)).map((r) => r.id).sort(),
    grandfathered: records.filter((r) => !compliant.has(r.id)).map((r) => r.id).sort(),
  };
  writeFileSync(manifestPath, `${JSON.stringify(m, null, 2)}\n`);
  console.log(`wrote ${manifestPath} — compliant=${m.compliant.length} grandfathered=${m.grandfathered.length}`);
  process.exit(0);
}

if (!existsSync(manifestPath)) {
  console.error(`missing ${manifestPath} — run: bun run check-decisions --init`);
  process.exit(1);
}
const manifest: Manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const wasCompliant = new Set(manifest.compliant);
const grandfathered = new Set(manifest.grandfathered);

const fails: string[] = [];
const warns: string[] = [];

for (const r of records) {
  const missing = missingElements(readFileSync(r.path, "utf8"));
  if (wasCompliant.has(r.id)) {
    if (missing.length > 0) fails.push(`${r.rel}: was complete, now missing ${missing.join(", ")}`);
    continue;
  }
  if (grandfathered.has(r.id)) continue;
  // new record
  if (missing.length > 0) {
    fails.push(`${r.rel}: new decision record missing ${missing.join(", ")} (CLAUDE.md rule #3 + alternatives)`);
  } else {
    warns.push(`${r.id}: new and complete — add it to compliant[] in meta/decision-format-coverage.json`);
  }
}
for (const id of [...wasCompliant, ...grandfathered]) {
  if (!records.some((r) => r.id === id)) warns.push(`${id}: in manifest but not on disk (stale entry)`);
}

const promoted = [...grandfathered].filter((id) => compliant.has(id));

// ── report ─────────────────────────────────────────────────────────────────────
const total = records.length;
const done = records.filter((r) => compliant.has(r.id)).length;
log(`decision-record format: ${done}/${total} (${total ? Math.round((done / total) * 100) : 0}%) carry all five elements`);
log(`  required: decision · why · alternatives · wrong-if · revisit`);
if (promoted.length > 0) log(`\n  ↑ promoted (move into compliant[]): ${promoted.join(", ")}`);
if (!quiet && grandfathered.size > 0) {
  const list = [...grandfathered].filter((id) => !compliant.has(id)).sort();
  if (list.length > 0) {
    log(`\n  backlog (${list.length}) — grandfathered:`);
    for (const id of list) {
      const r = records.find((x) => x.id === id);
      const miss = r ? missingElements(readFileSync(r.path, "utf8")) : [];
      log(`    ${id} — missing ${miss.join(", ")}`);
    }
  }
}
for (const w of warns) log(`  warn: ${w}`);

if (fails.length > 0) {
  console.error(`\n✗ check-decisions: ${fails.length} problem(s)`);
  for (const f of fails) console.error(`  • ${f}`);
  process.exit(1);
}
log(`\n✓ check-decisions: no regressions, every new record complete`);
