# Enforce the Invariant — deleting a capability is not removing it

You removed something for a reason: it cost money, it leaked data, it was slow. You deleted the calls, updated the comments, and review passed. Six weeks later it is back, added in good faith by someone who never knew why it left — because nothing stopped them.

> **Status: scar tissue.** Earned on Patently (`products/copyright`), 2026-08-20, removing a metered API from every user-facing path. Companion to [`spend-belongs-to-a-customer.md`](./spend-belongs-to-a-customer.md), which is about *who* may spend; this one is about making any such decision stick.

## The principle

> **When you remove a capability for safety or cost, add a check that fails if it comes back.**

A deletion is a state. A check is a property. Only one of them survives contact with a growing codebase and a team that turns over.

This is the [lesson-to-check ladder](../../../AGENTS.md) applied to *architecture* rather than to a single defect: hook → CI guard → eval case → prose. Most teams stop at prose.

## Three things that look like enforcement and are not

### 1. An environment variable

`PATENT_BQ_FALLBACK=1` existed, defaulted off, and was documented. It is not a boundary — it is a switch a server can flip, and the whole reason the capability was removed was that a server should not have that power. **Delete the variable, don't default it to off.** A flag you can turn on is a feature, not a wall.

### 2. A comment

Comments are read by people who already agree with you. The person who breaks the invariant is the one who did not read that file.

### 3. Deleting the call sites

You will miss one. On Patently, every call to the metered SDK was deleted and the SDK was still in the module graph, because one module used `import type { X } from "the-sdk"`. That import is erased at compile time — so it could not actually *run* anything — but it sat one keystroke from a value import, in a file reachable from a user request. Nobody reading a diff catches that.

## How to enforce it

**Give the forbidden thing exactly one home.** One module imports the SDK. Everything else that needs it goes through that module's gate. Split anything the boundary does not need — on Patently, credential *parsing* moved into its own SDK-free module so the health route could report configuration status without importing the client.

**Then check the import graph, not the call sites.** Reachability is the property that survives refactoring; "is it called" is not.

```bash
bun run check-boundaries
```

`scripts/check-import-boundaries.ts` reads `.import-boundaries.json`, globs each boundary's roots, walks the real import graph, and fails the build with the offending chain.

```json
{
  "boundaries": [{
    "name": "no metered SDK from user-facing paths",
    "forbidden": ["@some/metered-sdk"],
    "roots": ["src/app/**/route.ts", "src/lib/tools/**/*.ts"],
    "allow": ["src/app/api/admin/approve/route.ts"],
    "why": "Costs $1.41 a call. Acquisition is approval-gated — see ADR-0006."
  }]
}
```

Four things make it hold rather than rot:

- **Glob the roots.** A hand-maintained list of entry points silently loses coverage as the app grows. Patently's first version listed ten roots; the app had thirty-nine.
- **Name the exceptions in config.** An exception in config is a decision. An exception in someone's head is a hole.
- **Write `why` down.** The next person needs to know whether they are violating a boundary or the boundary has genuinely moved.
- **Know what type-only means.** `import type` is erased — it cannot load a module or break an install. A *dependency* boundary must ignore those edges or it reports failures that cannot happen. An *adjacency* boundary may want them. Choose per boundary; the default is value-only, the runtime truth.

## Prove the check can fail

A green check proves nothing until you have watched it go red. Add the violation deliberately, watch it fail, then remove it:

```bash
printf 'import { x } from "@some/metered-sdk";\n' > src/lib/tools/probe-tmp.ts
bun run check-boundaries   # must exit 1 and name the file
rm src/lib/tools/probe-tmp.ts
```

Doing this on the factory's own zero-dependency boundary caught two mistakes in the config within ten minutes — roots too broad, and type-only edges wrongly counted. A checker that cries wolf is worse than no checker, and you only find out by trying to make it cry.

## Where this fits

| Removing something because… | Then… |
|---|---|
| it costs money per call | gate it on a payer, and boundary-check the paths ([spend-belongs-to-a-customer](./spend-belongs-to-a-customer.md)) |
| it touches data it should not | one module owns it; boundary-check the rest |
| it breaks a portability promise | boundary-check the promise (the factory checks its own zero-dependency claim) |
| it is merely deprecated | a comment is fine — no invariant to protect |

The last row matters. Not every deletion needs a check; **the ones where re-adding it would be a mistake rather than a preference** do.

## Checklist

- [ ] The forbidden thing has exactly one home
- [ ] Anything the boundary doesn't need has been split out of that home
- [ ] A boundary is declared in config, with globbed roots and a written `why`
- [ ] Exceptions are listed in config, not assumed
- [ ] Type-only handling is chosen deliberately per boundary
- [ ] The check has been seen to FAIL on a deliberate violation
- [ ] Any env-var version of the old switch is deleted, not defaulted off

## Provenance

Authored 2026-08-20 from the Patently local-only-search change (`products/copyright`, decisions `0005`–`0006`, PRs #17/#18). Dogfooded immediately: the factory's own "zero runtime dependencies" promise is now enforced by this check, which found and corrected two errors in its own configuration on first run.

Related anti-patterns: [`env-var-as-an-architectural-boundary`](../../../brain/anti-patterns/env-var-as-an-architectural-boundary.md) · [`silence-as-a-failure-mode`](../../../brain/anti-patterns/silence-as-a-failure-mode.md) · [`a-metric-that-cannot-discriminate`](../../../brain/anti-patterns/a-metric-that-cannot-discriminate.md)
