// Sentry — Node.js server runtime init. Loaded by instrumentation.ts register().
//
// Uses process.env directly rather than @/lib/env: this file is imported at the
// very start of the server lifecycle (and its edge twin runs in a runtime with no
// Node globals), so it must not depend on the zod schema module booting first.
//
// No DSN → init() is never called and the SDK stays inert. That's the local-first
// default (LOCAL_MODE): `bun dev` with zero env must not phone home or throw.

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Trace 10% of transactions in prod, everything in dev.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    environment: process.env.NODE_ENV,
    // Tie every event to the deployed commit so a Sentry issue maps to a diff.
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    debug: false,
  });
}
