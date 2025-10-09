/**
 * @file base.ts
 * @summary Playwright base test fixture with offline network defaults
 * @remarks
 *   - Extends @playwright/test with offline-first defaults
 *   - Import as `test` and use like normal Playwright tests
 *   - External requests blocked by default; localhost allowed
 */
import { test as base } from "@playwright/test";

import { blockExternalRequests } from "@tests/e2e/utils/network";

/**
 * Extended test fixture with automatic offline mode
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    // Block external requests for all pages in this context
    await blockExternalRequests(context, {
      onBlock: () => {
        // Optional: log blocked requests (disabled by default to reduce noise)
        // console.warn(`🚫 Blocked: ${method} ${url}`);
      },
    });

    await use(context);
  },
});

export { expect } from "@playwright/test";
