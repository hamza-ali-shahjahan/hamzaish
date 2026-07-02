import type { ConnectorStatus } from '../types';

// Real Stripe connector (v2 — 2026-07-02). Zero-dep: raw fetch against the REST
// API, no SDK. The v1 stub returned `connected` with hardcoded zeros — worse
// than not_connected, because a portfolio review reads that as "live, $0 MRR".
// Now: no key or no account → not_connected; API failure → error; connected
// means these numbers came from Stripe.
//
// MRR: sum over ACTIVE subscriptions of item unit_amount × quantity, normalized
// to monthly (year/12, week×4.345, day×30.44, ÷ interval_count). Trials and
// canceled subs excluded — active only, deliberately conservative.

export type StripeDeps = {
  fetchFn?: typeof fetch; // injectable for tests
  apiKey?: string; // defaults to STRIPE_SECRET_KEY
};

const MONTHLY_FACTOR: Record<string, number> = { month: 1, year: 1 / 12, week: 4.345, day: 30.44 };
const MAX_PAGES = 10; // safety cap — 1000 subs is beyond this dashboard's league

export async function fetchStripeMetrics(
  accountId: string | null,
  deps: StripeDeps = {},
): Promise<{ status: ConnectorStatus; mrr_usd: number | null; paying_customers: number | null }> {
  const apiKey = deps.apiKey ?? process.env.STRIPE_SECRET_KEY;
  const fetchFn = deps.fetchFn ?? fetch;
  if (!accountId || !apiKey) return { status: 'not_connected', mrr_usd: null, paying_customers: null };

  const headers: Record<string, string> = { Authorization: `Bearer ${apiKey}` };
  // Platform key + connected account → scope the call; a direct account key ignores this.
  if (accountId.startsWith('acct_')) headers['Stripe-Account'] = accountId;

  try {
    let mrrCents = 0;
    const customers = new Set<string>();
    let startingAfter: string | null = null;

    for (let page = 0; page < MAX_PAGES; page++) {
      const params = new URLSearchParams({ status: 'active', limit: '100' });
      params.append('expand[]', 'data.items');
      if (startingAfter) params.set('starting_after', startingAfter);

      const res = await fetchFn(`https://api.stripe.com/v1/subscriptions?${params}`, { headers });
      if (!res.ok) return { status: 'error', mrr_usd: null, paying_customers: null };
      const body = (await res.json()) as {
        data: Array<{
          id: string;
          customer: string;
          items: { data: Array<{ quantity?: number; price: { unit_amount: number | null; recurring: { interval: string; interval_count: number } | null } }> };
        }>;
        has_more: boolean;
      };

      for (const sub of body.data) {
        customers.add(sub.customer);
        for (const item of sub.items.data) {
          const { price } = item;
          if (price.unit_amount == null || !price.recurring) continue; // metered/usage prices excluded from MRR
          const factor = MONTHLY_FACTOR[price.recurring.interval] ?? 0;
          const intervalCount = price.recurring.interval_count || 1;
          mrrCents += (price.unit_amount * (item.quantity ?? 1) * factor) / intervalCount;
        }
      }

      if (!body.has_more || body.data.length === 0) break;
      startingAfter = body.data[body.data.length - 1].id;
    }

    return { status: 'connected', mrr_usd: Math.round(mrrCents) / 100, paying_customers: customers.size };
  } catch {
    return { status: 'error', mrr_usd: null, paying_customers: null };
  }
}
