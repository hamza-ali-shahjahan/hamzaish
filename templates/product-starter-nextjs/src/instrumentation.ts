// Next.js instrumentation hook — THE reason Sentry actually runs.
//
// Without this file, @sentry/nextjs can sit in package.json, wrap the build via
// withSentryConfig, and declare a DSN in the env schema while Sentry.init() is
// never called: the product presents as instrumented and captures zero errors.
// That exact gap shipped in this starter until 2026-07-15. src/__tests__/sentry-init.test.ts
// is the canary that fails if register() ever stops calling init again.
//
// LOCATION IS LOAD-BEARING: this file MUST live at src/instrumentation.ts because
// this app lives in src/app/. At the project root Next.js silently ignores it — no
// warning, no error, a green build, and zero error capture. It was placed at the
// root first and the mocked unit test passed anyway; only firing a real error at a
// running server (verify-live A11) caught it. If you ever move this file, A11 is
// what tells you.
//
// register() runs once per server runtime at startup; onRequestError forwards
// server-side render/route errors that Next catches (these do NOT surface as
// uncaught exceptions, so without this hook they never reach Sentry).

import * as Sentry from '@sentry/nextjs';

export async function register() {
  // The sentry.*.config.ts files stay at the project root — that is where the
  // Sentry webpack plugin looks for them — so these reach up out of src/.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
