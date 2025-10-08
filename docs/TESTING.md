# Cross-Browser & Mobile Testing Strategy

## Overview

This project supports comprehensive testing across desktop browsers, mobile devices, and tablets using Playwright.

## Supported Platforms

### Desktop Browsers
- ✅ **Chrome** (Desktop Chrome)
- ✅ **Firefox** (Desktop Firefox)
- ✅ **Edge** (Desktop Edge via Chromium)

### Mobile Devices
- ✅ **Mobile Chrome** (Pixel 5 emulation)
- ✅ **Mobile Safari** (iPhone 13 emulation)
- ✅ **Mobile Safari Landscape** (iPhone 13 landscape)
- ✅ **Tablet** (iPad Pro emulation)

## Browser Installation

### First Time Setup
```bash
# Install all browsers (Chromium, Firefox, WebKit) with system dependencies
npx playwright install --with-deps
```

### Install Specific Browsers
```bash
npx playwright install chromium  # For Chrome/Edge
npx playwright install firefox
npx playwright install webkit    # For Safari/iOS
```

## Test Commands

### Run All Tests (All Platforms)
```bash
npm run test:e2e
# Runs on: Chrome, Firefox, Edge, Mobile Chrome, Mobile Safari, Mobile Safari Landscape, iPad
```

### Desktop Only
```bash
npm run test:e2e:desktop
# Runs on: Desktop Chrome, Desktop Firefox, Desktop Edge
```

### Mobile Only
```bash
npm run test:e2e:mobile
# Runs on: Mobile Chrome (Pixel 5), Mobile Safari (iPhone 13)
```

### Single Browser Tests
```bash
npm run test:e2e:chrome    # Desktop Chrome only
npm run test:e2e:firefox   # Desktop Firefox only
npm run test:e2e:edge      # Desktop Edge only
```

### Development Mode
```bash
npm run test:e2e:headed
# Opens visible browser windows - great for debugging
```

### CI Mode
```bash
npm run test:e2e:ci
# Generates HTML report with screenshots/videos on failure
```

## Testing Strategy

### Local Development (Fast Feedback)
Run tests on a single browser during active development:
```bash
npm run test:e2e:chrome
```

**Why?** Faster feedback loop (seconds vs minutes)

### Pre-Commit (Desktop Verification)
Run tests on all desktop browsers before committing:
```bash
npm run test:e2e:desktop
```

**Why?** Catches cross-browser issues early

### Pre-Push (Full Coverage)
Run all tests including mobile:
```bash
npm run test:e2e
```

**Why?** Ensures mobile responsiveness and full compatibility

### CI Pipeline (Complete Validation)
```bash
npm run test:ci  # Unit + E2E on all platforms
```

**Why?** Final gate before deployment

## Test Execution Times

Approximate execution times (3 smoke tests):

| Command | Browsers | Time | Use Case |
|---------|----------|------|----------|
| `test:e2e:chrome` | 1 | ~3s | Active development |
| `test:e2e:desktop` | 3 | ~8s | Pre-commit check |
| `test:e2e:mobile` | 2 | ~6s | Mobile verification |
| `test:e2e` | 7 | ~15s | Pre-push / CI |

## Device Emulation Details

### Mobile Chrome (Pixel 5)
- Viewport: 393 × 851
- User Agent: Mobile Android
- Touch events: Enabled
- Device scale factor: 2.75

### Mobile Safari (iPhone 13)
- Viewport: 390 × 844
- User Agent: Mobile Safari iOS
- Touch events: Enabled
- Device scale factor: 3

### iPad Pro
- Viewport: 1024 × 1366
- User Agent: Safari on iPad
- Touch events: Enabled
- Device scale factor: 2

## Writing Cross-Platform Tests

### Mobile-Friendly Test Example

```ts
import { test, expect } from '@playwright/test';

test('should work on mobile and desktop', async ({ page, isMobile }) => {
  await page.goto('/');

  if (isMobile) {
    // Mobile-specific: tap hamburger menu
    await page.tap('[aria-label="Open menu"]');
  } else {
    // Desktop: menu always visible
    await page.click('nav a[href="/reservations"]');
  }

  await expect(page).toHaveURL('/reservations');
});
```

### Responsive Design Testing

