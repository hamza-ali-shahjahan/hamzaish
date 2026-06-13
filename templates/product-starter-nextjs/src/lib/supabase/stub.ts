// Local-first dev stub for the Supabase client.
//
// Active only in LOCAL_MODE (no Supabase configured) so the starter runs with
// zero accounts — `bun dev` boots, auth-gated pages render, the waitlist accepts
// input, nothing throws. It implements only the surface the starter actually
// uses (auth.getUser / getSession / signOut, from().insert / select).
//
// The moment you set NEXT_PUBLIC_SUPABASE_URL + ANON_KEY, the real client takes
// over and this stub is never imported at runtime. Nothing here ships to prod.

const DEV_USER = {
  id: 'local-dev-user',
  email: 'you@localhost',
  app_metadata: {},
  user_metadata: { name: 'Local Builder' },
  aud: 'authenticated',
  created_at: new Date(0).toISOString(),
};

export function localClient() {
  return {
    auth: {
      async getUser() {
        return { data: { user: DEV_USER }, error: null };
      },
      async getSession() {
        return { data: { session: { user: DEV_USER } }, error: null };
      },
      async signInWithOtp() {
        // Login isn't needed in local mode — you're already "signed in".
        return { data: {}, error: null };
      },
      async signOut() {
        return { error: null };
      },
    },
    from(table: string) {
      const result = async () => {
        console.log(`[local-mode] ${table}: no-op (wire Supabase to persist)`);
        return { data: [], error: null };
      };
      return { insert: result, upsert: result, update: result, delete: result, select: result };
    },
  };
}
