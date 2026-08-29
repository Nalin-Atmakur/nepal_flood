import { defineConfig, devices } from "@playwright/test";

/** Smoke suite against a built app: `npm run build && npm run e2e`. */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000/en",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
