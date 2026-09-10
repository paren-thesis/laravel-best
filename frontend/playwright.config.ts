import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run on the host against the containerised app, because the
 * frontend image is Alpine and Playwright's browsers require glibc.
 *
 * Bring the stack up first:  docker compose up -d
 * Then:                      npm run test:e2e
 *
 * Timeouts are deliberately generous. PHP-FPM on Docker Desktop for Windows
 * answers in seconds rather than milliseconds, and login is slower still
 * because of the bcrypt cost factor.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 45_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    actionTimeout: 45_000,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
