import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isStripeConfigured } from '@/lib/stripe';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main className="container mx-auto max-w-2xl px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <section className="space-y-2">
        <h2 className="font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">Email: {user.email}</p>
      </section>
      {isStripeConfigured() && (
        <section className="space-y-2">
          <h2 className="font-semibold">Billing</h2>
          <form action="/api/stripe/portal" method="post">
            <button className="rounded-md border px-4 py-2 hover:bg-muted">Manage subscription</button>
          </form>
        </section>
      )}
    </main>
  );
}
