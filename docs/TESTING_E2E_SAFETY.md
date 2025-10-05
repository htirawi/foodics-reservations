# E2E Testing Safety Guide

This document explains how we keep Playwright E2E tests **offline, secret-safe, and fast** by default.

## Overview

Our E2E tests run in **offline mode** by default:
- ✅ No real API calls (all requests fulfilled from fixtures)
- ✅ No real tokens (test-only token required)
- ✅ Fast, deterministic, and safe for CI
- ✅ Optional online mode for contract testing (off by default)

---

## Token Separation

### Development vs. E2E

| Environment | File | Token | Purpose |
|-------------|------|-------|---------|
| **Development** | `.env.local` | Real Foodics token | Local dev server, manual testing |
| **E2E Tests** | `.env.e2e` | `"e2e-test-token"` | Playwright tests (offline mode) |
| **CI/Staging** | CI secrets | Staging token | Optional online contract tests |

### Setup

1. **Copy `.env.example` to `.env.e2e`**:
   ```bash
   cp env.example .env.e2e
   ```

2. **Edit `.env.e2e`** and set:
   ```bash
   VITE_FOODICS_TOKEN="e2e-test-token"
   VITE_API_BASE_URL="http://localhost:5173/api"
   ```

3. **Never commit `.env.e2e`** — it's in `.gitignore`.

---

## How Offline Mode Works

### Route Interception

All E2E tests call `setupOfflineMode(page)` before navigating:

```typescript
import { setupOfflineMode } from './setup/intercepts';

test('my test', async ({ page }) => {
  await setupOfflineMode(page);  // Intercept all /api/** requests
  await page.goto('/');
  // ... assertions
});
```

**What `setupOfflineMode` does:**
1. Intercepts `GET /api/branches` → returns `fixtures/branches.json`
2. Intercepts `GET /api/branches?include=sections.tables` → returns `fixtures/branches-with-sections.json`
3. Intercepts `PATCH /api/branches/:id` → returns success response
4. **Aborts all external requests** (fonts, CDNs, analytics) → `blockedbyclient`

### Fixtures

Fixtures live in `tests/e2e/fixtures/`:
- `branches.json` — sample branches (3 branches, realistic data)
- `branches-with-sections.json` — branches with nested sections/tables
- `empty.json` — empty response for testing empty states

To add a new fixture:
1. Create `tests/e2e/fixtures/my-fixture.json`
2. Update `tests/e2e/setup/intercepts.ts` to route the appropriate URL to your fixture

---

## Safety Preflight

Before every E2E run, `globalSetup` runs a **safety preflight** that fails fast if:

1. `VITE_FOODICS_TOKEN` looks real (not `"e2e-test-token"`)
2. `PW_E2E_ONLINE=true` but `PW_API_BASE_URL` or `PW_STAGING_TOKEN` is missing
3. (Future) Any `.env*` files are tracked by git

**Example failure:**
```
❌ E2E Safety Preflight FAILED:
  - VITE_FOODICS_TOKEN appears to be a real token (length: 64).
    E2E tests must use "e2e-test-token" from .env.e2e

E2E safety checks failed. Aborting tests.
```

---

## Running Tests

### Offline Mode (Default)

```bash
# Run all E2E tests (offline, no real API calls)
npm run test:e2e

# Run specific browser
npm run test:e2e:chrome

# Run headed (see browser)
npm run test:e2e:headed

# Run desktop browsers only
npm run test:e2e:desktop
```

### Online Mode (Optional Contract Tests)

Online mode is **off by default** and requires explicit env vars:

```bash
# Set environment variables
export PW_E2E_ONLINE=true
export PW_API_BASE_URL=https://api.foodics.dev/v5
export PW_STAGING_TOKEN=your-staging-token-here

# Run only @online tagged tests
npm run test:e2e -- --grep @online
```

**When to use online mode:**
- CI/staging environment only
- Validating API contract changes
- Rate-limited, small dataset

**Files affected:**
- `tests/e2e/api.branches.spec.ts` — tagged with `@online`, skipped by default

---

## Tracing & Artifacts

### Policy

