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

function loadFixture(filename: string): unknown {
  const path = resolve(FIXTURES_DIR, filename);
  const content = readFileSync(path, 'utf-8');
  return JSON.parse(content);
}

function isAllowedUrl(url: string): boolean {
  return (
    url.includes('localhost:5173') ||
    url.includes('127.0.0.1:5173') ||
    url.startsWith('http://localhost:5173') ||
    url.includes('/@vite') ||
    url.includes('/@fs') ||
    url.includes('/node_modules/')
  );
}

async function interceptBranchesGet(page: Page, tracker: string[]): Promise<void> {
  await page.route(/\/api\/branches(\?.*)?$/, async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    tracker.push('GET /api/branches');
    const url = new URL(route.request().url());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const includeParam = url.searchParams.get('include[0]') || url.searchParams.get('include');
    
    let fixture = 'branches.json';
    if (includeParam?.includes('sections')) {
      fixture = 'branches-with-sections.json';
    } else if (url.pathname.includes('disabled') || url.search.includes('disabled=true')) {
      fixture = 'branches-with-disabled.json';
    }
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(loadFixture(fixture)),
    });
  });
}

async function interceptBranchMutations(page: Page, tracker: string[]): Promise<void> {
  // Intercept PUT /branches/:id (generic - handles enable/disable/settings)
  await page.route(/\/api\/branches\/[^/]+$/, async (route: Route) => {
    if (route.request().method() !== 'PUT') {
      await route.continue();
      return;
    }
    
    const body = route.request().postDataJSON() as Record<string, unknown>;
    tracker.push('PUT /api/branches/:id');
    
    // Determine which fixture to use based on request body
    let fixture = 'branch-enable-success.json';
    if (body.accepts_reservations === false) {
      fixture = 'branch-disable-success.json';
    } else if (body.reservation_duration !== undefined || body.reservation_times !== undefined) {
      fixture = 'branch-settings-success.json';
    }
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(loadFixture(fixture)),
    });
  });
}

async function setupCatchAll(page: Page, escapedTracker: string[]): Promise<void> {
  await page.route('**/*', async (route: Route) => {
    const url = route.request().url();
    if (isAllowedUrl(url)) {
      await route.continue();
      return;
    }
    const resourceType = route.request().resourceType();
    escapedTracker.push(`${route.request().method()} ${url} (${resourceType})`);
    await route.abort('blockedbyclient');
  });
}

export async function setupOfflineMode(page: Page): Promise<void> {
  const interceptedRequests: string[] = [];
  const escapedRequests: string[] = [];

  // Register in reverse order: catch-all first, then specific intercepts
  // Playwright checks routes LIFO (last registered = first checked)
  await setupCatchAll(page, escapedRequests);
  await interceptBranchMutations(page, interceptedRequests);
  await interceptBranchesGet(page, interceptedRequests);

  // Small delay to ensure routes are fully registered
  await page.waitForFunction(() => true, { timeout: 100 });

  await page.evaluate(
    ({ intercepted, escaped }) => {
      (window as unknown as { __e2eIntercepts?: { intercepted: string[]; escaped: string[] } }).__e2eIntercepts = {
        intercepted,
        escaped,
      };
    },
    { intercepted: interceptedRequests, escaped: escapedRequests }
  );
}

export async function setupOfflineModeWithDisabledBranches(page: Page): Promise<void> {
  const interceptedRequests: string[] = [];
  const escapedRequests: string[] = [];

  // Register in reverse order: catch-all first, then specific intercepts
  // Playwright checks routes LIFO (last registered = first checked)
  await setupCatchAll(page, escapedRequests);
  await interceptBranchMutations(page, interceptedRequests);
  
  // Override the branches GET to use disabled branches fixture
  await page.route(/\/api\/branches(\?.*)?$/, async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    interceptedRequests.push('GET /api/branches (with disabled)');
    const url = new URL(route.request().url());
    // Check for include parameter but don't use it in this setup
    url.searchParams.get('include[0]') || url.searchParams.get('include');
    
    // Always use disabled branches fixture for this setup
    const fixture = 'branches-with-disabled-and-sections.json';
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(loadFixture(fixture)),
    });
  });

  // Small delay to ensure routes are fully registered
  await page.waitForFunction(() => true, { timeout: 100 });

  await page.evaluate(
    ({ intercepted, escaped }) => {
      (window as unknown as { __e2eIntercepts?: { intercepted: string[]; escaped: string[] } }).__e2eIntercepts = {
        intercepted,
        escaped,
      };
    },
    { intercepted: interceptedRequests, escaped: escapedRequests }
  );
}

export async function setupEmptyState(page: Page): Promise<void> {
  const interceptedRequests: string[] = [];
  const escapedRequests: string[] = [];

  // Register in reverse order: catch-all first, then specific intercepts
  await setupCatchAll(page, escapedRequests);
  
  // Override the branches GET to use empty fixture
  await page.route(/\/api\/branches(\?.*)?$/, async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    interceptedRequests.push('GET /api/branches (empty)');
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(loadFixture('empty.json')),
    });
  });

  // Small delay to ensure routes are fully registered
  await page.waitForFunction(() => true, { timeout: 100 });

  await page.evaluate(
    ({ intercepted, escaped }) => {
      (window as unknown as { __e2eIntercepts?: { intercepted: string[]; escaped: string[] } }).__e2eIntercepts = {
        intercepted,
        escaped,
      };
    },
    { intercepted: interceptedRequests, escaped: escapedRequests }
  );
}

export async function setupOfflineModeWithSections(page: Page): Promise<void> {
  const interceptedRequests: string[] = [];
  const escapedRequests: string[] = [];

  // Register in reverse order: catch-all first, then specific intercepts
  await setupCatchAll(page, escapedRequests);
  await interceptBranchMutations(page, interceptedRequests);
  
  // Override the branches GET to always use sections fixture
  await page.route(/\/api\/branches(\?.*)?$/, async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    interceptedRequests.push('GET /api/branches (with sections)');
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(loadFixture('branches-with-sections.json')),
    });
  });

  // Small delay to ensure routes are fully registered
  await page.waitForFunction(() => true, { timeout: 100 });

  await page.evaluate(
    ({ intercepted, escaped }) => {
      (window as unknown as { __e2eIntercepts?: { intercepted: string[]; escaped: string[] } }).__e2eIntercepts = {
        intercepted,
        escaped,
      };
    },
    { intercepted: interceptedRequests, escaped: escapedRequests }
  );
}