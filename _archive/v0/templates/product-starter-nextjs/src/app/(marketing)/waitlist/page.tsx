'use client';
import { useState } from 'react';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', body: JSON.stringify({ email }) });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="container mx-auto max-w-md px-4 py-24">
      <header className="text-center space-y-3 mb-8">
        <h1 className="text-3xl font-bold">Join the waitlist</h1>
        <p className="text-muted-foreground">We&apos;ll email you as soon as we open access.</p>
      </header>
      {status === 'success' ? (
        <p className="text-center text-lg">You&apos;re in. Check your inbox.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@work.com"
            className="w-full rounded-md border px-4 py-3"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-md bg-primary text-primary-foreground px-4 py-3 font-medium disabled:opacity-50"
          >
            {status === 'submitting' ? 'Joining…' : 'Join waitlist'}
          </button>
          {status === 'error' && (
            <p className="text-sm text-red-500 text-center">Something went wrong. Try again?</p>
          )}
        </form>
      )}
    </main>
  );
}
