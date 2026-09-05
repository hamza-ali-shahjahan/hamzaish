// idea-gate.test.ts — pins the gate's scoring, and especially its failure modes.
//
// The tests that matter most here are the ones proving the gate can go RED on plausible
// input. A checker that only rejects blank fields is theatre: the real failure mode is a
// form full of confident mush, and `check-validation` shipped two false-greens (2026-08-14)
// for exactly this reason. So: the shipped template must fail, vague answers must fail,
// and one item's text must never satisfy another's.
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REQUIRED_QUOTES,
  countQuotes,
  evaluateIdeaGate,
  field,
  parseStatus,
  section,
} from "./idea-gate";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** A form that passes every item — the baseline each failure test mutates. */
const GOOD = `# Ideation Gate — Example

## Status
- **Status**: \`locked\`
- **Locked**: 2026-09-06

## 1. ICP + watering hole
**Who**: Solo immigration attorneys in the US filing 5-40 I-130s a year.
**Where**:
- r/immigrationlaw (18k members)
- The AILA member directory

## 2. The pain, in their words
### 2026-08-01 — r/immigrationlaw thread
> I spend more time chasing clients for documents than filing.
### 2026-08-02 — G2 review of Docketwise
> The intake forms are fine but nothing tells me what is missing.
### 2026-08-03 — call notes, solo practitioner
> My paralegal rebuilds the same checklist for every single case.

## 3. Current workaround + its cost
**What they do today**: A Google Sheet checklist per case, copied by hand.
**What it costs them**: Roughly 4 hours a week of paralegal time.

## 4. Demand hypothesis
> At least 8% of solo immigration attorneys reached via r/immigrationlaw will hand over an email when told it catches missing documents before filing.

## 5. Kill condition
Stop if conversion stays under 2% after 600 qualified reach across 3 channels.

## 6. Cheapest test
**The artifact**: A one-page landing page with an email capture.
**Qualified reach needed**: 600 qualified visitors
**Window**: 3 weeks
`;

