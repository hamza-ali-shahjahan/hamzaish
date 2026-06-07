import { defineConfig, devices } from '@playwright/test';

// Smoke E2E. The output-validation playbook's rule applies here: a 100%-green unit
// suite can still ship a broken app — so we boot the REAL Next server and hit REAL
// routes. This is the cheapest "run it in the consumer environment" gate.
//
// Point E2E_BASE_URL at a deployed preview to run against that instead of booting locally.
const PORT = 3000;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
