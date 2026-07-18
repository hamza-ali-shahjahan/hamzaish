// Sentry — browser init. Next.js loads this file by convention (no import needed).
// Same contract as the server/edge configs: no DSN → no init, SDK stays inert.

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    // Session Replay is off by default: it ships a large bundle and carries real
    // privacy weight. Turn it on deliberately, once you know you want it.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    debug: false,
  });
}
