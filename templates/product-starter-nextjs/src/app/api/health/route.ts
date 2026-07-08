import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Live-health endpoint — the contract scripts/verify-live.ts (Hamzaish) asserts
// against after every deploy (A3 ok, A4 buildSha, A6 db probe). Keep the shape:
// { ok: boolean, buildSha: string, probes: { db: 'ok' | 'fail' | 'off' } }
export const dynamic = 'force-dynamic';

export async function GET() {
  const buildSha = (process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev').slice(0, 7);
  const probes: Record<string, 'ok' | 'fail' | 'off'> = {};

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('waitlist')
        .select('id', { count: 'exact', head: true });
      probes.db = error ? 'fail' : 'ok';
    } catch {
      probes.db = 'fail';
    }
  } else {
    probes.db = 'off'; // local mode — no backend wired yet
  }

  const ok = Object.values(probes).every((v) => v !== 'fail');
  return NextResponse.json({ ok, buildSha, probes }, { status: ok ? 200 : 503 });
}
