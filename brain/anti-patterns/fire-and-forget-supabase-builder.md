---
name: fire-and-forget-supabase-builder
description: Discarding a supabase-js query builder (`void supabase.from(...).insert(...)`) — builders are lazy thenables, so nothing is ever sent; the analytics call is dead code that looks alive
type: anti-pattern
---

# Fire-and-Forget Supabase Builder

## The pattern

An analytics or logging call is meant to be non-blocking, so the code discards the promise:

```ts
void supabase.from('events').insert({ type: 'view', ... });
```

It looks like a fired-and-forgotten HTTP request. It is not. supabase-js query builders are **lazy thenables** — building the query does nothing; the request is only dispatched when something consumes the thenable (`await`, `.then()`, `.catch()`). `void builder` consumes nothing, so **no request is ever sent**. Not a failed request, not a rejected one — zero network activity, silently, on every call, forever.

The pattern is extra-deceptive because the surrounding code keeps running: sessionStorage writes, counters, and other side effects around the dead call all execute normally, so the logger *looks* alive in every code-level inspection.

## Why we don't do it

**Incident 2026-07-12 (ThousandWorlds Explorer):** the Explorer's client event logger shipped as exactly this — `void supabase.from('events').insert(...)`. Its client analytics were dead code from day one. Two things masked it:

1. **Side effects looked alive.** The sessionStorage bookkeeping around the insert ran fine, so reading the code (and re-reading it) showed a working logger.
2. **DB-trigger rows faked a heartbeat.** An audit had concluded "events work for signed-in users" — but those rows were written by a database trigger on signup, server-side. The trigger's rows were indistinguishable in the table from what the client logger *would* have written, so the DB contents "confirmed" a logger that had never sent a byte.

The bug was found only by a **network-level check**: the browser performance API showed zero fetches to `*.supabase.co` while the surrounding code demonstrably executed. No amount of code reading or DB inspection had caught it.

## What to do instead

**1. Always consume the builder.** For genuine fire-and-forget, attach a no-op rejection handler (which also prevents unhandled-rejection noise):

```ts
supabase.from('events').insert({...}).then(null, () => {});
```

or `await` it where the flow allows.

**2. Verify telemetry at the network layer, never by reading code or querying the destination table.** Open the network tab (or use the performance API) and watch the request leave the client. The response status is itself diagnostic: a **401 means the client sent and the server rejected** (e.g. an RLS policy — in the ThousandWorlds case the post-fix 401 was the *expected* pre-migration state); **no request at all means the client never sends**. Those are wildly different bugs, and only network-level observation distinguishes them.

**3. Distrust destination-side evidence when triggers exist.** Any table that a DB trigger also writes to cannot prove the client logger works — attribute rows to their writer before counting them as verification.

## When this might not apply

- Code paths that `await` or `.then()` the builder are fine — the anti-pattern is specifically the discarded thenable.
- Other clients with the same lazy-thenable design (some ORMs, query builders) inherit the same rule: "fire-and-forget" must still consume the promise.

## Related

- Learnings source: the 2026-07-12 ThousandWorlds sprint (client-analytics audit).
- Same family as silent-`catch(() => {})`-swallowed failures: code that cannot fail loudly must be verified by observing behavior, not by reading it.
