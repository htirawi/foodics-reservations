/**
 * @file network.ts
 * @summary Reusable network utilities for E2E tests
 * @remarks
 *   - Block external requests by default (offline-first)
 *   - Mock API routes with fixture mappings
 *   - Minimal, composable helpers for test setup
 */
import type { Page, BrowserContext, Route } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = resolve(__dirname, "../fixtures");

/**
 * Load JSON fixture from tests/e2e/fixtures/
 */
export function loadFixture(filename: string): unknown {
  const path = resolve(FIXTURES_DIR, filename);
  const content = readFileSync(path, "utf-8");
  return JSON.parse(content);
}

/**
 * Check if URL should be allowed (localhost, Vite dev server, etc.)
 */
export function isAllowedUrl(url: string): boolean {
  return (
    url.includes("localhost:5173") ||
    url.includes("127.0.0.1:5173") ||
    url.startsWith("http://localhost:5173") ||
    url.includes("/@vite") ||
    url.includes("/@fs") ||
    url.includes("/node_modules/") ||
    url.includes("/src/") // Allow Vite HMR
  );
}

/**
 * Block all external requests (non-localhost).
 * Allows Vite dev server, localhost, and static assets.
 *
 * @param context - Browser context (blocks at context level for all pages)
 * @param options.onBlock - Optional callback when request is blocked
 */
export async function blockExternalRequests(
  context: BrowserContext,
  options?: { onBlock?: (url: string, method: string) => void }
): Promise<void> {
  await context.route("**/*", async (route: Route) => {
    const url = route.request().url();

    if (isAllowedUrl(url)) {
      await route.continue();
      return;
    }

    // Block external request
    const method = route.request().method();
    options?.onBlock?.(url, method);
    await route.abort("blockedbyclient");
  });
}

/**
 * API route mapping: pattern -> fixture filename or handler
 */
export type ApiMapping = {
  pattern: string | RegExp;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  fixture?: string;
  handler?: (route: Route) => Promise<void>;
};

/**
 * Mock API routes with fixture mappings.
 *
 * @example
 * await mockApi(page, [
 *   { pattern: /\/api\/branches$/, method: 'GET', fixture: 'branches.json' },
 *   { pattern: /\/api\/branches\/\w+$/, method: 'PUT', fixture: 'branch-update.json' }
 * ]);
 */
export async function mockApi(
  page: Page,
  mappings: ApiMapping[]
): Promise<void> {
  for (const mapping of mappings) {
    await page.route(mapping.pattern, async (route: Route) => {
      // Check method if specified
      if (mapping.method && route.request().method() !== mapping.method) {
        await route.continue();
        return;
      }

      // Use custom handler if provided
      if (mapping.handler) {
        await mapping.handler(route);
        return;
      }

      // Use fixture if provided
      if (mapping.fixture) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(loadFixture(mapping.fixture)),
        });
        return;
      }

      // Fallback: continue
      await route.continue();
    });
  }
}

/**
 * Combined helper: block externals + mock API in one call
 *
 * @example
 * await setupOfflineApi(page, [
 *   { pattern: /\/api\/branches/, fixture: 'branches.json' }
 * ]);
 */
export async function setupOfflineApi(
  page: Page,
  mappings: ApiMapping[] = []
): Promise<void> {
  // Block at context level (covers all pages in the context)
  const context = page.context();
  await blockExternalRequests(context);

  // Mock API routes if mappings provided
  if (mappings.length > 0) {
    await mockApi(page, mappings);
  }
}
