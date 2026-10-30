import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  // Smoke tests run against the production build, not the dev server.
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    // Section 8.1: designed at 360px, must be usable at 320px.
    {
      name: "phone-320",
      use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 640 } },
    },
    {
      name: "phone-360",
      use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 740 } },
    },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
