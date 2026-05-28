import { NextResponse } from 'next/server';
import { stripe, getOrCreateCustomer } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

export async function POST() {
  if (!stripe) return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const customerId = await getOrCreateCustomer(user.id, user.email);
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
