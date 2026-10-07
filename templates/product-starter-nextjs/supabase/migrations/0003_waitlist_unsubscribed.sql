-- Marketing-email opt-out (CAN-SPAM). Set by /api/unsubscribe; every marketing send
-- must filter `where unsubscribed_at is null`.
alter table public.waitlist add column if not exists unsubscribed_at timestamptz;
