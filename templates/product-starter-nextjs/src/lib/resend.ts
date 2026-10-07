import { Resend } from 'resend';
import { env } from '@/lib/env';
import { withRetry, isTransient } from '@/lib/retry';
import { unsubscribeUrl } from '@/lib/unsubscribe';

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
export const fromEmail = env.RESEND_FROM_EMAIL || 'hi@example.com';

export async function sendEmail(opts: {
  to: string;
  subject: string;
  react?: React.ReactElement;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
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

/**
 * Marketing email — anything that sells or announces (launch email, newsletter,
 * digest, waitlist blast). CAN-SPAM requires a working unsubscribe link and your
 * physical postal address in every one, fined per email, so this refuses to send
 * without them. Transactional mail (magic links, receipts) uses sendEmail().
 *
 * Callers must skip contacts with `unsubscribed_at` set (see /api/unsubscribe).
 */
export async function sendMarketingEmail(opts: { to: string; subject: string; text: string; html?: string }) {
  if (!env.POSTAL_ADDRESS?.trim()) throw new Error('POSTAL_ADDRESS is not set — marketing email needs your mailing address (CAN-SPAM)');
  const unsubscribe = unsubscribeUrl(opts.to);
  const footerText = `\n\n—\nYou're getting this because you signed up at ${env.NEXT_PUBLIC_APP_URL}.\nUnsubscribe: ${unsubscribe}\n${env.POSTAL_ADDRESS}`;
  const footerHtml = `<hr><p style="font-size:12px;color:#666">You're getting this because you signed up at ${env.NEXT_PUBLIC_APP_URL}. <a href="${unsubscribe}">Unsubscribe</a><br>${env.POSTAL_ADDRESS}</p>`;
  return sendEmail({
    to: opts.to,
    subject: opts.subject,
    text: opts.text + footerText,
    ...(opts.html ? { html: opts.html + footerHtml } : {}),
    headers: {
      'List-Unsubscribe': `<${unsubscribe}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });
}
