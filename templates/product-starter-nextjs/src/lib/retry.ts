// retry.ts — bounded retry + timeout for external calls.
//
// Every network call in this codebase goes through one of three doors:
//   1. The vendor SDK's own retry config when it exists and is idempotency-safe
//      (Stripe: maxNetworkRetries auto-attaches idempotency keys — see stripe.ts).
//   2. withRetry() here, for calls where a retry is PROVABLY safe (the failure
//      mode guarantees the operation didn't happen — e.g. a 429/5xx response).
//   3. A bare await, deliberately, for non-idempotent calls with no safe signal —
//      with a comment saying so.
// A transient network blip must not permanently fail a user-facing action; but a
// blind retry on a non-idempotent call is worse (double-charge, double-email).
// Decide the door consciously.

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`operation timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

/** Reject with TimeoutError if `fn` doesn't settle within `ms`. */
export async function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * True for failures where the request either never completed or the service
 * explicitly refused it before doing work: safe-to-retry signals.
 * Reads the shapes used by fetch (TypeError), Stripe/Resend SDK errors
 * (statusCode / status), and our own TimeoutError.
 */
export function isTransient(err: unknown): boolean {
  if (err instanceof TimeoutError) return true;
  if (err instanceof TypeError) return true; // fetch network failure
  const status =
    (err as { statusCode?: number })?.statusCode ?? (err as { status?: number })?.status;
  if (typeof status === 'number') return status === 429 || status >= 500;
  const code = (err as { code?: string })?.code;
  return code === 'ECONNRESET' || code === 'ECONNREFUSED' || code === 'ETIMEDOUT';
}

export type RetryOptions = {
  /** Additional attempts after the first (default 2 → 3 total). */
  retries?: number;
  /** Per-attempt timeout in ms (default 10_000). */
  timeoutMs?: number;
  /** First backoff delay in ms; doubles per attempt with jitter (default 250). */
  minDelayMs?: number;
  /** Backoff ceiling (default 2_000). */
  maxDelayMs?: number;
  /** Which errors to retry (default isTransient). Return false to fail fast. */
  retryOn?: (err: unknown) => boolean;
};

/**
 * Run `fn` with a per-attempt timeout and bounded exponential backoff.
 * ONLY use for operations where retrying is safe — see the doors above.
 */
export async function withRetry<T>(fn: (attempt: number) => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { retries = 2, timeoutMs = 10_000, minDelayMs = 250, maxDelayMs = 2_000, retryOn = isTransient } = opts;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await withTimeout(() => fn(attempt), timeoutMs);
    } catch (err) {
      lastErr = err;
      if (attempt === retries || !retryOn(err)) throw err;
      const backoff = Math.min(maxDelayMs, minDelayMs * 2 ** attempt);
      await new Promise((r) => setTimeout(r, backoff / 2 + Math.random() * (backoff / 2)));
    }
  }
  throw lastErr; // unreachable, satisfies control-flow analysis
}
