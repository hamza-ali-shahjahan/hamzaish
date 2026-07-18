import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

// The Sentry canary — live half. Paired with verify-live.ts A11.
//
// Proves, against the REAL deploy, that an error actually reaches a real Sentry
// project: init ran, the DSN is set in the deployed env, and the transport works.
// Reading the source can never prove this — the pre-2026-07-15 starter had Sentry
// in package.json, in next.config.mjs, and in env.ts, and captured nothing.
//
// Gated on a shared secret, and 404s when SENTRY_CANARY_TOKEN is unset — so it
// does not exist as an attack surface unless you deliberately turn it on. It
// captures an exception rather than throwing one: capture returns an event id we
// can assert on, and flush() proves the event left the process instead of dying
// in a queue when the lambda froze.

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const token = process.env.SENTRY_CANARY_TOKEN;

  // Unconfigured → this route does not exist. No token, no oracle, no surface.
  if (!token) return new NextResponse('Not Found', { status: 404 });
  if (req.headers.get('x-canary-token') !== token) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // The exact defect class this canary exists to catch: the product believes it
    // is instrumented and is not. Loud, not silent.
    return NextResponse.json(
      { error: 'sentry_not_configured', detail: 'NEXT_PUBLIC_SENTRY_DSN is unset in this deploy' },
      { status: 503 },
    );
  }

  const nonce = new URL(req.url).searchParams.get('nonce') ?? 'no-nonce';
  const eventId = Sentry.captureException(
    new Error(`sentry-canary: verify-live A11 probe (nonce=${nonce})`),
  );

  // If init() never ran, capture returns an id but nothing is queued and flush
  // resolves instantly against an empty client — so assert delivery, not just id.
  const flushed = await Sentry.flush(5000);

  return NextResponse.json({ captured: Boolean(eventId), eventId, flushed, nonce });
}
