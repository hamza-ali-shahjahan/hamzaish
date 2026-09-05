// scripts/lib/idea-gate.ts — ideation-gate parsing + scoring (pure).
//
// The form is products/<slug>/validation/idea-gate.md; the gate decides whether an idea
// is TESTABLE — whether a null result from a validation attempt would mean anything.
//
// The failure mode this targets is vagueness, not absence. A blank form is obvious and
// harmless; a form full of plausible mush ("SMBs who care about compliance", "if it
// doesn't feel promising") passes a naive presence check and then produces an
// uninterpretable attempt three weeks later. So every item is checked for a specific
// SHAPE, not just for having text:
//
//   1  a watering hole (a named place), not just an audience adjective
//   2  three quotes, each with a source heading AND a blockquote line
//   3  both halves — what they do today, and what it costs
//   4  a real number in the hypothesis (a threshold set after seeing data isn't one)
//   5  a falsifiable stopping condition: a number or a comparison, never a mood
//   6  artifact + qualified reach + window (reach is the denominator; see below)
//
// The denominator is why item 6 demands a number: 12 signups from 60 qualified reach is
// 20% (a traffic problem), 12 from 6,000 is 0.2% (a wrong message or wrong ICP). Same
// numerator, opposite actions. Without a denominator "no demand" is unfalsifiable.
//
// Inherited from lib/validation-ledger.ts's two false-greens (2026-08-14): HTML comments
// are stripped before anything is counted, so the template's own guidance can never be
// read as content, and each section is scoped so one item's text can't satisfy another's.
//
// Pure functions only; check-idea-gate.ts does the filesystem walk.

/** The six items, in form order. Keys double as section numbers. */
export const ITEMS = [
  { n: 1, key: "icp", title: "ICP + watering hole" },
  { n: 2, key: "quotes", title: "The pain, in their words" },
  { n: 3, key: "workaround", title: "Current workaround + its cost" },
  { n: 4, key: "hypothesis", title: "Demand hypothesis" },
  { n: 5, key: "kill", title: "Kill condition" },
  { n: 6, key: "test", title: "Cheapest test" },
] as const;

export type ItemKey = (typeof ITEMS)[number]["key"];

export type ItemResult = {
  n: number;
  key: ItemKey;
  title: string;
  pass: boolean;
  /** Why it failed, phrased as what to do. Absent when it passes. */
  reason?: string;
};

export type GateVerdict = {
  status: "draft" | "locked" | (string & {});
  items: ItemResult[];
  /** True only when every item passes. Status is reported, never gating — see below. */
  pass: boolean;
  failed: ItemResult[];
};

/**
 * Text that looks filled but isn't. The template seeds `TODO`; humans and agents leave
 * ellipses, angle brackets, and underscores. Checked per-value, not per-file, so one
 * real answer never covers for a placeholder elsewhere.
 */
const PLACEHOLDER = /^(todo\b|tbd\b|\.\.\.|…|_{2,}|<.*>|\[.*\]|n\/?a$|xxx+$)/i;

/** Strip HTML comments so template guidance is never read as an answer. */
export function strip(text: string): string {
  return text.replace(/<!--[\s\S]*?-->/g, "");
}

/**
 * Slice out one `## N. Title` section, up to the next `##`/`#` heading (`###` subheadings
 * belong to the section, since item 2's quotes are `###` blocks).
 */
