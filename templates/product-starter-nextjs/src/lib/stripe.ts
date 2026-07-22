import Stripe from 'stripe';
import { env } from '@/lib/env';

// Retry door #1 (see lib/retry.ts): Stripe's own SDK retries are the safe kind —
// it attaches idempotency keys to retried POSTs, so a network blip can't
// double-create a customer or charge. timeout bounds every call (default is 80s;
// a user-facing request should never hang that long).
export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
      maxNetworkRetries: 2,
      timeout: 10_000,
    })
  : null;

export const isStripeConfigured = () => Boolean(stripe);

export async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  if (!stripe) throw new Error('Stripe not configured');
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data[0]) return existing.data[0].id;
  const customer = await stripe.customers.create({ email, metadata: { supabase_user_id: userId } });
  return customer.id;
}
