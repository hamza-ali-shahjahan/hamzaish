import type { ConnectorStatus } from '../types';

export async function fetchGSCMetrics(property: string | null): Promise<{
  status: ConnectorStatus;
  top_queries_7d: Array<{ query: string; clicks: number; impressions: number; position: number }>;
}> {
  if (!property) return { status: 'not_connected', top_queries_7d: [] };
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return { status: 'not_connected', top_queries_7d: [] };
  }

  try {
    // v1: stub. TODO: Google Search Console Searchanalytics API
    // POST https://searchconsole.googleapis.com/webmasters/v3/sites/<property>/searchAnalytics/query
    // with { startDate, endDate, dimensions: ['query'], rowLimit: 5 }
    return { status: 'connected', top_queries_7d: [] };
  } catch {
    return { status: 'error', top_queries_7d: [] };
  }
}
