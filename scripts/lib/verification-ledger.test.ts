import { describe, expect, test } from "bun:test";
import {
  GENESIS,
  appendRecord,
  hashRecord,
  parseLedger,
  renderChecked,
  verifyChain,
  type VerificationRecord,
} from "./verification-ledger";

const base = { ts: "2026-08-16T10:00:00Z", cmd: "bun run check-counts", durationMs: 120 };

function chain(...gates: Array<{ gate: string; exitCode: number }>): VerificationRecord[] {
  const out: VerificationRecord[] = [];
  for (const g of gates) out.push(appendRecord(out, { ...base, ...g }));
  return out;
}

describe("appendRecord / verifyChain", () => {
  test("first record links to genesis and a clean chain verifies", () => {
    const records = chain({ gate: "check-counts", exitCode: 0 }, { gate: "check-evals", exitCode: 0 });
    expect(records[0]!.prev).toBe(GENESIS);
    expect(records[1]!.prev).toBe(records[0]!.hash);
    expect(verifyChain(records)).toEqual({ ok: true });
  });

  test("an empty chain is vacuously intact", () => {
    expect(verifyChain([])).toEqual({ ok: true });
  });

  test("editing a recorded exit code breaks the chain", () => {
    const records = chain({ gate: "check-counts", exitCode: 1 });
    // The tampering this whole file exists to catch: turning a real failure into a pass.
    const tampered = [{ ...records[0]!, exitCode: 0 }];
    const status = verifyChain(tampered);
    expect(status.ok).toBe(false);
    if (!status.ok) expect(status.brokenAt).toBe(0);
  });

  test("deleting a middle record breaks the chain", () => {
    const records = chain(
      { gate: "a", exitCode: 0 },
      { gate: "b", exitCode: 1 },
      { gate: "c", exitCode: 0 },
    );
    const status = verifyChain([records[0]!, records[2]!]);
    expect(status.ok).toBe(false);
    if (!status.ok) expect(status.brokenAt).toBe(1);
  });

  test("hashing is stable across identical bodies", () => {
    const body = { ...base, gate: "x", exitCode: 0, prev: GENESIS };
    expect(hashRecord(body)).toBe(hashRecord({ ...body }));
  });
});

describe("renderChecked", () => {
  test("an empty ledger says nothing was verified — silence is a visible claim", () => {
    const line = renderChecked([]);
    expect(line.clean).toBe(false);
    expect(line.text).toBe("nothing was verified — no check was run this session");
  });

  test("all-pass renders the gate names and is clean", () => {
    const line = renderChecked(chain({ gate: "check-counts", exitCode: 0 }, { gate: "check-evals", exitCode: 0 }));
    expect(line.clean).toBe(true);
    expect(line.passed).toEqual(["check-counts", "check-evals"]);
    expect(line.text).toBe("check-counts, check-evals were run and passed");
  });

  test("a failure is never renderable as a pass", () => {
    const line = renderChecked(chain({ gate: "check-counts", exitCode: 0 }, { gate: "check-evals", exitCode: 1 }));
    expect(line.clean).toBe(false);
    expect(line.failed).toEqual(["check-evals"]);
    expect(line.text).toContain("FAILED");
  });

  test("a re-run after a fix supersedes the earlier failure", () => {
    const line = renderChecked(chain({ gate: "check-counts", exitCode: 1 }, { gate: "check-counts", exitCode: 0 }));
    expect(line.clean).toBe(true);
    expect(line.passed).toEqual(["check-counts"]);
  });

  test("a broken chain renders as altered, never as success", () => {
    const records = chain({ gate: "check-counts", exitCode: 1 });
    const line = renderChecked([{ ...records[0]!, exitCode: 0 }]);
    expect(line.clean).toBe(false);
    expect(line.text).toContain("altered");
  });
});

describe("parseLedger", () => {
  test("reads whole records and drops corrupt lines", () => {
    const good = JSON.stringify(chain({ gate: "a", exitCode: 0 })[0]);
    expect(parseLedger(`${good}\nnot json\n\n{"gate":"b"}\n`)).toHaveLength(1);
  });
});
