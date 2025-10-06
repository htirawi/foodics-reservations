import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load .env.e2e for E2E tests (offline mode by default)
// This ensures we never accidentally use real tokens in tests
dotenv.config({ path: '.env.e2e', quiet: true });

// Note: Color behavior is controlled via package.json scripts
// Use FORCE_COLOR=0 for no color, or let tools default to colored output

// Configurable locale via env (default EN)
// const TEST_LOCALE = process.env.TEST_LOCALE || 'en';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : (process.env.FIXING ? 0 : 0),
  workers: (process.env.CI || process.env.FIXING) ? 1 : undefined,
  reporter: 'html',
  globalSetup: './tests/e2e/setup/global-setup.ts',
  expect: {
    timeout: 7000, // 7s for assertions
  },
  timeout: 30000, // 30s total test timeout
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000, // 10s for actions
    navigationTimeout: 30000, // 30s for navigation
    // Fix environment variable conflicts
    colorScheme: 'light',
  },
  projects: [
    // Chromium - English
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        locale: 'en-US',
      },
      retries: 0, // No retries for deterministic tests
    },
    // Chromium - Arabic
    {
      name: 'chromium-ar',
      use: { 
        ...devices['Desktop Chrome'],
        locale: 'ar-SA',
      },
      retries: 0,
    },
    // Firefox - English
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        locale: 'en-US',
      },
      retries: 0,
    },
    // Firefox - Arabic
    {
      name: 'firefox-ar',
      use: { 
        ...devices['Desktop Firefox'],
        locale: 'ar-SA',
      },
      retries: 0,
    },
    // WebKit - English
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        locale: 'en-US',
      },
      retries: 1, // WebKit needs retries for focus issues
    },
    // WebKit - Arabic
    {
      name: 'webkit-ar',
      use: { 
        ...devices['Desktop Safari'],
        locale: 'ar-SA',
      },
      retries: 1,
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