```ts
test('should be responsive', async ({ page, viewport }) => {
  await page.goto('/');

  // Check layout adapts to viewport
  const nav = page.locator('nav');

  if (viewport && viewport.width < 768) {
    // Mobile: collapsed menu
    await expect(nav).toHaveClass(/mobile-menu/);
  } else {
    // Desktop: expanded menu
    await expect(nav).toHaveClass(/desktop-menu/);
  }
});
```

### Touch vs Mouse Events

```ts
test('should handle touch and mouse', async ({ page, isMobile }) => {
  await page.goto('/');

  const button = page.locator('button.primary');

  if (isMobile) {
    await button.tap();  // Touch event
  } else {
    await button.click();  // Mouse event
  }

  await expect(page.locator('.success')).toBeVisible();
});
```

## Edge-Specific Testing

Edge runs on Chromium but can have subtle differences. To test actual Edge browser:

1. **Install Edge** on your system
2. Set `channel: 'msedge'` in playwright.config.ts (already configured)
3. Run: `npm run test:e2e:edge`

**Note**: If Edge is not installed, Playwright will use Chromium as fallback.

## Best Practices

### 1. Mobile-First Approach
Write tests that work on mobile by default, then enhance for desktop:

```ts
test('mobile-first example', async ({ page }) => {
  await page.goto('/');

  // This works on both mobile and desktop
  await page.locator('button', { hasText: 'Reserve' }).click();

  // Playwright auto-handles touch vs click
});
```

### 2. Viewport-Aware Selectors
Use semantic selectors that work across viewports:

```ts
// ✅ Good: semantic, viewport-agnostic
await page.locator('[aria-label="Main navigation"]').click();

// ❌ Bad: assumes desktop layout
await page.locator('nav.desktop-only').click();
```

### 3. Wait for Responsiveness
Mobile networks are slower - ensure tests account for this:

```ts
await page.goto('/', { waitUntil: 'networkidle' });
await expect(page.locator('.content')).toBeVisible({ timeout: 10000 });
```

### 4. Test RTL on Mobile
Arabic (RTL) on mobile requires special attention:

```ts
test('RTL on mobile', async ({ page, isMobile }) => {
  await page.goto('/');
  await page.click('[aria-label="Switch to Arabic"]');

  if (isMobile) {
    // Mobile RTL: swipe directions reversed
    await page.locator('.carousel').swipe({ direction: 'left' });
  }

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});
```

## Debugging Mobile Tests

### Visual Debugging
```bash
npm run test:e2e:headed -- --project="Mobile Chrome"
```

Opens a visible mobile-emulated browser window.

### Playwright Inspector
```bash
PWDEBUG=1 npm run test:e2e -- --project="Mobile Safari"
```

Step-by-step debugging with mobile emulation.

### Screenshots & Videos
Playwright auto-captures on failure. View in `test-results/`:

```bash
open playwright-report/index.html
```

## CI Configuration Example

```yaml
# .github/workflows/test.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:ci
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Performance Tips

### 1. Parallel Execution
Playwright runs tests in parallel by default:

```ts
// playwright.config.ts
workers: process.env.CI ? 1 : 6  // 6 parallel workers locally
```

### 2. Selective Testing in Development
Don't run all platforms every time:

```bash
# During active dev on a mobile feature
npm run test:e2e:mobile

# Before committing desktop changes
npm run test:e2e:desktop
```

### 3. Headed Mode for Specific Test
```bash
npx playwright test smoke.spec.ts --headed --project="Mobile Safari"
```

## Troubleshooting

### Edge Not Found
If `test:e2e:edge` fails:
1. Install Edge: https://www.microsoft.com/edge
2. Or remove Edge project from `playwright.config.ts`

### Mobile Emulation Issues
If touch events don't work:
- Ensure `isMobile: true` in device config
- Use `.tap()` instead of `.click()` for mobile

### Viewport Mismatch
If layout looks wrong:
- Check device viewport in playwright.config.ts
- Verify CSS breakpoints match device widths

## Summary

✅ **7 platforms covered**: Chrome, Firefox, Edge, Mobile Chrome, Mobile Safari, Tablet  
✅ **Flexible commands**: Run all, desktop-only, mobile-only, or single browser  
✅ **Mobile-first approach**: Touch events, responsive design, RTL support  
✅ **Fast feedback loop**: 3s for single browser, 15s for full suite  
✅ **CI-ready**: Parallel execution, screenshots, HTML reports  

For more details, see [Playwright Docs](https://playwright.dev/).

---

**Last Updated**: 2025-10-05  
**Author**: Testing Team
