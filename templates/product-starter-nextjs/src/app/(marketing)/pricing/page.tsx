import Link from 'next/link';
import type { Route } from 'next';

// href is typed as Route so `typedRoutes` validates these against real pages —
// a renamed route breaks the build here instead of 404ing in production.
const tiers: Array<{
  name: string;
  price: string;
  cadence: string;
  features: string[];
  cta: string;
  href: Route;
  highlight?: boolean;
}> = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    features: ['{{FREE_FEATURE_1}}', '{{FREE_FEATURE_2}}', '{{FREE_FEATURE_3}}'],
    cta: 'Get started',
    href: '/login',
  },
  {
    name: 'Pro',
    price: '$29',
    cadence: '/mo',
    features: ['{{PRO_FEATURE_1}}', '{{PRO_FEATURE_2}}', '{{PRO_FEATURE_3}}', '{{PRO_FEATURE_4}}'],
    cta: 'Start free trial',
    href: '/login?plan=pro',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$99',
    cadence: '/mo',
    features: ['Everything in Pro', '{{TEAM_FEATURE_1}}', '{{TEAM_FEATURE_2}}'],
    cta: 'Start free trial',
    href: '/login?plan=team',
  },
];

export default function PricingPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-24">
      <header className="text-center mb-16 space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="text-muted-foreground text-lg">Start free. Upgrade when you need more.</p>
      </header>
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`rounded-lg border p-8 space-y-6 ${t.highlight ? 'border-primary border-2' : ''}`}
          >
            <div>
              <h2 className="text-2xl font-semibold">{t.name}</h2>
              <div className="mt-2">
                <span className="text-4xl font-bold">{t.price}</span>
                <span className="text-muted-foreground">{t.cadence}</span>
              </div>
            </div>
            <ul className="space-y-2">
              {t.features.map((f) => (
                <li key={f} className="text-sm">
                  ✓ {f}
                </li>
              ))}
            </ul>
            <Link
              href={t.href}
              className="block text-center rounded-md bg-primary text-primary-foreground px-4 py-2 font-medium hover:opacity-90"
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mt-12">
        Annual billing saves 15%. Enterprise pricing is custom —{' '}
        {/* plain <a>: mailto is not a route; next/link + typedRoutes rightly rejects it */}
        <a href="mailto:sales@example.com" className="underline">
          talk to us
        </a>
        .
      </p>
    </main>
  );
}
