// Sentry — Edge runtime init (middleware + edge routes). Loaded by instrumentation.ts.
// Same contract as sentry.server.config.ts: no DSN → no init, SDK stays inert.

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    debug: false,
  });
}
