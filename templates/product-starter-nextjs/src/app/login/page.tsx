'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LOCAL_MODE } from '@/lib/env';
import { AGE_REFUSED_KEY, isUnderAge } from '@/lib/legal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error' | 'invalid_year' | 'refused'>('idle');

  // An under-age refusal sticks for the whole session (back button can't retry).
  useEffect(() => {
    try { if (sessionStorage.getItem(AGE_REFUSED_KEY)) setStatus('refused'); } catch {}
  }, []);

  // Local-first: with no auth provider wired, you're already "signed in".
  if (LOCAL_MODE) {
    return (
      <main className="container mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">Local mode</h1>
        <p className="text-muted-foreground mt-2">
          No auth provider configured yet — you&apos;re running as a dev user.
        </p>
        <Link href="/dashboard" className="mt-8 inline-block rounded-md bg-primary text-primary-foreground px-4 py-3 font-medium">
          Go to your dashboard →
        </Link>
        <p className="text-xs text-muted-foreground mt-6">Wire Supabase (or Clerk) when you&apos;re ready for real sign-in.</p>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Neutral age gate: a magic link creates the account on first use.
    const year = parseInt(birthYear, 10);
    const under = isUnderAge(year);
    if (under === null) return setStatus('invalid_year');
    if (under) {
      // Refuse without calling auth or analytics — nothing is stored or sent.
      try { sessionStorage.setItem(AGE_REFUSED_KEY, '1'); } catch {}
      setEmail('');
      setBirthYear('');
      return setStatus('refused');
    }
    setStatus('submitting');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { age_confirmed: true, birth_year: year },
      },
    });
    setStatus(error ? 'error' : 'sent');
  }

  return (
    <main className="container mx-auto max-w-md px-4 py-24">
      <h1 className="text-3xl font-bold text-center">Sign in</h1>
      <p className="text-center text-muted-foreground mt-2">We&apos;ll email you a magic link.</p>
      {status === 'refused' ? (
        <p className="text-center mt-8">Sorry, we can&apos;t create an account for you right now.</p>
      ) : status === 'sent' ? (
        <p className="text-center mt-8">Check your inbox for the sign-in link.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@work.com"
            className="w-full rounded-md border px-4 py-3"
          />
          <input
            type="number" inputMode="numeric" required min={1900} max={new Date().getFullYear()}
            value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
            placeholder="Birth year (YYYY)" aria-label="Birth year"
            className="w-full rounded-md border px-4 py-3"
          />
          <button
            type="submit" disabled={status === 'submitting'}
            className="w-full rounded-md bg-primary text-primary-foreground px-4 py-3 font-medium disabled:opacity-50"
          >
            {status === 'submitting' ? 'Sending…' : 'Send magic link'}
          </button>
          {status === 'invalid_year' && (
            <p className="text-sm text-red-500 text-center">Please enter a valid birth year.</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-500 text-center">Something went wrong. Try again.</p>
          )}
        </form>
      )}
    </main>
  );
}
