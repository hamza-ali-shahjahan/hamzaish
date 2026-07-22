import { describe, expect, it } from 'vitest';
import { withRetry, withTimeout, isTransient, TimeoutError } from './retry';

const FAST = { minDelayMs: 1, maxDelayMs: 2, timeoutMs: 500 };

describe('withTimeout', () => {
  it('resolves a fast operation', async () => {
    await expect(withTimeout(async () => 'ok', 100)).resolves.toBe('ok');
  });

  it('rejects a slow operation with TimeoutError', async () => {
    await expect(
      withTimeout(() => new Promise((r) => setTimeout(r, 200)), 20),
    ).rejects.toBeInstanceOf(TimeoutError);
  });
});

describe('isTransient', () => {
  it('treats 429/5xx/network/timeout as transient, 4xx and plain errors as not', () => {
    expect(isTransient({ statusCode: 429 })).toBe(true);
    expect(isTransient({ status: 503 })).toBe(true);
    expect(isTransient(new TypeError('fetch failed'))).toBe(true);
    expect(isTransient(new TimeoutError(1))).toBe(true);
    expect(isTransient({ code: 'ECONNRESET' })).toBe(true);
    expect(isTransient({ statusCode: 400 })).toBe(false);
    expect(isTransient({ status: 401 })).toBe(false);
    expect(isTransient(new Error('validation failed'))).toBe(false);
  });
});

describe('withRetry', () => {
  it('succeeds after transient failures', async () => {
    let calls = 0;
    const result = await withRetry(async () => {
      calls++;
      if (calls < 3) throw { statusCode: 503 };
      return 'recovered';
    }, FAST);
    expect(result).toBe('recovered');
    expect(calls).toBe(3);
  });

  it('gives up after the retry budget and rethrows the last error', async () => {
    let calls = 0;
    await expect(
      withRetry(async () => {
        calls++;
        throw { statusCode: 500 };
      }, { ...FAST, retries: 2 }),
    ).rejects.toEqual({ statusCode: 500 });
    expect(calls).toBe(3); // 1 + 2 retries
  });

  it('fails fast on non-transient errors — a 400 is never retried', async () => {
    let calls = 0;
    await expect(
      withRetry(async () => {
        calls++;
        throw { statusCode: 400 };
      }, FAST),
    ).rejects.toEqual({ statusCode: 400 });
    expect(calls).toBe(1);
  });

  it('retries per-attempt timeouts', async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls++;
        if (calls === 1) await new Promise((r) => setTimeout(r, 100));
        return 'fast-second-try';
      },
      { ...FAST, timeoutMs: 30 },
    );
    expect(result).toBe('fast-second-try');
    expect(calls).toBe(2);
  });
});
