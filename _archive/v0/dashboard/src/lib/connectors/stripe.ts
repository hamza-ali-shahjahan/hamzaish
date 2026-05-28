import type { ConnectorStatus } from '../types';

export async function fetchStripeMetrics(accountId: string | null): Promise<{
  status: ConnectorStatus;
  mrr_usd: number | null;
  paying_customers: number | null;
}> {
  if (!accountId) return { status: 'not_connected', mrr_usd: null, paying_customers: null };
  if (!process.env.STRIPE_SECRET_KEY) {
    return { status: 'not_connected', mrr_usd: null, paying_customers: null };
  }

  try {
    // v1: stub. TODO: real Stripe API — list active subscriptions for account, sum MRR.
    // Real impl: const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    //            const subs = await stripe.subscriptions.list({ status: 'active', expand: ['data.items'] });
    return { status: 'connected', mrr_usd: 0, paying_customers: 0 };
  } catch {
    return { status: 'error', mrr_usd: null, paying_customers: null };
  }
}
