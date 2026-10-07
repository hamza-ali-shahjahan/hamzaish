// Unsubscribe tokens for marketing email (CAN-SPAM). SERVER-ONLY.
//
// A token is the email plus an HMAC of it, so the /api/unsubscribe link works with
// one click and can't be forged to unsubscribe someone else. No database lookup is
// needed to verify it.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '@/lib/env';

function sign(email: string): string {
  if (!env.UNSUBSCRIBE_SECRET) throw new Error('UNSUBSCRIBE_SECRET is not set — marketing email is disabled');
  return createHmac('sha256', env.UNSUBSCRIBE_SECRET).update(email.trim().toLowerCase()).digest('base64url');
}

export function unsubscribeToken(email: string): string {
  return `${Buffer.from(email.trim().toLowerCase()).toString('base64url')}.${sign(email)}`;
}

/** Returns the email the token was issued for, or null if it's malformed or forged. */
export function verifyUnsubscribeToken(token: string): string | null {
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  let email: string;
  try {
    email = Buffer.from(token.slice(0, dot), 'base64url').toString('utf8');
  } catch {
    return null;
  }
  const expected = Buffer.from(sign(email));
  const provided = Buffer.from(token.slice(dot + 1));
  return expected.length === provided.length && timingSafeEqual(expected, provided) ? email : null;
}

export function unsubscribeUrl(email: string): string {
  return `${env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken(email))}`;
}
