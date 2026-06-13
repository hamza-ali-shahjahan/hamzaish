'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LOCAL_MODE } from '@/lib/env';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');

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
    setStatus('submitting');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setStatus(error ? 'error' : 'sent');
  }

  return (
    <main className="container mx-auto max-w-md px-4 py-24">
      <h1 className="text-3xl font-bold text-center">Sign in</h1>
      <p className="text-center text-muted-foreground mt-2">We&apos;ll email you a magic link.</p>
      {status === 'sent' ? (
        <p className="text-center mt-8">Check your inbox for the sign-in link.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@work.com"
            className="w-full rounded-md border px-4 py-3"
          />
          <button
            type="submit" disabled={status === 'submitting'}
            className="w-full rounded-md bg-primary text-primary-foreground px-4 py-3 font-medium disabled:opacity-50"
          >
            {status === 'submitting' ? 'Sending…' : 'Send magic link'}
          </button>
          {status === 'error' && (
            <p className="text-sm text-red-500 text-center">Something went wrong. Try again.</p>
          )}
        </form>
      )}
    </main>
  );
}
