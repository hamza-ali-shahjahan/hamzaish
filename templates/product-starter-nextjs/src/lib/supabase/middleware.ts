import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env, LOCAL_MODE } from '@/lib/env';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Local-first: no Supabase configured → no session to refresh. Just pass through.
  if (LOCAL_MODE) return supabaseResponse;

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      // Explicit annotation: @supabase/ssr 0.5.x's overloads otherwise resolve to the
      // deprecated get/set/remove signature, leaving this param an implicit any under strict.
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();
  return supabaseResponse;
}
