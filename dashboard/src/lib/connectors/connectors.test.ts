// Force every connector path with an injected fetch — no network, no keys.
// The lie these tests exist to prevent: a connector reporting `connected`
// with numbers that came from nowhere (the v1 stubs did exactly that).
import { describe, expect, test } from 'bun:test';
import { fetchStripeMetrics } from './stripe';
import { fetchPostHogMetrics } from './posthog';
import { fetchSentryMetrics } from './sentry';

const ok = (body: unknown) => ({ ok: true, json: async () => body }) as unknown as Response;
const fail = () => ({ ok: false, status: 500, json: async () => ({}) }) as unknown as Response;

describe('stripe — MRR math, pagination, honesty', () => {
  const sub = (id: string, customer: string, items: any[]) => ({ id, customer, items: { data: items } });
  const price = (unit_amount: number, interval: string, interval_count = 1, quantity = 1) => ({
    quantity,
    price: { unit_amount, recurring: { interval, interval_count } },
  });

  test('normalizes yearly + monthly to MRR and counts distinct customers', async () => {
    const fetchFn = (async () =>
      ok({
        data: [
          sub('sub_1', 'cus_a', [price(2000, 'month')]), // $20/mo
          sub('sub_2', 'cus_b', [price(24000, 'year')]), // $240/yr = $20/mo
          sub('sub_3', 'cus_a', [price(1000, 'month', 1, 3)]), // $10 × 3 seats, same customer
        ],
        has_more: false,
      })) as unknown as typeof fetch;
    const r = await fetchStripeMetrics('acct_123', { fetchFn, apiKey: 'sk_test_x' });
    expect(r.status).toBe('connected');
    expect(r.mrr_usd).toBe(70); // 20 + 20 + 30
    expect(r.paying_customers).toBe(2); // cus_a deduped
  });

  test('follows pagination across pages', async () => {
    let call = 0;
    const fetchFn = (async (url: any) => {
      call++;
      if (call === 1) {
        expect(String(url)).not.toContain('starting_after');
        return ok({ data: [sub('sub_1', 'cus_a', [price(1000, 'month')])], has_more: true });
      }
      expect(String(url)).toContain('starting_after=sub_1');
      return ok({ data: [sub('sub_2', 'cus_b', [price(1000, 'month')])], has_more: false });
    }) as unknown as typeof fetch;
    const r = await fetchStripeMetrics('acct_123', { fetchFn, apiKey: 'sk_test_x' });
    expect(r.mrr_usd).toBe(20);
    expect(r.paying_customers).toBe(2);
    expect(call).toBe(2);
  });

  test('metered prices (null unit_amount) are excluded, not guessed', async () => {
    const fetchFn = (async () =>
      ok({ data: [sub('sub_1', 'cus_a', [{ price: { unit_amount: null, recurring: { interval: 'month', interval_count: 1 } } }])], has_more: false })) as unknown as typeof fetch;
    const r = await fetchStripeMetrics('acct_123', { fetchFn, apiKey: 'sk_test_x' });
    expect(r.mrr_usd).toBe(0);
  });

  test('no key → not_connected (never fake-connected)', async () => {
    const r = await fetchStripeMetrics('acct_123', { apiKey: undefined, fetchFn: (async () => ok({})) as any });
    // deps.apiKey undefined falls back to env; ensure env absence in test context still yields honesty
    if (!process.env.STRIPE_SECRET_KEY) expect(r.status).toBe('not_connected');
  });

  test('API failure → error, nulls (never zeros)', async () => {
    const r = await fetchStripeMetrics('acct_123', { fetchFn: (async () => fail()) as any, apiKey: 'sk_test_x' });
    expect(r.status).toBe('error');
    expect(r.mrr_usd).toBeNull();
  });
});

describe('posthog — one HogQL query, WAU/MAU proxy', () => {
  test('parses actives, signups, retention proxy', async () => {
    const fetchFn = (async (_url: any, init: any) => {
      const q = JSON.parse(init.body).query.query as string;
      expect(q).toContain("event = 'user_signed_up'");
      return ok({ results: [[42, 120, 7]] });
    }) as unknown as typeof fetch;
    const r = await fetchPostHogMetrics('12345', { fetchFn, apiKey: 'phx_test' });
    expect(r.status).toBe('connected');
    expect(r.active_users_7d).toBe(42);
    expect(r.signups_7d).toBe(7);
    expect(r.retention_proxy).toBeCloseTo(0.35);
  });

  test('zero 30d actives → retention null, not division blowup', async () => {
    const fetchFn = (async () => ok({ results: [[0, 0, 0]] })) as unknown as typeof fetch;
    const r = await fetchPostHogMetrics('12345', { fetchFn, apiKey: 'phx_test' });
    expect(r.retention_proxy).toBeNull();
  });

  test('malformed response → error with nulls', async () => {
    const fetchFn = (async () => ok({ nope: true })) as unknown as typeof fetch;
    const r = await fetchPostHogMetrics('12345', { fetchFn, apiKey: 'phx_test' });
    expect(r.status).toBe('error');
    expect(r.active_users_7d).toBeNull();
  });
});

describe('sentry — 24h bucket sum', () => {
  test('sums hourly buckets', async () => {
    const fetchFn = (async () => ok([[1, 5], [2, 0], [3, 12]])) as unknown as typeof fetch;
    const r = await fetchSentryMetrics('my-org', 'my-proj', { fetchFn, authToken: 'sntrys_x' });
    expect(r.status).toBe('connected');
    expect(r.errors_24h).toBe(17);
  });

  test('missing org/project/token → not_connected', async () => {
    const r = await fetchSentryMetrics(null, 'p', { authToken: 'x' });
    expect(r.status).toBe('not_connected');
  });

  test('HTTP failure → error, null', async () => {
    const r = await fetchSentryMetrics('o', 'p', { fetchFn: (async () => fail()) as any, authToken: 'x' });
    expect(r.status).toBe('error');
    expect(r.errors_24h).toBeNull();
  });
});
