/**
 * Vitest Global Setup
 * Ensures no real HTTP calls in unit tests
 */

import { afterEach, vi } from 'vitest';

afterEach(() => {
  // Reset all mocks after each test
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
