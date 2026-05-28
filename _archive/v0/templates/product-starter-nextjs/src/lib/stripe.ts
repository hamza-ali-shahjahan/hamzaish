import Stripe from 'stripe';
import { env } from '@/lib/env';

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion })
  : null;

export const isStripeConfigured = () => Boolean(stripe);

export async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  if (!stripe) throw new Error('Stripe not configured');
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data[0]) return existing.data[0].id;
  const customer = await stripe.customers.create({ email, metadata: { supabase_user_id: userId } });
  return customer.id;
}
