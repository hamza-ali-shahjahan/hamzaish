import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env, LOCAL_MODE } from '@/lib/env';
import { localClient } from './stub';

export async function createClient() {
  if (LOCAL_MODE) return localClient() as unknown as ReturnType<typeof createServerClient>;
  const cookieStore = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      // Same annotation as middleware.ts — see the note there.
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from Server Component — middleware will handle refresh
        }
      },
    },
  });
}
