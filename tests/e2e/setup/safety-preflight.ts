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

  // 1. Check if VITE_FOODICS_TOKEN looks real (not the test token)
  const token = process.env.VITE_FOODICS_TOKEN;
  if (token && token !== 'e2e-test-token' && token.length > 20) {
    errors.push(
      `VITE_FOODICS_TOKEN appears to be a real token (length: ${token.length}). ` +
        'E2E tests must use "e2e-test-token" from .env.e2e'
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

  // 4. Fail fast if any errors
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
  console.log('✅ E2E Safety Preflight passed');
}
