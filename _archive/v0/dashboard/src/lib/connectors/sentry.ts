import type { ConnectorStatus } from '../types';

export async function fetchSentryMetrics(
  org: string | null,
  project: string | null,
): Promise<{ status: ConnectorStatus; errors_24h: number | null }> {
  if (!org || !project) return { status: 'not_connected', errors_24h: null };
  if (!process.env.SENTRY_AUTH_TOKEN) return { status: 'not_connected', errors_24h: null };

  try {
    // v1: stub. TODO: Sentry Events API
    // GET https://sentry.io/api/0/projects/<org>/<project>/stats/?stat=received&resolution=1h&since=<24h_ago>
    return { status: 'connected', errors_24h: 0 };
  } catch {
    return { status: 'error', errors_24h: null };
  }
}
