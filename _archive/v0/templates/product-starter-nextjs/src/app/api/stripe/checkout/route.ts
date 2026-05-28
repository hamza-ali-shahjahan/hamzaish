import { NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe, getOrCreateCustomer } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

const schema = z.object({ priceId: z.string().min(1) });

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const customerId = await getOrCreateCustomer(user.id, user.email);
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: parsed.data.priceId, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=1`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
