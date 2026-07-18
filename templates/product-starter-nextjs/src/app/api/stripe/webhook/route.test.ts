// The Stripe webhook canary.
//
// The defect this exists for: until 2026-07-15 this route verified the signature,
// switched on five event types, ran `// TODO: persist to Supabase subscriptions
// table`, and returned { received: true } — telling Stripe the event was handled
// while dropping it. The subscriptions table was created by 0001_init.sql and
// never written to. A product could take real money and hold no subscription state.
//
// These tests pin the three properties that defect violated:
//   1. A relevant event actually WRITES a subscriptions row.
//   2. A REDELIVERED event.id (Stripe is at-least-once) yields exactly ONE row.
//   3. A persistence failure returns 5xx — never 200 — so Stripe retries.
//
// The fake below enforces the real primary-key constraint from
// 0002_stripe_webhook_events.sql; the idempotency claim is only meaningful if the
// unique violation it relies on is actually simulated.

import { describe, it, expect, vi, beforeEach } from 'vitest';

const UNIQUE_VIOLATION = '23505';

type Row = Record<string, unknown>;

/** In-memory stand-in for the service-role client: PK on events, onConflict upsert on subs. */
function fakeAdmin() {
  const events: Row[] = [];
  const subscriptions: Row[] = [];
  const failures = { subscriptionsUpsert: false, eventsInsert: false, eventsDelete: false };

  const client = {
    from(table: string) {
      return {
        insert(row: Row) {
          if (table === 'stripe_webhook_events') {
            if (failures.eventsInsert) return Promise.resolve({ error: { code: 'XX000', message: 'db down' } });
            if (events.some((e) => e.id === row.id)) {
              // the PK constraint doing its job — what idempotency depends on
              return Promise.resolve({ error: { code: UNIQUE_VIOLATION, message: 'duplicate key' } });
            }
            events.push(row);
          }
          return Promise.resolve({ error: null });
        },
        upsert(row: Row, opts?: { onConflict?: string }) {
          if (table === 'subscriptions') {
            if (failures.subscriptionsUpsert) {
              return Promise.resolve({ error: { code: 'XX000', message: 'db down' } });
            }
            const key = opts?.onConflict ?? 'id';
            const i = subscriptions.findIndex((s) => s[key] === row[key]);
            if (i >= 0) subscriptions[i] = { ...subscriptions[i], ...row };
            else subscriptions.push(row);
          }
          return Promise.resolve({ error: null });
        },
        delete() {
          return {
            eq(col: string, val: unknown) {
              if (failures.eventsDelete) return Promise.resolve({ error: { code: 'XX000', message: 'db down' } });
              const i = events.findIndex((e) => e[col] === val);
              if (i >= 0) events.splice(i, 1);
              return Promise.resolve({ error: null });
            },
          };
        },
      };
    },
  };

  return { client, events, subscriptions, failures };
}

let admin = fakeAdmin();
let currentEvent: unknown;

const constructEvent = vi.fn(() => currentEvent);
const customersRetrieve = vi.fn(async () => ({
  id: 'cus_123',
  deleted: false,
  metadata: { supabase_user_id: 'user-abc' },
}));
const subscriptionsRetrieve = vi.fn(async () => subscriptionObject());

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: (...a: unknown[]) => constructEvent(...(a as [])) },
    customers: { retrieve: (...a: unknown[]) => customersRetrieve(...(a as [])) },
    subscriptions: { retrieve: (...a: unknown[]) => subscriptionsRetrieve(...(a as [])) },
  },
}));

vi.mock('@/lib/env', () => ({
  env: { STRIPE_WEBHOOK_SECRET: 'whsec_test', NEXT_PUBLIC_APP_URL: 'http://localhost:3000' },
  LOCAL_MODE: false,
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => admin.client,
}));

function subscriptionObject(overrides: Row = {}) {
  return {
    id: 'sub_123',
    customer: 'cus_123',
    status: 'active',
    current_period_end: 1800000000,
    cancel_at_period_end: false,
    items: { data: [{ price: { id: 'price_123' } }] },
    ...overrides,
  };
}

function subscriptionEvent(id: string) {
  return {
    id,
    type: 'customer.subscription.created',
    data: { object: subscriptionObject() },
  };
}