export function section(text: string, n: number): string {
  const lines = strip(text).split("\n");
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${n}\\.\\s`).test(l));
  if (start === -1) return "";
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^#{1,2}\s/.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n");
}

/** Read a `**Label**: value` field's value from a section. Empty when missing or placeholder. */
export function field(sectionText: string, label: string): string {
  const m = sectionText.match(new RegExp(`\\*\\*${label}\\*\\*\\s*:?\\s*(.*)`, "i"));
  const value = (m?.[1] ?? "").trim();
  return PLACEHOLDER.test(value) ? "" : value;
}

/** Non-empty, non-placeholder bullet lines. */
export function bullets(sectionText: string): string[] {
  return sectionText
    .split("\n")
    .filter((l) => /^\s*[-*]\s+/.test(l))
    .map((l) => l.replace(/^\s*[-*]\s+/, "").trim())
    .filter((v) => v.length > 0 && !PLACEHOLDER.test(v));
}

export function parseStatus(text: string): GateVerdict["status"] {
  return (strip(text).match(/\*\*Status\*\*\s*:?\s*`?([a-z-]+)`?/i)?.[1] ?? "draft").toLowerCase();
}

/** Item 2: a quote is a `###` heading (the source) followed by a `>` line before the next heading. */
export function countQuotes(sectionText: string): number {
  const lines = sectionText.split("\n");
  let quotes = 0;
  for (let i = 0; i < lines.length; i++) {
    const heading = lines[i].match(/^###\s+(.+)/);
    if (!heading || PLACEHOLDER.test(heading[1].trim())) continue;
    for (let j = i + 1; j < lines.length && !/^#{1,3}\s/.test(lines[j]); j++) {
      const quoted = lines[j].match(/^>\s*(.+)/);
      if (quoted && !PLACEHOLDER.test(quoted[1].trim())) {
        quotes++;
        break;
      }
    }
  }
  return quotes;
}

/** Minimum verbatim quotes for item 2 — see /idea-gate for why paraphrase is banned. */
export const REQUIRED_QUOTES = 3;

/** Any explicit number: a percentage, a count, a currency figure, or a written ratio. */
const HAS_NUMBER = /\d/;
/** A comparison, for kill conditions expressed without a bare number. */
const HAS_COMPARISON = /\b(under|below|above|over|less than|fewer than|more than|at least|no more than|<|>|≤|≥)\b/i;

function ok(item: (typeof ITEMS)[number]): ItemResult {
  return { n: item.n, key: item.key, title: item.title, pass: true };
}
function bad(item: (typeof ITEMS)[number], reason: string): ItemResult {
  return { n: item.n, key: item.key, title: item.title, pass: false, reason };
}

export function evaluateIdeaGate(text: string): GateVerdict {
  const status = parseStatus(text);
  const items: ItemResult[] = [];

  // 1 — ICP + watering hole. The watering hole is the load-bearing half: without a place
  // to reach 100 of them, no attempt can be run at all.
  {
    const item = ITEMS[0];
    const s = section(text, 1);
    const who = field(s, "Who");
    const where = bullets(s);
    if (!s) items.push(bad(item, "section `## 1.` is missing from the form."));
    else if (!who) items.push(bad(item, "no **Who** — name the segment, not an adjective (\"small businesses\" is not an ICP)."));
    else if (where.length === 0)
      items.push(bad(item, "no watering hole — list at least one specific place you can reach ~100 of them (a subreddit, a directory, a title search, a list). Without it the idea cannot be tested at all."));
    else items.push(ok(item));
  }

  // 2 — three verbatim quotes with sources. Paraphrase is where the author's hypothesis
  // replaces the evidence, which makes every downstream item circular.
  {
    const item = ITEMS[1];
    const s = section(text, 2);
    const quotes = countQuotes(s);
    if (!s) items.push(bad(item, "section `## 2.` is missing from the form."));
    else if (quotes < REQUIRED_QUOTES)
      items.push(bad(item, `${quotes}/${REQUIRED_QUOTES} verbatim quotes — each needs a \`###\` source heading and a \`>\` quote line. Paraphrase doesn't count; if three people can't be found saying it, that is the finding.`));
    else items.push(ok(item));
  }

  // 3 — the workaround and what it costs. No workaround usually means a feature idea.
  {
    const item = ITEMS[2];
    const s = section(text, 3);
    const today = field(s, "What they do today");
    const cost = field(s, "What it costs them");
    if (!s) items.push(bad(item, "section `## 3.` is missing from the form."));
    else if (!today) items.push(bad(item, "no **What they do today** — every real problem is already being solved badly. If you can't name the workaround, this is probably a feature idea."));
    else if (!cost) items.push(bad(item, "no **What it costs them** — the workaround's cost is also your pricing anchor."));
    else items.push(ok(item));
  }

  // 4 — a hypothesis with a real number, locked before the data exists.
  {
    const item = ITEMS[3];
    const s = section(text, 4);
    const claim = s
      .split("\n")
      .filter((l) => /^>\s*\S/.test(l))
      .map((l) => l.replace(/^>\s*/, "").trim())
      .join(" ");
    const filled = claim.replace(/\bTODO\b/gi, "").trim();
    if (!s) items.push(bad(item, "section `## 4.` is missing from the form."));
    else if (!filled || /\bTODO\b/i.test(claim))
      items.push(bad(item, "hypothesis still has TODOs — write it as one locked sentence: \"At least X% of [ICP] reached via [channel] will [action] when told [message].\""));
    else if (!HAS_NUMBER.test(filled))
      items.push(bad(item, "no number in the hypothesis — a threshold chosen after seeing the data is not a threshold. Commit to a rate now."));
    else items.push(ok(item));
  }

  // 5 — a falsifiable stopping condition. "If it doesn't feel promising" is not one.
  {
    const item = ITEMS[4];
    const s = section(text, 5);
    const body = s
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !/^[-*]\s*$/.test(l) && !PLACEHOLDER.test(l))
      .join(" ");
    if (!s) items.push(bad(item, "section `## 5.` is missing from the form."));
    else if (!body) items.push(bad(item, "no kill condition — write what result makes you stop, before you look at anything."));
    else if (!HAS_NUMBER.test(body) && !HAS_COMPARISON.test(body))
      items.push(bad(item, "kill condition isn't falsifiable — it needs a number or a comparison. \"If it doesn't feel promising\" is a mood; \"under 2% after 600 qualified reach across 3 channels\" is a condition."));
    else items.push(ok(item));
  }

  // 6 — the cheapest test, and the denominator that makes its rate readable.
  {
    const item = ITEMS[5];
    const s = section(text, 6);
    const artifact = field(s, "The artifact");
    const reach = field(s, "Qualified reach needed");
    const window = field(s, "Window");
    if (!s) items.push(bad(item, "section `## 6.` is missing from the form."));
    else if (!artifact) items.push(bad(item, "no **The artifact** — name the smallest thing that could produce the item-4 signal. If the answer is \"a working product\", the test hasn't been found yet."));
    else if (!reach || !HAS_NUMBER.test(reach))
      items.push(bad(item, "no numeric **Qualified reach needed** — this is the denominator. Without it, \"no demand\" is an unfalsifiable claim."));
    else if (!window) items.push(bad(item, "no **Window** — an attempt without a closing date drifts instead of concluding."));
    else items.push(ok(item));
  }

  const failed = items.filter((i) => !i.pass);
  return { status, items, pass: failed.length === 0, failed };
}