/** Replace one `## N.` section's body, leaving the rest of the form intact. */
function replaceSection(form: string, n: number, body: string): string {
  const lines = form.split("\n");
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${n}\\.\\s`).test(l));
  const rest = lines.slice(start + 1);
  const offset = rest.findIndex((l) => /^#{1,2}\s/.test(l));
  const end = offset === -1 ? lines.length : start + 1 + offset;
  return [...lines.slice(0, start + 1), body, ...lines.slice(end)].join("\n");
}

describe("the shipped template must not pass", () => {
  // The template is the thing every new product starts from. If it passes, the gate is
  // decorative from day one.
  test("products/_template/validation/idea-gate.md fails every item", () => {
    const template = readFileSync(
      resolve(root, "products", "_template", "validation", "idea-gate.md"),
      "utf8",
    );
    const v = evaluateIdeaGate(template);
    expect(v.pass).toBe(false);
    expect(v.failed).toHaveLength(6);
  });
});

describe("a complete form passes", () => {
  test("all six items", () => {
    const v = evaluateIdeaGate(GOOD);
    expect(v.failed.map((f) => f.n)).toEqual([]);
    expect(v.pass).toBe(true);
    expect(v.status).toBe("locked");
  });
});

describe("item 1 — the watering hole is load-bearing", () => {
  test("a named ICP with no reachable place fails", () => {
    const v = evaluateIdeaGate(
      replaceSection(GOOD, 1, "**Who**: Solo immigration attorneys.\n**Where**:\n"),
    );
    expect(v.failed.map((f) => f.n)).toContain(1);
    expect(v.failed.find((f) => f.n === 1)?.reason).toMatch(/watering hole/i);
  });

  test("a placeholder bullet is not a place", () => {
    const v = evaluateIdeaGate(
      replaceSection(GOOD, 1, "**Who**: Solo attorneys.\n**Where**:\n- TODO\n- ...\n"),
    );
    expect(v.failed.map((f) => f.n)).toContain(1);
  });

  test("a placeholder Who fails even with a real place", () => {
    const v = evaluateIdeaGate(
      replaceSection(GOOD, 1, "**Who**: TODO\n**Where**:\n- r/immigrationlaw\n"),
    );
    expect(v.failed.map((f) => f.n)).toContain(1);
  });
});

describe("item 2 — three verbatim quotes, each with a source", () => {
  test("two quotes fail", () => {
    const v = evaluateIdeaGate(
      replaceSection(
        GOOD,
        2,
        "### 2026-08-01 — thread\n> One real quote.\n### 2026-08-02 — review\n> Another real quote.\n",
      ),
    );
    expect(v.failed.map((f) => f.n)).toContain(2);
    expect(v.failed.find((f) => f.n === 2)?.reason).toContain(`2/${REQUIRED_QUOTES}`);
  });

  test("a source heading with no blockquote is not a quote", () => {
    const body =
      "### 2026-08-01 — thread\nThey said documents are a pain.\n" +
      "### 2026-08-02 — review\n> A real quote.\n" +
      "### 2026-08-03 — call\n> Another real quote.\n";
    expect(countQuotes(section(replaceSection(GOOD, 2, body), 2))).toBe(2);
  });

  test("a commented-out example quote never counts", () => {
    const body =
      "<!--\n### YYYY-MM-DD — source\n> example quote\n-->\n" +
      "### 2026-08-02 — review\n> A real quote.\n" +
      "### 2026-08-03 — call\n> Another real quote.\n";
    const v = evaluateIdeaGate(replaceSection(GOOD, 2, body));
    expect(v.failed.map((f) => f.n)).toContain(2);
  });

  test("paraphrase in the quote slot still needs the blockquote shape", () => {
    expect(countQuotes("### source\n> TODO\n")).toBe(0);
  });
});

describe("item 3 — both halves of the workaround", () => {
  test("the workaround without its cost fails", () => {
    const v = evaluateIdeaGate(
      replaceSection(GOOD, 3, "**What they do today**: A Google Sheet per case.\n"),
    );
    expect(v.failed.map((f) => f.n)).toContain(3);
    expect(v.failed.find((f) => f.n === 3)?.reason).toMatch(/costs them/i);
  });
});

describe("item 4 — a number, committed in advance", () => {
  test("a hypothesis with no number fails", () => {
    const v = evaluateIdeaGate(
      replaceSection(
        GOOD,
        4,
        "> Lots of solo attorneys reached via Reddit will hand over an email when told it catches missing documents.\n",
      ),
    );
    expect(v.failed.map((f) => f.n)).toContain(4);
    expect(v.failed.find((f) => f.n === 4)?.reason).toMatch(/threshold/i);
  });

  test("a half-filled template sentence fails", () => {
    const v = evaluateIdeaGate(
      replaceSection(GOOD, 4, "> At least 8% of TODO reached via TODO will TODO.\n"),
    );
    expect(v.failed.map((f) => f.n)).toContain(4);
  });

  // Section scoping: item 5's threshold must not satisfy item 4.
  test("a number elsewhere in the form does not satisfy item 4", () => {
    const v = evaluateIdeaGate(
      replaceSection(GOOD, 4, "> Some meaningful share of attorneys will sign up.\n"),
    );
    expect(v.failed.map((f) => f.n)).toContain(4);
  });
});

describe("item 5 — falsifiable, not a mood", () => {
  test("a vibe fails", () => {
    const v = evaluateIdeaGate(
      replaceSection(GOOD, 5, "Stop if it doesn't feel promising after a while.\n"),
    );
    expect(v.failed.map((f) => f.n)).toContain(5);
    expect(v.failed.find((f) => f.n === 5)?.reason).toMatch(/mood/i);
  });

  test("a comparison without a bare digit passes", () => {
    const v = evaluateIdeaGate(
      replaceSection(GOOD, 5, "Stop if conversion stays below the paid-ads baseline.\n"),
    );
    expect(v.failed.map((f) => f.n)).not.toContain(5);
  });
});

describe("item 6 — the denominator", () => {
  test("reach without a number fails", () => {
    const v = evaluateIdeaGate(
      replaceSection(
        GOOD,
        6,
        "**The artifact**: A landing page.\n**Qualified reach needed**: enough to be sure\n**Window**: 3 weeks\n",
      ),
    );
    expect(v.failed.map((f) => f.n)).toContain(6);
    expect(v.failed.find((f) => f.n === 6)?.reason).toMatch(/denominator/i);
  });

  test("a missing window fails", () => {
    const v = evaluateIdeaGate(
      replaceSection(
        GOOD,
        6,
        "**The artifact**: A landing page.\n**Qualified reach needed**: 600 visitors\n",
      ),
    );
    expect(v.failed.map((f) => f.n)).toContain(6);
    expect(v.failed.find((f) => f.n === 6)?.reason).toMatch(/window/i);
  });
});

describe("structural readings", () => {
  test("a missing section is reported, not crashed on", () => {
    const v = evaluateIdeaGate("# Ideation Gate — Empty\n");
    expect(v.pass).toBe(false);
    expect(v.failed).toHaveLength(6);
    expect(v.failed.every((f) => /missing from the form/.test(f.reason ?? ""))).toBe(true);
  });

  test("status defaults to draft when absent", () => {
    expect(parseStatus("# no status here")).toBe("draft");
  });

  // Status is reported but never gates: a form can be complete and still unlocked, and
  // locking a form full of TODOs must not buy a pass.
  test("status does not decide the verdict", () => {
    expect(evaluateIdeaGate(GOOD.replace("`locked`", "`draft`")).pass).toBe(true);
  });

  test("field ignores placeholder values", () => {
    expect(field("**Who**: TODO", "Who")).toBe("");
    expect(field("**Who**: <segment>", "Who")).toBe("");
    expect(field("**Who**: Solo attorneys", "Who")).toBe("Solo attorneys");
  });
});
