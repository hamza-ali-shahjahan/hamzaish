// Every branch of the copy-vs-customized decision — the logic that stops global
// command copies from rotting after upgrades without ever clobbering user edits.
import { describe, expect, test } from "bun:test";
import { decideCommandAction } from "./command-refresh";

const H = { a: "hash-a", b: "hash-b", c: "hash-c" };

describe("decideCommandAction", () => {
  test("missing dest → install", () => {
    expect(decideCommandAction({ destExists: false, srcHash: H.a, force: false })).toBe("install");
  });

  test("identical copy → skip (and caller records the hash — migrates pre-manifest installs)", () => {
    expect(decideCommandAction({ destExists: true, destHash: H.a, srcHash: H.a, force: false })).toBe("skip");
  });

  test("factory moved ahead, user never touched (dest == manifest) → refresh", () => {
    expect(
      decideCommandAction({ destExists: true, destHash: H.a, srcHash: H.b, manifestHash: H.a, force: false }),
    ).toBe("refresh");
  });

  test("user customized (dest != manifest), no force → keep-customized, never clobber", () => {
    expect(
      decideCommandAction({ destExists: true, destHash: H.c, srcHash: H.b, manifestHash: H.a, force: false }),
    ).toBe("keep-customized");
  });

  test("user customized + --refresh-commands → force-refresh (explicit consent)", () => {
    expect(
      decideCommandAction({ destExists: true, destHash: H.c, srcHash: H.b, manifestHash: H.a, force: true }),
    ).toBe("force-refresh");
  });

  test("pre-manifest install that differs (no manifest entry), no force → keep-customized (can't prove it's safe)", () => {
    expect(decideCommandAction({ destExists: true, destHash: H.c, srcHash: H.b, force: false })).toBe("keep-customized");
  });

  test("pre-manifest install that differs + force → force-refresh", () => {
    expect(decideCommandAction({ destExists: true, destHash: H.c, srcHash: H.b, force: true })).toBe("force-refresh");
  });
});
