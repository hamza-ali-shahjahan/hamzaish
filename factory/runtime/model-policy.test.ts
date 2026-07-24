// Force every path of the model-policy resolver against the real agent tree —
// no Claude calls, filesystem only.
import { describe, expect, test } from "bun:test";
import { modelForAgent, tierFromSkillMd, findAgentSkillMd, escalate, stakesFromPrompt, DEFAULT_MODEL, TOP_TIER, nextTierUp, recommendedFromLeaderboard, routedModel } from "./model-policy";

describe("modelForAgent — the policy, resolved from frontmatter", () => {
  test("Tier A agent resolves to opus (devils-advocate: adversarial reasoning is the job)", () => {
    expect(modelForAgent("devils-advocate")).toBe("opus");
  });
  test("Tier B agent resolves to sonnet (idea-generator: high-volume divergent work)", () => {
    expect(modelForAgent("idea-generator")).toBe("sonnet");
  });
  test("Tier C agent resolves to haiku (scope-guardian: bounded classification)", () => {
    expect(modelForAgent("scope-guardian")).toBe("haiku");
  });
  test("engineering agents are tiered too (security-auditor → opus)", () => {
    expect(modelForAgent("security-auditor")).toBe("opus");
  });
  test("unknown agent falls back to the Tier B default, never crashes", () => {
    expect(modelForAgent("agent-that-does-not-exist")).toBe(DEFAULT_MODEL);
  });
  test("every spawnable agent on disk resolves to a valid model", () => {
    // The wiring claim, asserted: no agent silently missing its tier.
    const { readdirSync, statSync } = require("node:fs");
    const { join, resolve } = require("node:path");
    const agentsRoot = resolve(import.meta.dir, "..", "agents");
    for (const stage of readdirSync(agentsRoot)) {
      const stageDir = join(agentsRoot, stage);
      if (!statSync(stageDir).isDirectory()) continue;
      for (const a of readdirSync(stageDir)) {
        let isAgent = false;
        try { isAgent = statSync(join(stageDir, a, "SKILL.md")).isFile(); } catch {}
        if (!isAgent) continue;
        const skillMd = findAgentSkillMd(a);
        expect(skillMd).not.toBeNull();
        expect(tierFromSkillMd(skillMd!)).not.toBeNull();
      }
    }
  });
});

describe("stakes escalation — policy Phase 2, active", () => {
  test("high stakes escalates any tier to the top", () => {
    expect(escalate("haiku", "high")).toBe(TOP_TIER);
    expect(escalate("sonnet", "high")).toBe(TOP_TIER);
  });
  test("normal stakes keeps the agent's own tier", () => {
    expect(escalate("haiku", "normal")).toBe("haiku");
  });
  test("prompt sniffing flags auth/payments/migrations/RLS", () => {
    expect(stakesFromPrompt("add Stripe billing webhooks")).toBe("high");
    expect(stakesFromPrompt("write the Supabase RLS policies")).toBe("high");
    expect(stakesFromPrompt("run the database migration for teams")).toBe("high");
    expect(stakesFromPrompt("tighten the landing page hero copy")).toBe("normal");
  });
});

describe("cost-to-outcome routing — evidence + cascade (leaderboard-driven)", () => {
  test("nextTierUp climbs cheap→capable and saturates at the top", () => {
    expect(nextTierUp("haiku")).toBe("sonnet");
    expect(nextTierUp("sonnet")).toBe("opus");
    expect(nextTierUp("opus")).toBe("opus"); // already top → unchanged
    expect(nextTierUp("gpt-9")).toBe("gpt-9"); // unknown → unchanged, never crashes
  });

  test("recommendedFromLeaderboard returns a valid recommended model, else null", () => {
    const lb = { skills: { x: { recommended: "haiku" }, y: { recommended: null }, z: { recommended: "gpt-9" } } };
    expect(recommendedFromLeaderboard(lb, "x")).toBe("haiku");
    expect(recommendedFromLeaderboard(lb, "y")).toBeNull();
    expect(recommendedFromLeaderboard(lb, "z")).toBeNull(); // not a valid Claude tier
    expect(recommendedFromLeaderboard(lb, "absent")).toBeNull();
    expect(recommendedFromLeaderboard(null, "x")).toBeNull(); // no leaderboard at all
  });

  test("routedModel prefers measured evidence over the frontmatter tier", () => {
    // devils-advocate is Tier A (opus) by frontmatter; if the bench shows haiku clears
    // the bar, we route haiku — measured capability-per-dollar beats the hand table.
    const lb = { skills: { "devils-advocate": { recommended: "haiku" } } };
    expect(routedModel({ skill: "devils-advocate", agent: "devils-advocate" }, lb)).toBe("haiku");
  });

  test("routedModel falls back to the frontmatter tier when there's no evidence", () => {
    expect(routedModel({ skill: "no-such-skill", agent: "devils-advocate" }, null)).toBe("opus");
  });

  test("routedModel falls back to the Tier B default with neither evidence nor agent", () => {
    expect(routedModel({}, null)).toBe(DEFAULT_MODEL);
  });
});
