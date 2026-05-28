import posthog from 'posthog-js';
import { env } from '@/lib/env';

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;
  if (env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
    });
  }
  initialized = true;
}

export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (env.NEXT_PUBLIC_POSTHOG_KEY) posthog.capture(event, props);
  // GA4 + Plausible auto-tracked via their script tags in layout.tsx
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (env.NEXT_PUBLIC_POSTHOG_KEY) posthog.identify(userId, traits);
}
