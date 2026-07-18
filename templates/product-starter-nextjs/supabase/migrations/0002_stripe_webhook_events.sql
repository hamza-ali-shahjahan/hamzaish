-- {{PRODUCT_NAME}} — Stripe webhook idempotency ledger
--
-- Stripe delivers at-least-once: network hiccups, timeouts, and manual replays
-- all cause the SAME event.id to arrive more than once. Without a ledger, a
-- retried invoice.payment_succeeded double-processes.
--
-- The webhook CLAIMS an event by inserting its id here inside the same request.
-- The primary key is the idempotency key: a concurrent or later redelivery of the
-- same id loses the insert race (23505 unique_violation) and is skipped. If
-- processing then fails, the claim is released so Stripe's retry can re-claim it.

create table if not exists public.stripe_webhook_events (
  id text primary key,              -- Stripe event.id — the idempotency key
  type text not null,
  processed_at timestamptz default now()
);

-- Service-role only: the webhook writes via SUPABASE_SERVICE_ROLE_KEY, which
-- bypasses RLS. No policies are defined, so RLS denies every anon/authenticated
-- read and write by default. That is deliberate — this table is internal.
alter table public.stripe_webhook_events enable row level security;
