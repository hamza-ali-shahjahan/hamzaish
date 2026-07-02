#!/usr/bin/env bun
// telemetry.ts — the portfolio's senses, on the command line.
//
// Pulls real metrics for every product via the dashboard connectors (Stripe MRR,
// PostHog actives/signups, Sentry error pressure) and prints one table. This is
// the data source /portfolio-pulse and portfolio-conductor were designed around
// (the audit's finding: "the five most decision-heavy agents are the five
// blindest"). Connectors degrade honestly: no key → not_connected, API failure
// → error — never invented numbers.
//
//   bun run telemetry            # markdown table
//   bun run telemetry --json     # machine-readable (for skills/agents)
//
// Keys (all optional — table renders with not_connected columns without them):
//   STRIPE_SECRET_KEY · POSTHOG_PERSONAL_API_KEY (+ POSTHOG_HOST, POSTHOG_SIGNUP_EVENT) · SENTRY_AUTH_TOKEN
//
// NOTE: imports from dashboard/src/lib use type-only imports for zod'd types,
// so this runs with zero installed dependencies (bun erases type imports).
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchStripeMetrics } from '../dashboard/src/lib/connectors/stripe';
import { fetchPostHogMetrics } from '../dashboard/src/lib/connectors/posthog';
import { fetchSentryMetrics } from '../dashboard/src/lib/connectors/sentry';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const asJson = process.argv.includes('--json');

type Row = {
  slug: string;
  stage: string;
  status: string;
  mrr_usd: number | null;
  paying_customers: number | null;
  active_users_7d: number | null;
  signups_7d: number | null;
  retention_proxy: number | null;
  errors_24h: number | null;
  connectors: Record<string, string>;
};

const productsDir = join(root, 'products');
const rows: Row[] = [];

for (const entry of readdirSync(productsDir)) {
  if (entry.startsWith('_')) continue;
  const cfgPath = join(productsDir, entry, 'product.config.json');
  try { if (!statSync(cfgPath).isFile()) continue; } catch { continue; }
  let cfg: any;
  try { cfg = JSON.parse(readFileSync(cfgPath, 'utf8')); } catch { continue; }
  if (cfg.status === 'killed') continue;
  const analytics = cfg.analytics ?? {};

  const [stripe, posthog, sentry] = await Promise.all([
    fetchStripeMetrics(analytics.stripe_account_id ?? null),
    fetchPostHogMetrics(analytics.posthog_project_id ?? null),
    fetchSentryMetrics(analytics.sentry_org ?? null, analytics.sentry_project ?? null),
  ]);

  rows.push({
    slug: cfg.slug ?? entry,
    stage: cfg.stage ?? '?',
    status: cfg.status ?? '?',
    mrr_usd: stripe.mrr_usd,
    paying_customers: stripe.paying_customers,
    active_users_7d: posthog.active_users_7d,
    signups_7d: posthog.signups_7d,
    retention_proxy: posthog.retention_proxy,
    errors_24h: sentry.errors_24h,
    connectors: { stripe: stripe.status, posthog: posthog.status, sentry: sentry.status },
  });
}

if (asJson) {
  console.log(JSON.stringify({ generated: new Date().toISOString(), products: rows }, null, 2));
  process.exit(0);
}

const fmt = (v: number | null, prefix = '') => (v === null ? '—' : `${prefix}${v}`);
const dot: Record<string, string> = { connected: '🟢', not_connected: '⚪', error: '🔴' };

console.log(`## Portfolio telemetry — ${new Date().toISOString().slice(0, 16)}Z\n`);
console.log('| product | stage | MRR | paying | active 7d | signups 7d | WAU/MAU | errors 24h | stripe·posthog·sentry |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  const ret = r.retention_proxy === null ? '—' : `${Math.round(r.retention_proxy * 100)}%`;
  console.log(
    `| ${r.slug} | ${r.stage} | ${fmt(r.mrr_usd, '$')} | ${fmt(r.paying_customers)} | ${fmt(r.active_users_7d)} | ${fmt(r.signups_7d)} | ${ret} | ${fmt(r.errors_24h)} | ${dot[r.connectors.stripe]}${dot[r.connectors.posthog]}${dot[r.connectors.sentry]} |`,
  );
}
const disconnected = rows.every((r) => Object.values(r.connectors).every((s) => s === 'not_connected'));
if (disconnected) {
  console.log(
    `\n_All connectors ⚪ not_connected — set STRIPE_SECRET_KEY / POSTHOG_PERSONAL_API_KEY / SENTRY_AUTH_TOKEN (and per-product IDs in product.config.json → analytics) to light them up. No key ever gets invented numbers._`,
  );
}
