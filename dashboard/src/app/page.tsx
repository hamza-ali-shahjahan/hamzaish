import { loadRegistry } from '@/lib/registry';
import { fetchProductMetrics } from '@/lib/connectors';
import ProductCard from '@/components/product-card';

export const revalidate = 60;

export default async function DashboardPage() {
  const products = await loadRegistry();
  const metricsList = await Promise.all(products.map((p) => fetchProductMetrics(p)));

  const totals = metricsList.reduce(
    (acc, m) => ({
      mrr: acc.mrr + (m.mrr_usd ?? 0),
      customers: acc.customers + (m.paying_customers ?? 0),
      users: acc.users + (m.active_users_7d ?? 0),
      errors: acc.errors + (m.errors_24h ?? 0),
    }),
    { mrr: 0, customers: 0, users: 0, errors: 0 },
  );

  return (
    <main className="container mx-auto max-w-7xl px-4 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Hamzaish Portfolio</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {products.length} products · {products.filter((p) => p.status === 'active').length} active · {products.filter((p) => p.status === 'slot_reserved').length} reserved
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatBox label="MRR (total)" value={`$${totals.mrr.toFixed(0)}`} />
        <StatBox label="Paying customers" value={totals.customers.toString()} />
        <StatBox label="7d active users" value={totals.users.toString()} />
        <StatBox label="Errors (24h)" value={totals.errors.toString()} tone={totals.errors > 50 ? 'warn' : 'normal'} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {products.map((p, i) => (
          <ProductCard key={p.slug} product={p} metrics={metricsList[i]} />
        ))}
      </section>

      <footer className="mt-12 text-xs text-zinc-400">
        Data refreshes every 5 min per product. Reload to recompute.
      </footer>
    </main>
  );
}

function StatBox({ label, value, tone = 'normal' }: { label: string; value: string; tone?: 'normal' | 'warn' }) {
  return (
    <div className={`rounded-lg border bg-white p-4 ${tone === 'warn' ? 'border-red-300' : 'border-zinc-200'}`}>
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${tone === 'warn' ? 'text-red-600' : ''}`}>{value}</div>
    </div>
  );
}
