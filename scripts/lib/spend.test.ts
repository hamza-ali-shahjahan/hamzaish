import { describe, expect, test } from "bun:test";
import { parseClaudeJson, capReached, recordSession, spendLine, ledgerLine, sumLedger } from "./spend";

describe("parseClaudeJson", () => {
  test("reads total_cost_usd from a result object", () => {
    const out = JSON.stringify({ type: "result", total_cost_usd: 1.2345, num_turns: 12, result: "done" });
    const c = parseClaudeJson(out);
    expect(c.parsed).toBe(true);
    expect(c.costUsd).toBe(1.2345);
    expect(c.turns).toBe(12);
    expect(c.resultText).toBe("done");
  });

  test("accepts the legacy cost_usd field name", () => {
    const c = parseClaudeJson(JSON.stringify({ cost_usd: 0.5 }));
    expect(c.parsed).toBe(true);
    expect(c.costUsd).toBe(0.5);
  });

  test("last JSON line wins over earlier noise", () => {
    const out = [
      "some log noise",
      JSON.stringify({ total_cost_usd: 0.1 }),
      JSON.stringify({ total_cost_usd: 0.9 }),
    ].join("\n");
    expect(parseClaudeJson(out).costUsd).toBe(0.9);
  });

  test("pretty-printed multi-line JSON parses via fallback", () => {
    const out = JSON.stringify({ total_cost_usd: 2.5, result: "ok" }, null, 2);
    const c = parseClaudeJson(out);
    expect(c.parsed).toBe(true);
    expect(c.costUsd).toBe(2.5);
  });

  test("garbage → parsed:false, costUsd 0 (caller warns, never crashes)", () => {
    const c = parseClaudeJson("segfault\nnot json at all");
    expect(c.parsed).toBe(false);
    expect(c.costUsd).toBe(0);
  });
});

describe("cap arithmetic", () => {
  test("capReached only at/above the cap, and never with cap 0 (explicitly uncapped)", () => {
    expect(capReached({ spentUsd: 24.99, capUsd: 25 })).toBe(false);
    expect(capReached({ spentUsd: 25, capUsd: 25 })).toBe(true);
    expect(capReached({ spentUsd: 26, capUsd: 25 })).toBe(true);
    expect(capReached({ spentUsd: 999, capUsd: 0 })).toBe(false);
  });

  test("recordSession accumulates and ignores negative costs", () => {
    let s = { spentUsd: 0, capUsd: 10 };
    s = recordSession(s, 1.5);
    s = recordSession(s, -3); // a parse bug must never DECREASE spend
    s = recordSession(s, 0.25);
    expect(s.spentUsd).toBe(1.75);
  });

  test("spendLine matches the tick-discipline shape", () => {
    expect(spendLine({ spentUsd: 3.5, capUsd: 25 })).toBe("spend $3.50/$25.00");
  });
});

describe("ledger", () => {
  test("round-trips entries and sums with slug + since filters", () => {
    const lines = [
      ledgerLine({ ts: "2026-07-14T01:00:00Z", slug: "ventbox", session: 1, model: "sonnet", costUsd: 1 }),
      ledgerLine({ ts: "2026-07-18T01:00:00Z", slug: "ventbox", session: 2, model: "sonnet", costUsd: 2 }),
      ledgerLine({ ts: "2026-07-18T02:00:00Z", slug: "dnsdoctor", session: 1, model: "sonnet", costUsd: 4 }),
      "{ half-written garbage",
    ].join("\n");
    expect(sumLedger(lines)).toBe(7);
    expect(sumLedger(lines, { slug: "ventbox" })).toBe(3);
    expect(sumLedger(lines, { sinceIso: "2026-07-15T00:00:00Z" })).toBe(6);
    expect(sumLedger(lines, { slug: "ventbox", sinceIso: "2026-07-15T00:00:00Z" })).toBe(2);
  });

  test("empty ledger sums to 0", () => {
    expect(sumLedger("")).toBe(0);
  });
});
