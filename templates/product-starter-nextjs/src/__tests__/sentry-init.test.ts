// The Sentry canary — build-time half.
//
// The defect this exists for: from the starter's first commit until 2026-07-15,
// @sentry/nextjs was a dependency, next.config.mjs wrapped the build in
// withSentryConfig, and env.ts declared NEXT_PUBLIC_SENTRY_DSN — but no
// instrumentation.ts existed, so Sentry.init() was NEVER called. Every product
// scaffolded from this starter presented as instrumented and captured zero
// runtime errors. Reading the template could not catch it; only running it can.
//
// These tests assert the two halves of the contract:
//   1. DSN present  → register() calls Sentry.init() with that DSN
//   2. DSN absent   → register() calls nothing and does not throw (LOCAL_MODE)
//
// The live half is verify-live.ts A11, which proves a real error reaches a real
// Sentry project from the real deploy. This half runs on every commit in CI.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const initMock = vi.fn();

vi.mock('@sentry/nextjs', () => ({
  init: (...args: unknown[]) => initMock(...args),
  captureRequestError: vi.fn(),
}));

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  initMock.mockClear();
  vi.resetModules();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('Sentry initialization', () => {
  it('calls Sentry.init with the DSN when one is configured (nodejs runtime)', async () => {
    process.env.NEXT_RUNTIME = 'nodejs';
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://canary@o0.ingest.sentry.io/1';

    const { register } = await import('../instrumentation');
    await register();

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock.mock.calls[0][0]).toMatchObject({
      dsn: 'https://canary@o0.ingest.sentry.io/1',
    });
  });

  it('calls Sentry.init on the edge runtime too', async () => {
    process.env.NEXT_RUNTIME = 'edge';
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://canary@o0.ingest.sentry.io/1';

    const { register } = await import('../instrumentation');
    await register();

    expect(initMock).toHaveBeenCalledTimes(1);
  });

  it('no-ops cleanly when no DSN is set — LOCAL_MODE must not phone home', async () => {
    process.env.NEXT_RUNTIME = 'nodejs';
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    const { register } = await import('../instrumentation');
    await expect(register()).resolves.not.toThrow();

    expect(initMock).not.toHaveBeenCalled();
  });

  it('exports onRequestError so Next-caught server errors reach Sentry', async () => {
    const mod = await import('../instrumentation');
    expect(mod.onRequestError).toBeTypeOf('function');
  });
});
