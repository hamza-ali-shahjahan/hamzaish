import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Welcome, {user.email}</h1>
      <p className="mt-4 text-muted-foreground">Your dashboard. Build the first feature here.</p>
    </main>
  );
}
