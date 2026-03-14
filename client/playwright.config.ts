import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "yarn dev",
      cwd: "../server",
      port: 3000,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5173",
      cwd: ".",
      port: 5173,
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
