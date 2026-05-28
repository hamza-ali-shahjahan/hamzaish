import type { ConnectorStatus } from '../types';

export async function fetchPostHogMetrics(projectId: string | null): Promise<{
  status: ConnectorStatus;
  active_users_7d: number | null;
  signups_7d: number | null;
  retention_proxy: number | null;
}> {
  if (!projectId) {
    return { status: 'not_connected', active_users_7d: null, signups_7d: null, retention_proxy: null };
  }
  if (!process.env.POSTHOG_PERSONAL_API_KEY) {
    return { status: 'not_connected', active_users_7d: null, signups_7d: null, retention_proxy: null };
  }

  try {
    // v1: stub. TODO: PostHog Query API
    // GET https://us.posthog.com/api/projects/<id>/query/ with HogQL
    return { status: 'connected', active_users_7d: 0, signups_7d: 0, retention_proxy: 0.5 };
  } catch {
    return { status: 'error', active_users_7d: null, signups_7d: null, retention_proxy: null };
  }
}
