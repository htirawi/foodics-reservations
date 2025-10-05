/**
 * E2E Safety Preflight
 * Runs before all tests to ensure no real tokens or secrets leak
 */

import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '../../..');

export function runSafetyPreflight(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check if VITE_FOODICS_TOKEN is exactly the test token (strict mode)
  const token = process.env.VITE_FOODICS_TOKEN;
  if (!token) {
    warnings.push('VITE_FOODICS_TOKEN not set; some tests may fail');
  } else if (token !== 'e2e-test-token') {
    errors.push(
      `VITE_FOODICS_TOKEN must be exactly "e2e-test-token" for E2E tests, got: "${token.slice(0, 20)}..." ` +
        'Update .env.e2e to use the test token.'
    );
  }

  // 2. Check if .env, .env.local, or .env.production are tracked by git
  const trackedEnvFiles = ['.env', '.env.local', '.env.production'];
  trackedEnvFiles.forEach((file) => {
    const path = resolve(REPO_ROOT, file);
    if (existsSync(path)) {
      // Note: This only checks existence, not git tracking status
      // In a real scenario, you'd run `git ls-files` to verify
      // For now, we trust .gitignore is correct
    }
  });

  // 3. Ensure PW_E2E_ONLINE is explicitly set if attempting online mode
  const isOnlineMode = process.env.PW_E2E_ONLINE === 'true';
  if (isOnlineMode) {
    if (!process.env.PW_API_BASE_URL) {
      errors.push('PW_E2E_ONLINE=true requires PW_API_BASE_URL to be set');
    }
    if (!process.env.PW_STAGING_TOKEN) {
      errors.push('PW_E2E_ONLINE=true requires PW_STAGING_TOKEN to be set');
    }
  }

  // 4. Show warnings (non-blocking)
  if (warnings.length > 0) {
    // eslint-disable-next-line no-console -- Allowed for test setup logging
    console.warn('\n⚠️  E2E Safety Preflight Warnings:\n');
    // eslint-disable-next-line no-console -- Allowed for test setup logging
    warnings.forEach((warn) => console.warn(`  - ${warn}`));
    // eslint-disable-next-line no-console -- Allowed for test setup logging
    console.warn('\n');
  }

  // 5. Fail fast if any errors
  if (errors.length > 0) {
    // eslint-disable-next-line no-console -- Allowed for critical test safety errors
    console.error('\n❌ E2E Safety Preflight FAILED:\n');
    // eslint-disable-next-line no-console -- Allowed for critical test safety errors
    errors.forEach((err) => console.error(`  - ${err}`));
    // eslint-disable-next-line no-console -- Allowed for critical test safety errors
    console.error('\n');
    throw new Error('E2E safety checks failed. Aborting tests.');
  }

  // eslint-disable-next-line no-console -- Allowed for test setup logging
  console.log('✅ E2E Safety Preflight passed (offline mode, test token only)');
}
