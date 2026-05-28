import type { ProductConfig, ProductMetrics } from '../types';
import { fetchStripeMetrics } from './stripe';
import { fetchPostHogMetrics } from './posthog';
import { fetchSentryMetrics } from './sentry';
import { fetchGSCMetrics } from './gsc';

const CACHE = new Map<string, { value: ProductMetrics; expires: number }>();
const TTL_MS = 5 * 60 * 1000;

export async function fetchProductMetrics(p: ProductConfig): Promise<ProductMetrics> {
  const cached = CACHE.get(p.slug);
  if (cached && cached.expires > Date.now()) return cached.value;

  const [stripe, posthog, sentry, gsc] = await Promise.allSettled([
    fetchStripeMetrics(p.analytics.stripe_account_id),
    fetchPostHogMetrics(p.analytics.posthog_project_id),
    fetchSentryMetrics(p.analytics.sentry_org, p.analytics.sentry_project),
    fetchGSCMetrics(p.analytics.gsc_property),
  ]);

  const metrics: ProductMetrics = {
    slug: p.slug,
    mrr_usd: stripe.status === 'fulfilled' ? stripe.value.mrr_usd : null,
    paying_customers: stripe.status === 'fulfilled' ? stripe.value.paying_customers : null,
    active_users_7d: posthog.status === 'fulfilled' ? posthog.value.active_users_7d : null,
    signups_7d: posthog.status === 'fulfilled' ? posthog.value.signups_7d : null,
    errors_24h: sentry.status === 'fulfilled' ? sentry.value.errors_24h : null,
    top_queries_7d: gsc.status === 'fulfilled' ? gsc.value.top_queries_7d : [],
    health_score: computeHealth({
      retention: posthog.status === 'fulfilled' ? posthog.value.retention_proxy : null,
      mrr: stripe.status === 'fulfilled' ? stripe.value.mrr_usd : null,
      errors: sentry.status === 'fulfilled' ? sentry.value.errors_24h : null,
    }),
    connectors: {
      stripe: stripe.status === 'fulfilled' ? stripe.value.status : 'error',
      posthog: posthog.status === 'fulfilled' ? posthog.value.status : 'error',
      sentry: sentry.status === 'fulfilled' ? sentry.value.status : 'error',
      gsc: gsc.status === 'fulfilled' ? gsc.value.status : 'error',
      plausible: 'not_connected',
    },
  };

  CACHE.set(p.slug, { value: metrics, expires: Date.now() + TTL_MS });
  return metrics;
}

function computeHealth(parts: { retention: number | null; mrr: number | null; errors: number | null }): number | null {
  // Naive v1: returns null if we have no signal at all.
  if (parts.retention === null && parts.mrr === null && parts.errors === null) return null;
  const retentionScore = parts.retention ?? 0.5;
  const mrrScore = parts.mrr === null ? 0.5 : Math.min(1, parts.mrr / 1000);
  const errorPenalty = parts.errors === null ? 0 : Math.min(0.3, parts.errors / 1000);
  return Math.max(0, Math.min(1, 0.4 * retentionScore + 0.3 * mrrScore + 0.3 * (1 - errorPenalty)));
}
