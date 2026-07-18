// Where instrumentation.ts lives — asserted separately, ON PURPOSE.
//
// This app lives in src/app/, so Next.js loads ONLY src/instrumentation.ts. At the
// project root the file is silently ignored: no warning, no error, a green build,
// and zero error capture. Nothing about that failure is visible from the source.
//
// This is deliberately its own file with NO import of instrumentation. Its sibling
// (sentry-init.test.ts) imports register() to prove init is called — so when the
// file is missing or misplaced, that suite dies at import resolution and reports a
// module-not-found, never reaching a location assertion. This file still runs and
// says the actual thing that is wrong.
//
// History: the fix for the missing-Sentry-init bug was first written with
// instrumentation.ts at the project root. Mocked tests passed. The build was green.
// Only firing a real error at a running server (verify-live A11) revealed that
// Sentry had never initialized. This is the cheap every-commit guard for that.

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const root = resolve(__dirname, '../..');

describe('instrumentation.ts placement', () => {
  it('exists at src/instrumentation.ts, where Next.js actually looks', () => {
    expect(
      existsSync(resolve(root, 'src/instrumentation.ts')),
      'src/instrumentation.ts is missing — Next.js will never call Sentry.init() and the app will capture zero errors',
    ).toBe(true);
  });

  it('is NOT at the project root, where Next.js silently ignores it', () => {
    expect(
      existsSync(resolve(root, 'instrumentation.ts')),
      'instrumentation.ts is at the project root — for a src/app project Next.js IGNORES it. Move it to src/instrumentation.ts.',
    ).toBe(false);
  });
});
