import type { ProductConfig, ProductMetrics, ConnectorStatus } from '@/lib/types';

const stageColors: Record<string, string> = {
  idea: 'bg-zinc-200 text-zinc-700',
  mvp: 'bg-blue-100 text-blue-700',
  launch: 'bg-amber-100 text-amber-700',
  scale: 'bg-emerald-100 text-emerald-700',
};

const statusBadge: Record<string, string> = {
  active: '',
  slot_reserved: '🚧 reserved',
  sunset_planned: '🌅 sunset',
  killed: '💀 killed',
};

export default function ProductCard({
  product,
  metrics,
}: {
  product: ProductConfig;
  metrics: ProductMetrics;
}) {
  const isReserved = product.status === 'slot_reserved';
  return (
    <article className={`rounded-lg border bg-white p-5 ${isReserved ? 'opacity-60' : ''}`}>
      <header className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <span className={`text-xs px-2 py-0.5 rounded ${stageColors[product.stage]}`}>{product.stage}</span>
            {statusBadge[product.status] && (
              <span className="text-xs text-zinc-500">{statusBadge[product.status]}</span>
            )}
          </div>
          <p className="text-sm text-zinc-500 mt-1">{product.one_liner}</p>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-3 text-sm">
        <Metric label="MRR" value={metrics.mrr_usd === null ? '—' : `$${metrics.mrr_usd.toFixed(0)}`} />
        <Metric label="Paying" value={metrics.paying_customers === null ? '—' : metrics.paying_customers.toString()} />
        <Metric label="7d AU" value={metrics.active_users_7d === null ? '—' : metrics.active_users_7d.toString()} />
        <Metric
          label="Errors 24h"
          value={metrics.errors_24h === null ? '—' : metrics.errors_24h.toString()}
          tone={metrics.errors_24h && metrics.errors_24h > 10 ? 'warn' : 'normal'}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <ConnectorPill name="Stripe" status={metrics.connectors.stripe} />
        <ConnectorPill name="PostHog" status={metrics.connectors.posthog} />
        <ConnectorPill name="Sentry" status={metrics.connectors.sentry} />
        <ConnectorPill name="GSC" status={metrics.connectors.gsc} />
        <ConnectorPill name="Plausible" status={metrics.connectors.plausible} />
      </div>
    </article>
  );
}

function Metric({ label, value, tone = 'normal' }: { label: string; value: string; tone?: 'normal' | 'warn' }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-400">{label}</div>
      <div className={`font-semibold ${tone === 'warn' ? 'text-red-600' : ''}`}>{value}</div>
    </div>
  );
}

function ConnectorPill({ name, status }: { name: string; status: ConnectorStatus }) {
  const cls =
    status === 'connected'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'error'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-zinc-50 text-zinc-400 border-zinc-200';
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${cls}`}>
      {name}
      {status === 'not_connected' ? ' ·' : ''}
      {status === 'not_connected' ? ' off' : ''}
    </span>
  );
}
