import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { env } from '@/lib/env';

export async function POST(req: Request) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  const body = await req.text();
  if (!sig) return NextResponse.json({ error: 'no_sig' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_sig', message: (err as Error).message },
      { status: 400 },
    );
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed':
      // TODO: persist to Supabase subscriptions table
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
