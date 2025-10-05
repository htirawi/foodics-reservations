/**
 * Playwright Global Setup
 * Runs once before all tests
 */

import dotenv from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSafetyPreflight } from './safety-preflight';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.e2e for E2E tests (offline mode by default)
const envPath = resolve(__dirname, '../../../.env.e2e');
dotenv.config({ path: envPath });

async function globalSetup(): Promise<void> {
  // Run safety preflight checks
  runSafetyPreflight();

  // Optional: perform any global setup (e.g., seed test data, start mock server)
  // For now, we rely on route interception in individual tests

  // eslint-disable-next-line no-console -- Allowed for test setup logging
  console.log('✅ E2E global setup complete');
}

export default globalSetup;
