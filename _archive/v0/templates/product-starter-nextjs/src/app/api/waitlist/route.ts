import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resend, fromEmail } from '@/lib/resend';

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_email' }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from('waitlist')
    .insert({ email: parsed.data.email, source: 'website' });
  if (error && !error.message.includes('duplicate')) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  if (resend) {
    await resend.emails
      .send({
        from: fromEmail,
        to: parsed.data.email,
        subject: 'You\'re on the list',
        text: 'Thanks for joining — we\'ll be in touch.',
      })
      .catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