- **Trace**: `on-first-retry` (only if test fails once)
- **Screenshot**: `only-on-failure`
- **Video**: `retain-on-failure`

### No Secret Leakage

- Request/response headers are **not printed** in logs by default
- Env values are **masked** in debug output
- Artifacts stored only on failure (not on success)

### Viewing Traces

```bash
# Open last test report
npx playwright show-report

# Open specific trace
npx playwright show-trace playwright-report/trace.zip
```

---

## CI Configuration

### GitHub Actions Example

```yaml
- name: Run E2E Tests (Offline)
  run: |
    npx playwright install --with-deps
    npm run test:e2e
  env:
    # No real tokens needed; .env.e2e is used automatically
    CI: true

- name: Run Online Contract Tests (Optional)
  if: github.event_name == 'schedule' # Run nightly only
  run: npm run test:e2e -- --grep @online
  env:
    PW_E2E_ONLINE: true
    PW_API_BASE_URL: ${{ secrets.STAGING_API_URL }}
    PW_STAGING_TOKEN: ${{ secrets.STAGING_TOKEN }}
```

---

## Adding New Tests

### Offline Test (Default)

```typescript
import { test, expect } from '@playwright/test';
import { setupOfflineMode } from './setup/intercepts';

test('my new feature', async ({ page }) => {
  await setupOfflineMode(page);  // Always call this first
  await page.goto('/my-feature');

  // Assertions...
  await expect(page.getByTestId('my-element')).toBeVisible();
});
```

### Empty State Test

```typescript
import { setupEmptyState } from './setup/intercepts';

test('shows empty state', async ({ page }) => {
  await setupEmptyState(page);  // Returns { data: [] }
  await page.goto('/');

  await expect(page.getByTestId('empty-state')).toBeVisible();
});
```

### Online Contract Test (Rare)

```typescript
test.skip(!process.env.PW_E2E_ONLINE, 'Requires online mode');

test('validates API response shape @online', async ({ request }) => {
  const response = await request.get(`${process.env.PW_API_BASE_URL}/branches`, {
    headers: { Authorization: `Bearer ${process.env.PW_STAGING_TOKEN}` },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body).toHaveProperty('data');
});
```

---

## Troubleshooting

### "Safety preflight failed: token appears real"

**Cause:** You're using a real Foodics token in `.env.e2e`.

**Fix:**
1. Open `.env.e2e`
2. Set `VITE_FOODICS_TOKEN="e2e-test-token"`
3. Re-run tests

### "Timeout waiting for selector"

**Cause:** Intercepts not set up, or fixture data doesn't match expectations.

**Fix:**
1. Ensure `await setupOfflineMode(page)` is called **before** `page.goto('/')`
2. Check fixture data in `tests/e2e/fixtures/`
3. Verify selectors use `data-testid` attributes

### "Request blocked by client"

**Cause:** External request (font, CDN) is being aborted by catch-all.

**Fix:**
- This is **expected behavior** for offline mode
- If you need to allow a specific domain, update `tests/e2e/setup/intercepts.ts`:

```typescript
if (url.includes('localhost') || url.includes('fonts.googleapis.com')) {
  await route.continue();
}
```

---

## References

- [Playwright Route Interception](https://playwright.dev/docs/network#handle-requests)
- [Playwright Global Setup](https://playwright.dev/docs/test-global-setup-teardown)
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)
- [Foodics API Docs](https://docs.foodics.dev/)

---

## Summary

| Aspect | Offline Mode (Default) | Online Mode (Optional) |
|--------|------------------------|------------------------|
| **Token** | `"e2e-test-token"` | Staging token (CI secret) |
| **API Calls** | None (fixtures) | Real API (rate-limited) |
| **Speed** | Fast (~2-5s/test) | Slower (network latency) |
| **CI** | Always runs | Nightly/on-demand only |
| **Tag** | (none) | `@online` |
| **Command** | `npm run test:e2e` | `PW_E2E_ONLINE=true npm run test:e2e -- --grep @online` |

**Default philosophy:** E2E tests should be fast, deterministic, and safe. Use offline mode for 99% of tests; reserve online mode for critical contract validation only.
