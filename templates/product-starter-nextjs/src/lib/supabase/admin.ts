// Service-role Supabase client — bypasses RLS. SERVER-ONLY.
//
// Never import this from a client component or anything under a "use client"
// boundary: the service-role key grants full table access and must never reach a
// browser bundle. It exists for trusted server-side writers — chiefly the Stripe
// webhook, which is authenticated by signature rather than by a user session and
// therefore has no auth.uid() for RLS to check against.
//
// Returns null when unconfigured (LOCAL_MODE) so callers can degrade explicitly
// rather than crash at import time.

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export function createAdminClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