function post() {
  return new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': 't=1,v1=fake' },
    body: '{}',
  });
}

async function callWebhook() {
  const { POST } = await import('./route');
  return POST(post());
}

beforeEach(() => {
  admin = fakeAdmin();
  vi.clearAllMocks();
  vi.resetModules();
});

describe('Stripe webhook — persistence', () => {
  it('writes a subscriptions row instead of ACKing and dropping', async () => {
    currentEvent = subscriptionEvent('evt_1');

    const res = await callWebhook();

    expect(res.status).toBe(200);
    expect(admin.subscriptions).toHaveLength(1);
    expect(admin.subscriptions[0]).toMatchObject({
      user_id: 'user-abc',
      stripe_subscription_id: 'sub_123',
      stripe_customer_id: 'cus_123',
      status: 'active',
      price_id: 'price_123',
    });
  });

  it('mirrors subscription state on invoice.payment_succeeded', async () => {
    subscriptionsRetrieve.mockResolvedValueOnce(subscriptionObject({ status: 'past_due' }) as never);
    currentEvent = {
      id: 'evt_inv',
      type: 'invoice.payment_succeeded',
      data: { object: { id: 'in_1', subscription: 'sub_123' } },
    };

    const res = await callWebhook();

    expect(res.status).toBe(200);
    expect(admin.subscriptions).toHaveLength(1);
    expect(admin.subscriptions[0]).toMatchObject({ status: 'past_due' });
  });
});

describe('Stripe webhook — idempotency (Stripe redelivers)', () => {
  it('processes the same event.id exactly once — one row, not two', async () => {
    currentEvent = subscriptionEvent('evt_dup');

    const first = await callWebhook();
    const second = await callWebhook();

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({ received: true, duplicate: true });

    expect(admin.events).toHaveLength(1);
    expect(admin.subscriptions).toHaveLength(1);
    // the replay must not have re-run the work
    expect(customersRetrieve).toHaveBeenCalledTimes(1);
  });

  it('treats distinct event ids as distinct work', async () => {
    currentEvent = subscriptionEvent('evt_a');
    await callWebhook();
    currentEvent = subscriptionEvent('evt_b');
    await callWebhook();

    expect(admin.events).toHaveLength(2);
    expect(customersRetrieve).toHaveBeenCalledTimes(2);
  });
});

describe('Stripe webhook — failures must NOT be ACKed', () => {
  it('returns 500 (not 200) when the subscriptions write fails, so Stripe retries', async () => {
    currentEvent = subscriptionEvent('evt_fail');
    admin.failures.subscriptionsUpsert = true;

    const res = await callWebhook();

    expect(res.status).toBe(500);
    expect(admin.subscriptions).toHaveLength(0);
  });

  it('releases the claim on failure so the retry can re-process', async () => {
    currentEvent = subscriptionEvent('evt_retry');
    admin.failures.subscriptionsUpsert = true;

    const failed = await callWebhook();
    expect(failed.status).toBe(500);
    expect(admin.events).toHaveLength(0); // claim released, not left behind

    // Stripe redelivers; the DB is healthy again — the event must now process.
    admin.failures.subscriptionsUpsert = false;
    const retried = await callWebhook();

    expect(retried.status).toBe(200);
    expect(admin.subscriptions).toHaveLength(1);
  });

  it('returns 503 (not 200) when there is no service-role key to persist with', async () => {
    currentEvent = subscriptionEvent('evt_nokey');
    vi.doMock('@/lib/supabase/admin', () => ({ createAdminClient: () => null }));
    vi.resetModules();

    const res = await callWebhook();

    expect(res.status).toBe(503);
  });

  it('still 200s an irrelevant event without claiming it', async () => {
    currentEvent = { id: 'evt_other', type: 'customer.created', data: { object: {} } };

    const res = await callWebhook();

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ignored: true });
    expect(admin.events).toHaveLength(0);
  });

  it('rejects a bad signature with 400 and never touches the DB', async () => {
    constructEvent.mockImplementationOnce(() => {
      throw new Error('no signatures found matching the expected signature');
    });

    const res = await callWebhook();

    expect(res.status).toBe(400);
    expect(admin.events).toHaveLength(0);
  });
});
