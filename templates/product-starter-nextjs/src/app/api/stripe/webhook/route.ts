import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { env } from '@/lib/env';

// Stripe webhook — verify, claim, persist.
//
// Two rules this route exists to hold, both learned the hard way:
//
//   1. NEVER 200 an event you didn't persist. A 2xx tells Stripe "handled" and it
//      stops retrying — an error swallowed here is a subscription silently lost
//      forever. Persistence failures MUST return 5xx so Stripe redelivers.
//   2. Stripe delivers AT-LEAST-ONCE. The same event.id will arrive twice. Every
//      write is idempotent: the event is claimed in stripe_webhook_events (PK =
//      event.id) and a redelivery that loses the insert race is skipped.
//
// The claim is released if processing fails, so a retry can re-claim it. Claiming
// without releasing would make the first failure permanent — the retry would see
// "already processed" and skip the work that never happened.

const RELEVANT_EVENTS = new Set<Stripe.Event['type']>([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

const UNIQUE_VIOLATION = '23505';

/** Resolve the Supabase user behind a Stripe customer, via the metadata getOrCreateCustomer writes. */
async function resolveUserId(customer: string | Stripe.Customer | Stripe.DeletedCustomer) {
  if (typeof customer !== 'string') {
    return customer.deleted ? null : (customer.metadata?.supabase_user_id ?? null);
  }
  const full = await stripe!.customers.retrieve(customer);
  if (full.deleted) return null;
  return full.metadata?.supabase_user_id ?? null;
}

async function upsertSubscription(admin: SupabaseClient, sub: Stripe.Subscription) {
  const userId = await resolveUserId(sub.customer);
  if (!userId) {
    // A customer with no supabase_user_id was created outside getOrCreateCustomer
    // (Stripe dashboard, a legacy import). There is no row to attach it to.
    // Not an error — but say so loudly rather than failing the whole delivery.
    console.warn(
      JSON.stringify({
        level: 'warn',
        msg: 'stripe_customer_without_supabase_user_id',
        subscription: sub.id,
      }),
    );
    return;
  }

  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;

  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      price_id: sub.items.data[0]?.price?.id ?? null,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' },
  );

  // Throw, don't swallow: the caller turns this into a 5xx so Stripe retries.
  if (error) throw new Error(`subscriptions upsert failed: ${error.message}`);
}

async function handleEvent(admin: SupabaseClient, event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await upsertSubscription(admin, event.data.object as Stripe.Subscription);
      return;

    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef = (invoice as unknown as { subscription?: string | Stripe.Subscription | null })
        .subscription;
      if (!subRef) return; // one-off invoice, no subscription to mirror
      // Re-read from Stripe rather than trusting the invoice's embedded copy:
      // Stripe is the source of truth for status, and events can arrive out of order.
      const subId = typeof subRef === 'string' ? subRef : subRef.id;
      const sub = await stripe!.subscriptions.retrieve(subId);
      await upsertSubscription(admin, sub);
      return;
    }

    default:
      return;
  }
}

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

  if (!RELEVANT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const admin = createAdminClient();
  if (!admin) {
    // Signature verified, so this IS a real event we are contracted to persist —
    // and we cannot. 503 (not 200) so Stripe retries once the key is configured.
    console.error(
      JSON.stringify({
        level: 'error',
        msg: 'webhook_unpersistable_no_service_role_key',
        event: event.id,
      }),
    );
    return NextResponse.json({ error: 'persistence_not_configured' }, { status: 503 });
  }

  // Claim the event. A redelivery loses this race and is skipped.
  const { error: claimError } = await admin
    .from('stripe_webhook_events')
    .insert({ id: event.id, type: event.type });

  if (claimError) {
    if (claimError.code === UNIQUE_VIOLATION) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error(
      JSON.stringify({ level: 'error', msg: 'webhook_claim_failed', event: event.id, error: claimError.message }),
    );
    return NextResponse.json({ error: 'claim_failed' }, { status: 500 });
  }

  try {
    await handleEvent(admin, event);
  } catch (err) {
    // Release the claim so Stripe's retry can re-claim and reprocess. If this
    // delete itself fails the event is stuck claimed-but-unprocessed — log loudly;
    // that is the one state a human needs to know about.
    const { error: releaseError } = await admin
      .from('stripe_webhook_events')
      .delete()
      .eq('id', event.id);

    console.error(
      JSON.stringify({
        level: 'error',
        msg: releaseError ? 'webhook_claim_stuck' : 'webhook_processing_failed',
        event: event.id,
        type: event.type,
        error: (err as Error).message,
        releaseError: releaseError?.message,
      }),
    );

    return NextResponse.json({ error: 'processing_failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
