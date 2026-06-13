import { createBrowserClient } from '@supabase/ssr';
import { env, LOCAL_MODE } from '@/lib/env';
import { localClient } from './stub';

export const createClient = () =>
  LOCAL_MODE
    ? (localClient() as unknown as ReturnType<typeof createBrowserClient>)
    : createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
