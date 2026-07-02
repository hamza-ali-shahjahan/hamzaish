import type { ConnectorStatus } from '../types';

// Real PostHog connector (v2 — 2026-07-02). One HogQL query returns all three
// numbers: distinct actives over 7d, over 30d (for the retention proxy), and
// signups over 7d. The v1 stub returned `connected` with hardcoded zeros.
//
// retention_proxy = 7d actives / 30d actives (WAU/MAU) — an honest 0..1 proxy,
// NOT a cohort retention curve (that's retention-analyst's deeper job).
// Signup event name: POSTHOG_SIGNUP_EVENT (default "user_signed_up" — the
// factory's PostHog naming standard from measurement-framework).

export type PostHogDeps = {
  fetchFn?: typeof fetch;
  apiKey?: string; // defaults to POSTHOG_PERSONAL_API_KEY
  host?: string; // defaults to POSTHOG_HOST or https://us.posthog.com
  signupEvent?: string;
};

export async function fetchPostHogMetrics(
  projectId: string | null,
  deps: PostHogDeps = {},
): Promise<{ status: ConnectorStatus; active_users_7d: number | null; signups_7d: number | null; retention_proxy: number | null }> {
  const apiKey = deps.apiKey ?? process.env.POSTHOG_PERSONAL_API_KEY;
  const host = (deps.host ?? process.env.POSTHOG_HOST ?? 'https://us.posthog.com').replace(/\/$/, '');
  const signupEvent = deps.signupEvent ?? process.env.POSTHOG_SIGNUP_EVENT ?? 'user_signed_up';
  const fetchFn = deps.fetchFn ?? fetch;
  const empty = { active_users_7d: null, signups_7d: null, retention_proxy: null };
  if (!projectId || !apiKey) return { status: 'not_connected', ...empty };

  const hogql = `
    SELECT
      count(DISTINCT if(timestamp > now() - INTERVAL 7 DAY, person_id, NULL)) AS active_7d,
      count(DISTINCT person_id) AS active_30d,
      count(DISTINCT if(event = '${signupEvent.replace(/'/g, "''")}' AND timestamp > now() - INTERVAL 7 DAY, person_id, NULL)) AS signups_7d
    FROM events
    WHERE timestamp > now() - INTERVAL 30 DAY`;

  try {
    const res = await fetchFn(`${host}/api/projects/${encodeURIComponent(projectId)}/query/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query: hogql } }),
    });
    if (!res.ok) return { status: 'error', ...empty };
    const body = (await res.json()) as { results?: Array<Array<number>> };
    const row = body.results?.[0];
    if (!row || row.length < 3) return { status: 'error', ...empty };
    const [active7d, active30d, signups7d] = row;
    return {
      status: 'connected',
      active_users_7d: active7d,
      signups_7d: signups7d,
      retention_proxy: active30d > 0 ? Math.min(1, active7d / active30d) : null,
    };
  } catch {
    return { status: 'error', ...empty };
  }
}
