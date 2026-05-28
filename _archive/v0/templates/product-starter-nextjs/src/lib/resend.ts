import { Resend } from 'resend';
import { env } from '@/lib/env';

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
export const fromEmail = env.RESEND_FROM_EMAIL || 'hi@example.com';

export async function sendEmail(opts: {
  to: string;
  subject: string;
  react?: React.ReactElement;
  text?: string;
}) {
  if (!resend) throw new Error('Resend not configured');
  return resend.emails.send({ from: fromEmail, ...opts } as Parameters<typeof resend.emails.send>[0]);
}
