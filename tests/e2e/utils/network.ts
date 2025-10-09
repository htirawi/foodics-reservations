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
 * In-memory state for branch mutations (simulates backend state)
 */
export interface IBranchState {
  id: string;
  accepts_reservations: boolean;
  reservation_duration?: number;
  reservation_times?: Record<string, string[][]>;
  [key: string]: unknown;
}

const branchStateStore = new Map<string, IBranchState>();

/**
 * Initialize branch state from fixtures
 */
export function initBranchState(branches: IBranchState[]): void {
  branchStateStore.clear();
  branches.forEach((branch) => {
    branchStateStore.set(branch.id, { ...branch });
  });
}

/**
 * Get current state of a branch
 */
export function getBranchState(id: string): IBranchState | undefined {
  return branchStateStore.get(id);
}

/**
 * Update branch state
 */
export function updateBranchState(id: string, updates: Partial<IBranchState>): IBranchState | undefined {
  const current = branchStateStore.get(id);
  if (!current) return undefined;

  const updated = { ...current, ...updates };
  branchStateStore.set(id, updated);
  return updated;
}

/**
 * Get all branch states (useful for filtering)
 */
export function getAllBranchStates(): IBranchState[] {
  return Array.from(branchStateStore.values());
}

/**
 * Mock Foodics API routes for offline testing with pagination support
 * Handles:
 * - GET /api/branches (paginated, filters by accepts_reservations if needed)
 * - PUT /api/branches/:id (updates branch settings)
 */
export async function mockFoodicsRoutes(page: Page): Promise<void> {
  // Initialize state from fixtures
  const page1Data = loadFixture("branches_page1.json") as { data: IBranchState[] };
  const page2Data = loadFixture("branches_page2.json") as { data: IBranchState[] };

  const allBranches = [...page1Data.data, ...page2Data.data];
  initBranchState(allBranches);

  // Mock GET /api/branches (paginated)
  await page.route(/\/api\/branches(\?.*)?$/, async (route: Route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    const url = new URL(route.request().url());
    const pageParam = url.searchParams.get("page") || "1";
    const pageNum = parseInt(pageParam, 10);

    // Determine which fixture to serve (both page1 and page2 have sections by default)
    let responseData;
    if (pageNum === 1) {
      responseData = loadFixture("branches_page1.json");
    } else if (pageNum === 2) {
      responseData = loadFixture("branches_page2.json");
    } else {
      // No more pages
      responseData = {
        data: [],
        links: { first: null, last: null, prev: null, next: null },
        meta: { current_page: pageNum, from: 0, last_page: 2, path: "", per_page: 1, to: 0, total: 2 },
      };
    }

    // Apply current state to response (update accepts_reservations dynamically)
    const stateData = JSON.parse(JSON.stringify(responseData)) as { data: IBranchState[] };
    stateData.data = stateData.data.map((branch: IBranchState) => {
      const currentState = branchStateStore.get(branch.id);
      return currentState ? { ...branch, ...currentState } : branch;
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(stateData),
    });
  });

  // Mock PUT /api/branches/:id (update settings)
  await page.route(/\/api\/branches\/([^/]+)$/, async (route: Route) => {
    if (route.request().method() !== "PUT") {
      await route.continue();
      return;
    }

    const matches = route.request().url().match(/\/api\/branches\/([^/?]+)/);
    const branchId = matches?.[1];

    if (!branchId) {
      await route.abort();
      return;
    }

    const payload = route.request().postDataJSON() as Partial<IBranchState>;
    const updated = updateBranchState(branchId, payload);

    if (!updated) {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "Branch not found" }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: updated }),
    });
  });
}

/**
 * Setup page with mocked Foodics routes (helper for tests)
 */
export async function mountWithMocks(page: Page): Promise<void> {
  await mockFoodicsRoutes(page);

  // Block external requests (allow only localhost/vite)
  const context = page.context();
  await blockExternalRequests(context);
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
