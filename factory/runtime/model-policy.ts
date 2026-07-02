// Hamzaish — model-policy resolution (Movement 1, brick #4: the policy, wired)
//
// factory/model-policy.md was Phase 1 "declarative — the orchestrator does not
// yet read it." This module is the wiring: each agent's SKILL.md now carries a
// `model_tier:` frontmatter line (the policy's single source of truth, kept
// next to the agent it governs), and any spawner — the runtime loop, a Workflow
// step, an orchestrator using the Agent tool — resolves the model here instead
// of guessing.
//
// Escalation (the policy's Phase 2 rule, now active): stakes beat role. A task
// that touches auth, payments, migrations, RLS/permissions, or data deletion
// runs on the top tier regardless of the agent's default.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..", "..");
const AGENTS_ROOT = join(ROOT, "factory", "agents");

export const DEFAULT_MODEL = "sonnet"; // the policy's Tier B workhorse
export const TOP_TIER = "opus";
const VALID = new Set(["opus", "sonnet", "haiku"]);

/** Parse a SKILL.md's frontmatter `model_tier:` line. Null if absent/invalid. */
export function tierFromSkillMd(skillMdPath: string): string | null {
  let src: string;
  try { src = readFileSync(skillMdPath, "utf8"); } catch { return null; }
  const fm = src.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const m = fm[1].match(/^model_tier:\s*(\S+)\s*$/m);
  if (!m || !VALID.has(m[1])) return null;
  return m[1];
}

/** Locate an agent by folder name across the stage dirs. Null if not found. */
export function findAgentSkillMd(agentName: string): string | null {
  for (const stage of readdirSync(AGENTS_ROOT)) {
    const stageDir = join(AGENTS_ROOT, stage);
    try { if (!statSync(stageDir).isDirectory()) continue; } catch { continue; }
    const candidate = join(stageDir, agentName, "SKILL.md");
    try { if (statSync(candidate).isFile()) return candidate; } catch { /* keep looking */ }
  }
  return null;
}

/**
 * The one call a spawner makes: which model should this agent run on?
 * Unknown agent or missing tier → DEFAULT_MODEL (Tier B), never a crash —
 * the policy is a routing preference, not a precondition.
 */
export function modelForAgent(agentName: string): string {
  const md = findAgentSkillMd(agentName);
  if (!md) return DEFAULT_MODEL;
  return tierFromSkillMd(md) ?? DEFAULT_MODEL;
}

export type Stakes = "normal" | "high";

/**
 * Stakes-escalation (policy Phase 2, active): high-stakes work — auth, payments,
 * billing, database migrations, RLS/permissions, data deletion, anything a
 * product's decisions/ marks irreversible — runs on the top tier regardless of
 * the agent's default. Escalation only goes UP; a high-stakes task never
 * de-escalates below the agent's own tier.
 */
export function escalate(model: string, stakes: Stakes): string {
  return stakes === "high" ? TOP_TIER : model;
}

/** Sniff obvious high-stakes markers in a task prompt (belt-and-suspenders; callers should pass stakes explicitly when they know). */
export function stakesFromPrompt(prompt: string): Stakes {
  return /\b(auth|authentication|oauth|payment|billing|stripe|migration|migrate\b|RLS|row.level.security|delete (user|data|account)|drop table)\b/i.test(prompt)
    ? "high"
    : "normal";
}
