import Link from 'next/link';
import { env } from '@/lib/env';

export default function HomePage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-24">
      <section className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">{env.NEXT_PUBLIC_APP_NAME}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {/* {{ONE_LINER}} */}
          The fastest way to <span className="font-semibold">{'{{CORE_BENEFIT}}'}</span> — built for{' '}
          <span className="font-semibold">{'{{TARGET_USER}}'}</span>.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/waitlist"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90"
          >
            Join the waitlist
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-md border px-6 py-3 font-medium hover:bg-muted"
          >
            See pricing
          </Link>
        </div>
      </section>

      <section className="mt-24 grid md:grid-cols-3 gap-8">
        {[
          { title: '{{VALUE_PROP_1}}', body: '{{Explain in 2 sentences how this benefits the user.}}' },
          { title: '{{VALUE_PROP_2}}', body: '{{Explain in 2 sentences.}}' },
          { title: '{{VALUE_PROP_3}}', body: '{{Explain in 2 sentences.}}' },
        ].map((b) => (
          <div key={b.title} className="rounded-lg border p-6 space-y-2">
            <h3 className="text-lg font-semibold">{b.title}</h3>
            <p className="text-muted-foreground">{b.body}</p>
          </div>
        ))}
      </section>

      <footer className="mt-24 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {env.NEXT_PUBLIC_APP_NAME}.{' '}
        <Link href="/privacy" className="underline">Privacy</Link> ·{' '}
        <Link href="/terms" className="underline">Terms</Link>
      </footer>
    </main>
  );
}
