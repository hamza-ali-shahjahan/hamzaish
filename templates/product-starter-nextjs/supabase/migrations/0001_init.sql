-- {{PRODUCT_NAME}} — initial schema
-- Apply via Supabase CLI: `supabase db push` (or paste in SQL editor)

create extension if not exists "uuid-ossp";

-- waitlist
create table if not exists public.waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  source text default 'website',
  created_at timestamptz default now()
);

-- subscriptions (mirror Stripe)
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_customer_id text not null,
  stripe_subscription_id text unique not null,
  status text not null,
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- enable RLS
alter table public.waitlist enable row level security;
alter table public.subscriptions enable row level security;

-- waitlist: anonymous can insert; nobody can read (admin via service role)
create policy "anon insert waitlist" on public.waitlist
  for insert to anon with check (true);

-- subscriptions: user can read their own
create policy "user reads own subscriptions" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);
