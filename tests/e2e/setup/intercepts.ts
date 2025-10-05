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
    url.includes('/node_modules/') ||
    url.includes('/api/')
  );
}

async function interceptBranchesGet(page: Page, tracker: string[]): Promise<void> {
  await page.route('**/api/branches', async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    tracker.push('GET /api/branches');
    const url = new URL(route.request().url());
    const fixture = url.searchParams.get('include')?.includes('sections')
      ? 'branches-with-sections.json'
      : 'branches.json';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(loadFixture(fixture)),
    });
  });
}

async function interceptBranchMutations(page: Page, tracker: string[]): Promise<void> {
  await page.route('**/api/branches/*/enable', async (route: Route) => {
    if (route.request().method() !== 'PATCH') {
      await route.continue();
      return;
    }
    tracker.push('PATCH /api/branches/:id/enable');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(loadFixture('branch-enable-success.json')),
    });
  });

  await page.route('**/api/branches/*/disable', async (route: Route) => {
    if (route.request().method() !== 'PATCH') {
      await route.continue();
      return;
    }
    tracker.push('PATCH /api/branches/:id/disable');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(loadFixture('branch-disable-success.json')),
    });
  });

  await page.route('**/api/branches/*/settings', async (route: Route) => {
    if (route.request().method() !== 'PATCH') {
      await route.continue();
      return;
    }
    tracker.push('PATCH /api/branches/:id/settings');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(loadFixture('branch-settings-success.json')),
    });
  });

  await page.route('**/api/branches/*', async (route: Route) => {
    if (route.request().method() === 'PATCH') {
      tracker.push(`PATCH /api/branches/${route.request().url().split('/').pop() ?? 'unknown'}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { success: true } }),
      });
    } else {
      await route.continue();
    }
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

  await interceptBranchesGet(page, interceptedRequests);
  await interceptBranchMutations(page, interceptedRequests);
  await setupCatchAll(page, escapedRequests);

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
  await page.route('**/api/branches*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(loadFixture('empty.json')),
    });
  });
}