import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load .env.e2e for E2E tests (offline mode by default)
// This ensures we never accidentally use real tokens in tests
dotenv.config({ path: '.env.e2e' });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: './tests/e2e/setup/global-setup.ts',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Chromium - English
    {
      name: 'chromium-en',
      use: { 
        ...devices['Desktop Chrome'],
        locale: 'en-US',
      },
    },
    // Chromium - Arabic
    {
      name: 'chromium-ar',
      use: { 
        ...devices['Desktop Chrome'],
        locale: 'ar-SA',
      },
    },
    // Firefox - English
    {
      name: 'firefox-en',
      use: { 
        ...devices['Desktop Firefox'],
        locale: 'en-US',
      },
    },
    // Firefox - Arabic
    {
      name: 'firefox-ar',
      use: { 
        ...devices['Desktop Firefox'],
        locale: 'ar-SA',
      },
    },
    // WebKit - English
    {
      name: 'webkit-en',
      use: { 
        ...devices['Desktop Safari'],
        locale: 'en-US',
      },
    },
    // WebKit - Arabic
    {
      name: 'webkit-ar',
      use: { 
        ...devices['Desktop Safari'],
        locale: 'ar-SA',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
