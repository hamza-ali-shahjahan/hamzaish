import { z } from 'zod';

const required = (name: string) => z.string().min(1, `${name} is required`);
const optional = z.string().optional();

const envSchema = z.object({
  // App — sane defaults so `bun dev` runs with zero config
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('My Product'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Supabase — OPTIONAL. Local-first by default: with no Supabase configured the
  // app runs in LOCAL_MODE (dev-auth stub, no external calls). Wire it when you deploy.
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optional,
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

  // Sentry — DSN is the on-switch (read directly by the sentry.*.config.ts files,
  // which must not depend on this module booting). AUTH_TOKEN/ORG/PROJECT are
  // build-time source-map upload only and do NOT enable error capture.
  NEXT_PUBLIC_SENTRY_DSN: optional,
  SENTRY_AUTH_TOKEN: optional,
  SENTRY_ORG: optional,
  SENTRY_PROJECT: optional,
  // Gate for /api/debug/sentry-canary (verify-live A11). Unset → the route 404s.
  SENTRY_CANARY_TOKEN: optional,

  // AI
  ANTHROPIC_API_KEY: optional,
  OPENROUTER_API_KEY: optional,

});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Only fires on *malformed* values (e.g. a non-URL APP_URL) — never on missing
  // ones, since everything optional/defaulted. Zero env still boots.
  console.error('❌ Invalid env:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables — see .env.example');
}

export const env = parsed.data;

/**
 * LOCAL_MODE — the Builder Mode default. True when Supabase isn't configured:
 * the app runs entirely local (dev-auth stub, no external calls, no signups) so
 * `bun dev` works in 60 seconds. Add your stack when you want it; ship when ready.
 */
export const LOCAL_MODE =
  !env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
