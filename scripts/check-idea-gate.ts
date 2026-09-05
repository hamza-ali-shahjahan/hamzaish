#!/usr/bin/env bun
// check-idea-gate.ts — is this idea TESTABLE enough to earn a validation attempt?
//
// Reads products/<slug>/validation/idea-gate.md and scores its six items.
//   exit 0 = testable — go design the shot portfolio
//   exit 1 = not testable yet (or no form), with the specific items named
//   exit 2 = usage error
//
// This gate does NOT judge whether an idea is good — that's what the attempt is for. It
// asks whether a null result would mean anything. An untestable idea burns a whole
// validation cycle and produces no learning, because you can't tell "the idea was wrong"
// from "the test was unspecifiable".
//
// Like check-validation it is a SPEED BUMP, not a wall: nothing stops you running an
// attempt on a failing form. What it stops is doing so *without noticing*. Full guidance
// and the six items: factory/commands/idea-gate.md (/idea-gate).
//
// Usage: bun run check-idea-gate <slug>
//        bun run check-idea-gate --all
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateIdeaGate, ITEMS } from "./lib/idea-gate";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const all = args.includes("--all");
const slug = args.find((a) => !a.startsWith("-"));

if (!all && !slug) {
  console.error("usage: bun run check-idea-gate <slug>    (or --all)");
  process.exit(2);
}

const formPath = (s: string) => resolve(root, "products", s, "validation", "idea-gate.md");

/** One product. Returns true when the gate passes. */
function check(s: string, quiet = false): boolean {
  const path = formPath(s);
  if (!existsSync(path)) {
    if (!quiet) {
      console.error(`✗ ${s}: no ideation gate at products/${s}/validation/idea-gate.md`);
      console.error("  → seed one: cp products/_template/validation/idea-gate.md products/" + s + "/validation/idea-gate.md");
      console.error("  → then fill the six items (see /idea-gate)");
    }
    return false;
  }

  const { status, items, pass, failed } = evaluateIdeaGate(readFileSync(path, "utf8"));
  const score = `${items.length - failed.length}/${items.length}`;

  if (pass) {
    console.log(`✓ ${s}: ideation gate ${score} — testable. Status: ${status}.`);
    if (status !== "locked") {
      console.log("  Note: status is still `draft`. Set it to `locked` with today's date — a hypothesis you can still edit isn't a precommitment.");
    }
    console.log("  Next: design the shot portfolio (≥3 channels, ≥2 message angles, the item-6 reach, ≥1 ICP re-cut).");
    return true;
  }

  console.error(`✗ ${s}: ideation gate ${score} — not testable yet.`);
  for (const f of failed) console.error(`  · Item ${f.n} (${f.title}) — ${f.reason}`);
  if (!quiet) {
    console.error("");
    console.error("  A null result from an untestable idea is unreadable — you can't tell a wrong idea");
    console.error("  from an unspecifiable test. Fill the items above before spending reach.");
    console.error("  Running the attempt anyway is allowed; doing it without noticing is what this prevents.");
  }
  return false;
}

if (!all) {
  process.exit(check(slug!) ? 0 : 1);
}

// --all: a portfolio view. Reports every product, and exits 1 if any tracked form fails —
// products with no form at all are listed separately, since "never gated" and "gated and
// failing" are different states and collapsing them is how a backlog goes invisible.
const slugs = readdirSync(join(root, "products"))
  .filter((e) => !e.startsWith("_") && existsSync(join(root, "products", e, "product.config.json")))
  .sort();

const withForm = slugs.filter((s) => existsSync(formPath(s)));
const withoutForm = slugs.filter((s) => !existsSync(formPath(s)));

let failures = 0;
for (const s of withForm) if (!check(s, true)) failures++;

if (withoutForm.length > 0) {
  console.log("");
  console.log(`○ ${withoutForm.length} product(s) with no ideation gate yet — never gated, not failed:`);
  console.log(`  ${withoutForm.join(", ")}`);
}

console.log("");
console.log(`ideation gate: ${withForm.length - failures}/${withForm.length} passing · ${withoutForm.length} ungated`);
process.exit(failures > 0 ? 1 : 0);
