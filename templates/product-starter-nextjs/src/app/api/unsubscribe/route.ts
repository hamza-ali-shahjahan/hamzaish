import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';

// One-click unsubscribe for marketing email (CAN-SPAM; Gmail/Yahoo bulk-sender rules).
// GET = the link in the email footer; POST = mail clients' List-Unsubscribe-Post button.
// Both mark the waitlist contact unsubscribed; sendMarketingEmail callers skip them.

async function unsubscribe(token: string | null) {
  const email = token ? verifyUnsubscribeToken(token) : null;
  if (!email) return false;
  const admin = createAdminClient();
  if (!admin) return false;
  const { error } = await admin
    .from('waitlist')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', email)
    .is('unsubscribed_at', null);
  return !error;
}

export async function GET(req: Request) {
  const ok = await unsubscribe(new URL(req.url).searchParams.get('token'));
  const body = ok
    ? "You're unsubscribed. You won't get marketing email from us again."
    : 'That unsubscribe link is invalid or expired — reply to any email and we will remove you by hand.';
  return new NextResponse(`<!doctype html><meta charset="utf-8"><title>Unsubscribe</title><p style="font-family:system-ui;max-width:32rem;margin:4rem auto">${body}</p>`, {
    status: ok ? 200 : 400,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

export async function POST(req: Request) {
  const ok = await unsubscribe(new URL(req.url).searchParams.get('token'));
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}
