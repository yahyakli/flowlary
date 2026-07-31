import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for Flowlary.
 *
 * The tests expect a running app on the EXISTING dev/build server:
 *   npm run dev
 *
 * They run against a real MongoDB deployment configured via .env.local
 * (MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL). To run locally:
 *
 *   npm run test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});