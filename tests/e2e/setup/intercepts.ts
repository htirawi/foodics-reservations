/**
 * Playwright Route Interception Helpers
 * Provides fixtures for offline E2E testing
 */

import type { Page, Route } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = resolve(__dirname, '../fixtures');

/**
 * Load a JSON fixture file
 */
function loadFixture(filename: string): unknown {
  const path = resolve(FIXTURES_DIR, filename);
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(content);
}

/**
 * Setup offline mode: intercept all /api/** requests and fulfill from fixtures
 */
export async function setupOfflineMode(page: Page): Promise<void> {
  // Intercept GET /api/branches (without include)
  await page.route('**/api/branches', async (route: Route) => {
    const url = new URL(route.request().url());
    const include = url.searchParams.get('include');

    if (include?.includes('sections')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(loadFixture('branches-with-sections.json')),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(loadFixture('branches.json')),
      });
    }
  });

  // Intercept PATCH /api/branches/:id (enable/disable reservations)
  await page.route('**/api/branches/*', async (route: Route) => {
    if (route.request().method() === 'PATCH') {
      // Return success response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { success: true } }),
      });
    } else {
      await route.continue();
    }
  });

  // Catch-all: abort any external requests (fonts, CDNs, analytics, etc.)
  await page.route('**/*', async (route: Route) => {
    const url = route.request().url();

    // Allow localhost and our API
    if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('/api/')) {
      await route.continue();
    } else {
      // Abort external requests
      await route.abort('blockedbyclient');
    }
  });
}

/**
 * Setup empty state: return empty data for branches
 */
export async function setupEmptyState(page: Page): Promise<void> {
  await page.route('**/api/branches*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(loadFixture('empty.json')),
    });
  });
}
