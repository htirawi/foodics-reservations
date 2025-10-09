/**
 * @file browser.ts
 * @summary MSW browser setup for E2E tests
 * @description
 *   Initializes Mock Service Worker in the browser for E2E testing.
 *   Intercepts network requests and returns mock responses.
 *
 * Usage in E2E tests:
 *   1. Start MSW before tests: `await setupMSW(page)`
 *   2. Run tests normally
 *   3. MSW will intercept API calls automatically
 */

import { setupWorker } from 'msw/browser'

import { handlers } from '@tests/mocks/handlers'

/**
 * Create MSW worker for browser
 */
export const worker = setupWorker(...handlers)

/**
 * Start MSW worker
 *
 * Call this in your E2E test setup to enable mocking.
 *
 * @example
 * ```typescript
 * test.beforeAll(async () => {
 *   await worker.start()
 * })
 *
 * test.afterAll(async () => {
 *   worker.stop()
 * })
 * ```
 */
export const startMockServer = () => {
  return worker.start({
    onUnhandledRequest: 'bypass', // Don't warn for unhandled requests
    quiet: false, // Log requests in development
  })
}

/**
 * Stop MSW worker
 */
export const stopMockServer = () => {
  worker.stop()
}

/**
 * Reset MSW handlers
 */
export const resetMockServer = () => {
  worker.resetHandlers()
}
