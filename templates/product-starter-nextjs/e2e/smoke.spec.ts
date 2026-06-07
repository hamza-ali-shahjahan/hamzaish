import { expect, test } from '@playwright/test';

// Smoke E2E — the routes that must never 500. Extend with the auth happy-path and a
// Stripe checkout dry-run (test mode) before you charge anyone real money.
test('landing page renders', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status() ?? 500).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
});

test('pricing page renders', async ({ page }) => {
  const res = await page.goto('/pricing');
  expect(res?.status() ?? 500).toBeLessThan(400);
});

test('waitlist page renders', async ({ page }) => {
  const res = await page.goto('/waitlist');
  expect(res?.status() ?? 500).toBeLessThan(400);
});
