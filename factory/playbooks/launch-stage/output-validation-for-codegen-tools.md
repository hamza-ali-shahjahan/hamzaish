# Output Validation for Code-Gen Tools

When the product is a tool whose **output is code or config** that the consumer runs (migration tools, scaffolders, transpilers, codegen, SDK generators), the natural test surface — unit tests on the tool itself + the tool's own check command — can be **100% green while the output is broken**.

This playbook codifies the rule that caught us on wp-to-astro `0.6.0` (the v0.6.1 patch landed within the hour of post-publish reality testing).

## The trap

Your tool emits files. Your tool's tests pass. Your tool's lint passes. You publish. Real users run the output and it crashes.

**Concrete instance**: wp-to-astro 0.6.0 shipped with `slug: z.string()` in its emitted Astro content-collection schema. Astro reserves `slug` and rejects any schema that includes it. All 138 unit tests passed. All golden-file diffs passed. `astro check` reported 0 errors. The bug was invisible until someone ran `astro dev` on the output — at which point every page 500'd.

**Why `astro check` lied**: it parses `.astro` files only. The migrated output had ZERO `.astro` files at check time (only `.mdx` + a `.ts` schema). "Result (0 files): 0 errors" is what passing looks like when there's nothing to check.

## The rule

**The pre-launch verification must include running the output in a real consumer environment, not just linting it.** The deepest gate the consumer offers is the right gate.

| Wrong gate | Right gate |
|---|---|
| `golden_file_diff(output, expected) && astro check` | `output → astro dev → curl every emitted entity → HTTP 200 across the board` |

## How to apply per product type

| Product shape | Right verification |
|---|---|
| Codegen for an SDK | `npm install` against the consumer's actual import path + `tsc` the consumer's project |
| SQL migration tool | Apply to an ephemeral DB at the consumer's schema version, then run a representative read/write |
| API client generator | Run an actual request against the documented API surface |
| Static-site migration tool (wp-to-astro) | Run the framework's dev server, hit every emitted route, expect 200 |
| Component library generator | Mount each emitted component in a sample app, run visual regression |
| Config-file generator (e.g. CI YAML) | Push to a branch on a sandbox repo, watch the actual CI run |

## Pre-launch checklist (mandatory for codegen products)

- [ ] Tool's own unit tests pass — ✓ but not sufficient
- [ ] Golden-file diffs pass — ✓ but not sufficient
- [ ] Output **runs in a real consumer toolchain** — load-bearing
- [ ] At least one **end-to-end test against a real-world input** (not just synthetic fixtures) — load-bearing
- [ ] The smoke test exercises the **deepest gate the consumer offers** (dev server, real CI run, real DB apply — not just static analysis)
- [ ] If the consumer's check command can return "0 files, 0 errors", you cannot rely on it as your pass signal

## Why this matters

Cost of skipping: silent shipping of broken output → post-publish reality check finds the bug → emergency patch within hours of publish → trust hit with the first 5 users. Cheap to do right, expensive to do wrong.

## Provenance

Surfaced in the `wp-to-astro 0.6.0 → 0.6.1` shipping retro, 2026-05-30. See `meta/retros/2026-05-30-wp-to-astro-shipping.md` and `brain/learnings/2026-05-30.md`.
