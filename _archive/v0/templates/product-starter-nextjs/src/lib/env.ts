import { z } from 'zod';

const required = (name: string) => z.string().min(1, `${name} is required`);
const optional = z.string().optional();

const envSchema = z.object({
  // App
  NEXT_PUBLIC_APP_NAME: required('NEXT_PUBLIC_APP_NAME'),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: optional,

  // Stripe — optional during setup, required to take payments
  STRIPE_SECRET_KEY: optional,
  STRIPE_WEBHOOK_SECRET: optional,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optional,

  // Email
  RESEND_API_KEY: optional,
  RESEND_FROM_EMAIL: optional,

  // Analytics — all optional during early setup
  NEXT_PUBLIC_POSTHOG_KEY: optional,
  NEXT_PUBLIC_POSTHOG_HOST: optional,
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: optional,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: optional,
  NEXT_PUBLIC_GSC_VERIFICATION: optional,

  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: optional,
  SENTRY_AUTH_TOKEN: optional,
  SENTRY_ORG: optional,
  SENTRY_PROJECT: optional,

  // AI
  ANTHROPIC_API_KEY: optional,
  OPENROUTER_API_KEY: optional,

  // Background
  INNGEST_SIGNING_KEY: optional,
  INNGEST_EVENT_KEY: optional,
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid env:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables — see .env.example');
}

export const env = parsed.data;
