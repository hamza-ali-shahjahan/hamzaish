import { Resend } from 'resend';
import { env } from '@/lib/env';
import { withRetry, isTransient } from '@/lib/retry';

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
export const fromEmail = env.RESEND_FROM_EMAIL || 'hi@example.com';

export async function sendEmail(opts: {
  to: string;
  subject: string;
  react?: React.ReactElement;
  text?: string;
}) {
  if (!resend) throw new Error('Resend not configured');
  // Retry door #2 (see lib/retry.ts): email must not double-send, so we retry ONLY
  // failures that mean the message was never accepted — 429/5xx responses and
  // connection-level errors BEFORE a response. The Resend SDK returns { data, error }
  // instead of throwing, so the API-level "not accepted" cases are re-thrown here to
  // make them retryable; an ambiguous late timeout is NOT retried (better a missing
  // email than a double one).
  return withRetry(
    async () => {
      const result = await resend.emails.send({ from: fromEmail, ...opts } as Parameters<
        typeof resend.emails.send
      >[0]);
      if (result.error) {
        const status = (result.error as { statusCode?: number }).statusCode;
        if (status === 429 || (typeof status === 'number' && status >= 500)) throw result.error;
      }
      return result;
    },
    { retries: 1, timeoutMs: 10_000, retryOn: (e) => !(e instanceof Error && e.name === 'TimeoutError') && isTransient(e) },
  );
}
