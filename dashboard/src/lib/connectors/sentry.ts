import type { ConnectorStatus } from '../types';

// Real Sentry connector (v2 — 2026-07-02). Project stats endpoint, hourly
// buckets summed over the last 24h. `stat=received` counts all events received
// (errors + everything else) — used here as the error-pressure proxy; a spike
// is a spike either way. The v1 stub returned `connected` with a hardcoded 0.

export type SentryDeps = {
  fetchFn?: typeof fetch;
  authToken?: string; // defaults to SENTRY_AUTH_TOKEN
};

export async function fetchSentryMetrics(
  org: string | null,
  project: string | null,
  deps: SentryDeps = {},
): Promise<{ status: ConnectorStatus; errors_24h: number | null }> {
  const token = deps.authToken ?? process.env.SENTRY_AUTH_TOKEN;
  const fetchFn = deps.fetchFn ?? fetch;
  if (!org || !project || !token) return { status: 'not_connected', errors_24h: null };

  const since = Math.floor(Date.now() / 1000) - 24 * 3600;
  try {
    const res = await fetchFn(
      `https://sentry.io/api/0/projects/${encodeURIComponent(org)}/${encodeURIComponent(project)}/stats/?stat=received&resolution=1h&since=${since}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return { status: 'error', errors_24h: null };
    const buckets = (await res.json()) as Array<[number, number]>;
    if (!Array.isArray(buckets)) return { status: 'error', errors_24h: null };
    return { status: 'connected', errors_24h: buckets.reduce((sum, [, n]) => sum + n, 0) };
  } catch {
    return { status: 'error', errors_24h: null };
  }
}
