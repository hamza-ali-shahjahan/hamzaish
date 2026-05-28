import { z } from 'zod';

export const productConfigSchema = z.object({
  slug: z.string(),
  name: z.string(),
  one_liner: z.string(),
  created: z.string(),
  stage: z.enum(['idea', 'mvp', 'launch', 'scale']),
  status: z.enum(['active', 'slot_reserved', 'sunset_planned', 'killed']),
  code_path: z.string().nullable(),
  aliases: z.array(z.string()),
  analytics: z.object({
    stripe_account_id: z.string().nullable(),
    posthog_project_id: z.string().nullable(),
    ga4_measurement_id: z.string().nullable(),
    plausible_domain: z.string().nullable(),
    sentry_org: z.string().nullable(),
    sentry_project: z.string().nullable(),
    gsc_property: z.string().nullable(),
    ahrefs_target: z.string().nullable(),
  }),
  links: z.object({
    github: z.string().nullable(),
    prod_url: z.string().nullable(),
    staging_url: z.string().nullable(),
  }),
  notes: z.string().optional(),
});

export type ProductConfig = z.infer<typeof productConfigSchema>;

export type ConnectorStatus = 'connected' | 'not_connected' | 'error';

export type ProductMetrics = {
  slug: string;
  mrr_usd: number | null;
  paying_customers: number | null;
  active_users_7d: number | null;
  signups_7d: number | null;
  errors_24h: number | null;
  top_queries_7d: Array<{ query: string; clicks: number; impressions: number; position: number }>;
  health_score: number | null;
  connectors: {
    stripe: ConnectorStatus;
    posthog: ConnectorStatus;
    sentry: ConnectorStatus;
    gsc: ConnectorStatus;
    plausible: ConnectorStatus;
  };
};
